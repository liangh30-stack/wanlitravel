/** Prueba de los módulos Mapping 3.1 y Reservations 3.1 contra TEST. */
import { T10Client } from '../src/t10/client.js';
import { createModuleTransport } from '../src/t10/transport.js';
const client = new T10Client({
  user: process.env.T10_USER!, password: process.env.T10_PASSWORD!,
  transport: createModuleTransport({
    bookingUrl: process.env.T10_BOOKING_URL!, mappingUrl: process.env.T10_MAPPING_URL!,
    reservationsUrl: process.env.T10_RESERVATIONS_URL!, logDir: './logs/t10',
  }),
});
const hoteles = await client.getAllHotels({ maxPages: 2 });
console.log('getAllHotels:', hoteles.length, '→', hoteles.slice(0, 4).map(h => `${h.code} ${h.name}`).join(' | '));
const paises = await client.getCountries();
console.log('getCountries:', paises.length, '→', paises.slice(0, 3).map(c => `${c.code}:${c.name}`).join(' '));
const provincias = await client.getProvinces('ES');
console.log('getProvinces(ES):', provincias.length);
const malaga = provincias.find(p => /M..?laga/i.test(p.name));
console.log('provincia Málaga:', malaga?.code, malaga?.name);
const ciudades = await client.getCities(malaga?.code);
console.log('getCities:', ciudades.length, '→ Málaga presente:', ciudades.some(c => c.code === 'ES00634'));
const regimenes = await client.getMealPlans();
console.log('getMealPlans:', regimenes.length, '→', regimenes.map(m => m.code).join(','));
const cats = await client.getAccommodationCategories();
console.log('getCategories:', cats.length);
if (hoteles.length) {
  const det = await client.getHotelDetails(hoteles[0].code);
  console.log('getHotelDetails OK para', hoteles[0].code);
}
