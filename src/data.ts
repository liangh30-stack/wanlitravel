export interface RouteItineraryStep {
  location: string;
  activity: string;
  img: string;
}

export interface TravelRoute {
  id: string;
  code: string;        // wholesale product code (carried over from static site v1, e.g. ES-AD02)
  region: string;
  title: string;
  description: string;
  img: string;
  days: number;
  nights: number;
  netFrom: number;     // net rate per pax in EUR
  itinerary: RouteItineraryStep[];
}

export const spainRoutes: TravelRoute[] = [
  {
    id: 'spain-costa-del-sol',
    code: 'ES-AD02',
    region: 'Andalusia',
    title: "Costa del Sol Classic",
    description: "Sun-drenched beaches, whitewashed villages, and Michelin-starred dining along the Mediterranean coast.",
    img: "/r-costa.jpg",
    days: 7, nights: 6, netFrom: 850,
    itinerary: [
      { location: "Málaga & Marbella", activity: "VIP airport transfer to 5★ hotel. Welcome dinner at rooftop terrace overlooking the Mediterranean. Morning in Old Town Marbella.", img: "https://images.unsplash.com/photo-1559121225-4c96255d4482?auto=format&fit=crop&q=80&w=1200" },
      { location: "Ronda", activity: "Private visit to Ronda's legendary Puente Nuevo bridge. Wine tasting at a historic mountain bodega. Panoramic sunset views.", img: "https://images.unsplash.com/photo-1543783232-af412b852fc3?auto=format&fit=crop&q=80&w=1200" },
      { location: "Granada — Alhambra", activity: "Skip-the-line access to the Alhambra Palace. Flamenco show in the Sacromonte caves at dusk. Tea in the Albaicín quarter.", img: "https://images.unsplash.com/photo-1592639296346-560c37a0f711?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  { 
    id: 'spain-catalonia-basque',
    code: 'ES-BM01',
    region: 'Catalonia & Basque Country',
    title: "Catalonia & Basque",
    description: "From Gaudí's Barcelona to Bilbao's Guggenheim — a cultural odyssey through Spain's most progressive regions.",
    img: "/r-catalonia.jpg",
    days: 8, nights: 7, netFrom: 920,
    itinerary: [
      { location: "Barcelona", activity: "Private Sagrada Família tour before public opening. Rooftop lunch at Casa Batlló. Private culinary workshop in the Gothic Quarter.", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=1200" },
      { location: "Costa Brava & Montserrat", activity: "Sailing the hidden coves of Costa Brava. Sacred mountain monastery at Montserrat with panoramic valley views.", img: "https://images.unsplash.com/photo-1512753360425-00667f5427aa?auto=format&fit=crop&q=80&w=1200" },
      { location: "Bilbao & San Sebastián", activity: "Guggenheim Museum priority access. Pintxos tour with local chef guide. Optional Michelin-starred dinner at La Concha bay.", img: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  { 
    id: 'spain-castile',
    code: 'ES-CM03',
    region: 'Castile & Madrid',
    title: "Imperial Legacy",
    description: "Three UNESCO World Heritage cities — Toledo, Segovia, and the royal grandeur of Madrid.",
    img: "/r-castile.jpg",
    days: 8, nights: 7, netFrom: 780,
    itinerary: [
      { location: "Madrid", activity: "Prado Museum private access before crowds. Dinner at a historic taberna in the Barrio de las Letras. Royal Palace visit.", img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=1200" },
      { location: "Toledo & Segovia", activity: "Full day Toledo: cathedral, El Greco museum, medieval walls. Roman aqueduct at Segovia and the fairy-tale Alcázar castle.", img: "https://images.unsplash.com/photo-1547191783-94d5f8f6d8b1?auto=format&fit=crop&q=80&w=1200" },
      { location: "Salamanca & Ávila", activity: "Salamanca's golden university and Plaza Mayor. Ávila's medieval walls at sunrise. Private farewell dinner with flamenco performance.", img: "https://images.unsplash.com/photo-1564659996620-f09478b376bb?auto=format&fit=crop&q=80&w=1200" }
    ]
  }
];

export const chinaRoutes: TravelRoute[] = [
  {
    id: 'china-imperial-capitals',
    code: 'CN-IC01',
    region: 'Beijing & Xi\'an',
    title: "Imperial Capitals",
    description: "Walk the Great Wall at sunrise, stand inside the Forbidden City, and trace the Silk Road from Xi'an.",
    img: "/r-imperial.jpg",
    days: 9, nights: 8, netFrom: 720,
    itinerary: [
      { location: "Beijing", activity: "Private Great Wall sunrise hike at Mutianyu. Skip-the-line Forbidden City access. Peking Duck dinner in historic hutong. Summer Palace boat on Kunming Lake.", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=1200" },
      { location: "Xi'an", activity: "Exclusive access to Terracotta Warriors excavation. Expert archaeologist guide. Xi'an Muslim Quarter street food tour by night. Ancient city wall cycling.", img: "https://images.unsplash.com/photo-1599008585472-8700253818e5?auto=format&fit=crop&q=80&w=1200" },
      { location: "Pingyao", activity: "Stay in restored Ming Dynasty courtyard hotel. Ancient trading city walking tour. Traditional shadow puppet performance. Local countryside excursion.", img: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  { 
    id: 'china-modernity-water-towns',
    code: 'CN-MW02',
    region: 'Shanghai & Suzhou',
    title: "Modernity & Water Towns",
    description: "The skyline of tomorrow meets the canals of a thousand years. Shanghai's finance district, Suzhou's classical gardens.",
    img: "/r-modernity.jpg",
    days: 8, nights: 7, netFrom: 750,
    itinerary: [
      { location: "Shanghai", activity: "The Bund at golden hour with rooftop cocktails. French Concession cycling tour. Xintiandi heritage district. World's fastest commercial Maglev train ride.", img: "https://images.unsplash.com/photo-1538428494232-eb1d115131b0?auto=format&fit=crop&q=80&w=1200" },
      { location: "Suzhou", activity: "Humble Administrator's Garden at dawn before crowds. Silk factory and weaving demonstration. Private canal boat through the old water town.", img: "https://images.unsplash.com/photo-1577587230708-187fdbef4d91?auto=format&fit=crop&q=80&w=1200" },
      { location: "Zhouzhuang & Hangzhou", activity: "Zhouzhuang water town private boat tour. West Lake tea ceremony and sunrise walk. Longjing tea plantation. Traditional silk weaving workshop.", img: "https://images.unsplash.com/photo-1563240619-44ec0047592c?auto=format&fit=crop&q=80&w=1200" }
    ]
  },
  { 
    id: 'china-karst-landscapes',
    code: 'CN-KL03',
    region: 'Guilin & Yangshuo',
    title: "Karst Landscapes",
    description: "The landscape that defines China's imagination — Li River karst peaks, emerald paddies, and timeless villages.",
    img: "/r-karst.jpg",
    days: 7, nights: 6, netFrom: 680,
    itinerary: [
      { location: "Guilin", activity: "Reed Flute Cave private tour. Two Rivers & Four Lakes evening cruise. Traditional cormorant fishing demonstration at sunrise.", img: "https://images.unsplash.com/photo-1529921879218-f99546d03a9d?auto=format&fit=crop&q=80&w=1200" },
      { location: "Li River & Yangshuo", activity: "Private boat from Guilin to Yangshuo through iconic karst peaks. Bicycle through emerald rice terraces. Cooking class with a rural family.", img: "https://images.unsplash.com/photo-1552423312-3269229e612f?auto=format&fit=crop&q=80&w=1200" },
      { location: "Longji Terraces", activity: "Dragon's Backbone Rice Terraces at sunrise. Yao minority village cultural experience. Traditional minority costume photo session. Mountain hiking trail.", img: "https://images.unsplash.com/photo-1533614767277-ea7d48fd46cb?auto=format&fit=crop&q=80&w=1200" }
    ]
  }
];

export const allRoutes = [...spainRoutes, ...chinaRoutes];

/** Render a per-language duration template like "{d} Days / {n} Nights" or "{d}天 / {n}晚". */
export function formatDuration(template: string, days: number, nights: number): string {
  return template.replace('{d}', String(days)).replace('{n}', String(nights));
}
