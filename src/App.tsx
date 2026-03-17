import React, { useRef, useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { spainRoutes, chinaRoutes } from './data';
import RouteDetails from './RouteDetails';
import { translations, Language } from './translations';
import { 
  ArrowRight, 
  ChevronDown,
  Phone,
  Mail,
  Globe,
  Compass,
  Map,
  Sparkles,
  Coffee,
  Camera,
  Heart,
  Star
} from 'lucide-react';

// --- Context ---
export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const useLanguage = () => useContext(LanguageContext);

// --- Components ---

const Grain = () => <div className="grain" />;

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { language, setLanguage, t } = useLanguage();

  const handleMouseEnter = (dropdownId: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(dropdownId);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // 300ms delay before closing
  };

  const handleNavClick = (percent: number, dropdownId: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToPercent(percent), 100);
    } else {
      scrollToPercent(percent);
    }
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  const scrollToPercent = (percent: number) => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: height * percent,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] py-8 px-16 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-ink/5 text-ink">
      <div className="flex items-center gap-12">
        <Link to="/" className="text-xl font-black tracking-tighter text-accent cursor-pointer">WANLITRAVEL</Link>
        <div className="h-4 w-[1px] bg-ink/10"></div>
        <div className="flex gap-10 text-[9px] font-bold uppercase tracking-[0.2em] relative">
          
          {/* Spain Dropdown */}
          <div className="relative group" onMouseLeave={handleMouseLeave} onMouseEnter={() => handleMouseEnter('spain')}>
            <button 
              onClick={() => handleNavClick(0.6, 'spain')} 
              className="hover:text-accent transition-colors uppercase flex items-center gap-1 py-4"
            >
              {t.nav.spainCollections} <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'spain' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 pt-2 w-64"
                >
                  <div className="bg-white border border-ink/5 shadow-2xl rounded-2xl overflow-hidden py-4">
                    {spainRoutes.map(route => (
                      <Link 
                        key={route.id} 
                        to={`/route/${route.id}`}
                        className="block px-6 py-3 hover:bg-surface transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <p className="text-xs font-black text-ink normal-case tracking-normal mb-1">{t.routes[route.id as keyof typeof t.routes].title}</p>
                        <p className="text-[8px] text-ink/50">{t.routes[route.id as keyof typeof t.routes].region}</p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* China Dropdown */}
          <div className="relative group" onMouseLeave={handleMouseLeave} onMouseEnter={() => handleMouseEnter('china')}>
            <button 
              onClick={() => handleNavClick(0.8, 'china')} 
              className="hover:text-accent transition-colors uppercase flex items-center gap-1 py-4"
            >
              {t.nav.chinaRoutes} <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {activeDropdown === 'china' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 pt-2 w-64"
                >
                  <div className="bg-white border border-ink/5 shadow-2xl rounded-2xl overflow-hidden py-4">
                    {chinaRoutes.map(route => (
                      <Link 
                        key={route.id} 
                        to={`/route/${route.id}`}
                        className="block px-6 py-3 hover:bg-surface transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <p className="text-xs font-black text-ink normal-case tracking-normal mb-1">{t.routes[route.id as keyof typeof t.routes].title}</p>
                        <p className="text-[8px] text-ink/50">{t.routes[route.id as keyof typeof t.routes].region}</p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => handleNavClick(0.4, 'b2b')} className="hover:text-accent transition-colors uppercase">{t.nav.b2bSolutions}</button>
        </div>
      </div>
      
      <div className="flex items-center gap-10 text-[9px] font-bold tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <Globe size={12} className="text-accent" />
          <div className="flex gap-2">
            <button onClick={() => setLanguage('en')} className={`hover:text-accent transition-colors ${language === 'en' ? 'text-accent' : ''}`}>EN</button>
            <span className="opacity-30">/</span>
            <button onClick={() => setLanguage('zh')} className={`hover:text-accent transition-colors ${language === 'zh' ? 'text-accent' : ''}`}>中文</button>
            <span className="opacity-30">/</span>
            <button onClick={() => setLanguage('es')} className={`hover:text-accent transition-colors ${language === 'es' ? 'text-accent' : ''}`}>ES</button>
          </div>
        </div>
        <button 
          onClick={() => handleNavClick(0.95, 'partner')}
          className="bg-ink text-white px-6 py-2 rounded-full hover:bg-accent transition-colors uppercase tracking-widest text-[8px]"
        >
          {t.nav.partnerPortal}
        </button>
      </div>
    </nav>
  );
};

const ScrollytellingExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  // --- HERO PORTAL ANIMATIONS (0% - 15%) ---
  const portalScale = useTransform(smoothProgress, [0, 0.15], [1, 20]);
  const portalOpacity = useTransform(smoothProgress, [0.13, 0.15], [1, 0]);
  const heroTextOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);
  const heroTextY = useTransform(smoothProgress, [0, 0.08], [0, -50]);
  const bgParallax = useTransform(smoothProgress, [0, 0.15], [0, -100]);
  
  // --- THE EXCHANGE (15% - 35%) ---
  const exchangeSectionOpacity = useTransform(smoothProgress, [0.15, 0.2, 0.3, 0.35], [0, 1, 1, 0]);
  const exchangeRotate = useTransform(smoothProgress, [0.2, 0.3], [0, 180]);
  const exchangeScale = useTransform(smoothProgress, [0.2, 0.3], [0.8, 1]);
  const specsOpacity = useTransform(smoothProgress, [0.22, 0.28], [0, 1]);

  // --- FEMALE CURATION (35% - 55%) ---
  const curationOpacity = useTransform(smoothProgress, [0.35, 0.4, 0.5, 0.55], [0, 1, 1, 0]);
  const curationY = useTransform(smoothProgress, [0.35, 0.4], [100, 0]);

  // --- DESTINATION CONTRAST (55% - 75%) ---
  const destinationOpacity = useTransform(smoothProgress, [0.55, 0.6, 0.7, 0.75], [0, 1, 1, 0]);
  const destinationScale = useTransform(smoothProgress, [0.6, 0.7], [0.9, 1.1]);

  // --- GLOBAL MAP (75% - 90%) ---
  const globalOpacity = useTransform(smoothProgress, [0.75, 0.8, 0.85, 0.9], [0, 1, 1, 0]);
  const mapScale = useTransform(smoothProgress, [0.8, 0.9], [0.8, 1.2]);

  // --- COMMUNITY (90% - 100%) ---
  const communityOpacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);
  const communityY = useTransform(smoothProgress, [0.9, 0.95], [50, 0]);

  return (
    <div ref={containerRef} className="h-[1200vh] relative bg-bg">
      
      {/* 1. THE CULTURAL GATEWAY (Sticky) */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Background (Spanish Architecture - Iconic Gateway) */}
        <motion.div style={{ y: bgParallax }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&q=80&w=2000" 
            alt="Spanish Architecture" 
            className="w-full h-[120%] object-cover brightness-75"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* The Gateway Portal */}
        <motion.div 
          style={{ scale: portalScale, opacity: portalOpacity }}
          className="relative z-20 w-[350px] h-[500px] md:w-[550px] md:h-[750px] bg-bg flex items-center justify-center"
        >
          <div className="w-[85%] h-[85%] bg-transparent plane-window-shape shadow-[0_0_0_100vw_#F9F7F2] relative overflow-hidden">
             <div className="absolute inset-0 border-[15px] border-accent/20 rounded-[160px] pointer-events-none z-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&q=80&w=1200" 
               alt="China Landscape" 
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 flex items-center justify-center text-white/40 font-serif italic text-6xl tracking-tighter z-10 pointer-events-none">
                Wanlitravel
             </div>
          </div>
        </motion.div>

        {/* Hero Text Overlay */}
        <div className="absolute inset-0 z-30 flex items-center justify-between px-24 pointer-events-none">
          <motion.div style={{ opacity: heroTextOpacity, y: heroTextY }} className="max-w-xl">
            <h1 className="text-[11vw] leading-[0.82] mb-12 text-ink">
              {t.hero.b2b}<br /><span className="italic font-serif normal-case tracking-normal text-accent">{t.hero.excellence}</span>
            </h1>
            <div className="flex gap-10 items-start">
              <div className="w-16 h-[2px] bg-accent mt-3"></div>
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-ink">{t.hero.subtitle}</p>
                <p className="text-sm font-medium text-ink/60 max-w-xs leading-relaxed">
                  {t.hero.description}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div style={{ opacity: heroTextOpacity, y: heroTextY }} className="text-right">
            <h1 className="text-[11vw] leading-[0.82] text-ink">
              {t.hero.scale}<br /><span className="italic font-serif normal-case tracking-normal text-sun">{t.hero.trust}</span>
            </h1>
          </motion.div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToPercent(0.95)}
            className="bg-accent text-bg px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl relative overflow-hidden group"
          >
            <span className="relative z-10">{t.nav.partnerPortal}</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </motion.button>
          <motion.div 
            style={{ opacity: heroTextOpacity }}
            animate={{ y: [0, 8, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2 opacity-30"
          >
            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-ink">{t.hero.scroll}</span>
            <ChevronDown size={14} className="text-ink" />
          </motion.div>
        </div>
      </div>

      {/* 2. THE EXCHANGE (Sticky) */}
      <motion.div 
        style={{ opacity: exchangeSectionOpacity }}
        className="sticky top-0 h-screen w-full bg-white z-40 flex items-center justify-center overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full px-12 grid grid-cols-12 items-center relative h-full">
          
          {/* Left: Outbound China */}
          <motion.div style={{ opacity: specsOpacity }} className="col-span-3 space-y-20">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4 text-sun">{t.exchange.outbound}</p>
              <h2 className="text-7xl leading-none" dangerouslySetInnerHTML={{ __html: t.exchange.chinaToEurope.replace(' to ', '<br />to ') }}></h2>
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2">{t.exchange.targetGroup}</p>
                <p className="text-3xl font-bold tracking-tighter">{t.exchange.chineseConsumers}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2">{t.exchange.solutions}</p>
                <p className="text-3xl font-bold tracking-tighter">{t.exchange.wholesaleRoutes}</p>
              </div>
            </div>
          </motion.div>

          {/* Rotating Cultural Icons */}
          <div className="col-span-6 flex items-center justify-center relative">
            <motion.div 
              style={{ rotate: exchangeRotate, scale: exchangeScale }}
              className="w-full max-w-md relative z-10 aspect-square flex items-center justify-center"
            >
              {/* Orbital Track */}
              <div className="absolute inset-0 border-[2px] border-dashed border-ink/10 rounded-full"></div>
              
              {/* Europe Node */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-2xl border border-ink/5">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=100&w=1600" 
                    alt="Europe" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 shadow-inner rounded-full pointer-events-none"></div>
                </div>
              </div>

              {/* China Node */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white p-3 rounded-full shadow-2xl border border-ink/5">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&q=100&w=1600" 
                    alt="China" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 shadow-inner rounded-full pointer-events-none"></div>
                </div>
              </div>
              
              {/* Center Anchor */}
              <div className="bg-white p-6 rounded-full shadow-xl border border-ink/5 z-20 relative">
                <Globe size={48} className="text-accent" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Right: Inbound China */}
          <motion.div style={{ opacity: specsOpacity }} className="col-span-3 text-right space-y-20">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4 text-accent">{t.exchange.inbound}</p>
              <h2 className="text-7xl leading-none" dangerouslySetInnerHTML={{ __html: t.exchange.europeToChina.replace(' to ', '<br />to ') }}></h2>
            </div>
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2">{t.exchange.targetGroup}</p>
                <p className="text-3xl font-bold tracking-tighter">{t.exchange.europeanTravelers}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-2">{t.exchange.solutions}</p>
                <p className="text-3xl font-bold tracking-tighter">{t.exchange.groundHandling}</p>
              </div>
            </div>
          </motion.div>

          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[20vw] font-black text-outline opacity-5 select-none">{t.exchange.title.replace('.', '').toUpperCase()}</h2>
          </div>
        </div>
      </motion.div>

      {/* 3. B2B SOLUTIONS & DASHBOARD (Sticky) */}
      <motion.div 
        style={{ opacity: curationOpacity, y: curationY }}
        className="sticky top-0 h-screen w-full bg-ink text-white z-42 flex items-center justify-center overflow-hidden"
      >
        {/* Atmospheric Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000" 
            alt="Global Network" 
            className="w-full h-full object-cover mix-blend-luminosity scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(242,125,38,0.15),transparent_50%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-center">
            <div className="col-span-1 md:col-span-5 space-y-16">
              <div className="relative">
                <div className="absolute -left-10 top-0 w-1 h-full bg-accent"></div>
                <p className="text-[11px] font-bold uppercase tracking-[0.6em] mb-6 text-accent">{t.b2b.subtitle}</p>
                <h2 className="text-7xl md:text-[90px] leading-[0.85] font-black tracking-tighter" dangerouslySetInnerHTML={{ __html: t.b2b.title.replace('.', '.<br />') }}></h2>
              </div>
              <div className="space-y-10">
                <div className="flex gap-8 items-start group">
                  <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 shrink-0 group-hover:border-accent/50 transition-colors">
                    <Globe size={28} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] mb-3 text-white">{t.b2b.inventory}</p>
                    <p className="text-sm text-white/50 leading-relaxed font-medium">{t.b2b.inventoryDesc}</p>
                  </div>
                </div>
                <div className="flex gap-8 items-start group">
                  <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 shrink-0 group-hover:border-accent/50 transition-colors">
                    <Map size={28} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] mb-3 text-white">{t.b2b.dynamic}</p>
                    <p className="text-sm text-white/50 leading-relaxed font-medium">{t.b2b.dynamicDesc}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => scrollToPercent(0.95)}
                className="group relative inline-flex items-center justify-center px-12 py-6 text-[11px] font-bold text-white uppercase tracking-[0.3em] overflow-hidden rounded-full bg-ink border border-white/20 hover:border-accent transition-colors"
              >
                <span className="absolute inset-0 w-full h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
                <span className="relative z-10 flex items-center gap-3">{t.b2b.requestDemo} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
              </button>
            </div>

            <div className="col-span-1 md:col-span-7">
              <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
                {/* Glow effect behind dashboard */}
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8 relative z-10">
                  <div className="flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                  </div>
                  <div className="text-[10px] font-bold opacity-50 uppercase tracking-[0.3em] font-mono">{t.b2b.dashboard.title}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <div className="col-span-1 md:col-span-2 space-y-8">
                    <div className="h-48 bg-gradient-to-br from-white/10 to-transparent rounded-3xl p-8 flex flex-col justify-between border border-white/10 shadow-inner">
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t.b2b.dashboard.bookings}</p>
                      <div className="flex items-end justify-between">
                        <span className="text-7xl font-black tracking-tighter">1,284</span>
                        <span className="text-sm text-accent font-bold tracking-widest bg-accent/10 px-4 py-2 rounded-full">{t.b2b.dashboard.yoy}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="h-40 bg-white/5 rounded-3xl p-8 flex flex-col justify-between border border-white/5 hover:bg-white/10 transition-colors">
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t.b2b.dashboard.revenue}</p>
                        <span className="text-4xl font-black tracking-tight">€4.2M</span>
                      </div>
                      <div className="h-40 bg-white/5 rounded-3xl p-8 flex flex-col justify-between border border-white/5 hover:bg-white/10 transition-colors">
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t.b2b.dashboard.allotment}</p>
                        <span className="text-4xl font-black tracking-tight">84%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-accent/10 rounded-3xl p-8 space-y-10 border border-accent/20 backdrop-blur-md">
                    <p className="text-[10px] font-bold opacity-90 uppercase tracking-[0.2em] text-accent">{t.b2b.dashboard.topRoutes}</p>
                    <div className="space-y-8">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold tracking-widest font-mono">SHA — MAD</span>
                          <span className="text-[10px] opacity-70 font-mono">92%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[92%] h-full bg-accent rounded-full shadow-[0_0_10px_rgba(242,125,38,0.8)]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold tracking-widest font-mono">PEK — BCN</span>
                          <span className="text-[10px] opacity-70 font-mono">88%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[88%] h-full bg-sun rounded-full shadow-[0_0_10px_rgba(242,193,38,0.8)]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold tracking-widest font-mono">CAN — PAR</span>
                          <span className="text-[10px] opacity-70 font-mono">76%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[76%] h-full bg-white/60 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. SPAIN COLLECTIONS (Sticky) */}
      <motion.div 
        id="spain"
        style={{ opacity: destinationOpacity }}
        className="sticky top-0 h-screen w-full bg-white z-45 flex items-center justify-center overflow-hidden"
      >
        {/* Subtle Spain Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1543783232-af412b852fc3?auto=format&fit=crop&q=80&w=2000" 
            alt="Spain Architecture" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto w-full px-12 relative z-10">
          <div className="flex justify-between items-end mb-16">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4 text-accent">{t.spain.subtitle}</p>
              <h2 className="text-7xl leading-none" dangerouslySetInnerHTML={{ __html: t.spain.title.replace('.', '.<br />').replace(' ', '<br />') }}></h2>
            </div>
            <p className="text-sm font-medium text-ink/40 max-w-xs text-right leading-relaxed">
              {t.spain.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {spainRoutes.map((route) => (
              <Link 
                key={route.id} 
                to={`/route/${route.id}`}
                className="group cursor-pointer block"
              >
                <div className="relative h-80 rounded-3xl overflow-hidden mb-6">
                  <img src={route.img} alt={t.routes[route.id as keyof typeof t.routes].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl">
                      <ArrowRight size={20} className="text-accent" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-1">{t.routes[route.id as keyof typeof t.routes].title}</h3>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.routes[route.id as keyof typeof t.routes].region}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 5. CHINA ROUTES (Sticky) */}
      <motion.div 
        id="china"
        style={{ opacity: globalOpacity }}
        className="sticky top-0 h-screen w-full bg-ink text-bg z-50 flex items-center justify-center overflow-hidden"
      >
        {/* Subtle China Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&q=80&w=2000" 
            alt="Great Wall of China" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto w-full px-12 relative z-10">
          <div className="flex justify-between items-end mb-16">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4 text-sun">{t.china.subtitle}</p>
              <h2 className="text-7xl leading-none text-white" dangerouslySetInnerHTML={{ __html: t.china.title.replace('.', '.<br />').replace(' ', '<br />') }}></h2>
            </div>
            <p className="text-sm font-medium text-white/40 max-w-xs text-right leading-relaxed">
              {t.china.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {chinaRoutes.map((route) => (
              <Link 
                key={route.id} 
                to={`/route/${route.id}`}
                className="group cursor-pointer block"
              >
                <div className="relative h-80 rounded-3xl overflow-hidden mb-6 border border-white/10">
                  <img src={route.img} alt={t.routes[route.id as keyof typeof t.routes].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-accent/90 backdrop-blur-md flex items-center justify-center shadow-xl">
                      <Sparkles size={20} className="text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black mb-1 text-white">{t.routes[route.id as keyof typeof t.routes].title}</h3>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-white">{t.routes[route.id as keyof typeof t.routes].region}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 6. OUR PARTNERS & INQUIRY (Sticky) */}
      <motion.div 
        style={{ opacity: communityOpacity, y: communityY }}
        className="sticky top-0 h-screen w-full bg-white z-[55] flex items-center justify-center overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full px-12 grid grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4 text-accent">{t.community.subtitle}</p>
              <h2 className="text-7xl font-serif italic">{t.community.title}</h2>
            </div>
            
            <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=1200" 
                alt="Business Partnership" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-ink/10"></div>
            </div>

            <div className="pt-12 border-t border-ink/5">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-30 mb-8">{t.community.trustedBy}</p>
              <div className="flex gap-12 opacity-20 grayscale">
                <Globe size={32} />
                <Compass size={32} />
                <Map size={32} />
                <Globe size={32} />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-[40px] p-16 shadow-xl border border-ink/5">
            <h3 className="text-3xl font-black mb-8">{t.community.inquiry}</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">{t.community.companyName}</label>
                  <input type="text" className="w-full bg-white border border-ink/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors" placeholder={t.community.companyPlaceholder} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">{t.community.businessType}</label>
                  <select className="w-full bg-white border border-ink/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors">
                    <option>{t.community.tourOperator}</option>
                    <option>{t.community.travelAgency}</option>
                    <option>{t.community.corporateTMC}</option>
                    <option>{t.community.other}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">{t.community.workEmail}</label>
                <input type="email" className="w-full bg-white border border-ink/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors" placeholder={t.community.emailPlaceholder} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">{t.community.primaryInterest}</label>
                <textarea className="w-full bg-white border border-ink/5 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-colors h-32 resize-none" placeholder={t.community.interestPlaceholder}></textarea>
              </div>
              <button className="w-full bg-ink text-white py-5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg">
                {t.community.submit}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-bg py-48 px-16 border-t border-ink/5 relative z-[60] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-24 mb-48">
          <div className="md:col-span-6">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-10 text-ink">Wanlitravel</h2>
            <p className="text-ink/60 max-w-md leading-relaxed text-lg font-medium">
              {t.footer.description}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-12 opacity-30">{t.footer.solutions}</p>
            <ul className="space-y-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              <li><a href="#" className="hover:text-accent transition-colors">{t.footer.wholesale}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t.footer.groundHandling}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t.footer.apiIntegration}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t.footer.bespoke}</a></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-12 opacity-30">{t.footer.connect}</p>
            <ul className="space-y-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              <li><a href="#" className="hover:text-accent transition-colors">{t.footer.linkedin}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t.footer.partnerPortal}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t.footer.contactUs}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-16 border-t border-ink/5 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">
          <p>{t.footer.rights}</p>
          <p className="italic font-serif normal-case tracking-normal opacity-50">{t.footer.globalPartnerships}</p>
        </div>
      </div>
      
      <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-[0.02]">
        <h2 className="text-[40vw] font-black leading-none tracking-tighter">WANLI</h2>
      </div>
    </footer>
  );
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <BrowserRouter>
        <div className="no-scrollbar">
          <Grain />
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <main>
                  <ScrollytellingExperience />
                </main>
                <Footer />
              </>
            } />
            <Route path="/route/:id" element={<RouteDetails />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageContext.Provider>
  );
}
