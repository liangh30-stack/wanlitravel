import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';
import { CONTACTO } from '../../contact';
import { C, lineOn, serif, softOn } from '../../theme';

/** Pie: oficinas, contacto y los tres documentos legales */
const Footer = () => {
  const { t, language } = useLanguage();
  const u = t.ui;
  const lg = t.legal;

  const legales = [
    { to: `/${language}/privacy`, texto: lg.privacy.title },
    { to: `/${language}/cookies`, texto: lg.cookies.title },
    { to: `/${language}/legal`, texto: lg.legal.title },
  ];

  return (
    <footer className="pad" style={{ background: C.darker, color: C.bg, paddingTop: 80, paddingBottom: 44 }}>
      <div className="wrap">
        <div className="cols-3" style={{ gap: 56, alignItems: 'start' }}>
          <div>
            <img src="/logo-wanli-on-dark.png" alt="Wanli Travel" style={{ height: 64, width: 'auto', objectFit: 'contain' }} />
            <p style={{ margin: '18px 0 0', maxWidth: 300, fontSize: 13, lineHeight: 1.9, color: softOn(0.55) }}>
              {u.ftDesc}
            </p>
          </div>

          <div>
            <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.32em', color: softOn(0.42) }}>
              {u.ftOffices}
            </p>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontFamily: serif, fontSize: 22 }}>
              <span>Madrid</span>
              <span>Beijing · 北京</span>
              <span>Shanghai · 上海</span>
            </div>
          </div>

          <div>
            <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.32em', color: softOn(0.42) }}>
              {u.ftContact}
            </p>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14, color: softOn(0.75) }}>
              <a href={`mailto:${CONTACTO.partner}`}>{CONTACTO.partner}</a>
              <a href={`mailto:${CONTACTO.general}`}>{CONTACTO.general}</a>
              <a href={`tel:${CONTACTO.telefono.replace(/\s/g, '')}`}>{CONTACTO.telefono}</a>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 56, paddingTop: 24, borderTop: `1px solid ${lineOn(0.14)}`,
          display: 'flex', flexWrap: 'wrap', gap: '14px 30px', justifyContent: 'space-between',
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.26em', color: softOn(0.4),
        }}>
          <span>{u.ftRights}</span>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 26 }}>
            {legales.map(l => <Link key={l.to} to={l.to}>{l.texto}</Link>)}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
