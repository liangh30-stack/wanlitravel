import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowUpRight, Menu, X } from 'lucide-react';
import { spainRoutes, chinaRoutes } from '../data';
import type { Language } from '../translations';
import { useLanguage } from '../context';
import DualClock from './DualClock';

/* ─────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────── */
const Navbar = () => {
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [solid, setSolid] = useState(false);
  // Sin este menú el móvil se queda sin navegación: el <nav> de escritorio
  // es `hidden lg:flex`, así que en un teléfono no había forma de llegar
  // al buscador de hoteles ni a las rutas.
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Las secciones solo existen en la home. Si estamos en /hotels o en una
  // ficha de ruta, primero navegamos y luego hacemos scroll.
  const goTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    navigate(`/${language}`);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  // Bloquea el scroll del fondo mientras el menú está abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
        <Link to={`/${language}`} className="shrink-0">
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
                          <Link key={r.id} to={`/${language}/route/${r.id}`} onClick={() => setDropdown(null)}
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
          <Link to={`/${language}/hotels`}
            className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase transition-colors ${
              solid ? 'text-crimson hover:text-crimson/70' : 'text-gold hover:text-white'
            }`} style={{ color: solid ? '#B31C2E' : '#C4923A' }}>{t.nav.hotelSearch}</Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-5">
          <DualClock solid={solid} />
          <button onClick={() => setMobileOpen(v => !v)} aria-label="Menu"
            className="lg:hidden flex items-center justify-center"
            style={{ width: 34, height: 34, borderRadius: 10, color: solid ? '#0E1117' : 'white',
                     background: solid ? 'rgba(14,17,23,0.05)' : 'rgba(255,255,255,0.12)' }}>
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
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

      {/* Menú móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden"
            style={{ background: 'rgba(248,246,242,0.99)', backdropFilter: 'blur(20px)',
                     borderTop: '1px solid rgba(14,17,23,0.07)', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            <div className="container" style={{ paddingTop: 18, paddingBottom: 26 }}>

              <Link to={`/${language}/hotels`} onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between"
                style={{ padding: '14px 16px', borderRadius: 14, background: '#B31C2E', color: 'white',
                         fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                {t.nav.hotelSearch} <ArrowUpRight size={15} />
              </Link>

              <button onClick={() => goTo('b2b')} className="w-full flex items-center justify-between"
                style={{ padding: '14px 16px', marginTop: 8, borderRadius: 14,
                         background: 'rgba(14,17,23,0.04)', color: '#0E1117',
                         fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                {t.nav.b2bSolutions} <ArrowUpRight size={15} style={{ opacity: 0.3 }} />
              </button>

              {[
                { label: t.nav.spainCollections, routes: spainRoutes },
                { label: t.nav.chinaRoutes, routes: chinaRoutes },
              ].map(({ label, routes }) => (
                <div key={label} style={{ marginTop: 24 }}>
                  <p className="label" style={{ color: 'rgba(14,17,23,0.35)', marginBottom: 8 }}>{label}</p>
                  {routes.map(r => {
                    const tr = t.routes[r.id as keyof typeof t.routes];
                    return (
                      <Link key={r.id} to={`/${language}/route/${r.id}`} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3" style={{ padding: '9px 0' }}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                          <img src={r.img} alt={tr?.title} className="img-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0E1117' }} className="truncate">{tr?.title}</p>
                          <p style={{ fontSize: 10, color: 'rgba(14,17,23,0.4)', marginTop: 2 }}>{tr?.region}</p>
                        </div>
                        <ArrowUpRight size={14} style={{ color: 'rgba(14,17,23,0.2)', flexShrink: 0 }} />
                      </Link>
                    );
                  })}
                </div>
              ))}

              <div className="flex items-center gap-4" style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid rgba(14,17,23,0.08)' }}>
                {(['en','zh','es'] as Language[]).map(lang => (
                  <button key={lang} onClick={() => { setLanguage(lang); setMobileOpen(false); }}
                    style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                             padding: '8px 14px', borderRadius: 999,
                             background: language === lang ? '#B31C2E' : 'rgba(14,17,23,0.05)',
                             color: language === lang ? 'white' : 'rgba(14,17,23,0.55)' }}>
                    {lang === 'en' ? 'EN' : lang === 'zh' ? '中文' : 'ES'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
