export type Language = 'en' | 'zh' | 'es';

export const translations = {
  en: {
    nav: {
      spainCollections: "Spain Collections",
      chinaRoutes: "China Routes",
      b2bSolutions: "B2B Solutions",
      partnerPortal: "Partner Portal",
    },
    hero: {
      b2b: "B2B",
      excellence: "Excellence.",
      scale: "Scale &",
      trust: "Trust.",
      subtitle: "Wanlitravel Global Solutions",
      description: "The premier B2B gateway for Europe-China travel. Wholesale routes, ground handling, and strategic infrastructure.",
      scroll: "Scroll"
    },
    exchange: {
      title: "The Exchange.",
      subtitle: "Bridging Two Worlds",
      description: "We connect the vibrant cultures of Spain and China through meticulously crafted travel experiences, fostering mutual understanding and unforgettable journeys.",
      spain: "Spain",
      china: "China",
      outbound: "Outbound China",
      chinaToEurope: "China to Europe",
      targetGroup: "Target Group",
      chineseConsumers: "Chinese Consumers",
      solutions: "Solutions",
      wholesaleRoutes: "Wholesale Routes",
      inbound: "Inbound China",
      europeToChina: "Europe to China",
      europeanTravelers: "European Travelers",
      groundHandling: "Ground Handling"
    },
    curation: {
      title: "Curated Experiences.",
      subtitle: "Beyond the Ordinary",
      description: "Our itineraries are designed to immerse your clients in the authentic essence of each destination, from hidden culinary gems to exclusive cultural encounters.",
      exploreSpain: "Explore Spain",
      exploreChina: "Explore China"
    },
    b2b: {
      title: "Global Command.",
      subtitle: "Technology Driven",
      inventory: "Real-time Inventory",
      inventoryDesc: "Direct access to wholesale allotments across 50+ Chinese and European cities.",
      dynamic: "Dynamic Itineraries",
      dynamicDesc: "Bespoke white-label route builder for your agency's unique brand requirements.",
      requestDemo: "Request Demo Access",
      dashboard: {
        title: "Wanlitravel OS // v2.4",
        bookings: "Active Global Bookings",
        yoy: "+12% YOY",
        revenue: "YTD Revenue",
        allotment: "Network Allotment",
        topRoutes: "Top Performing Routes"
      }
    },
    spain: {
      subtitle: "Spain Collections",
      title: "Iberian Heritage.",
      description: "Curated experiences through the heart of Spain. From Andalusian soul to Mediterranean modernism."
    },
    china: {
      subtitle: "China Routes",
      title: "Mystic Orient.",
      description: "From the imperial grandeur of the north to the ethereal peaks of the south."
    },
    destinations: {
      title: "Destinations.",
      subtitle: "Our Portfolio",
      viewAll: "View All Routes"
    },
    global: {
      title: "Global Reach.",
      subtitle: "Our Network",
      description: "With offices in Madrid, Beijing, and Shanghai, our on-the-ground teams ensure seamless operations and unparalleled local expertise.",
      offices: "Global Offices",
      partners: "Local Partners",
      travelers: "Annual Travelers"
    },
    community: {
      title: "Join the Network.",
      subtitle: "Partnerships",
      trustedBy: "Trusted by industry leaders",
      inquiry: "Partner Inquiry",
      companyName: "Company Name",
      companyPlaceholder: "e.g. Global Travel Co.",
      businessType: "Business Type",
      tourOperator: "Tour Operator",
      travelAgency: "Travel Agency",
      corporateTMC: "Corporate TMC",
      other: "Other",
      workEmail: "Work Email",
      emailPlaceholder: "partner@company.com",
      primaryInterest: "Primary Interest",
      interestPlaceholder: "Tell us about your route requirements...",
      submit: "Submit Partnership Request"
    },
    footer: {
      description: "Global B2B travel management bridging Europe and China. Strategic partnerships for the modern industry.",
      solutions: "Solutions",
      wholesale: "Wholesale",
      groundHandling: "Ground Handling",
      apiIntegration: "API Integration",
      bespoke: "Bespoke",
      connect: "Connect",
      linkedin: "LinkedIn",
      partnerPortal: "Partner Portal",
      contactUs: "Contact Us",
      rights: "© 2026 Wanlitravel B2B. All rights reserved.",
      globalPartnerships: "Global Partnerships."
    },
    routes: {
      "spain-1": {
        region: "Andalusia",
        title: "The Golden Soul",
        description: "A journey through the Moorish legacy and vibrant traditions of Southern Spain.",
        itinerary: [
          { location: "Seville", activity: "Private tour of the Alcázar and evening Flamenco in Triana." },
          { location: "Granada", activity: "Sunset at the Alhambra followed by tea in the Albaicín." },
          { location: "Córdoba", activity: "Exploring the Mezquita and the flower-lined patios." }
        ]
      },
      "spain-2": {
        region: "Catalonia",
        title: "Modernist Dreams",
        description: "Witness the architectural marvels and coastal elegance of the Mediterranean shore.",
        itinerary: [
          { location: "Barcelona", activity: "Gaudí's masterpieces and a private culinary workshop." },
          { location: "Costa Brava", activity: "Sailing the hidden coves and visiting Dalí's Figueres." },
          { location: "Montserrat", activity: "Spiritual heights and mountain-top monastery views." }
        ]
      },
      "spain-3": {
        region: "Castile",
        title: "Imperial Legacy",
        description: "The historic heart of the Spanish Empire, where history lives in every stone.",
        itinerary: [
          { location: "Madrid", activity: "VIP access to the Prado Museum and Royal Palace." },
          { location: "Segovia", activity: "The Roman Aqueduct and the fairy-tale Alcázar." },
          { location: "Toledo", activity: "Medieval wandering through the City of Three Cultures." }
        ]
      },
      "china-1": {
        region: "The North",
        title: "Imperial Capitals",
        description: "From the Forbidden City to the Terracotta Warriors, the ancient heart of China.",
        itinerary: [
          { location: "Beijing", activity: "Private Great Wall hike and Peking Duck culinary experience." },
          { location: "Xi'an", activity: "Exclusive access to the Terracotta Army excavation site." },
          { location: "Pingyao", activity: "Stay in a restored Ming Dynasty courtyard hotel." }
        ]
      },
      "china-2": {
        region: "The East",
        title: "Modernity & Water Towns",
        description: "The contrast of futuristic skylines and ancient canal villages.",
        itinerary: [
          { location: "Shanghai", activity: "Helicopter tour over the Bund and VIP dining in Pudong." },
          { location: "Suzhou", activity: "Private boat tour of the Classical Gardens." },
          { location: "Hangzhou", activity: "West Lake tea ceremony and silk weaving workshop." }
        ]
      },
      "china-3": {
        region: "The South",
        title: "Karst Landscapes",
        description: "The surreal limestone peaks and winding rivers of Guilin and Yangshuo.",
        itinerary: [
          { location: "Guilin", activity: "Luxury Li River cruise with private chef." },
          { location: "Yangshuo", activity: "Bamboo rafting and countryside cycling tour." },
          { location: "Longsheng", activity: "Trekking the Dragon's Backbone Rice Terraces." }
        ]
      }
    },
    routeDetails: {
      backToCollections: "Back to Collections",
      theJourney: "The Journey",
      day: "Day",
      guidedTour: "Guided Tour",
      premium: "Premium",
      routeOverview: "Route Overview",
      duration: "Duration",
      days: "Days",
      nights: "Nights",
      groupSize: "Group Size",
      groupSizeValue: "Private & Small Groups",
      serviceLevel: "Service Level",
      serviceLevelValue: "Luxury B2B Standard",
      includedInThisRoute: "Included in this route:",
      includedItems: [
        "Premium Ground Transportation",
        "5-Star Accommodations",
        "Expert Local Guides",
        "Exclusive Access & Activities"
      ],
      requestQuote: "Request B2B Quote",
      routeNotFound: "Route Not Found",
      returnHome: "Return Home"
    }
  },
  zh: {
    nav: {
      spainCollections: "西班牙精选",
      chinaRoutes: "中国路线",
      b2bSolutions: "B2B 解决方案",
      partnerPortal: "合作伙伴门户",
    },
    hero: {
      b2b: "B2B",
      excellence: "卓越。",
      scale: "规模与",
      trust: "信任。",
      subtitle: "万里旅行全球解决方案",
      description: "中欧旅游首选B2B门户。批发路线、地接服务和战略基础设施。",
      scroll: "向下滚动"
    },
    exchange: {
      title: "交流。",
      subtitle: "连接两个世界",
      description: "我们通过精心打造的旅行体验连接西班牙和中国充满活力的文化，促进相互理解和难忘的旅程。",
      spain: "西班牙",
      china: "中国",
      outbound: "中国出境",
      chinaToEurope: "中国到欧洲",
      targetGroup: "目标群体",
      chineseConsumers: "中国消费者",
      solutions: "解决方案",
      wholesaleRoutes: "批发路线",
      inbound: "中国入境",
      europeToChina: "欧洲到中国",
      europeanTravelers: "欧洲旅行者",
      groundHandling: "地接服务"
    },
    curation: {
      title: "精心策划的体验。",
      subtitle: "超越平凡",
      description: "我们的行程旨在让您的客户沉浸在每个目的地的真实本质中，从隐藏的美食瑰宝到独家的文化邂逅。",
      exploreSpain: "探索西班牙",
      exploreChina: "探索中国"
    },
    b2b: {
      title: "全球指挥。",
      subtitle: "技术驱动",
      inventory: "实时库存",
      inventoryDesc: "直接访问中国和欧洲50多个城市的批发配额。",
      dynamic: "动态行程",
      dynamicDesc: "为您旅行社独特品牌需求定制的白标路线构建器。",
      requestDemo: "申请演示访问",
      dashboard: {
        title: "万里旅行 OS // v2.4",
        bookings: "活跃全球预订",
        yoy: "同比 +12%",
        revenue: "年初至今收入",
        allotment: "网络配额",
        topRoutes: "表现最佳路线"
      }
    },
    spain: {
      subtitle: "西班牙精选",
      title: "伊比利亚遗产。",
      description: "穿越西班牙中心的精心策划体验。从安达卢西亚的灵魂到地中海的现代主义。"
    },
    china: {
      subtitle: "中国路线",
      title: "神秘东方。",
      description: "从北方的帝国宏伟到南方的空灵山峰。"
    },
    destinations: {
      title: "目的地。",
      subtitle: "我们的产品组合",
      viewAll: "查看所有路线"
    },
    global: {
      title: "全球影响力。",
      subtitle: "我们的网络",
      description: "我们在马德里、北京和上海设有办事处，我们的地面团队确保无缝运营和无与伦比的本地专业知识。",
      offices: "全球办事处",
      partners: "本地合作伙伴",
      travelers: "年度旅客"
    },
    community: {
      title: "加入网络。",
      subtitle: "合作伙伴关系",
      trustedBy: "受到行业领导者的信任",
      inquiry: "合作伙伴查询",
      companyName: "公司名称",
      companyPlaceholder: "例如：环球旅游公司",
      businessType: "业务类型",
      tourOperator: "旅游运营商",
      travelAgency: "旅行社",
      corporateTMC: "企业差旅管理公司",
      other: "其他",
      workEmail: "工作邮箱",
      emailPlaceholder: "partner@company.com",
      primaryInterest: "主要兴趣",
      interestPlaceholder: "告诉我们您的路线需求...",
      submit: "提交合作请求"
    },
    footer: {
      description: "连接欧洲和中国的全球 B2B 旅游管理。现代行业的战略合作伙伴关系。",
      solutions: "解决方案",
      wholesale: "批发",
      groundHandling: "地接服务",
      apiIntegration: "API 集成",
      bespoke: "定制",
      connect: "联系",
      linkedin: "领英",
      partnerPortal: "合作伙伴门户",
      contactUs: "联系我们",
      rights: "© 2026 万里旅行 B2B。保留所有权利。",
      globalPartnerships: "全球合作伙伴关系。"
    },
    routes: {
      "spain-1": {
        region: "安达卢西亚",
        title: "黄金之魂",
        description: "穿越摩尔人遗产和西班牙南部充满活力的传统的旅程。",
        itinerary: [
          { location: "塞维利亚", activity: "阿尔卡萨尔宫私人游览和特里亚纳的晚间弗拉门戈。" },
          { location: "格拉纳达", activity: "在阿尔罕布拉宫看日落，然后在阿尔拜辛喝茶。" },
          { location: "科尔多瓦", activity: "探索清真寺和鲜花盛开的庭院。" }
        ]
      },
      "spain-2": {
        region: "加泰罗尼亚",
        title: "现代主义梦想",
        description: "见证地中海沿岸的建筑奇迹和海岸优雅。",
        itinerary: [
          { location: "巴塞罗那", activity: "高迪的杰作和私人烹饪工作坊。" },
          { location: "布拉瓦海岸", activity: "在隐蔽的海湾航行，参观达利的菲格拉斯。" },
          { location: "蒙特塞拉特", activity: "精神高地和山顶修道院的景色。" }
        ]
      },
      "spain-3": {
        region: "卡斯蒂利亚",
        title: "帝国遗产",
        description: "西班牙帝国的历史中心，历史在每一块石头中鲜活。",
        itinerary: [
          { location: "马德里", activity: "普拉多博物馆和皇宫的 VIP 通道。" },
          { location: "塞哥维亚", activity: "罗马渡槽和童话般的阿尔卡萨尔城堡。" },
          { location: "托莱多", activity: "在中世纪的三文化之城漫步。" }
        ]
      },
      "china-1": {
        region: "北方",
        title: "帝国首都",
        description: "从紫禁城到兵马俑，中国古老的心脏。",
        itinerary: [
          { location: "北京", activity: "长城私人徒步和北京烤鸭美食体验。" },
          { location: "西安", activity: "兵马俑挖掘现场的独家通道。" },
          { location: "平遥", activity: "入住修复后的明代庭院酒店。" }
        ]
      },
      "china-2": {
        region: "东方",
        title: "现代与水乡",
        description: "未来主义天际线和古老运河村庄的对比。",
        itinerary: [
          { location: "上海", activity: "乘坐直升机飞越外滩，并在浦东享受 VIP 用餐。" },
          { location: "苏州", activity: "古典园林的私人游船之旅。" },
          { location: "杭州", activity: "西湖茶道和丝绸编织工作坊。" }
        ]
      },
      "china-3": {
        region: "南方",
        title: "喀斯特地貌",
        description: "桂林和阳朔超现实的石灰岩山峰和蜿蜒的河流。",
        itinerary: [
          { location: "桂林", activity: "配备私人厨师的豪华漓江游船。" },
          { location: "阳朔", activity: "竹筏漂流和乡村骑行之旅。" },
          { location: "龙胜", activity: "徒步龙脊梯田。" }
        ]
      }
    },
    routeDetails: {
      backToCollections: "返回精选",
      theJourney: "旅程",
      day: "第",
      guidedTour: "导游",
      premium: "高级",
      routeOverview: "路线概览",
      duration: "持续时间",
      days: "天",
      nights: "晚",
      groupSize: "团队规模",
      groupSizeValue: "私人和小型团队",
      serviceLevel: "服务水平",
      serviceLevelValue: "豪华 B2B 标准",
      includedInThisRoute: "此路线包含：",
      includedItems: [
        "高级地面交通",
        "五星级住宿",
        "专业当地导游",
        "独家活动和通道"
      ],
      requestQuote: "请求 B2B 报价",
      routeNotFound: "未找到路线",
      returnHome: "返回首页"
    }
  },
  es: {
    nav: {
      spainCollections: "Colecciones España",
      chinaRoutes: "Rutas China",
      b2bSolutions: "Soluciones B2B",
      partnerPortal: "Portal de Socios",
    },
    hero: {
      b2b: "B2B",
      excellence: "Excelencia.",
      scale: "Escala y",
      trust: "Confianza.",
      subtitle: "Soluciones Globales Wanlitravel",
      description: "El principal portal B2B para viajes entre Europa y China. Rutas mayoristas, asistencia en tierra e infraestructura estratégica.",
      scroll: "Desplazar"
    },
    exchange: {
      title: "El Intercambio.",
      subtitle: "Uniendo Dos Mundos",
      description: "Conectamos las vibrantes culturas de España y China a través de experiencias de viaje meticulosamente diseñadas, fomentando el entendimiento mutuo y viajes inolvidables.",
      spain: "España",
      china: "China",
      outbound: "China Emisora",
      chinaToEurope: "China a Europa",
      targetGroup: "Grupo Objetivo",
      chineseConsumers: "Consumidores Chinos",
      solutions: "Soluciones",
      wholesaleRoutes: "Rutas Mayoristas",
      inbound: "China Receptiva",
      europeToChina: "Europa a China",
      europeanTravelers: "Viajeros Europeos",
      groundHandling: "Asistencia en Tierra"
    },
    curation: {
      title: "Experiencias Curadas.",
      subtitle: "Más Allá de lo Ordinario",
      description: "Nuestros itinerarios están diseñados para sumergir a sus clientes en la esencia auténtica de cada destino, desde joyas culinarias ocultas hasta encuentros culturales exclusivos.",
      exploreSpain: "Explorar España",
      exploreChina: "Explorar China"
    },
    b2b: {
      title: "Comando Global.",
      subtitle: "Impulsado por Tecnología",
      inventory: "Inventario en Tiempo Real",
      inventoryDesc: "Acceso directo a cupos mayoristas en más de 50 ciudades chinas y europeas.",
      dynamic: "Itinerarios Dinámicos",
      dynamicDesc: "Constructor de rutas de marca blanca a medida para los requisitos únicos de su agencia.",
      requestDemo: "Solicitar Acceso Demo",
      dashboard: {
        title: "Wanlitravel OS // v2.4",
        bookings: "Reservas Globales Activas",
        yoy: "+12% Interanual",
        revenue: "Ingresos YTD",
        allotment: "Cupo de Red",
        topRoutes: "Rutas de Mayor Rendimiento"
      }
    },
    spain: {
      subtitle: "Colecciones España",
      title: "Herencia Ibérica.",
      description: "Experiencias seleccionadas por el corazón de España. Desde el alma andaluza hasta el modernismo mediterráneo."
    },
    china: {
      subtitle: "Rutas China",
      title: "Oriente Místico.",
      description: "Desde la grandeza imperial del norte hasta los picos etéreos del sur."
    },
    destinations: {
      title: "Destinos.",
      subtitle: "Nuestro Portafolio",
      viewAll: "Ver Todas las Rutas"
    },
    global: {
      title: "Alcance Global.",
      subtitle: "Nuestra Red",
      description: "Con oficinas en Madrid, Pekín y Shanghái, nuestros equipos sobre el terreno garantizan operaciones fluidas y una experiencia local inigualable.",
      offices: "Oficinas Globales",
      partners: "Socios Locales",
      travelers: "Viajeros Anuales"
    },
    community: {
      title: "Únete a la Red.",
      subtitle: "Asociaciones",
      trustedBy: "Con la confianza de líderes de la industria",
      inquiry: "Consulta de Socios",
      companyName: "Nombre de la Empresa",
      companyPlaceholder: "ej. Global Travel Co.",
      businessType: "Tipo de Negocio",
      tourOperator: "Operador Turístico",
      travelAgency: "Agencia de Viajes",
      corporateTMC: "TMC Corporativo",
      other: "Otro",
      workEmail: "Correo de Trabajo",
      emailPlaceholder: "partner@company.com",
      primaryInterest: "Interés Principal",
      interestPlaceholder: "Cuéntenos sobre sus requisitos de ruta...",
      submit: "Enviar Solicitud de Asociación"
    },
    footer: {
      description: "Gestión global de viajes B2B que une Europa y China. Asociaciones estratégicas para la industria moderna.",
      solutions: "Soluciones",
      wholesale: "Mayorista",
      groundHandling: "Asistencia en Tierra",
      apiIntegration: "Integración API",
      bespoke: "A Medida",
      connect: "Conectar",
      linkedin: "LinkedIn",
      partnerPortal: "Portal de Socios",
      contactUs: "Contáctenos",
      rights: "© 2026 Wanlitravel B2B. Todos los derechos reservados.",
      globalPartnerships: "Asociaciones Globales."
    },
    routes: {
      "spain-1": {
        region: "Andalucía",
        title: "El Alma Dorada",
        description: "Un viaje a través del legado árabe y las vibrantes tradiciones del sur de España.",
        itinerary: [
          { location: "Sevilla", activity: "Tour privado del Alcázar y flamenco nocturno en Triana." },
          { location: "Granada", activity: "Atardecer en la Alhambra seguido de té en el Albaicín." },
          { location: "Córdoba", activity: "Explorando la Mezquita y los patios llenos de flores." }
        ]
      },
      "spain-2": {
        region: "Cataluña",
        title: "Sueños Modernistas",
        description: "Sea testigo de las maravillas arquitectónicas y la elegancia costera de la costa mediterránea.",
        itinerary: [
          { location: "Barcelona", activity: "Obras maestras de Gaudí y un taller culinario privado." },
          { location: "Costa Brava", activity: "Navegando por las calas escondidas y visitando Figueres de Dalí." },
          { location: "Montserrat", activity: "Alturas espirituales y vistas del monasterio en la cima de la montaña." }
        ]
      },
      "spain-3": {
        region: "Castilla",
        title: "Legado Imperial",
        description: "El corazón histórico del Imperio Español, donde la historia vive en cada piedra.",
        itinerary: [
          { location: "Madrid", activity: "Acceso VIP al Museo del Prado y al Palacio Real." },
          { location: "Segovia", activity: "El Acueducto Romano y el Alcázar de cuento de hadas." },
          { location: "Toledo", activity: "Paseo medieval por la Ciudad de las Tres Culturas." }
        ]
      },
      "china-1": {
        region: "El Norte",
        title: "Capitales Imperiales",
        description: "Desde la Ciudad Prohibida hasta los Guerreros de Terracota, el antiguo corazón de China.",
        itinerary: [
          { location: "Pekín", activity: "Caminata privada por la Gran Muralla y experiencia culinaria de Pato Laqueado." },
          { location: "Xi'an", activity: "Acceso exclusivo al sitio de excavación del Ejército de Terracota." },
          { location: "Pingyao", activity: "Estancia en un hotel patio restaurado de la Dinastía Ming." }
        ]
      },
      "china-2": {
        region: "El Este",
        title: "Modernidad y Pueblos de Agua",
        description: "El contraste de los horizontes futuristas y los antiguos pueblos de los canales.",
        itinerary: [
          { location: "Shanghái", activity: "Tour en helicóptero sobre el Bund y cena VIP en Pudong." },
          { location: "Suzhou", activity: "Tour privado en barco por los Jardines Clásicos." },
          { location: "Hangzhou", activity: "Ceremonia del té del Lago Oeste y taller de tejido de seda." }
        ]
      },
      "china-3": {
        region: "El Sur",
        title: "Paisajes Kársticos",
        description: "Los picos de piedra caliza surrealistas y los ríos sinuosos de Guilin y Yangshuo.",
        itinerary: [
          { location: "Guilin", activity: "Crucero de lujo por el río Li con chef privado." },
          { location: "Yangshuo", activity: "Rafting en bambú y tour en bicicleta por el campo." },
          { location: "Longsheng", activity: "Senderismo por las Terrazas de Arroz del Espinazo del Dragón." }
        ]
      }
    },
    routeDetails: {
      backToCollections: "Volver a Colecciones",
      theJourney: "El Viaje",
      day: "Día",
      guidedTour: "Tour Guiado",
      premium: "Premium",
      routeOverview: "Resumen de la Ruta",
      duration: "Duración",
      days: "Días",
      nights: "Noches",
      groupSize: "Tamaño del Grupo",
      groupSizeValue: "Grupos Privados y Pequeños",
      serviceLevel: "Nivel de Servicio",
      serviceLevelValue: "Estándar B2B de Lujo",
      includedInThisRoute: "Incluido en esta ruta:",
      includedItems: [
        "Transporte Terrestre Premium",
        "Alojamiento de 5 Estrellas",
        "Guías Locales Expertos",
        "Acceso y Actividades Exclusivas"
      ],
      requestQuote: "Solicitar Cotización B2B",
      routeNotFound: "Ruta No Encontrada",
      returnHome: "Volver al Inicio"
    }
  }
};
