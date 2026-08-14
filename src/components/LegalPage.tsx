import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context';
import Header from './site/Header';
import Footer from './site/Footer';
import { C, display, kicker, line, serif, soft } from '../theme';

/* ─────────────────────────────────────────────────────────────
   PÁGINAS LEGALES — privacidad, cookies y aviso legal

   La política de privacidad usa el texto largo (RGPD: base jurídica,
   transferencias a China, plazos, AEPD). El diseño traía una versión
   de cuatro párrafos que legalmente se queda corta, así que se
   conserva la buena y se le pone la tipografía nueva.
───────────────────────────────────────────────────────────── */

type Doc = 'privacy' | 'cookies' | 'legal';

const LegalPage = ({ doc }: { doc: Doc }) => {
  const { t, language } = useLanguage();
  const lg = t.legal;

  useEffect(() => { window.scrollTo(0, 0); }, [doc]);

  const secciones: { h?: string; p: string }[] =
    doc === 'privacy'
      ? t.privacy.sections
      : lg[doc].paras.map(p => ({ p }));

  const titulo = doc === 'privacy' ? t.privacy.title : lg[doc].title;
  const actualizado = doc === 'privacy' ? t.privacy.updated : lg.updated;

  return (
    <>
      <Header />
      <main style={{ background: C.bg, minHeight: '100vh', paddingTop: 150, paddingBottom: 110 }} className="pad">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <Link to={`/${language}`} style={{ ...kicker(soft(0.5), '0.3em'), display: 'inline-block', fontSize: 10 }}>
            ← {lg.back}
          </Link>
          <h1 style={{ ...display('clamp(34px,4.6vw,58px)'), marginTop: 26 }}>{titulo}</h1>
          <p style={{ margin: '14px 0 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.28em', color: soft(0.45) }}>
            {actualizado}
          </p>

          <div style={{ marginTop: 44, borderTop: `1px solid ${line(0.16)}` }}>
            {secciones.map((s, i) => (
              <section key={i} style={{ borderBottom: `1px solid ${line(0.1)}`, padding: '28px 0' }}>
                {s.h && (
                  <h2 style={{ margin: '0 0 12px', fontFamily: serif, fontSize: 22, fontWeight: 400, color: C.ink }}>
                    {s.h}
                  </h2>
                )}
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 2, color: soft(0.72) }}>{s.p}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegalPage;
