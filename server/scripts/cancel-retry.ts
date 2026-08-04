import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';
const client = new T10Client({
  user: process.env.T10_USER!, password: process.env.T10_PASSWORD!,
  transport: createModuleTransport({
    bookingUrl: process.env.T10_BOOKING_URL!, mappingUrl: process.env.T10_MAPPING_URL!,
    reservationsUrl: process.env.T10_RESERVATIONS_URL!, logDir: './logs/t10',
  }),
});
const locator = process.argv[2];
for (let i = 1; i <= 3; i++) {
  try {
    const done = await client.cancel({ locator, execute: true });
    console.log(`CANCEL OK (intento ${i}) — coste=${done.cancellationCost ?? '0'}`);
    process.exit(0);
  } catch (e: any) {
    console.log(`intento ${i} falló: ${e.code ?? e.message}`);
    if (!e.isRetryable) break;
    await new Promise(r => setTimeout(r, 3000));
  }
}
// verificar estado real
const d = await client.getReservationDetails(locator);
console.log('estado actual (raw claves):', JSON.stringify(d).slice(0, 400));
