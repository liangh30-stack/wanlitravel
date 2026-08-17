import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { C, line, serif, soft } from '../../theme';
import { S } from '../admin/shared';
import PortalBooking from './PortalBooking';
import PortalOrders from './PortalOrders';

/* ─────────────────────────────────────────────────────────────
   PORTAL DE PARTNERS — /:lang/portal

   La visión de Andrés (nota 17/08): el partner no "usa una web de
   reservas", entra a SU espacio. v1: reservar hoteles en vivo y
   ver sus pedidos. Después: asistente IA de itinerarios, material
   con su marca, más herramientas.

   La sesión (30 días) se guarda en localStorage: el partner no
   quiere teclear la clave cada mañana. El token es revocable desde
   operaciones (desactivar cuenta o restablecer clave).

   v1 en castellano; cuando abramos a agencias chinas se traduce.
───────────────────────────────────────────────────────────── */

const TOKEN_KEY = 'wanli.portal.token';

export interface PartnerInfo { id: string; companyName: string; contactName?: string; email: string }

export class PortalApiError extends Error {
  constructor(public status: number, public body: any) {
    super(body?.message ?? body?.error ?? `HTTP ${status}`);
  }
}

export async function portalApi<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new PortalApiError(res.status, body);
  return body as T;
}

const PortalPage = () => {
  const { lang } = useParams();
  const idioma = lang ?? 'es';

  const [token, setToken] = useState<string>(() => {
    try { return localStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; }
  });
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [comprobando, setComprobando] = useState(Boolean(token));

  // login
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState('');

  const [vista, setVista] = useState<'reservar' | 'pedidos'>('reservar');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Sesión guardada: validarla al entrar
  useEffect(() => {
    if (!token) { setComprobando(false); return; }
    portalApi<{ partner: PartnerInfo }>(token, '/api/portal/me')
      .then(r => setPartner(r.partner))
      .catch(() => {
        try { localStorage.removeItem(TOKEN_KEY); } catch { /* noop */ }
        setToken('');
      })
      .finally(() => setComprobando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntrando(true); setError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: clave }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 401
          ? 'Email o clave incorrectos, o cuenta desactivada.'
          : res.status === 429 ? 'Demasiados intentos. Espere unos minutos.' : 'No se pudo conectar.');
        return;
      }
      try { localStorage.setItem(TOKEN_KEY, body.token); } catch { /* modo privado */ }
      setToken(body.token);
      setPartner(body.partner);
    } finally { setEntrando(false); }
  };

  const salir = useCallback(async () => {
    if (token) await portalApi(token, '/api/portal/logout', { method: 'POST' }).catch(() => {});
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* noop */ }
    setToken(''); setPartner(null); setClave('');
  }, [token]);

  /** Si el servidor dice SESSION_EXPIRED en cualquier llamada, volver al login */
  const sesionCaducada = useCallback(() => { void salir(); }, [salir]);

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'rgba(244,240,233,0.96)',
        backdropFilter: 'blur(14px)', borderBottom: `1px solid ${line(0.12)}`,
      }}>
        <Link to={`/${idioma}`} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: soft(0.55) }}>
          ← Web
        </Link>
        <p style={{ margin: 0, fontFamily: serif, fontSize: 17 }}>Wanli · Portal de partners</p>
        {partner ? (
          <button onClick={salir} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: soft(0.55),
          }}>
            Salir
          </button>
        ) : <div style={{ width: 46 }} />}
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '96px 24px 80px' }}>
        {comprobando ? (
          <p style={{ textAlign: 'center', color: soft(0.5) }}>Comprobando sesión…</p>
        ) : !partner ? (
          <form onSubmit={entrar} style={{ ...S.card, maxWidth: 440, margin: '8vh auto 0' }}>
            <p style={{ margin: '0 0 4px', fontFamily: serif, fontSize: 26 }}>Bienvenido</p>
            <p style={{ margin: '0 0 18px', fontSize: 13, lineHeight: 1.7, color: soft(0.55) }}>
              Acceso exclusivo para agencias y turoperadores de la red Wanli.
              ¿Aún sin cuenta? Escríbanos desde la <Link to={`/${idioma}#contacto`} style={{ color: C.gold }}>web</Link>.
            </p>
            <label style={S.label}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="username" style={{ ...S.input, marginBottom: 12 }} />
            <label style={S.label}>Clave de acceso</label>
            <input type="password" required value={clave} onChange={e => setClave(e.target.value)}
              autoComplete="current-password" style={S.input} />
            {error && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#7A2222' }}>{error}</p>}
            <button type="submit" disabled={entrando || !email || !clave}
              style={{ ...S.btn, marginTop: 16, opacity: entrando || !email || !clave ? 0.55 : 1 }}>
              {entrando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 18px', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontFamily: serif, fontSize: 30, fontWeight: 400 }}>
                {partner.companyName}
              </h1>
              <span style={{ fontSize: 12.5, color: soft(0.5) }}>{partner.email}</span>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: 13.5, lineHeight: 1.7, color: soft(0.6), maxWidth: 640 }}>
              Reserve hotelería en vivo con confirmación inmediata. Su mesa de operaciones
              está disponible para cualquier duda o petición fuera de catálogo.
            </p>
            <nav style={{ display: 'flex', gap: 6, borderBottom: `1px solid ${line(0.16)}`, marginBottom: 22 }}>
              {([['reservar', 'Reservar hotel'], ['pedidos', 'Mis reservas']] as const).map(([id, texto]) => (
                <button key={id} onClick={() => setVista(id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  padding: '12px 18px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em',
                  color: vista === id ? C.ink : soft(0.45),
                  borderBottom: `2px solid ${vista === id ? C.gold : 'transparent'}`,
                  marginBottom: -1,
                }}>
                  {texto}
                </button>
              ))}
            </nav>
            {vista === 'reservar' && <PortalBooking token={token} onSesionCaducada={sesionCaducada} />}
            {vista === 'pedidos' && <PortalOrders token={token} onSesionCaducada={sesionCaducada} />}
          </>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${line(0.1)}`, padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: soft(0.35) }}>
          Wanli Travel · Tarifa mostrada: PVP orientativo · Precio neto según su acuerdo comercial
        </span>
      </div>
    </div>
  );
};

export default PortalPage;
