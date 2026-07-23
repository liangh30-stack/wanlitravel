import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   PRIVACY POLICY — /:lang/privacy（GDPR）
───────────────────────────────────────────────────────────── */
const PrivacyPolicy = () => {
  const { t, language } = useLanguage();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-bg min-h-screen">
      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-[999] flex items-center justify-between px-8 lg:px-16"
        style={{ height: 64, background: 'rgba(248,246,242,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(14,17,23,0.07)' }}>
        <Link to={`/${language}`}
          className="flex items-center gap-2 transition-colors group"
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(14,17,23,0.5)' }}>
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {t.routeDetails.backToHome}
        </Link>
        <Link to={`/${language}`}>
          <img src="/logo-light-bg.jpeg" alt="Wanlitravel" style={{ height: 36, objectFit: 'contain', borderRadius: 8 }} />
        </Link>
        <div style={{ width: 80 }} />
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: 780, paddingTop: 140, paddingBottom: 120 }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(40px,6vw,64px)', color: '#0E1117', lineHeight: 1, marginBottom: 12 }}>
          {t.privacy.title}
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(14,17,23,0.4)', marginBottom: 48 }}>{t.privacy.updated}</p>

        <div className="space-y-10">
          {t.privacy.sections.map((s, i) => (
            <section key={i}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0E1117', marginBottom: 10 }}>{s.h}</h2>
              <p style={{ fontSize: 14.5, color: 'rgba(14,17,23,0.65)', lineHeight: 1.75 }}>{s.p}</p>
            </section>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <div style={{ background: '#05080F', padding: '28px 0' }}>
        <div className="container flex items-center justify-between">
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
            {t.footer.rights}
          </span>
          <Link to={`/${language}`} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            {t.routeDetails.returnHome}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
