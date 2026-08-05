/**
 * Batería de reservas exigida por el formulario de certificación de Tour10.
 * Ejecuta las 9 reservas + 2 cancelaciones y devuelve los localizadores.
 *
 * Uso: npx tsx --env-file=.env.local server/scripts/cert-suite.ts
 */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';
import type { RoomRequest } from '../src/t10/types.js';

const client = new T10Client({
  user: process.env.T10_USER!, password: process.env.T10_PASSWORD!,
  transport: createModuleTransport({
    bookingUrl: process.env.T10_BOOKING_URL!, mappingUrl: process.env.T10_MAPPING_URL!,
    reservationsUrl: process.env.T10_RESERVATIONS_URL!, logDir: './logs/t10',
  }),
});

const CHECK_IN = '2026-11-10';
const CHECK_OUT = '2026-11-15';
const CITY = 'ES00634';

interface Caso { id: string; desc: string; rooms: RoomRequest[] }

const CASOS: Caso[] = [
  { id: 'A', desc: '1 hab: 2 adultos', rooms: [{ adults: 2, children: 0, units: 1 }] },
  { id: 'B', desc: '1 hab: 2 adultos + 1 niño (10)', rooms: [{ adults: 2, children: 1, firstChildAge: 10, units: 1 }] },
  { id: 'C', desc: '1 hab: 2 adultos + 1 niño (1)', rooms: [{ adults: 2, children: 1, firstChildAge: 1, units: 1 }] },
  { id: 'D', desc: '1 hab: 2 adultos + 2 niños (5,10)', rooms: [{ adults: 2, children: 2, firstChildAge: 5, secondChildAge: 10, units: 1 }] },
  { id: 'E', desc: '1 hab: 2 adultos + 1 niño (15)', rooms: [{ adults: 2, children: 1, firstChildAge: 15, units: 1 }] },
  { id: 'F', desc: '2 hab: [2 ad] + [3 ad]', rooms: [{ adults: 2, children: 0, units: 1 }, { adults: 3, children: 0, units: 1 }] },
  { id: 'G', desc: '2 hab: [3 ad] + [2 ad + 1 niño 10]', rooms: [{ adults: 3, children: 0, units: 1 }, { adults: 2, children: 1, firstChildAge: 10, units: 1 }] },
  { id: 'H', desc: '2 hab: [2 ad] + [2 ad + 2 niños 9,10]', rooms: [{ adults: 2, children: 0, units: 1 }, { adults: 2, children: 2, firstChildAge: 9, secondChildAge: 10, units: 1 }] },
  { id: 'I', desc: '3 hab: [2 ad] x2 + [2 ad + 2 niños 9,10]', rooms: [{ adults: 2, children: 0, units: 2 }, { adults: 2, children: 2, firstChildAge: 9, secondChildAge: 10, units: 1 }] },
];

const NOMBRES = ['Juan', 'Maria', 'Carlos', 'Lucia', 'Pablo', 'Elena', 'Diego', 'Sara'];

/** Pasajeros: un cliente por persona, con la edad real (niños con su edad) */
function pasajeros(rooms: RoomRequest[]) {
  const out: { age: number; name: string; firstSurname: string; secondSurname: string }[] = [];
  let i = 0;
  for (const r of rooms) {
    for (let u = 0; u < r.units; u++) {
      for (let a = 0; a < r.adults; a++) {
        out.push({ age: 30 + (i % 15), name: NOMBRES[i % NOMBRES.length], firstSurname: 'Prueba', secondSurname: 'Cert' });
        i++;
      }
      const edades = [r.firstChildAge, r.secondChildAge].filter((e): e is number => e !== undefined);
      for (const edad of edades.slice(0, r.children)) {
        out.push({ age: edad, name: NOMBRES[i % NOMBRES.length], firstSurname: 'Prueba', secondSurname: 'Cert' });
        i++;
      }
    }
  }
  return out;
}

const resultados: Record<string, { desc: string; localizador?: string; neto?: string; error?: string }> = {};

for (const caso of CASOS) {
  const ref = `WLC${caso.id}${Date.now().toString(36).slice(-5).toUpperCase()}`;
  try {
    const avail = await client.getAccommodationAvail({
      checkIn: CHECK_IN, checkOut: CHECK_OUT, destinationCode: CITY, rooms: caso.rooms,
    });
    const oferta = avail.accommodations.find(a => a.status === 'SALE' && a.idDistributions);
    if (!oferta) throw new Error('sin ofertas disponibles para esta configuración');

    const valued = await client.value({
      idOperation: avail.idOperation, code: oferta.code, idDistributions: oferta.idDistributions!,
    });
    const confirmed = await client.confirm({
      idOperation: valued.idOperation, code: oferta.code, idDistributions: oferta.idDistributions!,
      clientLocalizer: ref, clients: pasajeros(caso.rooms),
    });
    resultados[caso.id] = { desc: caso.desc, localizador: confirmed.locator, neto: confirmed.neto };
    console.log(`${caso.id} OK  ${caso.desc}\n     localizador=${confirmed.locator}  neto=${confirmed.neto} ${confirmed.currencyCode ?? ''}`);
  } catch (e: any) {
    resultados[caso.id] = { desc: caso.desc, error: e?.code ? `${e.code}: ${e.serverMessage ?? e.message}` : String(e?.message ?? e) };
    console.log(`${caso.id} FALLO  ${caso.desc}\n     ${resultados[caso.id].error}`);
  }
}

console.log('\n=== CANCELACIONES ===');
for (const id of ['E', 'F']) {
  const loc = resultados[id]?.localizador;
  if (!loc) { console.log(`${id}: sin localizador, no se puede cancelar`); continue; }
  try {
    const quote = await client.cancel({ locator: loc, execute: false });
    const done = await client.cancel({ locator: loc, execute: true });
    console.log(`${id} CANCELADA  localizador=${loc}  coste=${done.cancellationCost ?? quote.cancellationCost ?? '0'}`);
  } catch (e: any) {
    console.log(`${id} fallo al cancelar (${e?.code ?? ''}): ${e?.serverMessage ?? e?.message}`);
  }
}

console.log('\n=== RESUMEN PARA EL FORMULARIO ===');
for (const c of CASOS) {
  const r = resultados[c.id];
  console.log(`${c.desc}\n   → ${r?.localizador ?? 'ERROR: ' + r?.error}`);
}
