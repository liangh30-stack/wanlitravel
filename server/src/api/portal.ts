/**
 * API del portal de partners (/api/portal/*).
 *
 * Modelo de precios MIENTRAS Andrés y Liangbin no decidan el markup:
 * el partner ve SOLO el PVP (precio de venta orientativo de Tour10).
 * El neto —el coste mayorista— no sale de aquí: se guarda en el pedido
 * y solo lo ve el centro de operaciones. Cuando se decida el modelo
 * (neto+markup por partner, o neto directo), se cambia la proyección
 * `ofertaPartner` y nada más.
 *
 * Autenticación: token Bearer de sesión (30 días, revocable). Sin registro
 * público: las cuentas las crea operaciones desde el panel.
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { z, ZodError } from 'zod';
import type { T10Client } from '../t10/index.js';
import { T10Error, ConfirmTimeoutError } from '../t10/index.js';
import { isSellable } from '../t10/restrictions.js';
import type { OrderStore } from '../store/orders.js';
import type { PartnerStore, PartnerRecord } from '../store/partners.js';
import { searchSchema, valueSchema, confirmSchema } from './schemas.js';

/** Intentos de login: estricto — 10 por IP cada 15 minutos */
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });
const portalLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false });

const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(200),
});

/** Proyección para el partner: TODO lo útil, NADA de neto */
const ofertaPartner = (a: any) => ({
  code: a.code, name: a.name, category: a.category, cityName: a.cityName,
  mealPlan: a.mealPlan, pvp: a.pvp, currencyCode: a.currencyCode, status: a.status,
  idOperation: a.idOperation, idDistributions: a.idDistributions,
  cancelPolicies: a.cancelPolicies,
  structuredCancelPolicies: a.structuredCancelPolicies,
  cancelPoliciesPending: a.cancelPoliciesPending,
  nonRefundable: a.nonRefundable,
  restrictions: a.restrictions,
  rooms: (a.rooms ?? []).map((r: any) => ({
    code: r.code, name: r.name, units: r.units, adults: r.adults, children: r.children, pvp: r.pvp,
  })),
});

interface CotizacionCacheada { neto?: string; pvp?: string; expira: number }

export function portalRouter(deps: { client: T10Client; orders: OrderStore; partners: PartnerStore; demoMode: boolean }) {
  const { client, orders, partners, demoMode } = deps;
  const router = express.Router();

  /*
   * El neto de cada cotización se retiene en memoria 15 minutos, indexado por
   * una referencia opaca: así `confirm` puede comparar el precio final con el
   * cotizado (detección de subidas) sin que el neto pase jamás por el navegador
   * del partner. Si el proceso se reinicia se pierde la referencia y solo se
   * pierde esa comparación — nunca la reserva.
   */
  const cotizaciones = new Map<string, CotizacionCacheada>();
  const guardarCotizacion = (ref: string, c: Omit<CotizacionCacheada, 'expira'>) => {
    const ahora = Date.now();
    for (const [k, v] of cotizaciones) if (v.expira < ahora) cotizaciones.delete(k);
    cotizaciones.set(ref, { ...c, expira: ahora + 15 * 60_000 });
  };

  const err = (res: express.Response, e: unknown) => {
    if (e instanceof ZodError) {
      res.status(400).json({ error: 'VALIDATION', issues: e.issues.map(i => ({ path: i.path.join('.'), message: i.message })) });
      return;
    }
    if (e instanceof T10Error) {
      res.status(e.isSessionExpired ? 502 : e.needsManualHandling ? 409 : 502)
        .json({ error: e.code, message: e.message, retryable: e.isRetryable });
      return;
    }
    console.error('[portal] error inesperado:', e);
    res.status(500).json({ error: 'INTERNAL' });
  };

  /* ── sesión ── */

  router.post('/login', loginLimiter, (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const partner = partners.authenticate(email, password);
      if (!partner) {
        res.status(401).json({ error: 'BAD_CREDENTIALS' });
        return;
      }
      const session = partners.createSession(partner.id);
      res.json({ token: session.token, expiresAt: session.expiresAt, partner: publico(partner) });
    } catch (e) { err(res, e); }
  });

  /** Autenticación Bearer para el resto del portal */
  const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const m = /^Bearer (.+)$/.exec(String(req.header('authorization') ?? ''));
    const partner = m ? partners.sessionPartner(m[1]) : undefined;
    if (!partner) {
      res.status(401).json({ error: 'SESSION_EXPIRED' });
      return;
    }
    (req as any).partner = partner;
    (req as any).portalToken = m![1];
    next();
  };

  router.use(portalLimiter);

  router.post('/logout', auth, (req, res) => {
    partners.destroySession((req as any).portalToken);
    res.json({ ok: true });
  });

  router.get('/me', auth, (req, res) => {
    res.json({ partner: publico((req as any).partner) });
  });

  /* ── reservas ── */

  router.post('/search', auth, async (req, res) => {
    try {
      const input = searchSchema.parse(req.body);
      if (demoMode) {
        res.status(503).json({ error: 'NOT_CONFIGURED' });
        return;
      }
      const result = await client.getAccommodationAvail({ ...input, retrieveCancelPolicies: true });
      const vendibles = result.accommodations.filter(a => isSellable(a.restrictions ?? []));
      res.json({ idOperation: result.idOperation, accommodations: vendibles.map(ofertaPartner) });
    } catch (e) { err(res, e); }
  });

  router.post('/value', auth, async (req, res) => {
    try {
      const input = valueSchema.parse(req.body);
      const valued = await client.value(input);
      const quoteRef = `q-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      guardarCotizacion(quoteRef, { neto: valued.neto, pvp: valued.pvp });
      // Proyección explícita: el neto viaja también DENTRO de cada habitación,
      // así que no basta con quitar el campo de arriba — se reconstruye entero.
      res.json({
        idOperation: valued.idOperation, code: valued.code, mealPlan: valued.mealPlan,
        pvp: valued.pvp, currencyCode: valued.currencyCode, status: valued.status,
        cancelPolicies: valued.cancelPolicies,
        structuredCancelPolicies: valued.structuredCancelPolicies,
        rooms: (valued.rooms ?? []).map(r => ({
          code: r.code, name: r.name, units: r.units, adults: r.adults, children: r.children, pvp: r.pvp,
        })),
        quoteRef,
      });
    } catch (e) { err(res, e); }
  });

  router.post('/confirm', async (req, res, next) => auth(req, res, next), async (req, res) => {
    try {
      const partner: PartnerRecord = (req as any).partner;
      const { quoteRef, ...body } = req.body ?? {};
      const input = confirmSchema.parse(body);
      const existing = orders.findByClientLocalizer(input.clientLocalizer);
      if (existing) {
        res.status(409).json({ error: 'DUPLICATE_CLIENT_LOCALIZER' });
        return;
      }
      const cotizada = typeof quoteRef === 'string' ? cotizaciones.get(quoteRef) : undefined;
      const { expectedNeto: _ignorado, hotelCode, checkIn, checkOut, ...confirmReq } = input;
      try {
        const confirmed = await client.confirm(confirmReq);
        const priceChanged = cotizada?.neto !== undefined && confirmed.neto !== undefined
          && Number(confirmed.neto) !== Number(cotizada.neto);
        const order = orders.create({
          clientLocalizer: input.clientLocalizer,
          locator: confirmed.locator,
          status: 'CONFIRMED',
          hotelCode: hotelCode ?? input.code,
          checkIn, checkOut,
          valuedNeto: cotizada?.neto,
          confirmedNeto: confirmed.neto,
          pvp: confirmed.pvp ?? cotizada?.pvp,
          currencyCode: confirmed.currencyCode,
          priceChanged,
          partnerId: partner.id,
        });
        // El partner ve locator + PVP; el neto queda en el pedido para operaciones
        res.json({
          locator: confirmed.locator, status: confirmed.status,
          pvp: confirmed.pvp ?? cotizada?.pvp, currencyCode: confirmed.currencyCode,
          priceChanged, orderId: order.id,
        });
      } catch (e) {
        if (e instanceof ConfirmTimeoutError) {
          const order = orders.create({
            clientLocalizer: input.clientLocalizer,
            status: 'PENDING_UNKNOWN',
            hotelCode: hotelCode ?? input.code,
            checkIn, checkOut,
            valuedNeto: cotizada?.neto,
            pvp: cotizada?.pvp,
            partnerId: partner.id,
          });
          res.status(504).json({ error: 'CONFIRM_TIMEOUT', orderId: order.id });
          return;
        }
        throw e;
      }
    } catch (e) { err(res, e); }
  });

  router.get('/orders', auth, (req, res) => {
    const partner: PartnerRecord = (req as any).partner;
    // Proyección sin neto: el partner ve su historial con PVP
    res.json(orders.listByPartner(partner.id).map(o => ({
      id: o.id, clientLocalizer: o.clientLocalizer, locator: o.locator,
      status: o.status, hotelCode: o.hotelCode, checkIn: o.checkIn, checkOut: o.checkOut,
      pvp: o.pvp, currencyCode: o.currencyCode, createdAt: o.createdAt,
    })));
  });

  return router;
}

const publico = (p: PartnerRecord) => ({
  id: p.id, companyName: p.companyName, contactName: p.contactName, email: p.email,
});
