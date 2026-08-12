/**
 * Reservas de certificación sobre tarifas restringidas.
 *
 * El formulario del API 2.9 pide tres reservas con restricción: NR (ya hecha),
 * EPKT y +55. Tour10 confirmó por correo el 2026-08-11 que, al no existir esas
 * dos últimas en el entorno de test, se sustituyen por ADLT y +60
 * respectivamente. Este script busca una tarifa de cada tipo y la reserva.
 *
 * Uso: npx tsx server/scripts/cert-restricted.ts
 */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';

const CHECK_IN = '2026-11-10';
const CHECK_OUT = '2026-11-15';
const CITY = 'ES00634';
const PAIS = 'ES';

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

/** Los pasajeros de la tarifa +60 deben tener la edad que la tarifa exige */
const CASOS = [
  { code: 'ADLT', desc: 'Solo adultos (sustituye a EPKT por indicación de Tour10)', edades: [35, 38] },
  { code: '+60', desc: 'Mayores de 60 (sustituye a +55 por indicación de Tour10)', edades: [66, 63] },
];

const NOMBRES = ['Juan', 'Maria', 'Carlos', 'Lucia'];

for (const caso of CASOS) {
  const ref = `WLR${caso.code.replace('+', 'P')}${Date.now().toString(36).slice(-4).toUpperCase()}`;
  try {
    const avail = await client.getAccommodationAvail({
      checkIn: CHECK_IN, checkOut: CHECK_OUT, destinationCode: CITY, countryCode: PAIS,
      rooms: [{ adults: 2, children: 0, units: 1 }],
      retrieveCancelPolicies: true,
    });
    const oferta = avail.accommodations.find(a =>
      a.status === 'SALE' && a.idDistributions &&
      (a.restrictions ?? []).some(r => r.code === caso.code));
    if (!oferta) {
      console.log(`${caso.code}: no se ha encontrado ninguna tarifa con esa restricción`);
      continue;
    }
    const valued = await client.value({
      idOperation: avail.idOperation, code: oferta.code, idDistributions: oferta.idDistributions!,
    });
    const confirmed = await client.confirm({
      idOperation: valued.idOperation, code: oferta.code, idDistributions: oferta.idDistributions!,
      clientLocalizer: ref,
      remarksForProvider: caso.code === '+60' ? '(+60) Tarifa mayores de 60 anos' : undefined,
      clients: caso.edades.map((age, i) => ({
        age, name: NOMBRES[i], firstSurname: 'Prueba', secondSurname: 'Cert',
      })),
    });
    console.log(`${caso.code.padEnd(5)} OK  hotel=${oferta.code} ${oferta.name}`);
    console.log(`        localizador=${confirmed.locator}  neto=${confirmed.neto} ${confirmed.currencyCode ?? ''}  ref=${ref}`);
    console.log(`        restricciones=${(oferta.restrictions ?? []).map(r => r.code).join(',')}`);
  } catch (e: any) {
    console.log(`${caso.code}: FALLO ${e?.code ?? ''} ${e?.serverMessage ?? e?.message ?? e}`);
  }
}
