/** Exporta disponibilidad REAL de T10 (varias duraciones) para la preview offline. */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';
const client = new T10Client({
  user: process.env.T10_USER!, password: process.env.T10_PASSWORD!,
  transport: createModuleTransport({
    bookingUrl: process.env.T10_BOOKING_URL!, mappingUrl: process.env.T10_MAPPING_URL!,
    reservationsUrl: process.env.T10_RESERVATIONS_URL!, logDir: './logs/t10',
  }),
});
const out: Record<string, any[]> = {};
for (const [nights, ci, co] of [[4,'2026-11-10','2026-11-14'],[5,'2026-11-10','2026-11-15'],[6,'2026-11-10','2026-11-16']] as const) {
  const res = await client.getAccommodationAvail({
    checkIn: ci, checkOut: co, rooms: [{ adults: 2, children: 0, units: 1 }], destinationCode: 'ES00634',
  });
  const byHotel = new Map<string, any>();
  for (const a of res.accommodations) {
    const prev = byHotel.get(a.code);
    if (!prev || Number(a.pvp ?? a.neto) < Number(prev.pvp)) {
      byHotel.set(a.code, {
        code: a.code, name: a.name, category: a.category, mealPlan: a.mealPlan,
        pvp: a.pvp ?? a.neto, currencyCode: a.currencyCode ?? 'EUR', status: a.status,
        cancelPoliciesPending: a.cancelPoliciesPending ?? false,
      });
    }
  }
  out[String(nights)] = [...byHotel.values()];
}
console.log(JSON.stringify(out));
