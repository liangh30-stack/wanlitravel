/**
 * Ciclo completo de certificación Booking 2.9 contra el entorno TEST:
 * avail → value → confirm → getReservations → getReservationDetails → cancel(consulta) → cancel(ejecuta)
 */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';

const client = new T10Client({
  user: process.env.T10_USER!,
  password: process.env.T10_PASSWORD!,
  transport: createModuleTransport({
    bookingUrl: process.env.T10_BOOKING_URL!,
    mappingUrl: process.env.T10_MAPPING_URL!,
    reservationsUrl: process.env.T10_RESERVATIONS_URL!,
    logDir: './logs/t10',
  }),
});

const clientLocalizer = `WANLI${Date.now().toString(36).toUpperCase()}`.slice(0, 12);
console.log('clientLocalizer:', clientLocalizer);

// 1. Disponibilidad
const res = await client.getAccommodationAvail({
  checkIn: '2026-11-10', checkOut: '2026-11-15',
  rooms: [{ adults: 2, children: 0, units: 1 }],
  destinationCode: 'ES00634',
});
const offer = res.accommodations.find(a => a.status === 'SALE' && a.idDistributions);
if (!offer) throw new Error('sin ofertas SALE');
console.log(`1) AVAIL OK — elegida ${offer.code} ${offer.name} neto=${offer.neto}`);

// 2. Valoración
const valued = await client.value({
  idOperation: res.idOperation, code: offer.code, idDistributions: offer.idDistributions!,
});
console.log(`2) VALUE OK — neto=${valued.neto} ${valued.currencyCode} políticas=${valued.structuredCancelPolicies?.length ?? 0}`);

// 3. Confirmación (reserva REAL en entorno de test)
const confirmed = await client.confirm({
  idOperation: valued.idOperation, code: offer.code, idDistributions: offer.idDistributions!,
  clientLocalizer,
  clients: [
    { age: 35, name: 'Juan', firstSurname: 'Perez', secondSurname: 'Prueba' },
    { age: 33, name: 'Maria', firstSurname: 'Lopez', secondSurname: 'Prueba' },
  ],
});
console.log(`3) CONFIRM OK — localizador=${confirmed.locator} neto=${confirmed.neto} (cambió precio: ${confirmed.neto !== valued.neto})`);

// 4. Verificación vía módulo Reservations
const today = new Date();
const fmt = (d: Date) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
const list = await client.getReservations({ initialBookingDate: fmt(today), finalBookingDate: fmt(today) });
const mine = list.find(r => r.clientReference === clientLocalizer || r.locator === confirmed.locator);
console.log(`4) GETRESERVATIONS OK — ${list.length} reservas hoy; la nuestra ${mine ? 'ENCONTRADA' : 'no encontrada'} (${mine?.locator ?? '-'} status=${mine?.status ?? '-'})`);

const details = await client.getReservationDetails(confirmed.locator);
console.log(`5) DETAILS OK — localizer=${details?.reservations?.reservation?.[0]?.localizer ?? details?.reservation?.[0]?.localizer ?? '(ver raw)'}`);

// 6. Consulta de gastos de cancelación
const quote = await client.cancel({ locator: confirmed.locator, execute: false });
console.log(`6) CANCEL-QUOTE OK — coste=${quote.cancellationCost} ${quote.currencyCode ?? ''}`);

// 7. Cancelación real
const done = await client.cancel({ locator: confirmed.locator, execute: true });
console.log(`7) CANCEL OK — coste final=${done.cancellationCost ?? '0'}`);
console.log('CICLO COMPLETO ✔');
