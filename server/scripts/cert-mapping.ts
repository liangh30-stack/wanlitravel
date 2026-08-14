/**
 * Certificación API 3.1 Mapping.
 *
 * El Excel de Tour10 pide la petición y la respuesta de nueve llamadas, entre
 * ellas dos de getAllHotels para demostrar la paginación por operationCode.
 * Este script las ejecuta contra el entorno de test y vuelca el XML crudo a
 * server/data/cert-mapping.json para rellenar el Excel.
 *
 * Uso: npx tsx server/scripts/cert-mapping.ts
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { createModuleTransport } from '../src/t10/transport.js';
import { parseResponseXml, extractResult } from '../src/t10/xml.js';

const transporte = createModuleTransport({
  bookingUrl: process.env.T10_BOOKING_URL!,
  mappingUrl: process.env.T10_MAPPING_URL!,
  reservationsUrl: process.env.T10_RESERVATIONS_URL!,
  logDir: './logs/t10',
});

const DECL = '<?xml version="1.0" encoding="ISO-8859-1"?>';
const USER = process.env.T10_USER!;
const PASS = process.env.T10_PASSWORD!;

interface Captura { clave: string; operacion: string; request: string; response: string }
const capturas: Captura[] = [];

/** Lanza una operación de Mapping y guarda el intercambio crudo. */
async function llamar(clave: string, operacion: string, campos: string): Promise<string> {
  const request = `${DECL}<${operacion}><user>${USER}</user><password>${PASS}</password>${campos}</${operacion}>`;
  const response = await transporte(operacion, request, 120_000);
  capturas.push({ clave, operacion, request, response });
  const res = extractResult(parseResponseXml(response));
  console.log(`${clave.padEnd(28)} ${res.cod_result} ${res.des_result.slice(0, 40)} (${response.length} car.)`);
  return response;
}

/* 1-2. getAllHotels: primera página y segunda usando el operationCode devuelto */
const primera = await llamar('getAllHotels inicial', 'getAllHotels', '<operationCode></operationCode>');
const operationCode = /<operationCode>(.*?)<\/operationCode>/.exec(primera)?.[1] ?? '';
console.log(`  operationCode devuelto: ${operationCode || '(vacío)'}`);
await llamar('getAllHotels segunda', 'getAllHotels', `<operationCode>${operationCode}</operationCode>`);

/* 3. Detalle de uno de los hoteles del entorno de test */
await llamar('getHotelDetails', 'getHotelDetails', '<hotelID>Mlg0846</hotelID>');

/* 4-9. Tablas estáticas */
await llamar('getAccomodationCategories', 'getAccomodationCategories', '');
await llamar('getMealPlans', 'getMealPlans', '');
// getCities exige el provinceCode ENTERO (con prefijo de país) y ADEMÁS el
// countryCode: con 'Mlg' o con 'ESMlg' a secas devuelve "No existen datos".
await llamar('getCities', 'getCities', '<provinceCode>ESMlg</provinceCode><countryCode>ES</countryCode>');
await llamar('getZones', 'getZones', '<countryCode>ES</countryCode>');
await llamar('getProvinces', 'getProvinces', '<countryCode>ES</countryCode>');
await llamar('getCountries', 'getCountries', '');

await mkdir('./server/data', { recursive: true });
await writeFile('./server/data/cert-mapping.json', JSON.stringify({
  generadoEl: new Date().toISOString(),
  entorno: process.env.T10_MAPPING_URL,
  usuario: USER,
  operationCode,
  capturas,
}, null, 2), 'utf8');
console.log('\nEscrito: server/data/cert-mapping.json');
