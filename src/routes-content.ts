/**
 * Contenido de las 8 rutas (5 Iberia + 3 China) en los tres idiomas.
 *
 * Las imagenes son ficheros locales en /public: no dependemos de terceros
 * (loremflickr/unsplash) que pueden caerse, cambiar la foto o estar
 * bloqueados en China continental.
 */
export type RouteGroup = 'iberia' | 'china';

export interface ItineraryStep { location: string; activity: string }
export interface RouteContent {
  region: string;
  title: string;
  description: string;
  itinerary: ItineraryStep[];
}
export interface RouteMeta {
  id: string;
  group: RouteGroup;
  /** Miniatura del listado (760 px) */
  img: string;
  /** Cabecera del detalle (1700 px) */
  hero: string;
  /** Fotos por paso del itinerario, indexadas por posicion */
  stepImgs?: Record<number, string>;
}

export const routeMeta: RouteMeta[] = [
  {
    id: "iberia-signature",
    group: "iberia",
    img: "/photos/lisboa.jpg",
    hero: "/photos/lisboa-hero.jpg",
    stepImgs: { 0: "/photos/lisboa.jpg", 2: "/photos/evora.jpg", 3: "/photos/sevilla.jpg", 4: "/photos/gibraltar.jpg", 5: "/photos/granada.jpg", 6: "/photos/toledo.jpg", 7: "/photos/segovia.jpg", 8: "/photos/sagrada-familia.jpg" },
  },
  {
    id: "modernist-dreams",
    group: "iberia",
    img: "/photos/barcelona.jpg",
    hero: "/photos/barcelona-hero.jpg",
    stepImgs: { 0: "/photos/sagrada-familia.jpg", 1: "/photos/costa-brava.jpg", 2: "/photos/montserrat.jpg" },
  },
  {
    id: "portugal-autentico",
    group: "iberia",
    img: "/photos/oporto.jpg",
    hero: "/photos/oporto-hero.jpg",
    stepImgs: { 0: "/photos/lisboa.jpg", 1: "/photos/evora.jpg", 2: "/photos/algarve.jpg", 3: "/photos/lagos.jpg", 4: "/photos/sintra.jpg", 5: "/photos/obidos.jpg", 6: "/photos/aveiro.jpg", 7: "/photos/oporto.jpg", 8: "/photos/duero.jpg", 9: "/photos/guimaraes.jpg" },
  },
  {
    id: "southern-spain",
    group: "iberia",
    img: "/photos/sevilla.jpg",
    hero: "/photos/sevilla-hero.jpg",
    stepImgs: { 0: "/photos/madrid.jpg", 1: "/photos/toledo.jpg", 2: "/photos/cordoba.jpg", 3: "/photos/sevilla.jpg", 4: "/photos/ronda.jpg", 5: "/photos/costa-del-sol.jpg", 6: "/photos/valencia.jpg", 8: "/photos/barcelona.jpg", 9: "/photos/sagrada-familia.jpg" },
  },
  {
    id: "atlantic-spain-portugal",
    group: "iberia",
    img: "/photos/san-sebastian.jpg",
    hero: "/photos/san-sebastian-hero.jpg",
    stepImgs: { 0: "/photos/barcelona.jpg", 1: "/photos/zaragoza.jpg", 2: "/photos/san-sebastian.jpg", 3: "/photos/santander.jpg", 4: "/photos/oviedo.jpg", 5: "/photos/gijon.jpg", 6: "/photos/lugo.jpg", 7: "/photos/santiago.jpg", 8: "/photos/vigo.jpg", 9: "/photos/oporto.jpg" },
  },
  {
    id: "china-imperial-capitals",
    group: "china",
    img: "/photos/gran-muralla.jpg",
    hero: "/photos/gran-muralla-hero.jpg",
    stepImgs: { 0: "/photos/beijing.jpg", 2: "/photos/gran-muralla.jpg", 4: "/photos/pingyao.jpg", 6: "/photos/xian.jpg", 8: "/photos/xian.jpg" },
  },
  {
    id: "china-water-towns",
    group: "china",
    img: "/photos/shanghai-bund.jpg",
    hero: "/photos/shanghai-bund-hero.jpg",
    stepImgs: { 0: "/photos/shanghai-bund.jpg", 1: "/photos/shanghai.jpg", 3: "/photos/suzhou.jpg", 5: "/photos/tongli.jpg", 6: "/photos/hangzhou.jpg", 8: "/photos/longjing.jpg" },
  },
  {
    id: "china-karst",
    group: "china",
    img: "/photos/rio-li.jpg",
    hero: "/photos/rio-li-hero.jpg",
    stepImgs: { 0: "/photos/guilin.jpg", 2: "/photos/longsheng.jpg", 3: "/photos/terrazas-longji.jpg", 4: "/photos/rio-li.jpg", 5: "/photos/yangshuo.jpg", 7: "/photos/xingping.jpg" },
  },
];

export const routeContent: Record<'en'|'zh'|'es', Record<string, RouteContent>> = {
  es: {
    "iberia-signature": {
      region: "Portugal y España",
      title: "Iberia Signature",
      description: "Gran tour de 10 días de Lisboa a Barcelona — cultura, arte, historia, gastronomía y compras premium.",
      itinerary: [
        {
          location: "Día 1 — Lisboa",
          activity: "Llegada a Lisboa y cena de bienvenida con música de Fado.",
        },
        {
          location: "Día 2 — Lisboa",
          activity: "Torre de Belém, Monasterio de los Jerónimos y degustación de los auténticos Pastéis de Belém.",
        },
        {
          location: "Día 3 — Évora → Sevilla",
          activity: "Templo romano de Évora y entrada en España hacia Sevilla.",
        },
        {
          location: "Día 4 — Sevilla",
          activity: "Catedral de Sevilla, Plaza de España y noche de flamenco auténtico en Triana.",
        },
        {
          location: "Día 5 — Gibraltar → Granada",
          activity: "Mirador de Gibraltar y traslado a Granada para la Alhambra iluminada de noche.",
        },
        {
          location: "Día 6 — Granada → Córdoba → Madrid",
          activity: "Alhambra y Generalife, Mezquita de Córdoba, AVE de alta velocidad a Madrid.",
        },
        {
          location: "Día 7 — Madrid y Toledo",
          activity: "Museo del Prado, Palacio Real y Toledo medieval, la Ciudad de las Tres Culturas.",
        },
        {
          location: "Día 8 — Segovia → Barcelona",
          activity: "Acueducto Romano de Segovia y tren AVE hasta Barcelona.",
        },
        {
          location: "Día 9 — Barcelona",
          activity: "Sagrada Familia, Park Güell, Casa Batlló y tapas por Las Ramblas.",
        },
        {
          location: "Día 10 — La Roca Village",
          activity: "Compras premium en La Roca Village y traslado de despedida al aeropuerto.",
        },
      ],
    },
    "modernist-dreams": {
      region: "Cataluña",
      title: "Sueños Modernistas",
      description: "Sea testigo de las maravillas arquitectónicas y la elegancia costera de la costa mediterránea.",
      itinerary: [
        {
          location: "Barcelona",
          activity: "Obras maestras de Gaudí y un taller culinario privado.",
        },
        {
          location: "Costa Brava",
          activity: "Navegando por las calas escondidas y visitando Figueres de Dalí.",
        },
        {
          location: "Montserrat",
          activity: "Alturas espirituales y vistas del monasterio en la cima de la montaña.",
        },
      ],
    },
    "portugal-autentico": {
      region: "Portugal",
      title: "Portugal Auténtico",
      description: "Inmersión de 10 días por Portugal — de Lisboa y la costa del Algarve a Oporto y el Valle del Duero.",
      itinerary: [
        {
          location: "Día 1 — Lisboa",
          activity: "Llegada a Lisboa y cena de bienvenida en una tasca tradicional.",
        },
        {
          location: "Día 2 — Lisboa y Évora",
          activity: "Barrio de Belém, Monasterio de los Jerónimos y templo romano de Évora.",
        },
        {
          location: "Día 3 — Algarve",
          activity: "Viaje hacia el sur a Faro y Albufeira por la costa del Algarve.",
        },
        {
          location: "Día 4 — Lagos",
          activity: "Paseo en barco por las cuevas de Benagil y los acantilados de Ponta da Piedade.",
        },
        {
          location: "Día 5 — Sintra y Cabo da Roca",
          activity: "Palacio da Pena, Quinta da Regaleira y los acantilados más occidentales de Europa.",
        },
        {
          location: "Día 6 — Óbidos y Nazaré",
          activity: "Óbidos medieval amurallada y las olas gigantes de Nazaré.",
        },
        {
          location: "Día 7 — Aveiro → Oporto",
          activity: "Paseo en moliceiro por Aveiro, llegada a Oporto y atardecer en la ribera del Duero.",
        },
        {
          location: "Día 8 — Oporto",
          activity: "Librería Lello, Torre de los Clérigos, Ribeira y degustación de vino de Oporto.",
        },
        {
          location: "Día 9 — Valle del Duero",
          activity: "Crucero por los viñedos del Duero y visita a una bodega histórica.",
        },
        {
          location: "Día 10 — Guimarães, Braga y Coimbra",
          activity: "Cuna de Portugal, santuario del Bom Jesus y la ciudad universitaria de Coimbra.",
        },
      ],
    },
    "southern-spain": {
      region: "Sur de España",
      title: "Southern Spain Signature",
      description: "Gran ruta de 11 días desde Madrid hasta Barcelona por Andalucía, Granada y Valencia — cultura, patrimonio, flamenco y shopping premium.",
      itinerary: [
        {
          location: "Día 1 — Madrid",
          activity: "Llegada a Madrid con primera panorámica por Castellana, Cibeles, Puerta de Alcalá y Gran Vía.",
        },
        {
          location: "Día 2 — Madrid → Toledo → Córdoba",
          activity: "Catedral de Toledo, casco histórico y miradores panorámicos antes de continuar hacia Córdoba.",
        },
        {
          location: "Día 3 — Córdoba → Sevilla",
          activity: "Mezquita-Catedral, Judería, Calleja de las Flores y Puente Romano antes de seguir a Sevilla.",
        },
        {
          location: "Día 4 — Sevilla",
          activity: "Visita guiada de Catedral y Giralda, Santa Cruz, Plaza de España y Parque María Luisa, con opción de flamenco.",
        },
        {
          location: "Día 5 — Sevilla → Ronda → Costa del Sol",
          activity: "Puente Nuevo, El Tajo y casco antiguo de Ronda antes de llegar a la Costa del Sol.",
        },
        {
          location: "Día 6 — Costa del Sol → Granada",
          activity: "Alhambra, Generalife y Alcazaba, con opción de Albaicín y cena-espectáculo flamenca.",
        },
        {
          location: "Día 7 — Granada → Valencia",
          activity: "Traslado a Valencia con ritmo equilibrado y paradas técnicas en ruta.",
        },
        {
          location: "Día 8 — Valencia",
          activity: "Catedral, Plaza de la Virgen, Ciudad de las Artes y las Ciencias y tiempo relajado para paella o playa.",
        },
        {
          location: "Día 9 — Valencia → Barcelona",
          activity: "Llegada a Barcelona con introducción panorámica por Sagrada Familia, Paseo de Gracia y Ramblas.",
        },
        {
          location: "Día 10 — Barcelona + La Roca Village",
          activity: "Sagrada Familia, Barrio Gótico, Montjuïc y tiempo dedicado a compras premium en La Roca Village.",
        },
        {
          location: "Día 11 — Salida Barcelona",
          activity: "Desayuno y traslado privado al aeropuerto para cerrar el viaje.",
        },
      ],
    },
    "atlantic-spain-portugal": {
      region: "España Atlántica y Portugal",
      title: "Atlantic Spain & Portugal",
      description: "Viaje premium de 10 días desde Barcelona por el norte de España y Galicia hasta Oporto — gastronomía vasca, costa atlántica y rituales del Duero.",
      itinerary: [
        {
          location: "Día 1 — Barcelona",
          activity: "Llegada a Barcelona y panorámica por Sagrada Familia, Paseo de Gracia y Plaza Cataluña.",
        },
        {
          location: "Día 2 — Barcelona → Zaragoza → San Sebastián",
          activity: "Parada en Zaragoza para visitar la Basílica del Pilar antes de continuar hacia San Sebastián.",
        },
        {
          location: "Día 3 — San Sebastián",
          activity: "La Concha, Monte Igueldo, casco antiguo y una experiencia de almuerzo con pintxos.",
        },
        {
          location: "Día 4 — San Sebastián → Santander",
          activity: "Traslado atlántico a Santander con visitas al Palacio de la Magdalena y El Sardinero.",
        },
        {
          location: "Día 5 — Santander → Oviedo",
          activity: "Santillana del Mar, Catedral de Oviedo, casco antiguo y una experiencia de sidra asturiana.",
        },
        {
          location: "Día 6 — Oviedo → Gijón → Oviedo",
          activity: "Día costero en Gijón, incluyendo Playa de San Lorenzo, puerto y almuerzo de marisco.",
        },
        {
          location: "Día 7 — Oviedo → Lugo → Santiago",
          activity: "Muralla romana de Lugo y primer paseo por el casco histórico de Santiago de Compostela.",
        },
        {
          location: "Día 8 — Santiago + Rías Baixas",
          activity: "Catedral de Santiago seguida de una excursión a Combarro y O Grove en las Rías Baixas.",
        },
        {
          location: "Día 9 — Santiago → Vigo → Oporto",
          activity: "Parada en Vigo, entrada en Portugal y crucero clásico de los Seis Puentes en Oporto.",
        },
        {
          location: "Día 10 — Salida Oporto",
          activity: "Breve visita de Oporto y traslado al aeropuerto para finalizar el programa atlántico.",
        },
      ],
    },
    "china-imperial-capitals": {
      region: "El Norte",
      title: "Capitales Imperiales",
      description: "Gran tour de 10 días por el corazón antiguo de China — Pekín, la Gran Muralla, Pingyao y Xi'an.",
      itinerary: [
        {
          location: "Día 1 — Pekín",
          activity: "Llegada a Pekín, traslado al hotel y cena de bienvenida con Pato Laqueado.",
        },
        {
          location: "Día 2 — Pekín",
          activity: "Plaza de Tiananmen, Ciudad Prohibida y paseo en rickshaw por los hutongs.",
        },
        {
          location: "Día 3 — Gran Muralla",
          activity: "Caminata privada por la sección de Mutianyu con ascenso en teleférico.",
        },
        {
          location: "Día 4 — Pekín",
          activity: "Palacio de Verano en barco y Templo del Cielo al atardecer.",
        },
        {
          location: "Día 5 — Pekín → Pingyao",
          activity: "Tren de alta velocidad a Pingyao, paseo por las murallas Ming.",
        },
        {
          location: "Día 6 — Pingyao",
          activity: "Museo bancario Rishengchang, Templo de Confucio y estancia en hotel patio.",
        },
        {
          location: "Día 7 — Pingyao → Xi'an",
          activity: "Tren a Xi'an y paseo en bicicleta sobre las murallas Ming al atardecer.",
        },
        {
          location: "Día 8 — Xi'an",
          activity: "Acceso exclusivo a las fosas del Ejército de Terracota con guía experto.",
        },
        {
          location: "Día 9 — Xi'an",
          activity: "Pagoda de la Oca Salvaje, ruta gastronómica por el Barrio Musulmán y espectáculo Tang.",
        },
        {
          location: "Día 10 — Salida",
          activity: "Traslado al aeropuerto para el vuelo de regreso.",
        },
      ],
    },
    "china-water-towns": {
      region: "El Este",
      title: "Modernidad y Pueblos de Agua",
      description: "Recorrido de 10 días entre rascacielos futuristas y antiguos pueblos de canales — Shanghái, Suzhou y Hangzhou.",
      itinerary: [
        {
          location: "Día 1 — Shanghái",
          activity: "Llegada a Shanghái y crucero nocturno por el río Huangpu a lo largo del Bund.",
        },
        {
          location: "Día 2 — Shanghái",
          activity: "Jardín Yu, Ciudad Vieja, Museo de Shanghái y los rascacielos de Pudong.",
        },
        {
          location: "Día 3 — Shanghái",
          activity: "Concesión Francesa, distrito artístico de Tianzifang y compras en Nanjing Road.",
        },
        {
          location: "Día 4 — Shanghái → Suzhou",
          activity: "Tren de alta velocidad a Suzhou, paseo en barco por el Jardín del Administrador Humilde.",
        },
        {
          location: "Día 5 — Suzhou",
          activity: "Colina del Tigre, canales de Pingjiang Road y taller de bordado en seda.",
        },
        {
          location: "Día 6 — Tongli",
          activity: "Excursión al pueblo de agua de Tongli con paseo en góndola tradicional.",
        },
        {
          location: "Día 7 — Suzhou → Hangzhou",
          activity: "Tren a Hangzhou y paseo al atardecer por las calzadas del Lago del Oeste.",
        },
        {
          location: "Día 8 — Hangzhou",
          activity: "Paseo en barco por el Lago del Oeste, Templo Lingyin y grutas de Feilai Feng.",
        },
        {
          location: "Día 9 — Aldea del té Longjing",
          activity: "Visita a una plantación de té Longjing, ceremonia y Museo Nacional del Té.",
        },
        {
          location: "Día 10 — Salida",
          activity: "Tren de alta velocidad de regreso a Shanghái y traslado al aeropuerto.",
        },
      ],
    },
    "china-karst": {
      region: "El Sur",
      title: "Paisajes Kársticos",
      description: "Inmersión de 10 días en los picos kársticos y ríos serpenteantes de Guilin, Yangshuo y Longsheng.",
      itinerary: [
        {
          location: "Día 1 — Guilin",
          activity: "Llegada a Guilin y cena de bienvenida con especialidades de Guangxi.",
        },
        {
          location: "Día 2 — Guilin",
          activity: "Cueva de la Flauta de Caña, Colina de la Trompa de Elefante y las Pagodas del Sol y la Luna de noche.",
        },
        {
          location: "Día 3 — Longsheng",
          activity: "Traslado a Longsheng y visita a los pueblos Zhuang y Yao.",
        },
        {
          location: "Día 4 — Espinazo del Dragón",
          activity: "Senderismo por las Terrazas de Arroz de Longji con miradores panorámicos.",
        },
        {
          location: "Día 5 — Crucero por el Li",
          activity: "Crucero de lujo de Guilin a Yangshuo entre los picos kársticos del río Li.",
        },
        {
          location: "Día 6 — Yangshuo",
          activity: "Calle Oeste, ciclismo entre arrozales y mirador de la Colina de la Luna.",
        },
        {
          location: "Día 7 — Río Yulong",
          activity: "Rafting en bambú por el tranquilo río Yulong y clase de Tai Chi al amanecer.",
        },
        {
          location: "Día 8 — Xingping",
          activity: "Excursión al pueblo pesquero de Xingping y demostración de pesca con cormoranes.",
        },
        {
          location: "Día 9 — Yangshuo",
          activity: "Clase de cocina con una familia local y espectáculo de luces Impression Liu Sanjie.",
        },
        {
          location: "Día 10 — Salida",
          activity: "Traslado por carretera al aeropuerto de Guilin.",
        },
      ],
    },
  },
  en: {
    "iberia-signature": {
      region: "Portugal & Spain",
      title: "Iberia Signature",
      description: "A 10-day grand tour from Lisbon to Barcelona — culture, art, history, gastronomy and premium shopping.",
      itinerary: [
        {
          location: "Day 1 — Lisbon",
          activity: "Arrival in Lisbon, welcome dinner with Fado music.",
        },
        {
          location: "Day 2 — Lisbon",
          activity: "Belém Tower, Jerónimos Monastery and tasting of the original Pastéis de Belém.",
        },
        {
          location: "Day 3 — Évora → Seville",
          activity: "Roman temple of Évora, then crossing into Spain to Seville.",
        },
        {
          location: "Day 4 — Seville",
          activity: "Cathedral of Seville, Plaza de España and an evening of authentic Flamenco in Triana.",
        },
        {
          location: "Day 5 — Gibraltar → Granada",
          activity: "Gibraltar viewpoint and drive to Granada for the illuminated Alhambra by night.",
        },
        {
          location: "Day 6 — Granada → Córdoba → Madrid",
          activity: "Alhambra & Generalife, Mezquita of Córdoba, high-speed AVE to Madrid.",
        },
        {
          location: "Day 7 — Madrid & Toledo",
          activity: "Prado Museum, Royal Palace and medieval Toledo, the City of Three Cultures.",
        },
        {
          location: "Day 8 — Segovia → Barcelona",
          activity: "Roman Aqueduct of Segovia, then AVE high-speed train to Barcelona.",
        },
        {
          location: "Day 9 — Barcelona",
          activity: "Sagrada Familia, Park Güell, Casa Batlló and tapas on Las Ramblas.",
        },
        {
          location: "Day 10 — La Roca Village",
          activity: "Premium shopping at La Roca Village and farewell transfer to the airport.",
        },
      ],
    },
    "modernist-dreams": {
      region: "Catalonia",
      title: "Modernist Dreams",
      description: "Witness the architectural marvels and coastal elegance of the Mediterranean shore.",
      itinerary: [
        {
          location: "Barcelona",
          activity: "Gaudí's masterpieces and a private culinary workshop.",
        },
        {
          location: "Costa Brava",
          activity: "Sailing the hidden coves and visiting Dalí's Figueres.",
        },
        {
          location: "Montserrat",
          activity: "Spiritual heights and mountain-top monastery views.",
        },
      ],
    },
    "portugal-autentico": {
      region: "Portugal",
      title: "Authentic Portugal",
      description: "A 10-day immersion through Portugal — from Lisbon and the Algarve coast to Porto and the Douro Valley.",
      itinerary: [
        {
          location: "Day 1 — Lisbon",
          activity: "Arrival in Lisbon and welcome dinner at a traditional tasca.",
        },
        {
          location: "Day 2 — Lisbon & Évora",
          activity: "Belém district, Jerónimos Monastery and the Roman temple of Évora.",
        },
        {
          location: "Day 3 — Algarve",
          activity: "Drive south to Faro and Albufeira along the Algarve coast.",
        },
        {
          location: "Day 4 — Lagos",
          activity: "Boat tour of the Benagil sea caves and Ponta da Piedade cliffs.",
        },
        {
          location: "Day 5 — Sintra & Cabo da Roca",
          activity: "Pena Palace, Quinta da Regaleira and the westernmost cliffs of Europe.",
        },
        {
          location: "Day 6 — Óbidos & Nazaré",
          activity: "Walled medieval Óbidos and the giant waves of Nazaré.",
        },
        {
          location: "Day 7 — Aveiro → Porto",
          activity: "Moliceiro boat ride in Aveiro, arrival in Porto, sunset at the Douro riverside.",
        },
        {
          location: "Day 8 — Porto",
          activity: "Livraria Lello, Clérigos Tower, Ribeira district and Port wine tasting.",
        },
        {
          location: "Day 9 — Douro Valley",
          activity: "River cruise through the Douro vineyards and visit to a historic wine estate.",
        },
        {
          location: "Day 10 — Guimarães, Braga & Coimbra",
          activity: "Birthplace of Portugal, Bom Jesus sanctuary and the university town of Coimbra.",
        },
      ],
    },
    "southern-spain": {
      region: "Southern Spain",
      title: "Southern Spain Signature",
      description: "An 11-day grand route from Madrid to Barcelona through Andalusia, Granada and Valencia — culture, heritage, flamenco and premium shopping.",
      itinerary: [
        {
          location: "Day 1 — Madrid",
          activity: "Arrival in Madrid with a panoramic introduction via Castellana, Cibeles, Puerta de Alcalá and Gran Vía.",
        },
        {
          location: "Day 2 — Madrid → Toledo → Córdoba",
          activity: "Toledo Cathedral, the historic center and panoramic viewpoints before continuing to Córdoba.",
        },
        {
          location: "Day 3 — Córdoba → Seville",
          activity: "Mezquita-Cathedral, the Jewish Quarter, Calleja de las Flores and the Roman Bridge, then on to Seville.",
        },
        {
          location: "Day 4 — Seville",
          activity: "Guided exploration of the Cathedral and Giralda, Santa Cruz, Plaza de España and María Luisa Park, with optional flamenco.",
        },
        {
          location: "Day 5 — Seville → Ronda → Costa del Sol",
          activity: "Ronda's Puente Nuevo, El Tajo and old quarter before a coastal arrival on the Costa del Sol.",
        },
        {
          location: "Day 6 — Costa del Sol → Granada",
          activity: "Granada's Alhambra, Generalife and Alcazaba, with optional Albaicín viewpoints and an evening flamenco dinner.",
        },
        {
          location: "Day 7 — Granada → Valencia",
          activity: "Cross-country transfer to Valencia with a balanced travel rhythm and scenic stops en route.",
        },
        {
          location: "Day 8 — Valencia",
          activity: "Valencia Cathedral, Plaza de la Virgen, the City of Arts and Sciences and relaxed time for paella or the beach.",
        },
        {
          location: "Day 9 — Valencia → Barcelona",
          activity: "Arrival in Barcelona for a panoramic introduction featuring Sagrada Familia, Passeig de Gràcia and Las Ramblas.",
        },
        {
          location: "Day 10 — Barcelona + La Roca Village",
          activity: "Sagrada Familia, the Gothic Quarter, Montjuïc and dedicated premium shopping time at La Roca Village.",
        },
        {
          location: "Day 11 — Barcelona Departure",
          activity: "Breakfast and private transfer to the airport to conclude the journey.",
        },
      ],
    },
    "atlantic-spain-portugal": {
      region: "Atlantic Spain & Portugal",
      title: "Atlantic Spain & Portugal",
      description: "A 10-day premium journey from Barcelona through northern Spain and Galicia to Porto — Basque gastronomy, Atlantic coastlines and Duero rituals.",
      itinerary: [
        {
          location: "Day 1 — Barcelona",
          activity: "Arrival in Barcelona with a panoramic drive past Sagrada Familia, Passeig de Gràcia and Plaça Catalunya.",
        },
        {
          location: "Day 2 — Barcelona → Zaragoza → San Sebastián",
          activity: "Stop in Zaragoza for the Basilica del Pilar before continuing north to San Sebastián.",
        },
        {
          location: "Day 3 — San Sebastián",
          activity: "La Concha, Monte Igueldo, the old town and a pintxos-led lunch experience define the day.",
        },
        {
          location: "Day 4 — San Sebastián → Santander",
          activity: "Atlantic transfer to Santander with visits to Palacio de la Magdalena and El Sardinero.",
        },
        {
          location: "Day 5 — Santander → Oviedo",
          activity: "Santillana del Mar, Oviedo Cathedral, the old quarter and a signature Asturian cider experience.",
        },
        {
          location: "Day 6 — Oviedo → Gijón → Oviedo",
          activity: "A coastal day in Gijón, including San Lorenzo Beach, the port and a seafood-focused lunch.",
        },
        {
          location: "Day 7 — Oviedo → Lugo → Santiago",
          activity: "Lugo's Roman walls and a first walk through the historic center of Santiago de Compostela.",
        },
        {
          location: "Day 8 — Santiago + Rías Baixas",
          activity: "Santiago Cathedral followed by an excursion to Combarro and O Grove in the Rías Baixas.",
        },
        {
          location: "Day 9 — Santiago → Vigo → Porto",
          activity: "Stop in Vigo, continue into Portugal and board a classic Six Bridges cruise in Porto.",
        },
        {
          location: "Day 10 — Porto Departure",
          activity: "A brief Porto visit and airport transfer close the Atlantic program.",
        },
      ],
    },
    "china-imperial-capitals": {
      region: "The North",
      title: "Imperial Capitals",
      description: "A 10-day grand tour through the ancient heart of China — Beijing, the Great Wall, Pingyao and Xi'an.",
      itinerary: [
        {
          location: "Day 1 — Beijing",
          activity: "Arrival in Beijing, transfer to a luxury hotel and welcome Peking Duck dinner.",
        },
        {
          location: "Day 2 — Beijing",
          activity: "Tiananmen Square, the Forbidden City and a hutong rickshaw tour.",
        },
        {
          location: "Day 3 — Great Wall",
          activity: "Private hike along the Mutianyu section of the Great Wall with cable car ascent.",
        },
        {
          location: "Day 4 — Beijing",
          activity: "Summer Palace by boat and the Temple of Heaven at sunset.",
        },
        {
          location: "Day 5 — Beijing → Pingyao",
          activity: "High-speed train to Pingyao, walk along the Ming dynasty city walls.",
        },
        {
          location: "Day 6 — Pingyao",
          activity: "Rishengchang banking museum, Confucian Temple and stay in a courtyard hotel.",
        },
        {
          location: "Day 7 — Pingyao → Xi'an",
          activity: "Train to Xi'an, sunset bike ride atop the Ming dynasty city walls.",
        },
        {
          location: "Day 8 — Xi'an",
          activity: "Exclusive access to the Terracotta Army excavation pits with an expert guide.",
        },
        {
          location: "Day 9 — Xi'an",
          activity: "Big Wild Goose Pagoda, Muslim Quarter food tour and Tang dynasty dance show.",
        },
        {
          location: "Day 10 — Departure",
          activity: "Transfer to the airport for your onward flight.",
        },
      ],
    },
    "china-water-towns": {
      region: "The East",
      title: "Modernity & Water Towns",
      description: "A 10-day journey through futuristic skylines and ancient canal villages — Shanghai, Suzhou and Hangzhou.",
      itinerary: [
        {
          location: "Day 1 — Shanghai",
          activity: "Arrival in Shanghai, evening cruise on the Huangpu river along the Bund.",
        },
        {
          location: "Day 2 — Shanghai",
          activity: "Yu Garden, Old City, Shanghai Museum and the futuristic skyline of Pudong.",
        },
        {
          location: "Day 3 — Shanghai",
          activity: "French Concession walking tour, Tianzifang art district and Nanjing Road shopping.",
        },
        {
          location: "Day 4 — Shanghai → Suzhou",
          activity: "High-speed train to Suzhou, private boat tour of the Humble Administrator's Garden.",
        },
        {
          location: "Day 5 — Suzhou",
          activity: "Tiger Hill, Pingjiang Road canals and a Suzhou silk embroidery workshop.",
        },
        {
          location: "Day 6 — Tongli Water Town",
          activity: "Day excursion to the Tongli ancient water town with traditional gondola ride.",
        },
        {
          location: "Day 7 — Suzhou → Hangzhou",
          activity: "Train to Hangzhou and sunset stroll along the West Lake causeways.",
        },
        {
          location: "Day 8 — Hangzhou",
          activity: "Boat ride on West Lake, Lingyin Temple and the Feilai Feng grottoes.",
        },
        {
          location: "Day 9 — Longjing Tea Village",
          activity: "Visit a Longjing tea plantation, tea ceremony and the China National Tea Museum.",
        },
        {
          location: "Day 10 — Departure",
          activity: "High-speed train back to Shanghai and transfer to the airport.",
        },
      ],
    },
    "china-karst": {
      region: "The South",
      title: "Karst Landscapes",
      description: "A 10-day immersion in the surreal limestone peaks and winding rivers of Guilin, Yangshuo and Longsheng.",
      itinerary: [
        {
          location: "Day 1 — Guilin",
          activity: "Arrival in Guilin and welcome dinner with Guangxi specialties.",
        },
        {
          location: "Day 2 — Guilin",
          activity: "Reed Flute Cave, Elephant Trunk Hill and the Sun and Moon Pagodas at night.",
        },
        {
          location: "Day 3 — Longsheng",
          activity: "Drive to Longsheng, Zhuang and Yao minority villages.",
        },
        {
          location: "Day 4 — Dragon's Backbone",
          activity: "Trekking the Longji Dragon's Backbone Rice Terraces with panoramic viewpoints.",
        },
        {
          location: "Day 5 — Li River Cruise",
          activity: "Luxury cruise from Guilin to Yangshuo through the karst peaks of the Li River.",
        },
        {
          location: "Day 6 — Yangshuo",
          activity: "West Street, countryside cycling among rice paddies and the Moon Hill viewpoint.",
        },
        {
          location: "Day 7 — Yulong River",
          activity: "Bamboo rafting on the gentle Yulong River and a Tai Chi class at sunrise.",
        },
        {
          location: "Day 8 — Xingping",
          activity: "Day trip to Xingping fishing village and a cormorant fisherman demonstration.",
        },
        {
          location: "Day 9 — Yangshuo",
          activity: "Cooking class with a local family and the Impression Liu Sanjie outdoor light show.",
        },
        {
          location: "Day 10 — Departure",
          activity: "Return drive to Guilin airport for your onward flight.",
        },
      ],
    },
  },
  zh: {
    "iberia-signature": {
      region: "葡萄牙与西班牙",
      title: "伊比利亚臻选之旅",
      description: "从里斯本到巴塞罗那的10日深度之旅——文化、艺术、历史、美食与高端购物。",
      itinerary: [
        {
          location: "第1天 — 里斯本",
          activity: "抵达里斯本，法朵音乐欢迎晚宴。",
        },
        {
          location: "第2天 — 里斯本",
          activity: "贝伦塔、热罗尼莫斯修道院，品尝正宗贝伦蛋挞。",
        },
        {
          location: "第3天 — 埃武拉 → 塞维利亚",
          activity: "参观埃武拉罗马神庙，跨境进入西班牙塞维利亚。",
        },
        {
          location: "第4天 — 塞维利亚",
          activity: "塞维利亚大教堂、西班牙广场，特里亚纳地道弗拉门戈之夜。",
        },
        {
          location: "第5天 — 直布罗陀 → 格拉纳达",
          activity: "直布罗陀观景，前往格拉纳达欣赏夜晚灯光下的阿尔罕布拉宫。",
        },
        {
          location: "第6天 — 格拉纳达 → 科尔多瓦 → 马德里",
          activity: "阿尔罕布拉宫与轩尼洛里菲花园、科尔多瓦清真寺，AVE高铁前往马德里。",
        },
        {
          location: "第7天 — 马德里与托莱多",
          activity: "普拉多博物馆、皇宫，中世纪三文化之城托莱多。",
        },
        {
          location: "第8天 — 塞哥维亚 → 巴塞罗那",
          activity: "塞哥维亚罗马渡槽，AVE高铁前往巴塞罗那。",
        },
        {
          location: "第9天 — 巴塞罗那",
          activity: "圣家堂、桂尔公园、巴特罗之家与兰布拉大道小吃。",
        },
        {
          location: "第10天 — 拉罗卡购物村",
          activity: "拉罗卡购物村高端购物，送机告别。",
        },
      ],
    },
    "modernist-dreams": {
      region: "加泰罗尼亚",
      title: "现代主义梦想",
      description: "见证地中海沿岸的建筑奇迹和海岸优雅。",
      itinerary: [
        {
          location: "巴塞罗那",
          activity: "高迪的杰作和私人烹饪工作坊。",
        },
        {
          location: "布拉瓦海岸",
          activity: "在隐蔽的海湾航行，参观达利的菲格拉斯。",
        },
        {
          location: "蒙特塞拉特",
          activity: "精神高地和山顶修道院的景色。",
        },
      ],
    },
    "portugal-autentico": {
      region: "葡萄牙",
      title: "葡萄牙风情深度体验",
      description: "10日深入葡萄牙之旅——从里斯本和阿尔加维海岸到波尔图与杜罗河谷。",
      itinerary: [
        {
          location: "第1天 — 里斯本",
          activity: "抵达里斯本，于传统小馆享用欢迎晚餐。",
        },
        {
          location: "第2天 — 里斯本与埃武拉",
          activity: "贝伦区、热罗尼莫斯修道院与埃武拉罗马神庙。",
        },
        {
          location: "第3天 — 阿尔加维",
          activity: "南下法鲁与阿尔布费拉，沿阿尔加维海岸游览。",
        },
        {
          location: "第4天 — 拉古什",
          activity: "贝纳吉尔海蚀洞游船与皮耶达海角悬崖。",
        },
        {
          location: "第5天 — 辛特拉与罗卡角",
          activity: "佩纳宫、雷加莱拉庄园与欧洲最西端悬崖。",
        },
        {
          location: "第6天 — 奥比都斯与纳扎雷",
          activity: "中世纪城墙小镇奥比都斯与纳扎雷的巨浪。",
        },
        {
          location: "第7天 — 阿威罗 → 波尔图",
          activity: "阿威罗摩里塞罗船游览，抵达波尔图，杜罗河畔日落。",
        },
        {
          location: "第8天 — 波尔图",
          activity: "莱罗书店、教士塔、里贝拉区与波特酒品鉴。",
        },
        {
          location: "第9天 — 杜罗河谷",
          activity: "杜罗河谷葡萄园游船，参观历史悠久的酒庄。",
        },
        {
          location: "第10天 — 吉马良斯、布拉加与科英布拉",
          activity: "葡萄牙的诞生地、仁慈耶稣朝圣所与大学城科英布拉。",
        },
      ],
    },
    "southern-spain": {
      region: "西班牙南部",
      title: "南西班牙臻选之旅",
      description: "11日经典环线，从马德里经安达卢西亚、格拉纳达与瓦伦西亚至巴塞罗那——文化、遗产、弗拉门戈与高端购物。",
      itinerary: [
        {
          location: "第1天 — 马德里",
          activity: "抵达马德里，沿卡斯特利亚纳大道、西贝莱斯广场、阿尔卡拉门与格兰大道全景初览。",
        },
        {
          location: "第2天 — 马德里 → 托莱多 → 科尔多瓦",
          activity: "托莱多大教堂、历史中心与全景观景台，随后前往科尔多瓦。",
        },
        {
          location: "第3天 — 科尔多瓦 → 塞维利亚",
          activity: "清真寺大教堂、犹太区、百花巷与罗马桥，继续前往塞维利亚。",
        },
        {
          location: "第4天 — 塞维利亚",
          activity: "专业导览大教堂与吉拉尔达塔、圣十字区、西班牙广场与玛丽亚·路易莎公园，可选弗拉门戈演出。",
        },
        {
          location: "第5天 — 塞维利亚 → 龙达 → 太阳海岸",
          activity: "龙达新桥、埃尔塔霍峡谷与老城区，傍晚抵达太阳海岸。",
        },
        {
          location: "第6天 — 太阳海岸 → 格拉纳达",
          activity: "阿尔罕布拉宫、轩尼洛里菲花园与阿尔卡萨瓦，可选阿尔拜辛观景与弗拉门戈晚宴。",
        },
        {
          location: "第7天 — 格拉纳达 → 瓦伦西亚",
          activity: "跨区域前往瓦伦西亚，节奏舒适，沿途风景停靠。",
        },
        {
          location: "第8天 — 瓦伦西亚",
          activity: "瓦伦西亚大教堂、圣母广场、艺术科学城，自由时间享用海鲜饭或海滩。",
        },
        {
          location: "第9天 — 瓦伦西亚 → 巴塞罗那",
          activity: "抵达巴塞罗那，全景游览圣家堂、格拉西亚大道与兰布拉大道。",
        },
        {
          location: "第10天 — 巴塞罗那 + 拉罗卡购物村",
          activity: "圣家堂、哥特区、蒙锥克山，并在拉罗卡购物村专享高端购物时光。",
        },
        {
          location: "第11天 — 巴塞罗那离境",
          activity: "早餐后专车送机，行程圆满结束。",
        },
      ],
    },
    "atlantic-spain-portugal": {
      region: "大西洋西班牙与葡萄牙",
      title: "大西洋西葡之旅",
      description: "10日高端旅程，从巴塞罗那经西班牙北部与加利西亚至波尔图——巴斯克美食、大西洋海岸与杜罗河风情。",
      itinerary: [
        {
          location: "第1天 — 巴塞罗那",
          activity: "抵达巴塞罗那，全景车览圣家堂、格拉西亚大道与加泰罗尼亚广场。",
        },
        {
          location: "第2天 — 巴塞罗那 → 萨拉戈萨 → 圣塞巴斯蒂安",
          activity: "中途游览萨拉戈萨皮拉尔圣母大教堂，随后北上圣塞巴斯蒂安。",
        },
        {
          location: "第3天 — 圣塞巴斯蒂安",
          activity: "贝壳海滩、伊格尔多山、老城区与巴斯克小食午餐体验。",
        },
        {
          location: "第4天 — 圣塞巴斯蒂安 → 桑坦德",
          activity: "沿大西洋前往桑坦德，参观玛格达莱纳宫与萨尔迪内罗海滩。",
        },
        {
          location: "第5天 — 桑坦德 → 奥维耶多",
          activity: "滨海圣蒂亚纳、奥维耶多大教堂、老城区与阿斯图里亚斯苹果酒体验。",
        },
        {
          location: "第6天 — 奥维耶多 → 希洪 → 奥维耶多",
          activity: "希洪海滨一日：圣洛伦索海滩、港口与海鲜午餐。",
        },
        {
          location: "第7天 — 奥维耶多 → 卢戈 → 圣地亚哥",
          activity: "卢戈罗马城墙，初访圣地亚哥-德孔波斯特拉历史中心。",
        },
        {
          location: "第8天 — 圣地亚哥 + 下海湾",
          activity: "圣地亚哥大教堂，随后前往孔巴罗与奥格罗韦下海湾游览。",
        },
        {
          location: "第9天 — 圣地亚哥 → 维戈 → 波尔图",
          activity: "停留维戈，进入葡萄牙，乘坐波尔图经典六桥游船。",
        },
        {
          location: "第10天 — 波尔图离境",
          activity: "波尔图短暂游览后送机，大西洋之旅圆满结束。",
        },
      ],
    },
    "china-imperial-capitals": {
      region: "北方",
      title: "帝国首都",
      description: "10日深度之旅，探索中国古老的心脏——北京、长城、平遥与西安。",
      itinerary: [
        {
          location: "第1天 — 北京",
          activity: "抵达北京，入住豪华酒店，北京烤鸭欢迎晚宴。",
        },
        {
          location: "第2天 — 北京",
          activity: "天安门广场、紫禁城与胡同人力车之旅。",
        },
        {
          location: "第3天 — 长城",
          activity: "私人徒步慕田峪长城，缆车上行。",
        },
        {
          location: "第4天 — 北京",
          activity: "颐和园泛舟，日落时分游天坛。",
        },
        {
          location: "第5天 — 北京 → 平遥",
          activity: "高铁前往平遥，漫步明代古城墙。",
        },
        {
          location: "第6天 — 平遥",
          activity: "日昇昌票号、文庙，入住四合院酒店。",
        },
        {
          location: "第7天 — 平遥 → 西安",
          activity: "火车前往西安，日落骑行明代城墙。",
        },
        {
          location: "第8天 — 西安",
          activity: "兵马俑挖掘现场专家独家导览。",
        },
        {
          location: "第9天 — 西安",
          activity: "大雁塔、回民街美食之旅与唐代歌舞表演。",
        },
        {
          location: "第10天 — 离境",
          activity: "送机前往机场。",
        },
      ],
    },
    "china-water-towns": {
      region: "东方",
      title: "现代与水乡",
      description: "10日畅游未来主义天际线与古老运河水乡——上海、苏州与杭州。",
      itinerary: [
        {
          location: "第1天 — 上海",
          activity: "抵达上海，外滩夜游黄浦江。",
        },
        {
          location: "第2天 — 上海",
          activity: "豫园、老城厢、上海博物馆与浦东未来天际线。",
        },
        {
          location: "第3天 — 上海",
          activity: "法租界漫步、田子坊艺术区与南京路购物。",
        },
        {
          location: "第4天 — 上海 → 苏州",
          activity: "高铁前往苏州，私人游船游拙政园。",
        },
        {
          location: "第5天 — 苏州",
          activity: "虎丘、平江路水巷与苏绣工作坊。",
        },
        {
          location: "第6天 — 同里水乡",
          activity: "前往同里古镇，传统摇橹船游览。",
        },
        {
          location: "第7天 — 苏州 → 杭州",
          activity: "火车前往杭州，西湖堤岸日落漫步。",
        },
        {
          location: "第8天 — 杭州",
          activity: "西湖泛舟、灵隐寺与飞来峰石窟。",
        },
        {
          location: "第9天 — 龙井茶村",
          activity: "参观龙井茶园、茶艺表演与中国茶叶博物馆。",
        },
        {
          location: "第10天 — 离境",
          activity: "高铁返沪，送机前往机场。",
        },
      ],
    },
    "china-karst": {
      region: "南方",
      title: "喀斯特地貌",
      description: "10日深入桂林、阳朔与龙胜，体验超现实的石灰岩山峰与蜿蜒河流。",
      itinerary: [
        {
          location: "第1天 — 桂林",
          activity: "抵达桂林，广西特色美食欢迎晚宴。",
        },
        {
          location: "第2天 — 桂林",
          activity: "芦笛岩、象鼻山与夜赏日月双塔。",
        },
        {
          location: "第3天 — 龙胜",
          activity: "前往龙胜，参观壮族与瑶族村寨。",
        },
        {
          location: "第4天 — 龙脊梯田",
          activity: "徒步龙脊梯田，俯瞰壮丽全景。",
        },
        {
          location: "第5天 — 漓江游船",
          activity: "豪华游船自桂林至阳朔，穿越漓江喀斯特峰林。",
        },
        {
          location: "第6天 — 阳朔",
          activity: "西街、乡间骑行穿越稻田与月亮山观景。",
        },
        {
          location: "第7天 — 遇龙河",
          activity: "遇龙河竹筏漂流，日出太极课。",
        },
        {
          location: "第8天 — 兴坪",
          activity: "兴坪渔村一日游与鸬鹚捕鱼表演。",
        },
        {
          location: "第9天 — 阳朔",
          activity: "当地家庭烹饪课与《印象·刘三姐》户外灯光秀。",
        },
        {
          location: "第10天 — 离境",
          activity: "返回桂林机场。",
        },
      ],
    },
  },
};

/**
 * Enlaces antiguos → ruta actual.
 *
 * El catálogo anterior tenía seis rutas con otros identificadores. Cualquier
 * enlace guardado, compartido por WhatsApp o indexado por Google seguiría
 * funcionando: sin esto daría 404 y perderíamos la visita.
 */
export const rutasAntiguas: Record<string, string> = {
  'spain-costa-del-sol': 'southern-spain',
  'spain-catalonia-basque': 'modernist-dreams',
  'spain-castile': 'southern-spain',
  'china-modernity-water-towns': 'china-water-towns',
  'china-karst-landscapes': 'china-karst',
  // china-imperial-capitals conserva el mismo identificador
};
