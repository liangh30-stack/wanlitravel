/**
 * Utilidades comunes del panel interno.
 *
 * La clave de API vive SOLO en memoria (se pasa por props): ni localStorage ni
 * cookies. Al recargar hay que reintroducirla — molestia deliberada a cambio de
 * no dejar la credencial escrita en un portátil que se puede perder.
 */
import { C, line, soft } from '../../theme';

export class ApiError extends Error {
  constructor(public status: number, public body: any) {
    super(body?.message ?? body?.error ?? `HTTP ${status}`);
  }
}

/** fetch con clave y JSON; lanza ApiError con el cuerpo decodificado */
export async function api<T>(key: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'X-Api-Key': key,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

/** Referencia de reserva legible y única: WL-<fecha>-<4 al azar> */
export function nuevaReferencia(): string {
  const d = new Date();
  const fecha = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const azar = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WL-${fecha}-${azar}`;
}

export const euros = (v?: string | number, cur = 'EUR') =>
  v === undefined || v === null || v === '' ? '—' : `${Number(v).toFixed(2)} ${cur}`;

/* ── Estilos compartidos (lenguaje visual del diseño 2026) ── */

export const S = {
  card: {
    background: '#FBF9F5', border: `1px solid ${line(0.14)}`, padding: 20,
  } as React.CSSProperties,
  input: {
    width: '100%', boxSizing: 'border-box', background: 'white',
    border: `1px solid ${line(0.18)}`, padding: '10px 12px', fontSize: 14,
    fontFamily: 'inherit', color: C.ink, outline: 'none',
  } as React.CSSProperties,
  label: {
    display: 'block', marginBottom: 6, fontSize: 9.5, fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.22em', color: soft(0.5),
  } as React.CSSProperties,
  btn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: C.ink, color: C.bg, border: 'none', cursor: 'pointer',
    padding: '11px 22px', fontFamily: 'inherit', fontSize: 10,
    textTransform: 'uppercase', letterSpacing: '0.24em', transition: 'background .25s',
  } as React.CSSProperties,
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'transparent', color: C.ink, border: `1px solid ${line(0.3)}`,
    cursor: 'pointer', padding: '10px 18px', fontFamily: 'inherit', fontSize: 10,
    textTransform: 'uppercase', letterSpacing: '0.24em',
  } as React.CSSProperties,
  tag: {
    display: 'inline-block', padding: '3px 9px', fontSize: 9,
    textTransform: 'uppercase', letterSpacing: '0.16em',
    border: `1px solid ${line(0.25)}`, color: soft(0.6),
  } as React.CSSProperties,
  warn: {
    background: 'rgba(155,44,44,0.07)', border: '1px solid rgba(155,44,44,0.3)',
    color: '#7A2222', padding: '10px 14px', fontSize: 13, lineHeight: 1.6,
  } as React.CSSProperties,
  ok: {
    background: 'rgba(63,107,74,0.08)', border: '1px solid rgba(63,107,74,0.3)',
    color: '#2E5238', padding: '10px 14px', fontSize: 13, lineHeight: 1.6,
  } as React.CSSProperties,
};

/* ── Tipos de las respuestas que consume el panel ── */

export interface RoomOffer {
  code: string; name?: string; units?: number; adults?: number; children?: number;
  pvp?: string; neto?: string;
}
export interface StructuredCancelPolicy {
  hoursFrom?: string; calculationType?: string; amountType?: string; amount?: string;
}
export interface AdminOffer {
  code: string; name?: string; category?: string; mealPlan?: string;
  pvp?: string; neto?: string; currencyCode?: string; status?: string;
  idDistributions?: string; cityName?: string;
  rooms: RoomOffer[];
  cancelPolicies?: { from?: string; amount?: string }[];
  structuredCancelPolicies?: StructuredCancelPolicy[];
  cancelPoliciesPending?: boolean;
  nonRefundable?: boolean;
  restrictions?: { code: string; description?: string }[];
}
export interface AdminSearchResponse {
  demo: boolean; idOperation: string; accommodations: AdminOffer[]; filteredOut?: number;
}
export interface ValuedOffer {
  idOperation: string; code?: string; mealPlan?: string; pvp?: string; neto?: string;
  currencyCode?: string; status?: string; rooms: RoomOffer[];
  cancelPolicies?: { from?: string; amount?: string }[];
  structuredCancelPolicies?: StructuredCancelPolicy[];
}
export interface OrderRecord {
  id: string; clientLocalizer: string; locator?: string;
  status: 'CONFIRMED' | 'PENDING_UNKNOWN' | 'CANCELLED';
  hotelCode?: string; checkIn?: string; checkOut?: string;
  valuedNeto?: string; confirmedNeto?: string; currencyCode?: string;
  priceChanged?: boolean; createdAt: string; updatedAt: string;
}
export interface Destination { code: string; label: string; countryCode?: string; hotels?: number }

/** Resume las políticas de cancelación estructuradas en frases legibles */
export function resumePoliticas(p?: StructuredCancelPolicy[], pendientes?: boolean): string[] {
  const tramos = (p ?? []).filter(x => x.hoursFrom !== undefined);
  const frases: string[] = [];
  for (const t of tramos) {
    const h = Number(t.hoursFrom);
    if (!Number.isFinite(h) || h >= 9999) continue;
    const cuando = h >= 48 ? `${Math.round(h / 24)} días antes` : `${h} h antes`;
    if (t.calculationType === 'NS' || t.amountType === 'NS') {
      frases.push(`desde ${cuando}: condiciones aún sin determinar (NS)`);
    } else if (Number(t.amount) === 0) {
      frases.push(`hasta ${cuando}: cancelación gratuita`);
    } else {
      const tipo = t.amountType === 'P' ? '%' : '';
      frases.push(`desde ${cuando}: gasto ${t.amount}${tipo}`);
    }
  }
  if (!frases.length && pendientes) frases.push('condiciones pendientes (NS): se conocerán al cotizar');
  return frases;
}
