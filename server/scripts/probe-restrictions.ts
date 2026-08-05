/**
 * Rastreo de tipos de tarifa en el entorno de test.
 *
 * Tour10 indica que los 4 hoteles de test "tienen todas las tarifas necesarias"
 * para la certificación, pero que solo afloran combinando varias duraciones
 * (4, 5, 6… noches) y varios meses de antelación. Este script barre esa rejilla
 * — duración × antelación × ocupación — y anota qué códigos de restricción
 * aparecen y con qué búsqueda exacta reproducirlos, que es lo que hay que
 * documentar en las páginas 3-5 del formulario de certificación.
 *
 * Uso: npx tsx server/scripts/probe-restrictions.ts
 */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';
import type { RoomRequest } from '../src/t10/types.js';

const CIUDAD = 'ES00634';
const NOCHES = [1, 2, 3, 4, 5, 7, 10];
/** Meses de antelación desde hoy */
const MESES = [1, 2, 3, 4, 5, 6];
const OCUPACIONES: { etiqueta: string; rooms: RoomRequest[] }[] = [
  { etiqueta: '1ad', rooms: [{ adults: 1, children: 0, units: 1 }] },
  { etiqueta: '2ad', rooms: [{ adults: 2, children: 0, units: 1 }] },
  { etiqueta: '3ad', rooms: [{ adults: 3, children: 0, units: 1 }] },
  { etiqueta: '2ad+1ni', rooms: [{ adults: 2, children: 1, firstChildAge: 8, units: 1 }] },
];

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

const iso = (d: Date) => d.toISOString().slice(0, 10);

interface Ejemplo { code: string; hotel: string; checkIn: string; checkOut: string; ocupacion: string; mealPlan?: string; pvp?: string }
const ejemplos: Ejemplo[] = [];
const conteo = new Map<string, number>();
let consultas = 0, conOferta = 0, ofertasTotales = 0;

for (const mes of MESES) {
  for (const noches of NOCHES) {
    for (const occ of OCUPACIONES) {
      const inicio = new Date();
      inicio.setMonth(inicio.getMonth() + mes);
      inicio.setDate(12);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + noches);
      try {
        consultas++;
        const r = await client.getAccommodationAvail({
          checkIn: iso(inicio), checkOut: iso(fin),
          rooms: occ.rooms, destinationCode: CIUDAD, retrieveCancelPolicies: true,
        });
        if (r.accommodations.length) conOferta++;
        ofertasTotales += r.accommodations.length;
        for (const a of r.accommodations) {
          for (const res of a.restrictions ?? []) {
            conteo.set(res.code, (conteo.get(res.code) ?? 0) + 1);
            if (ejemplos.filter(e => e.code === res.code).length < 2) {
              ejemplos.push({ code: res.code, hotel: a.code, checkIn: iso(inicio), checkOut: iso(fin), ocupacion: occ.etiqueta, mealPlan: a.mealPlan, pvp: a.pvp });
            }
          }
        }
      } catch (e) {
        console.log(`  ! ${iso(inicio)} ${noches}n ${occ.etiqueta}: ${(e as Error).message.slice(0, 70)}`);
      }
    }
    process.stdout.write('.');
  }
  process.stdout.write(` mes+${mes}\n`);
}

console.log(`\n${consultas} consultas · ${conOferta} con oferta · ${ofertasTotales} tarifas vistas`);
console.log('\n=== Códigos de restricción encontrados ===');
for (const [code, n] of [...conteo].sort((a, b) => b[1] - a[1])) console.log(`${code.padEnd(8)} ${n}`);
console.log('\n=== Cómo reproducir cada uno ===');
for (const e of ejemplos) {
  console.log(`${e.code.padEnd(8)} ${e.hotel} ${e.checkIn}→${e.checkOut} ${e.ocupacion.padEnd(8)} ${e.mealPlan ?? ''} ${e.pvp ?? ''}`);
}
