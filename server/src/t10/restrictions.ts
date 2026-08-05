/**
 * Restricciones de venta de tarifas (Booking 2.9, tag <restrictions>).
 *
 * Por qué importa: T10 puede ofrecer tarifas baratas que SOLO se pueden vender
 * a un perfil concreto (residentes canarios, mayores de 65, desempleados…) o
 * que no admiten devolución. Venderlas sin comprobar el perfil significa que el
 * hotel puede rechazar al huésped en recepción, y venderlas sin avisar de que
 * son no reembolsables traslada el coste de la cancelación a nosotros.
 *
 * Política de la agencia (configurable): por defecto solo se venden las tarifas
 * que cualquier cliente B2B puede usar — no reembolsable y empaquetable — y se
 * BLOQUEAN las que exigen acreditar un perfil que no podemos verificar.
 */

export type RestrictionCode =
  | 'NR' | '+55' | '+60' | '+65' | 'RESCAN' | 'DSMPL'
  | 'COLEC' | 'EPKT' | 'FUNC' | 'ADLT' | 'OTR';

export interface Restriction {
  code: string;
  description?: string;
}

/** Restricciones vendibles por defecto: no exigen acreditar perfil del huésped. */
const DEFAULT_SELLABLE = new Set<string>(['NR', 'EPKT', 'ADLT', 'OTR']);

/**
 * Códigos que exigen que el huésped acredite una condición (edad, residencia,
 * situación laboral, pertenencia a un colectivo). No podemos verificarlo, así
 * que por defecto se bloquean: el hotel rechazaría al huésped en recepción.
 */
const REQUIRES_PROOF = new Set<string>(['+55', '+60', '+65', 'RESCAN', 'RESBAL', 'DSMPL', 'COLEC', 'FUNC']);

/** Configurable por entorno: T10_SELLABLE_RESTRICTIONS="NR,EPKT,ADLT,OTR" */
function sellableSet(): Set<string> {
  const raw = process.env.T10_SELLABLE_RESTRICTIONS;
  if (!raw) return DEFAULT_SELLABLE;
  return new Set(raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean));
}

export function normalizeRestrictions(node: any): Restriction[] {
  const list = node?.restriction ?? node;
  const arr = list === undefined || list === null ? [] : Array.isArray(list) ? list : [list];
  return arr
    .map((r: any) => (typeof r === 'string'
      ? { code: 'OTR', description: r }
      : { code: String(r?.code ?? 'OTR').toUpperCase(), description: r?.description ? String(r.description) : undefined }))
    .filter((r: Restriction) => r.code);
}

/** true si TODAS las restricciones de la tarifa son vendibles según la política. */
export function isSellable(restrictions: Restriction[]): boolean {
  const ok = sellableSet();
  return restrictions.every(r => ok.has(r.code));
}

/** Restricciones que obligan a bloquear la tarifa (para poder explicar el motivo). */
export function blockingRestrictions(restrictions: Restriction[]): Restriction[] {
  const ok = sellableSet();
  return restrictions.filter(r => !ok.has(r.code));
}

/** true si la tarifa no admite devolución — debe avisarse SIEMPRE al cliente. */
export function isNonRefundable(restrictions: Restriction[]): boolean {
  return restrictions.some(r => r.code === 'NR');
}

export const REQUIRES_PROOF_CODES = REQUIRES_PROOF;
