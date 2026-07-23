import React, { useRef, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  motion, useScroll, useTransform, useSpring,
  AnimatePresence, useInView, useMotionValue,
} from 'motion/react';
import { spainRoutes, chinaRoutes, formatDuration } from './data';
import RouteDetails from './RouteDetails';
import { translations, Language } from './translations';
import { LanguageContext, useLanguage } from './context';
import {
  ArrowRight, ArrowUpRight, ChevronDown, Globe2, Sparkles,
  Star, CheckCircle2, TrendingUp, Clock3, ShieldCheck, Zap,
  Users2, Quote, Phone, Mail, ChevronLeft, ChevronRight,
  MapPin, Building2, Wifi,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   CURSOR GLOW
───────────────────────────────────────────────────────────── */
const CursorGlow = () => {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <motion.div className="cursor-glow"
      style={{ left: x, top: y, position: 'fixed', pointerEvents: 'none', zIndex: 9000 }} />
  );
};

/* ─────────────────────────────────────────────────────────────
   DUAL CLOCK — Madrid / Beijing (carried over from static site v1)
───────────────────────────────────────────────────────────── */
const DualClock = ({ solid }: { solid: boolean }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const fmt = (tz: string) =>
    now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
  return (
    <div className="hidden xl:flex items-center gap-4"
      style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', fontFamily: 'monospace',
        color: solid ? 'rgba(14,17,23,0.35)' : 'rgba(255,255,255,0.45)' }}>
      <span>MAD {fmt('Europe/Madrid')}</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>BJS {fmt('Asia/Shanghai')}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────── */
const Navbar = () => {
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [solid, setSolid] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const open = (id: string) => { if (timer.current) clearTimeout(timer.current); setDropdown(id); };
  const close = () => { timer.current = setTimeout(() => setDropdown(null), 220); };

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-[999] transition-all duration-500"
      style={{
        background: solid ? 'rgba(248,246,242,0.97)' : 'transparent',
        backdropFilter: solid ? 'blur(20px)' : 'none',
        borderBottom: solid ? '1px solid rgba(14,17,23,0.07)' : '1px solid transparent',
      }}>
      <div className="container flex items-center justify-between" style={{ height: solid ? 64 : 80, transition: 'height 0.4s ease' }}>

        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img src={solid ? '/logo-light-bg.jpeg' : '/logo-dark-bg.jpeg'}
            alt="Wanlitravel" className="h-9 object-contain rounded-lg" style={{ opacity: solid ? 1 : 0.92 }} />
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { id: 'spain', label: t.nav.spainCollections, routes: spainRoutes, section: 'routes-spain' },
            { id: 'china', label: t.nav.chinaRoutes, routes: chinaRoutes, section: 'routes-china' },
          ].map(({ id, label, routes, section }) => (
            <div key={id} className="relative" onMouseEnter={() => open(id)} onMouseLeave={close}>
              <button onClick={() => goTo(section)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase transition-colors ${
                  solid ? 'text-ink/70 hover:text-ink' : 'text-white/80 hover:text-white'
                }`}>
                {label} <ChevronDown size={10} className={`transition-transform ${dropdown === id ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dropdown === id && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-0 mt-2 w-72"
                    onMouseEnter={() => open(id)} onMouseLeave={close}>
                    <div className="card-glass overflow-hidden shadow-2xl">
                      <div className="px-4 pt-4 pb-2">
                        <p className="label text-ink/30">{id === 'spain' ? 'Spain Portfolio' : 'China Portfolio'}</p>
                      </div>
                      {routes.map(r => {
                        const tr = t.routes[r.id as keyof typeof t.routes];
                        return (
                          <Link key={r.id} to={`/route/${r.id}`} onClick={() => setDropdown(null)}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-black/4 transition-colors group">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 img-zoom-wrap">
                              <img src={r.img} alt={tr?.title} className="img-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-ink truncate">{tr?.title}</p>
                              <p className="text-[10px] text-ink/40 mt-0.5">{tr?.region}</p>
                            </div>
                            <ArrowUpRight size={14} className="text-ink/20 group-hover:text-crimson group-hover:scale-110 transition-all shrink-0" />
                          </Link>
                        );
                      })}
                      <div className="px-4 py-3 border-t border-black/6">
                        <button onClick={() => { goTo(section); setDropdown(null); }}
                          className="text-[9px] font-bold uppercase tracking-widest text-crimson hover:text-crimson/70 transition-colors">
                          View all {id === 'spain' ? 'Spain' : 'China'} routes →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <button onClick={() => goTo('b2b')}
            className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase transition-colors ${
              solid ? 'text-ink/70 hover:text-ink' : 'text-white/80 hover:text-white'
            }`}>{t.nav.b2bSolutions}</button>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-5">
          <DualClock solid={solid} />
          <div className="hidden sm:flex items-center gap-3">
            {(['en','zh','es'] as Language[]).map((lang, i) => (
              <React.Fragment key={lang}>
                {i > 0 && <span className={`opacity-20 text-xs ${solid ? 'text-ink' : 'text-white'}`}>/</span>}
                <button onClick={() => setLanguage(lang)}
                  className={`text-[9px] font-bold tracking-widest uppercase transition-colors ${
                    language === lang
                      ? 'text-crimson'
                      : solid ? 'text-ink/50 hover:text-ink' : 'text-white/50 hover:text-white'
                  }`}>
                  {lang === 'en' ? 'EN' : lang === 'zh' ? '中' : 'ES'}
                </button>
              </React.Fragment>
            ))}
          </div>
          <button onClick={() => goTo('partner-form')} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 9 }}>
            {t.nav.partnerPortal}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

/* ─────────────────────────────────────────────────────────────
   HERO — Airplane → Window → Spain
───────────────────────────────────────────────────────────── */
const PlaneMask = ({ progress }: { progress: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return progress.on('change', (v: number) => {
      if (!ref.current) return;
      // v goes 0→1 over 300vh. Mask hole grows from 9vw to 300vw
      const size = 9 + v * 291; // vw equivalent
      const mask = `radial-gradient(ellipse ${size * 0.88}vw ${size}vw at 50% 50%, transparent 98%, black 100%)`;
      ref.current.style.webkitMaskImage = mask;
      (ref.current.style as any).maskImage = mask;
    });
  }, [progress]);

  return (
    <div ref={ref} className="absolute inset-0"
      style={{
        backgroundImage: 'url(/hero-plane-sky.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        WebkitMaskImage: 'radial-gradient(ellipse 7.9vw 9vw at 50% 50%, transparent 98%, black 100%)',
        maskImage: 'radial-gradient(ellipse 7.9vw 9vw at 50% 50%, transparent 98%, black 100%)',
      }} />
  );
};

const HeroSection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const smooth = useSpring(scrollYProgress, { damping: 28, stiffness: 100, restDelta: 0.001 });

  const planeOpacity   = useTransform(smooth, [0, 0.05, 0.62, 0.78], [1, 1, 1, 0]);
  const spainOpacity   = useTransform(smooth, [0.1, 0.35], [0, 1]);
  const spainScale     = useTransform(smooth, [0.1, 0.78], [1.12, 1.0]);
  const textOpacity    = useTransform(smooth, [0, 0.08], [1, 0]);
  const textY          = useTransform(smooth, [0, 0.08], [0, -32]);
  const scrollHint     = useTransform(smooth, [0, 0.06], [1, 0]);
  const glareOpacity   = useTransform(smooth, [0, 0.05, 0.55, 0.7], [0, 1, 1, 0]);
  const arrivedOpacity = useTransform(smooth, [0.65, 0.82], [0, 1]);
  const arrivedY       = useTransform(smooth, [0.65, 0.82], [24, 0]);
  const overlayOpacity = useTransform(smooth, [0, 0.06, 0.55, 0.75], [0.55, 0.55, 0.55, 0]);

  return (
    <div ref={containerRef} style={{ height: '320vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#05080f]">

        {/* Spain landscape — revealed through the growing window */}
        <motion.div style={{ opacity: spainOpacity, scale: spainScale }}
          className="absolute inset-0 z-0 origin-center">
          <img src="/hero-spain-arrival.jpg" alt="Spain" className="img-cover" style={{ filter: 'brightness(0.9) saturate(1.1)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
        </motion.div>

        {/* Plane layer — full bleed, fades out */}
        <motion.div style={{ opacity: planeOpacity }} className="absolute inset-0 z-10">
          <img src="/hero-plane-sky.jpg" alt="Airplane" className="img-cover"
            style={{ objectPosition: 'center 60%', filter: 'brightness(0.82) saturate(1.05)' }} />
          {/* Atmospheric vignette */}
          <motion.div style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
        </motion.div>

        {/* Plane mask — punches growing hole to show Spain */}
        <motion.div style={{ opacity: planeOpacity }} className="absolute inset-0 z-20">
          <PlaneMask progress={smooth} />
        </motion.div>

        {/* Window ring — visible while plane is showing */}
        <motion.div style={{ opacity: glareOpacity }}
          className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
          <motion.div
            style={{ width: useTransform(smooth, [0, 0.62], ['18vw', '310vw']), aspectRatio: '0.88 / 1' }}
            className="relative shrink-0">
            {/* Outer frame */}
            <div className="absolute inset-0 rounded-[50%]"
              style={{ border: '5px solid rgba(200,215,240,0.35)', boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.35), 0 0 0 1px rgba(0,0,0,0.25)' }} />
            {/* Glass glare */}
            <div className="absolute inset-0 rounded-[50%] overflow-hidden">
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 30% 22%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.1) 28%, transparent 58%)' }} />
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 68% 12%, rgba(255,255,255,0.2) 0%, transparent 35%)' }} />
              {/* Sky tint */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(130,175,255,0.1) 0%, transparent 55%)', mixBlendMode: 'screen' }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Hero headline */}
        <motion.div style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="label text-white/50 mb-8">{t.hero.subtitle}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease: [0.22,1,0.36,1] }}
            className="text-white mb-6 leading-[0.88]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(64px, 10vw, 140px)' }}>
            Wan<span style={{ color: '#C4923A' }}>li</span>travel.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="text-white/55 max-w-md leading-relaxed mb-10" style={{ fontSize: 15 }}>
            {t.hero.description}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="flex items-center gap-3 pointer-events-auto">
            <button onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-primary">
              {t.hero.cta} <ArrowRight size={13} />
            </button>
            <button onClick={() => document.getElementById('routes-spain')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-ghost">
              Explore Routes
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div style={{ opacity: scrollHint }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
          <p className="label text-white/35" style={{ letterSpacing: '0.38em' }}>{t.hero.scroll}</p>
          <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/45 to-transparent" />
          </motion.div>
        </motion.div>

        {/* "Arrived" caption after zoom */}
        <motion.div style={{ opacity: arrivedOpacity, y: arrivedY }}
          className="absolute bottom-16 right-12 lg:right-20 z-40 text-right pointer-events-none">
          <p className="label text-white/50 mb-2">Now Arriving</p>
          <h2 className="text-white leading-[0.88]"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:'clamp(42px,6vw,88px)' }}>
            España.<br /><span style={{ color:'#C4923A' }}>Welcome.</span>
          </h2>
        </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TRUST BAR
───────────────────────────────────────────────────────────── */
const TrustBar = () => {
  const { t } = useLanguage();
  const items = [t.trust.item1, t.trust.item2, t.trust.item3, t.trust.item4];
  return (
    <div className="bg-[#0B1628] text-white overflow-hidden relative" style={{ borderBottom: '1px solid rgba(196,146,58,0.15)' }}>
      <div className="marquee-wrap py-4">
        <div className="marquee-track items-center gap-16">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-3 shrink-0"
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4923A', display: 'inline-block', flexShrink: 0 }} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   STATS — animated numbers
───────────────────────────────────────────────────────────── */
const Stats = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const stats = [
    { value: '8,400+', label: t.stats.s1desc, icon: <Globe2 size={20} /> },
    { value: '98.7%',  label: t.stats.s2desc, icon: <CheckCircle2 size={20} /> },
    { value: '120+',   label: t.stats.s3desc, icon: <Users2 size={20} /> },
    { value: '48h',    label: t.stats.s4desc, icon: <Clock3 size={20} /> },
  ];

  return (
    <section ref={ref} className="section-pad" style={{ background: '#0B1628' }}>
      <div className="container">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="label mb-3" style={{ color: 'rgba(196,146,58,0.7)' }}>{t.stats.label}</p>
            <h2 className="heading text-white" style={{ fontSize: 'clamp(36px,4.5vw,56px)' }}>
              Performance<br />that speaks.
            </h2>
          </div>
          <p className="text-white/35 max-w-xs leading-relaxed" style={{ fontSize: 14 }}>
            {t.trust.label}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="card-dark p-8 group hover:border-gold/20 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-gold/50 mb-5 group-hover:text-gold transition-colors">{s.icon}</div>
              <div className="stat-num text-white mb-2" style={{ fontSize: 'clamp(36px,4vw,52px)' }}>{s.value}</div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   PARTNER LOGOS
───────────────────────────────────────────────────────────── */
const PartnerLogos = () => {
  const { t } = useLanguage();
  const logos = ['Viajes Barceló', 'Globalia', 'SinoTour UK', 'TUI Group', 'Carlson Wagonlit', 'FCM Travel', 'Hotelbeds', 'El Corte Inglés', 'Iberia Partners', 'CITS'];
  return (
    <section className="section-pad-sm bg-bg">
      <div className="container">
        <p className="label text-center mb-10" style={{ color: 'rgba(14,17,23,0.2)' }}>{t.trust.label}</p>
      </div>
      <div className="marquee-wrap relative">
        <div className="absolute left-0 inset-y-0 w-24 z-10" style={{ background: 'linear-gradient(to right, #F8F6F2, transparent)' }} />
        <div className="absolute right-0 inset-y-0 w-24 z-10" style={{ background: 'linear-gradient(to left, #F8F6F2, transparent)' }} />
        <div className="marquee-track items-center gap-20">
          {[...logos, ...logos].map((name, i) => (
            <span key={i} className="shrink-0"
              style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(14,17,23,0.18)', whiteSpace: 'nowrap' }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   B2B SECTION
───────────────────────────────────────────────────────────── */
const B2BSection = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const features = [
    { icon: <Zap size={18}/>,        title: t.b2b.inventory, desc: t.b2b.inventoryDesc,  tag: 'Real-time' },
    { icon: <Sparkles size={18}/>,   title: t.b2b.dynamic,   desc: t.b2b.dynamicDesc,    tag: 'White-label' },
    { icon: <ShieldCheck size={18}/>,title: t.b2b.api,       desc: t.b2b.apiDesc,         tag: 'API-first' },
  ];

  return (
    <section id="b2b" ref={ref} className="section-pad relative overflow-hidden" style={{ background: '#0B1628' }}>
      {/* Subtle background */}
      <div className="absolute inset-0 z-0">
        <img src="/b2b-tech.jpg" alt="" className="img-cover" style={{ opacity: 0.12, mixBlendMode: 'luminosity' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0B1628 30%, rgba(22,34,64,0.9) 100%)' }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left text */}
          <div>
            <motion.div initial={{ opacity:0, y:24 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration: 0.7, ease:[0.22,1,0.36,1] }}>
              <p className="label mb-5" style={{ color: 'rgba(196,146,58,0.65)' }}>{t.b2b.subtitle}</p>
              <h2 className="heading text-white mb-6" style={{ fontSize: 'clamp(40px,5vw,64px)' }}>
                {t.b2b.title}
              </h2>
              <p className="text-white/40 leading-relaxed mb-10" style={{ fontSize: 15, maxWidth: 400 }}>
                {t.curation.description}
              </p>

              {/* Features */}
              <div className="space-y-4">
                {features.map((f, i) => (
                  <motion.div key={i}
                    initial={{ opacity:0, x:-20 }} animate={inView?{opacity:1,x:0}:{}} transition={{ delay: 0.2 + i*0.1 }}
                    className="card-dark flex items-start gap-5 p-5 group hover:border-gold/15 transition-colors cursor-default"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(196,146,58,0.1)', color: '#C4923A' }}>
                      {f.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{f.title}</p>
                        <span className="tag tag-gold">{f.tag}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay: 0.6 }}
                onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-primary mt-10">
                {t.b2b.requestDemo}
              </motion.button>
            </motion.div>
          </div>

          {/* Right — Dashboard mockup */}
          <motion.div
            initial={{ opacity:0, y:40 }} animate={inView?{opacity:1,y:0}:{}} transition={{ delay: 0.25, duration: 0.8, ease:[0.22,1,0.36,1] }}>
            <div className="card-glass-dark overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Titlebar */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex gap-1.5">
                  {['#FF5F57','#FEBC2E','#28C840'].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>{t.b2b.dashboard.title}</p>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="pulse-dot" style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block' }} />
                  <span style={{ fontSize: 8, fontWeight:700, color:'#22C55E', letterSpacing:'0.2em', textTransform:'uppercase' }}>LIVE</span>
                </div>
              </div>

              {/* Metric cards */}
              <div className="p-5 grid grid-cols-2 gap-3">
                {[
                  { l: t.b2b.dashboard.bookings,   v: '2,847', change: '+24%', c: '#22C55E' },
                  { l: t.b2b.dashboard.revenue,     v: '€4.2M', change: '+18%', c: '#C4923A' },
                  { l: t.b2b.dashboard.allotment,   v: '94%',   change: 'LIVE',  c: '#B31C2E' },
                  { l: t.b2b.dashboard.topRoutes,   v: '12',    change: 'ACTIVE',c: '#60A5FA' },
                ].map((d,i)=>(
                  <div key={i} className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize:8, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:8 }}>{d.l}</p>
                    <p className="stat-num" style={{ fontSize: 28, color: d.c, marginBottom:4 }}>{d.v}</p>
                    <span style={{ fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.07)', padding:'3px 8px', borderRadius:99 }}>{d.change}</span>
                  </div>
                ))}
              </div>

              {/* Top routes list */}
              <div className="px-5 pb-5">
                <div className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:8, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.22)', marginBottom:12 }}>Top Revenue Routes</p>
                  {[
                    { name:'Costa del Sol Classic', net:'€850 net/pax', trend: '+12%' },
                    { name:'Imperial Capitals',     net:'€720 net/pax', trend: '+8%' },
                    { name:'Karst Landscapes',      net:'€680 net/pax', trend: '+21%' },
                  ].map((r,i)=>(
                    <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i<2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:'#C4923A', flexShrink:0 }} />
                      <span style={{ fontSize:12, color:'rgba(255,255,255,0.55)', flex:1 }}>{r.name}</span>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{r.net}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:'#22C55E' }}>{r.trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   ROUTE GRID
───────────────────────────────────────────────────────────── */
const RouteGrid = ({ routes, title, subtitle, id, dark = false }: {
  routes: typeof spainRoutes; title: string; subtitle: string; id: string; dark?: boolean;
}) => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id={id} ref={ref} className="section-pad" style={{ background: dark ? '#0E1117' : '#F8F6F2' }}>
      <div className="container">
        {/* Section header */}
        <motion.div initial={{ opacity:0, y:24 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.6 }}
          className="flex items-end justify-between mb-14 flex-wrap gap-6">
          <div>
            <p className="label mb-3" style={{ color: dark ? 'rgba(196,146,58,0.6)' : '#B31C2E' }}>{subtitle}</p>
            <h2 className="heading" style={{ fontSize:'clamp(40px,5vw,64px)', color: dark ? 'white' : '#0E1117' }}>
              {title}
            </h2>
          </div>
          <p style={{ fontSize:14, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(14,17,23,0.5)', maxWidth:320, lineHeight:1.6 }}>
            {dark ? t.china.description : t.spain.description}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {routes.map((route, i) => {
            const tr = t.routes[route.id as keyof typeof t.routes];
            return (
              <motion.div key={route.id}
                initial={{ opacity:0, y:32 }} animate={inView?{opacity:1,y:0}:{}}
                transition={{ delay: i*0.12, duration:0.65, ease:[0.22,1,0.36,1] }}>
                <Link to={`/route/${route.id}`} className="route-card block" style={{ aspectRatio:'3/4' }}>
                  <img src={route.img} alt={tr?.title} className="img-cover w-full h-full" />
                  {/* Content overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-7">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={10} style={{ color: '#C4923A' }} />
                        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(196,146,58,0.85)' }}>
                          {tr?.region}
                        </p>
                      </div>
                      <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.2em', fontFamily:'monospace', color:'rgba(255,255,255,0.4)' }}>
                        {route.code}
                      </span>
                    </div>
                    <h3 className="heading text-white mb-1" style={{ fontSize: 22 }}>{tr?.title}</h3>
                    <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'#C4923A', marginBottom:10 }}>
                      {formatDuration(t.routeDetails.durationFormat, route.days, route.nights)} · {t.routeDetails.netFrom} €{route.netFrom}
                    </p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {tr?.description}
                    </p>
                    <div className="flex items-center gap-2 mt-5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      style={{ transition:'all 0.3s ease' }}>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>View Route</span>
                      <ArrowRight size={12} style={{ color: '#C4923A' }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────────────────────── */
const Testimonials = () => {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const items = t.testimonials.items;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section-pad" style={{ background: '#F0EDE8' }}>
      <div className="container">
        <motion.div initial={{ opacity:0, y:24 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.6 }}
          className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="label mb-3">{t.testimonials.label}</p>
            <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:'clamp(40px,5vw,64px)', color:'#0E1117', lineHeight:0.92 }}>
              What our<br />partners say.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {[ChevronLeft, ChevronRight].map((Icon, i) => (
              <button key={i}
                onClick={() => setActive((active + (i===0?-1:1) + items.length) % items.length)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                style={{ border:'1px solid rgba(14,17,23,0.12)', color:'rgba(14,17,23,0.5)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#B31C2E'; (e.currentTarget as HTMLElement).style.color = '#B31C2E'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,17,23,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(14,17,23,0.5)'; }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:28 }} animate={inView?{opacity:1,y:0}:{}} transition={{ delay: i*0.1, duration:0.6 }}
              onClick={() => setActive(i)}
              className="card cursor-pointer"
              style={{
                padding: 32,
                opacity: i === active ? 1 : 0.48,
                transform: i === active ? 'scale(1)' : 'scale(0.985)',
                transition: 'all 0.35s ease',
                outline: i === active ? '1.5px solid rgba(196,146,58,0.3)' : '1.5px solid transparent',
              }}>
              <Quote size={22} style={{ color: 'rgba(179,28,46,0.18)', marginBottom: 20 }} />
              <p style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:17, color:'rgba(14,17,23,0.75)', lineHeight:1.65, marginBottom:24 }}>
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3" style={{ paddingTop:20, borderTop:'1px solid rgba(14,17,23,0.07)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{ background:'#B31C2E', fontSize:13, fontWeight:900 }}>{item.name[0]}</div>
                <div className="flex-1">
                  <p style={{ fontSize:13, fontWeight:700, color:'#0E1117' }}>{item.name}</p>
                  <p style={{ fontSize:10, color:'rgba(14,17,23,0.4)', marginTop:1 }}>{item.title}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,j)=><Star key={j} size={9} style={{ fill:'#C4923A', color:'#C4923A' }} />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   PARTNER INQUIRY FORM
───────────────────────────────────────────────────────────── */
const PartnerForm = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="partner-form" ref={ref} className="section-pad relative overflow-hidden" style={{ background: '#F8F6F2' }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/about-team.jpg" alt="" className="img-cover" style={{ opacity: 0.18 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, #F8F6F2 45%, rgba(248,246,242,0.5) 100%)' }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left */}
          <motion.div initial={{ opacity:0, x:-32 }} animate={inView?{opacity:1,x:0}:{}} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}>
            <p className="label mb-5">{t.community.subtitle}</p>
            <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:'clamp(48px,6vw,80px)', color:'#0E1117', lineHeight:0.9, marginBottom:24 }}>
              {t.community.title}
            </h2>
            <p style={{ fontSize:15, color:'rgba(14,17,23,0.55)', lineHeight:1.65, maxWidth:380, marginBottom:40 }}>
              {t.community.description}
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2 mb-12">
              {[t.trust.item1, t.trust.item2, t.trust.item3].map((item,i)=>(
                <span key={i} className="tag tag-light">
                  <CheckCircle2 size={10} style={{ color:'#B31C2E' }} />{item}
                </span>
              ))}
            </div>

            {/* Contact info */}
            <div style={{ paddingTop:28, borderTop:'1px solid rgba(14,17,23,0.08)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Mail size={14} style={{ color:'#B31C2E', flexShrink:0 }} />
                <span style={{ fontSize:14, color:'rgba(14,17,23,0.55)' }}>partnerships@wanlitravel.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} style={{ color:'#B31C2E', flexShrink:0 }} />
                <span style={{ fontSize:14, color:'rgba(14,17,23,0.55)' }}>+34 91 000 0000 · +86 10 0000 0000</span>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div initial={{ opacity:0, x:32 }} animate={inView?{opacity:1,x:0}:{}} transition={{ delay:0.15, duration:0.7, ease:[0.22,1,0.36,1] }}>
            <div className="card-glass" style={{ padding: '40px' }}>
              <h3 className="heading mb-8" style={{ fontSize:22 }}>{t.community.inquiry}</h3>
              <form className="space-y-5" onSubmit={e=>e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t.community.companyName}</label>
                    <input type="text" placeholder={t.community.companyPlaceholder} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">{t.community.businessType}</label>
                    <select className="form-input">
                      <option>{t.community.tourOperator}</option>
                      <option>{t.community.travelAgency}</option>
                      <option>{t.community.corporateTMC}</option>
                      <option>{t.community.other}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t.community.workEmail}</label>
                  <input type="email" placeholder={t.community.emailPlaceholder} className="form-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t.community.region}</label>
                    <input type="text" placeholder={t.community.regionPlaceholder} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">{t.community.monthlyPax}</label>
                    <select className="form-input">
                      <option>&lt; 50</option>
                      <option>50–200</option>
                      <option>200–500</option>
                      <option>500+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t.community.primaryInterest}</label>
                  <textarea placeholder={t.community.interestPlaceholder} className="form-input" rows={4} style={{ resize:'none' }} />
                </div>
                <button type="submit" className="btn btn-primary w-full justify-center" style={{ width:'100%', fontSize:10 }}>
                  {t.community.submit}
                </button>
                <p style={{ fontSize:10, textAlign:'center', color:'rgba(14,17,23,0.3)', marginTop:12 }}>{t.community.privacy}</p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────── */
const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer style={{ background: '#05080F', color: 'white', paddingTop: 80, paddingBottom: 48 }}>
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <img src="/logo-dark-bg.jpeg" alt="Wanlitravel"
              style={{ height: 52, objectFit:'contain', borderRadius:10, opacity:0.88, marginBottom:20 }} />
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.32)', lineHeight:1.7, maxWidth:320 }}>
              {t.footer.description}
            </p>
          </div>
          <div className="lg:col-span-3 lg:col-start-7">
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:20 }}>
              {t.footer.solutions}
            </p>
            <div className="space-y-3">
              {[t.footer.wholesale, t.footer.groundHandling, t.footer.apiIntegration, t.footer.bespoke].map((item,i)=>(
                <a key={i} href="#" style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', transition:'color 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#C4923A')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:20 }}>
              {t.footer.connect}
            </p>
            <div className="space-y-3">
              {[t.footer.linkedin, t.footer.partnerPortal, t.footer.contactUs].map((item,i)=>(
                <a key={i} href="#" style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', transition:'color 0.2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.color='#C4923A')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="divider-gold mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.15)' }}>
            {t.footer.rights}
          </p>
          <p style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:14, color:'rgba(255,255,255,0.1)' }}>
            {t.footer.globalPartnerships}
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────────────────────── */
export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <BrowserRouter>
        <div className="no-scrollbar">
          <CursorGlow />
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <main>
                  <HeroSection />
                  <TrustBar />
                  <Stats />
                  <PartnerLogos />
                  <B2BSection />
                  <RouteGrid
                    routes={spainRoutes}
                    title={t.spain.title}
                    subtitle={t.spain.subtitle}
                    id="routes-spain"
                  />
                  <RouteGrid
                    routes={chinaRoutes}
                    title={t.china.title}
                    subtitle={t.china.subtitle}
                    id="routes-china"
                    dark
                  />
                  <Testimonials />
                  <PartnerForm />
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
