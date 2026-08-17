import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context';
import type { Language } from '../../translations';
import { C, line, lineOn, sans } from '../../theme';

/* ─────────────────────────────────────────────────────────────
   CABECERA FIJA
   Sobre el hero es transparente con el logotipo claro; en cuanto
   se baja (o en cualquier página interior) pasa a marfil sólido
   con el logotipo oscuro.
───────────────────────────────────────────────────────────── */

const SECCIONES = [
  { id: 'colecciones', key: 'navIberia' },
  { id: 'china', key: 'navChina' },
  { id: 'hoteles', key: 'navHotels' },
  { id: 'proceso', key: 'navProcess' },
  { id: 'oficinas', key: 'navOffices' },
] as const;

const IDIOMAS: { code: Language; label: string }[] = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
];

interface Props {
  /** true en el home, donde la cabecera arranca sobre la foto del hero */
  overHero?: boolean;
}

const Header = ({ overHero = false }: Props) => {
  const { t, language, setLanguage } = useLanguage();
  const u = t.ui;
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => setCompact(window.innerWidth < 1120);
    onScroll(); onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Con el menú desplegado se bloquea el scroll del fondo
  useEffect(() => {
    if (!menuOpen) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previo; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const oscuro = overHero && !scrolled;
  const textoNav = oscuro ? C.bg : C.ink;

  /** Va a una sección del home, esté donde esté el usuario */
  const irA = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const enHome = location.pathname === `/${language}` || location.pathname === `/${language}/`;
    if (!enHome) { navigate(`/${language}#${id}`); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const enlaceNav: React.CSSProperties = {
    color: 'inherit', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.28em',
  };

  return (
    <header style={{
      position: 'fixed', left: 0, right: 0, top: 0, zIndex: 120,
      background: oscuro ? 'rgba(12,17,22,0.25)' : 'rgba(244,240,233,0.94)',
      borderBottom: `1px solid ${oscuro ? lineOn(0.14) : line(0.12)}`,
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      transition: 'background .35s, border-color .35s', fontFamily: sans,
    }}>
      <div className="wrap pad" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: compact ? '12px 22px' : '14px 48px', gap: 24,
      }}>
        <Link to={`/${language}`} style={{ flexShrink: 0, display: 'block' }} aria-label="Wanli Travel">
          <span style={{ position: 'relative', display: 'block', height: compact ? 54 : 76, width: compact ? 112 : 158 }}>
            <img src="/logo-wanli-on-dark.png" alt="Wanli Travel — Bridging China and Europe" draggable={false}
              style={{ position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'contain', transition: 'opacity .35s', opacity: oscuro ? 1 : 0 }} />
            <img src="/logo-wanli-on-light.png" alt="" aria-hidden draggable={false}
              style={{ position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'contain', transition: 'opacity .35s', opacity: oscuro ? 0 : 1 }} />
          </span>
        </Link>

        {!compact && (
          <nav style={{
            display: 'flex', alignItems: 'center', gap: 36, flexShrink: 1, minWidth: 0,
            whiteSpace: 'nowrap', color: textoNav,
          }}>
            {SECCIONES.map(s => (
              <a key={s.id} href={`#${s.id}`} onClick={irA(s.id)} style={enlaceNav} className="link-gold">
                {u[s.key]}
              </a>
            ))}
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 16 : 28, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, letterSpacing: '0.2em', color: textoNav }}>
            {IDIOMAS.map(l => (
              <button key={l.code} onClick={() => setLanguage(l.code)} lang={l.code}
                aria-current={language === l.code ? 'true' : undefined}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', font: 'inherit',
                  letterSpacing: 'inherit', padding: 0, color: 'inherit',
                  opacity: language === l.code ? 1 : 0.45,
                  borderBottom: `1px solid ${language === l.code ? C.gold : 'transparent'}`,
                }}>
                {l.label}
              </button>
            ))}
          </div>

          {!compact && (
            <Link to={`/${language}/partner`} className="btn-solid" style={{
              border: `1px solid ${textoNav}`, color: textoNav, padding: '11px 26px',
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em', transition: 'all .3s',
            }}>
              {u.navCta}
            </Link>
          )}

          {compact && (
            <button onClick={() => setMenuOpen(o => !o)} aria-label={u.navMenu} aria-expanded={menuOpen}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.28em', color: textoNav,
              }}>
              {u.navMenu}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                {menuOpen
                  ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
                  : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
              </svg>
            </button>
          )}
        </div>
      </div>

      {compact && menuOpen && (
        <div style={{ borderTop: `1px solid ${line(0.12)}`, background: 'rgba(244,240,233,0.98)', maxHeight: 'calc(100vh - 78px)', overflowY: 'auto' }}>
          <nav className="pad" style={{
            display: 'flex', flexDirection: 'column', padding: '8px 22px 24px',
            fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.28em', color: C.ink,
          }}>
            {SECCIONES.map(s => (
              <a key={s.id} href={`#${s.id}`} onClick={irA(s.id)}
                style={{ padding: '15px 0', borderBottom: `1px solid ${line(0.1)}` }}>
                {u[s.key]}
              </a>
            ))}
            <Link to={`/${language}/partner`} onClick={() => setMenuOpen(false)} className="btn-solid" style={{
              marginTop: 20, background: C.ink, color: C.bg, textAlign: 'center',
              padding: '15px 20px', fontSize: 10, letterSpacing: '0.3em',
            }}>
              {u.navCta}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
