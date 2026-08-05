/**
 * Certificación API 3.1 Reservations.
 *
 * El Excel de Tour10 pide cuatro celdas: petición y respuesta de
 * getReservations, y petición y respuesta de getReservationDetails.
 * Este script las genera contra el entorno de test y las vuelca a
 * server/data/cert-reservations.json para rellenar el Excel.
 *
 * Uso: npx tsx --env-file=.env.local server/scripts/cert-reservations.ts
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';

/** Transporte espía: guarda el XML crudo de cada intercambio. */
const capturas: { operation: string; request: string; response: string }[] = [];

const base = createModuleTransport({
  bookingUrl: process.env.T10_BOOKING_URL!,
  mappingUrl: process.env.T10_MAPPING_URL!,
  reservationsUrl: process.env.T10_RESERVATIONS_URL!,
  logDir: './logs/t10',
});

const transport = async (operation: string, requestXml: string, timeoutMs: number) => {
  const response = await base(operation, requestXml, timeoutMs);
  capturas.push({ operation, request: requestXml, response });
  return response;
};

const client = new T10Client({
  user: process.env.T10_USER!,
  password: process.env.T10_PASSWORD!,
  transport,
});

/** dd/mm/yyyy — el formato de fecha de Reservations 3.1 (distinto de Booking) */
function ddmmyyyy(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

const hoy = new Date();
const hace30 = new Date(hoy.getTime() - 30 * 24 * 3600 * 1000);

const rango = { initialBookingDate: ddmmyyyy(hace30), finalBookingDate: ddmmyyyy(hoy) };
console.log('getReservations', rango);

const reservas = await client.getReservations(rango);
console.log(`  → ${reservas.length} reservas`);
for (const r of reservas.slice(0, 10)) {
  console.log(`    ${r.locator} | ${r.status} | ${r.checkIn}→${r.checkOut} | neto ${r.neto}`);
}

// Detalle: el localizador que pida el certificador; por defecto el primero.
const objetivo = process.env.CERT_LOCATOR || reservas[0]?.locator;
if (!objetivo) {
  console.error('Sin reservas en el rango: no se puede certificar getReservationDetails.');
  process.exit(1);
}
console.log('getReservationDetails', objetivo);
const detalle = await client.getReservationDetails(objetivo);
console.log('  → estado:', detalle?.reservation?.[0]?.status ?? detalle?.status ?? '(ver XML)');

const salida = {
  generadoEl: new Date().toISOString(),
  entorno: process.env.T10_RESERVATIONS_URL,
  usuario: process.env.T10_USER,
  rango,
  localizador: objetivo,
  capturas,
};
await mkdir('./server/data', { recursive: true });
await writeFile('./server/data/cert-reservations.json', JSON.stringify(salida, null, 2), 'utf8');
console.log('\nEscrito: server/data/cert-reservations.json');
