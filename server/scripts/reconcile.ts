/**
 * Conciliación diaria con T10 (tarea pendiente del README):
 * 1. Pedidos PENDING_UNKNOWN (confirm con timeout) → verificar contra getReservations
 * 2. Listar reservas T10 de los últimos N días y compararlas con la base local
 *
 * Uso: npx tsx --env-file=.env.local server/scripts/reconcile.ts [días=2]
 * Pensado para cron diario en producción.
 */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';
import { OrderStore } from '../src/store/orders.js';

const days = Number(process.argv[2] ?? 2);
const client = new T10Client({
  user: process.env.T10_USER!, password: process.env.T10_PASSWORD!,
  transport: createModuleTransport({
    bookingUrl: process.env.T10_BOOKING_URL!, mappingUrl: process.env.T10_MAPPING_URL!,
    reservationsUrl: process.env.T10_RESERVATIONS_URL!, logDir: './logs/t10',
  }),
});
const orders = new OrderStore();

const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const to = new Date();
const from = new Date(to.getTime() - days * 86_400_000);
const remote = await client.getReservations({ initialBookingDate: fmt(from), finalBookingDate: fmt(to) });
console.log(`[reconcile] T10 devuelve ${remote.length} reservas entre ${fmt(from)} y ${fmt(to)}`);

// 1. Resolver pedidos en estado desconocido (confirm timeout)
const pending = orders.listPendingUnknown();
for (const o of pending) {
  const match = remote.find(r => r.clientReference === o.clientLocalizer);
  if (match) {
    orders.update(o.id, { status: 'CONFIRMED', locator: match.locator, confirmedNeto: match.neto });
    console.log(`[reconcile] ${o.clientLocalizer}: T10 SÍ generó la reserva → CONFIRMED (locator ${match.locator})`);
  } else {
    console.log(`[reconcile] ${o.clientLocalizer}: sin rastro en T10 → puede reintentarse el confirm con seguridad`);
  }
}
if (!pending.length) console.log('[reconcile] sin pedidos PENDING_UNKNOWN');

// 2. Divergencias: reservas en T10 que no constan en la base local
const local = orders.list();
const unknownRemote = remote.filter(r => r.clientReference && !local.some(o =>
  o.clientLocalizer === r.clientReference || (o.locator && o.locator === r.locator)));
for (const r of unknownRemote) {
  console.log(`[reconcile] ⚠ reserva en T10 sin registro local: locator=${r.locator} ref=${r.clientReference} status=${r.status}`);
}
console.log(`[reconcile] terminado — ${unknownRemote.length} divergencias`);
