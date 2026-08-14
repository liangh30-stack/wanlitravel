import { Link } from 'react-router-dom';
import { useLanguage } from '../context';
import Header from './site/Header';
import Footer from './site/Footer';
import { C, display, kicker, soft, solidBtn } from '../theme';

/** 404 con la misma piel que el resto: mejor esto que la pantalla en blanco */
const NotFound = () => {
  const { t, language } = useLanguage();
  const lg = t.legal;
  return (
    <>
      <Header />
      <main className="pad" style={{
        background: C.bg, minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', paddingTop: 150, paddingBottom: 120,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 560 }}>
          <p style={kicker()}>{lg.nfKicker}</p>
          <h1 style={{ ...display('clamp(36px,5vw,64px)'), marginTop: 22 }}>{lg.nfTitle}</h1>
          <p style={{ margin: '22px 0 0', fontSize: 15, lineHeight: 1.9, color: soft() }}>{lg.nfDesc}</p>
          <Link to={`/${language}`} className="btn-solid" style={{ ...solidBtn(C.ink, C.bg), marginTop: 36 }}>
            {lg.nfCta}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
