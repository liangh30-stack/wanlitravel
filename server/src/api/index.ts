/**
 * 面向前端的 JSON API（Express）。
 *
 * 安全设计：
 * - T10 凭证只存在于服务端环境变量，前端永远不直连 T10
 * - 所有 /api 请求经过共享密钥鉴权（X-Api-Key）+ 限流
 * - 所有输入经 zod 校验后才进入 T10 客户端
 * - confirm 成功落地本地订单库；cancel 必须命中本地订单（归属校验），
 *   防止通过枚举 locator 取消非本系统的订单
 *
 * 启动：npm run server:dev（需先在 .env.local 配置 T10_* 与 API_SHARED_KEY）
 */
import express from 'express';
import { ZodError } from 'zod';
import { T10Client, createModuleTransport, T10Error, ConfirmTimeoutError } from '../t10/index.js';
import { OrderStore } from '../store/orders.js';
import { InquiryStore } from '../store/inquiries.js';
import { DestinationStore } from '../store/destinations.js';
import { apiKeyAuth, generalLimiter, bookingLimiter, inquiryLimiter, searchLimiter } from './middleware.js';
import { searchSchema, valueSchema, confirmSchema, cancelSchema, inquirySchema } from './schemas.js';
import { buildDemoAvailability, DEMO_DESTINATIONS } from '../t10/demo.js';
import { isSellable, blockingRestrictions } from '../t10/restrictions.js';
import { notifyInquiry } from './notify.js';

const {
  // 三个模块各有独立入口（如缺省，Mapping/Reservations 回落到 Booking 的 URL）
  T10_BOOKING_URL = process.env.T10_BASE_URL ?? '',
  T10_MAPPING_URL = '',
  T10_RESERVATIONS_URL = '',
  T10_USER = '',
  T10_PASSWORD = '',
  T10_LOG_DIR = './logs/t10',
  API_SHARED_KEY,
  PORT = '3001',
} = process.env;

if (!T10_BOOKING_URL || !T10_USER || !T10_PASSWORD) {
  console.warn('[t10] 缺少 T10_BOOKING_URL / T10_USER / T10_PASSWORD 环境变量 — API 将以未配置状态启动');
}
if (!process.env.INQUIRY_EMAIL_TO && !process.env.INQUIRY_WEBHOOK_URL) {
  console.warn('[inquiries] sin canal de aviso: las solicitudes solo se verán entrando al panel /admin');
}
if (!API_SHARED_KEY) {
  console.warn('[auth] 未配置 API_SHARED_KEY — 仅接受本机请求（开发模式）');
}

const client = new T10Client({
  user: T10_USER,
  password: T10_PASSWORD,
  transport: createModuleTransport({
    bookingUrl: T10_BOOKING_URL,
    mappingUrl: T10_MAPPING_URL,
    reservationsUrl: T10_RESERVATIONS_URL,
    logDir: T10_LOG_DIR,
  }),
});
const orders = new OrderStore();
const inquiries = new InquiryStore();
const destinations = new DestinationStore();

const app = express();
/**
 * Capas de proxy delante del servidor. Debe coincidir EXACTAMENTE con la
 * realidad del despliegue: si se pone de más, un atacante puede falsear su IP
 * con X-Forwarded-For y saltarse el rate limit; si se pone de menos, todas las
 * peticiones parecen venir del proxy y el rate limit bloquea a usuarios reales.
 * Vercel → Railway = 2. Solo Railway = 1. Sin proxy = 0.
 */
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
app.use(express.json({ limit: '100kb' }));

// 健康检查不鉴权（供负载均衡探活）
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(T10_BOOKING_URL && T10_USER && T10_PASSWORD) });
});

/**
 * 公开询盘端点 —— 网站访客提交表单，无法要求 API key。
 * 防护：独立更严限流（5/分钟/IP）+ 蜜罐字段 + zod 校验 + body 大小限制。
 */
app.post('/api/inquiries', inquiryLimiter, async (req, res) => {
  // 蜜罐：机器人填了隐藏字段 → 假装成功，静默丢弃
  if (typeof req.body?.website === 'string' && req.body.website.length > 0) {
    res.json({ ok: true });
    return;
  }
  try {
    const input = inquirySchema.parse(req.body);
    const { consent, ...fields } = input;
    const record = inquiries.create({ ...fields, consentAt: new Date().toISOString() });
    // El aviso nunca puede tumbar el guardado: notifyInquiry no lanza
    void notifyInquiry(record);
    res.json({ ok: true, id: record.id });
  } catch (err) { handleError(err, res); }
});

/**
 * 公开酒店搜索 —— 网站访客可直接搜索（限流保护）。
 * 未配置 T10 凭证或 DEMO_MODE=true 时返回演示数据（demo:true），
 * 配置真实凭证后自动切换为 T10 实时库存，前端无需改动。
 * 注意：核价/下单/取消仍需鉴权 —— 公开的只有"看"，不开放"交易"。
 */
const t10Configured = Boolean(T10_BOOKING_URL && T10_USER && T10_PASSWORD);
const demoMode = !t10Configured || process.env.DEMO_MODE === 'true';

/**
 * Destinos: prioridad (1) catálogo sincronizado del módulo Mapping,
 * (2) lista manual T10_DESTINATIONS, (3) datos de demostración.
 * Sincronizar con: npx tsx --env-file=.env.local server/scripts/sync-mapping.ts
 */
const manualDestinations = (process.env.T10_DESTINATIONS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => {
    const idx = s.indexOf(':');
    return idx > 0 ? { code: s.slice(0, idx), label: s.slice(idx + 1) } : { code: s, label: s };
  });

/**
 * Lista blanca de destinos (fase de pruebas).
 *
 * El catálogo de Mapping trae 237 ciudades, pero el entorno de TEST de T10 solo
 * tiene tarifas cargadas en Torremolinos: ofrecer las otras 236 hace que el
 * buscador parezca roto ("sin disponibilidad" siempre). Mientras estemos en
 * test se limita el desplegable a los códigos de T10_DESTINATION_WHITELIST.
 * En producción basta con dejar la variable vacía y vuelve el catálogo completo.
 */
const destinationWhitelist = new Set(
  (process.env.T10_DESTINATION_WHITELIST ?? '')
    .split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
);

app.get('/api/hotels/destinations', searchLimiter, (req, res) => {
  const country = typeof req.query.country === 'string' ? req.query.country.slice(0, 2).toUpperCase() : undefined;
  if (!demoMode) {
    const all = destinations.list(country);
    const synced = destinationWhitelist.size
      ? all.filter(d => destinationWhitelist.has(d.code.toUpperCase()))
      : all;
    if (synced.length) {
      res.json({
        demo: false,
        syncedAt: destinations.lastSync(),
        ...(destinationWhitelist.size ? { limited: true, catalogTotal: all.length } : {}),
        destinations: synced.map(d => ({ code: d.code, label: d.name, countryCode: d.countryCode, hotels: d.hotelCount })),
      });
      return;
    }
    if (manualDestinations.length) {
      res.json({ demo: false, destinations: manualDestinations });
      return;
    }
    // T10 conectado pero catálogo sin sincronizar: NUNCA servir los códigos de
    // demostración (AGP/MAD/BCN son códigos IATA, no cityCode de T10 → toda
    // búsqueda saldría vacía). Mejor lista vacía + aviso explícito.
    res.json({
      demo: false,
      destinations: [],
      warning: 'CATALOG_NOT_SYNCED',
      hint: 'Ejecuta: npm run sync:mapping',
    });
    return;
  }
  res.json({ demo: true, destinations: DEMO_DESTINATIONS });
});

/** Proyección pública de una oferta: sin neto (coste mayorista) ni raw. */
const publicOffer = (a: any) => ({
  code: a.code, name: a.name, category: a.category, cityName: a.cityName,
  mealPlan: a.mealPlan, pvp: a.pvp, currencyCode: a.currencyCode, status: a.status,
  idOperation: a.idOperation, idDistributions: a.idDistributions,
  cancelPoliciesPending: a.cancelPoliciesPending,
  /*
   * Las condiciones de cancelación que ya vienen en disponibilidad se
   * publican tal cual. En el entorno de test siempre llegan como NS
   * (pendientes), pero Tour10 confirma (correo del 14/08/2026) que en
   * producción el NS es un porcentaje muy pequeño: ocultar estas
   * condiciones hasta el paso de cotización nos dejaría en desventaja
   * frente a proveedores que sí las enseñan en el listado.
   *
   * Siguen recalculándose en `value`, que es la fuente autorizada: si
   * cambian entre disponibilidad y cotización, se avisa al cliente.
   */
  cancelPolicies: a.cancelPolicies,
  structuredCancelPolicies: a.structuredCancelPolicies,
  // El cliente debe saber SIEMPRE si la tarifa no admite devolución
  nonRefundable: a.nonRefundable,
  restrictions: a.restrictions,
  rooms: (a.rooms ?? []).map((r: any) => ({
    code: r.code, name: r.name, units: r.units, adults: r.adults, children: r.children,
  })),
});

app.post('/api/hotels/search', searchLimiter, async (req, res) => {
  try {
    const input = searchSchema.parse(req.body);
    if (demoMode) {
      const result = buildDemoAvailability(input);
      res.json({ demo: true, idOperation: result.idOperation, accommodations: result.accommodations.map(publicOffer) });
      return;
    }
    const result = await client.getAccommodationAvail(input);
    /*
     * Filtro de restricciones: T10 devuelve tarifas baratas que solo puede usar
     * un perfil concreto (residentes canarios, mayores de 65, desempleados…).
     * No podemos acreditar ese perfil, así que el hotel rechazaría al huésped en
     * recepción — se descartan. Las vendibles (NR/EPKT/ADLT) sí se muestran, con
     * su aviso correspondiente.
     */
    const vendibles = result.accommodations.filter(a => isSellable(a.restrictions ?? []));
    const descartadas = result.accommodations.length - vendibles.length;
    if (descartadas > 0) {
      const motivos = [...new Set(result.accommodations
        .flatMap(a => blockingRestrictions(a.restrictions ?? []))
        .map(r => r.code))];
      console.log(`[search] ${descartadas} tarifas descartadas por restricción: ${motivos.join(',')}`);
    }
    // Endpoint PÚBLICO: nunca exponer el neto (coste mayorista) ni el desglose
    // por habitación. Solo PVP y lo necesario para pedir cotización.
    res.json({
      demo: false,
      idOperation: result.idOperation,
      accommodations: vendibles.map(a => publicOffer(a)),
      ...(descartadas ? { filteredOut: descartadas } : {}),
    });
  } catch (err) { handleError(err, res); }
});

// 其余 /api 全部鉴权 + 限流
app.use('/api', apiKeyAuth(API_SHARED_KEY), generalLimiter);

/** 询盘管理（需鉴权）：列表 / 标记已处理 / 删除（GDPR） */
app.get('/api/inquiries', (_req, res) => { res.json(inquiries.list()); });
app.post('/api/inquiries/:id/handled', (req, res) => {
  res.json({ ok: inquiries.markHandled(req.params.id) });
});
app.delete('/api/inquiries/:id', (req, res) => {
  res.json({ ok: inquiries.delete(req.params.id) });
});

const strip = <T extends { raw?: unknown }>(o: T): Omit<T, 'raw'> => {
  const { raw, ...rest } = o;
  return rest;
};

/** 核价（下单前必须调用，防 M12） */
app.post('/api/hotels/value', async (req, res) => {
  try {
    res.json(strip(await client.value(valueSchema.parse(req.body))));
  } catch (err) { handleError(err, res); }
});

/** 确认下单：成功落库；成交价与 expectedNeto 比对返回 priceChanged */
app.post('/api/hotels/confirm', bookingLimiter, async (req, res) => {
  try {
    const input = confirmSchema.parse(req.body);
    // clientLocalizer 幂等保护：同一参考号已有订单则拒绝重复下单
    const existing = orders.findByClientLocalizer(input.clientLocalizer);
    if (existing) {
      res.status(409).json({ error: 'DUPLICATE_CLIENT_LOCALIZER', order: existing });
      return;
    }
    const { expectedNeto, hotelCode, checkIn, checkOut, ...confirmReq } = input;
    try {
      const confirmed = await client.confirm(confirmReq);
      const priceChanged = expectedNeto !== undefined && confirmed.neto !== undefined
        && Number(confirmed.neto) !== Number(expectedNeto);
      const order = orders.create({
        clientLocalizer: input.clientLocalizer,
        locator: confirmed.locator,
        status: 'CONFIRMED',
        hotelCode: hotelCode ?? input.code,
        checkIn, checkOut,
        valuedNeto: expectedNeto !== undefined ? String(expectedNeto) : undefined,
        confirmedNeto: confirmed.neto,
        currencyCode: confirmed.currencyCode,
        priceChanged,
      });
      res.json({ ...strip(confirmed), priceChanged, orderId: order.id });
    } catch (err) {
      if (err instanceof ConfirmTimeoutError) {
        // 状态未知：落库为 PENDING_UNKNOWN，由对账流程核实，前端展示"处理中"
        const order = orders.create({
          clientLocalizer: input.clientLocalizer,
          status: 'PENDING_UNKNOWN',
          hotelCode: hotelCode ?? input.code,
          checkIn, checkOut,
          valuedNeto: expectedNeto !== undefined ? String(expectedNeto) : undefined,
        });
        res.status(504).json({ error: 'CONFIRM_TIMEOUT', orderId: order.id, message: err.message });
        return;
      }
      throw err;
    }
  } catch (err) { handleError(err, res); }
});

/** 查询取消费用（须为本系统订单） */
app.post('/api/hotels/cancel-quote', async (req, res) => {
  try {
    const { locator } = cancelSchema.parse(req.body);
    if (!orders.findByLocator(locator)) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND', message: '该订单不属于本系统' });
      return;
    }
    res.json(strip(await client.cancel({ locator, execute: false })));
  } catch (err) { handleError(err, res); }
});

/** 执行取消（须为本系统订单，成功后更新状态） */
app.post('/api/hotels/cancel', bookingLimiter, async (req, res) => {
  try {
    const { locator } = cancelSchema.parse(req.body);
    const order = orders.findByLocator(locator);
    if (!order) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND', message: '该订单不属于本系统' });
      return;
    }
    const outcome = await client.cancel({ locator, execute: true });
    orders.update(order.id, { status: 'CANCELLED' });
    res.json(strip(outcome));
  } catch (err) { handleError(err, res); }
});

/** 待对账订单列表（confirm 超时后状态未知的单） */
app.get('/api/orders/pending', (_req, res) => {
  res.json(orders.listPendingUnknown());
});

function handleError(err: unknown, res: express.Response) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'VALIDATION', issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })) });
    return;
  }
  if (err instanceof T10Error) {
    const status = err.isSessionExpired ? 401 : err.needsManualHandling ? 409 : 502;
    res.status(status).json({
      error: err.code,
      message: err.message,
      needsManualHandling: err.needsManualHandling,
      retryable: err.isRetryable,
    });
    return;
  }
  console.error('[api] unexpected error:', err);
  res.status(500).json({ error: 'INTERNAL' });
}

/**
 * Auto-sincronización del catálogo de destinos al arrancar.
 *
 * Sin catálogo el buscador no ofrece ningún destino, así que en un despliegue
 * nuevo (volumen vacío) el sitio nacería inservible hasta que alguien ejecutase
 * el script a mano. Si la tabla está vacía y hay credenciales, se sincroniza en
 * segundo plano — no bloquea el arranque ni el healthcheck. Las
 * resincronizaciones periódicas siguen siendo tarea del cron semanal.
 */
async function autoSyncDestinations() {
  if (demoMode || destinations.count() > 0) return;
  try {
    console.log('[destinos] catálogo vacío — sincronizando desde Mapping…');
    const hotels = await client.getAllHotels();
    const byCity = new Map<string, { name: string; countryCode: string; hotelCount: number }>();
    for (const h of hotels) {
      const code = h.cityCode?.trim();
      if (!code) continue;
      const name = String((h.raw as any)?.city ?? '').trim() || code;
      const cur = byCity.get(code) ?? { name, countryCode: (h.countryCode ?? '').trim(), hotelCount: 0 };
      cur.hotelCount++;
      byCity.set(code, cur);
    }
    const n = destinations.replaceAll([...byCity.entries()].map(([code, v]) => ({ code, ...v })));
    console.log(`[destinos] sincronizados ${n} destinos desde ${hotels.length} hoteles`);
  } catch (err) {
    // Nunca tumbar el servidor por esto: el resto de la API funciona igual
    console.error('[destinos] fallo en la sincronización automática:', err);
  }
}

const server = app.listen(Number(PORT), () => {
  console.log(`[t10 api] listening on http://localhost:${PORT}`);
  void autoSyncDestinations();
});

/*
 * Apagado ordenado.
 *
 * Railway envía SIGTERM en cada redespliegue. Sin manejarlo, el proceso muere
 * con código distinto de cero: la plataforma lo cuenta como caída, manda un
 * correo de "Deploy Crashed" por cada despliegue, y las peticiones en vuelo se
 * cortan a media respuesta — incluido un `confirm` contra T10, que es
 * justamente el caso que no queremos dejar a medias.
 *
 * Cerramos el servidor (deja de aceptar conexiones nuevas y espera a las
 * abiertas) y salimos con 0. Si algo se queda colgado más de 10 segundos,
 * salimos igual: mejor un corte que un contenedor zombi bloqueando el volumen.
 */
let apagando = false;
for (const senal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(senal, () => {
    if (apagando) return;
    apagando = true;
    console.log(`[t10 api] ${senal} recibido, cerrando…`);
    const plazo = setTimeout(() => {
      console.warn('[t10 api] cierre forzado tras 10s de espera');
      process.exit(0);
    }, 10_000);
    plazo.unref();
    server.close(err => {
      if (err) console.error('[t10 api] error al cerrar:', err);
      console.log('[t10 api] cerrado limpiamente');
      process.exit(0);
    });
  });
}
