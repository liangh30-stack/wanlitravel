export const spainRoutes = [
  { 
    id: 'spain-1',
    region: 'Andalusia',
    title: "The Golden Soul", 
    description: "A journey through the Moorish legacy and vibrant traditions of Southern Spain.",
    img: "https://images.unsplash.com/photo-1543783232-af412b852fc3?auto=format&fit=crop&q=80&w=800",
    itinerary: [
      { location: "Seville", activity: "Private tour of the Alcázar and evening Flamenco in Triana.", img: "https://images.unsplash.com/photo-1559121225-4c96255d4482?auto=format&fit=crop&q=80&w=800" },
      { location: "Granada", activity: "Sunset at the Alhambra followed by tea in the Albaicín.", img: "https://images.unsplash.com/photo-1543783232-af412b852fc3?auto=format&fit=crop&q=80&w=800" },
      { location: "Córdoba", activity: "Exploring the Mezquita and the flower-lined patios.", img: "https://images.unsplash.com/photo-1592639296346-560c37a0f711?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  { 
    id: 'spain-2',
    region: 'Catalonia',
    title: "Modernist Dreams", 
    description: "Witness the architectural marvels and coastal elegance of the Mediterranean shore.",
    img: "https://images.unsplash.com/photo-1511527661048-7fe73d390147?auto=format&fit=crop&q=80&w=800",
    itinerary: [
      { location: "Barcelona", activity: "Gaudí's masterpieces and a private culinary workshop.", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=800" },
      { location: "Costa Brava", activity: "Sailing the hidden coves and visiting Dalí's Figueres.", img: "https://images.unsplash.com/photo-1512753360425-00667f5427aa?auto=format&fit=crop&q=80&w=800" },
      { location: "Montserrat", activity: "Spiritual heights and mountain-top monastery views.", img: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  { 
    id: 'spain-3',
    region: 'Castile',
    title: "Imperial Legacy", 
    description: "The historic heart of the Spanish Empire, where history lives in every stone.",
    img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=800",
    itinerary: [
      { location: "Madrid", activity: "VIP access to the Prado Museum and Royal Palace.", img: "https://images.unsplash.com/photo-1543783232-af412b852fc3?auto=format&fit=crop&q=80&w=800" },
      { location: "Segovia", activity: "The Roman Aqueduct and the fairy-tale Alcázar.", img: "https://images.unsplash.com/photo-1547191783-94d5f8f6d8b1?auto=format&fit=crop&q=80&w=800" },
      { location: "Toledo", activity: "Medieval wandering through the City of Three Cultures.", img: "https://images.unsplash.com/photo-1564659996620-f09478b376bb?auto=format&fit=crop&q=80&w=800" }
    ]
  }
];

export const chinaRoutes = [
  { 
    id: 'china-1',
    region: 'The North',
    title: "Imperial Capitals", 
    description: "From the Forbidden City to the Terracotta Warriors, the ancient heart of China.",
    img: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&q=80&w=800",
    itinerary: [
      { location: "Beijing", activity: "Private Great Wall hike and Peking Duck culinary experience.", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=800" },
      { location: "Xi'an", activity: "Exclusive access to the Terracotta Army excavation site.", img: "https://images.unsplash.com/photo-1599008585472-8700253818e5?auto=format&fit=crop&q=80&w=800" },
      { location: "Pingyao", activity: "Stay in a restored Ming Dynasty courtyard hotel.", img: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  { 
    id: 'china-2',
    region: 'The East',
    title: "Modernity & Water Towns", 
    description: "The contrast of futuristic skylines and ancient canal villages.",
    img: "https://images.unsplash.com/photo-1538428494232-eb1d115131b0?auto=format&fit=crop&q=80&w=800",
    itinerary: [
      { location: "Shanghai", activity: "Helicopter tour over the Bund and VIP dining in Pudong.", img: "https://images.unsplash.com/photo-1538428494232-eb1d115131b0?auto=format&fit=crop&q=80&w=800" },
      { location: "Suzhou", activity: "Private boat tour of the Classical Gardens.", img: "https://images.unsplash.com/photo-1577587230708-187fdbef4d91?auto=format&fit=crop&q=80&w=800" },
      { location: "Hangzhou", activity: "West Lake tea ceremony and silk weaving workshop.", img: "https://images.unsplash.com/photo-1563240619-44ec0047592c?auto=format&fit=crop&q=80&w=800" }
    ]
  },
  { 
    id: 'china-3',
    region: 'The South',
    title: "Karst Landscapes", 
    description: "The surreal limestone peaks and winding rivers of Guilin and Yangshuo.",
    img: "https://images.unsplash.com/photo-1529921879218-f99546d03a9d?auto=format&fit=crop&q=80&w=800",
    itinerary: [
      { location: "Guilin", activity: "Luxury Li River cruise with private chef.", img: "https://images.unsplash.com/photo-1529921879218-f99546d03a9d?auto=format&fit=crop&q=80&w=800" },
      { location: "Yangshuo", activity: "Bamboo rafting and countryside cycling tour.", img: "https://images.unsplash.com/photo-1552423312-3269229e612f?auto=format&fit=crop&q=80&w=800" },
      { location: "Longsheng", activity: "Trekking the Dragon's Backbone Rice Terraces.", img: "https://images.unsplash.com/photo-1533614767277-ea7d48fd46cb?auto=format&fit=crop&q=80&w=800" }
    ]
  }
];

export const allRoutes = [...spainRoutes, ...chinaRoutes];
