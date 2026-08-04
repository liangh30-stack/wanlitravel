/** Prueba de humo contra el entorno de test de T10: login + búsqueda ES00634. */
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

const sid = await client.login();
console.log('LOGIN OK, sessionID:', sid.slice(0, 12) + '…');

const res = await client.getAccommodationAvail({
  checkIn: '2026-11-10',
  checkOut: '2026-11-15',
  rooms: [{ adults: 2, children: 0, units: 1 }],
  destinationCode: 'ES00634',
});
console.log('BÚSQUEDA OK — ofertas:', res.accommodations.length);
for (const a of res.accommodations.slice(0, 6)) {
  console.log(` · ${a.code} ${a.name ?? ''} ${a.category ?? ''}* ${a.mealPlan ?? ''} neto=${a.neto} ${a.currencyCode ?? ''} status=${a.status} NS=${a.cancelPoliciesPending ? 'sí' : 'no'}`);
}

// Paso 2: valoración de la primera oferta (aquí deben llegar las políticas de cancelación)
const first = res.accommodations[0];
const valued = await client.value({
  idOperation: res.idOperation,
  code: first.code,
  idDistributions: first.idDistributions!,
});
console.log('VALUE OK —', valued.code, 'neto=', valued.neto, valued.currencyCode, 'status=', valued.status);
console.log('políticas estructuradas:', JSON.stringify(valued.structuredCancelPolicies ?? [], null, 1).slice(0, 500));
console.log('políticas texto:', (valued.cancelPolicies ?? []).map(p => p.raw ?? `${p.from} ${p.amount}`).slice(0, 3));
