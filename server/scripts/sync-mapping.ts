/**
 * Sincronización del catálogo estático de T10 (módulo Mapping).
 *
 * Descarga getAllHotels (paginado), agrupa por ciudad y guarda el catálogo de
 * destinos en SQLite para que el buscador ofrezca las ciudades reales en vez de
 * una lista escrita a mano. Pensado para ejecutarse en un cron (p. ej. semanal).
 *
 * Uso: npx tsx --env-file=.env.local server/scripts/sync-mapping.ts [--country=ES]
 */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';
import { DestinationStore } from '../src/store/destinations.js';

const onlyCountry = process.argv.find(a => a.startsWith('--country='))?.split('=')[1];

const client = new T10Client({
  user: process.env.T10_USER!,
  password: process.env.T10_PASSWORD!,
  transport: createModuleTransport({
    bookingUrl: process.env.T10_BOOKING_URL!,
    mappingUrl: process.env.T10_MAPPING_URL!,
    reservationsUrl: process.env.T10_RESERVATIONS_URL!,
    logDir: process.env.T10_LOG_DIR ?? './logs/t10',
  }),
});

console.log('[sync-mapping] descargando catálogo de hoteles…');
const hotels = await client.getAllHotels();
console.log(`[sync-mapping] ${hotels.length} hoteles`);

const byCity = new Map<string, { name: string; countryCode: string; hotelCount: number }>();
for (const h of hotels) {
  const code = h.cityCode?.trim();
  if (!code) continue;
  const countryCode = (h.countryCode ?? '').trim();
  if (onlyCountry && countryCode !== onlyCountry) continue;
  // el nombre legible de la ciudad viene en el bean original como `city`
  const name = String((h.raw as any)?.city ?? '').trim() || code;
  const cur = byCity.get(code) ?? { name, countryCode, hotelCount: 0 };
  cur.hotelCount++;
  byCity.set(code, cur);
}

const items = [...byCity.entries()].map(([code, v]) => ({ code, ...v }));
const store = new DestinationStore(process.env.DATA_DIR ?? './server/data');
const n = store.replaceAll(items);

const porPais = items.reduce<Record<string, number>>((acc, d) => {
  acc[d.countryCode] = (acc[d.countryCode] ?? 0) + 1;
  return acc;
}, {});
console.log(`[sync-mapping] guardados ${n} destinos:`,
  Object.entries(porPais).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, k]) => `${c}:${k}`).join(' '));
console.log('[sync-mapping] top:', store.list().slice(0, 5).map(d => `${d.code} ${d.name} (${d.hotelCount})`).join(' · '));
