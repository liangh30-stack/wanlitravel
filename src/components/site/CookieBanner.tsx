import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';
import { C, lineOn, softOn } from '../../theme';

const CLAVE = 'wanli.cookies';

/**
 * Aviso de cookies.
 *
 * La decisión se guarda en localStorage: si se guardase sólo en memoria,
 * el aviso reaparecería en cada página y sería un incordio. Hoy el sitio
 * no carga analítica de terceros, así que el aviso es informativo; el día
 * que se añada Google Analytics habrá que convertirlo en consentimiento
 * previo real (bloquear el script hasta que se acepte).
 */
const CookieBanner = () => {
  const { t, language } = useLanguage();
  const lg = t.legal;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try { setVisible(localStorage.getItem(CLAVE) !== 'ok'); } catch { setVisible(true); }
  }, []);

  if (!visible) return null;

  const aceptar = () => {
    try { localStorage.setItem(CLAVE, 'ok'); } catch { /* modo privado */ }
    setVisible(false);
  };

  return (
    <div role="region" aria-label="cookies" className="cookie-banner" style={{
      position: 'fixed', zIndex: 200,
      background: C.dark, color: C.bg, border: `1px solid ${lineOn(0.2)}`,
      padding: '18px 22px', boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
    }}>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.8, color: softOn(0.78) }}>
        {lg.ckText}{' '}
        <Link to={`/${language}/cookies`} style={{ color: C.goldLight, borderBottom: `1px solid ${C.goldLight}` }}>
          {lg.ckLink}
        </Link>
      </p>
      <button onClick={aceptar} className="btn-solid cookie-btn" style={{
        background: C.bg, color: C.ink, border: 'none', cursor: 'pointer',
        padding: '11px 26px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {lg.ckBtn}
      </button>
    </div>
  );
};

export default CookieBanner;
