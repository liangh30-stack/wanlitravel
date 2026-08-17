import { useEffect, useMemo } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate, Outlet,
  useParams, useNavigate, useLocation,
} from 'react-router-dom';
import { translations, type Language } from './translations';
import { LanguageContext, useLanguage } from './context';
import Header from './components/site/Header';
import Hero from './components/site/Hero';
import Statement from './components/site/Statement';
import Process from './components/site/Process';
import Collection from './components/site/Collection';
import HotelFinder from './components/site/HotelFinder';
import Credentials from './components/site/Credentials';
import Offices from './components/site/Offices';
import Contact from './components/site/Contact';
import Footer from './components/site/Footer';
import CookieBanner from './components/site/CookieBanner';
import RouteDetails from './RouteDetails';
import LegalPage from './components/LegalPage';
import NotFound from './components/NotFound';
import AdminConsole from './components/admin/AdminConsole';

const SOPORTADOS: Language[] = ['en', 'zh', 'es'];
const CLAVE_IDIOMA = 'wanli.lang';

const idiomaGuardado = (): Language => {
  try {
    const v = localStorage.getItem(CLAVE_IDIOMA);
    if (v && (SOPORTADOS as string[]).includes(v)) return v as Language;
  } catch { /* modo privado */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'es';
  return (SOPORTADOS as string[]).includes(nav) ? (nav as Language) : 'es';
};

/** Capa de idioma: prefijo /:lang, contexto y etiquetas de SEO */
const LanguageLayout = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const language: Language | null =
    lang && (SOPORTADOS as string[]).includes(lang) ? (lang as Language) : null;

  const value = useMemo(() => {
    if (!language) return null;
    return {
      language,
      t: translations[language],
      setLanguage: (next: Language) => {
        try { localStorage.setItem(CLAVE_IDIOMA, next); } catch { /* noop */ }
        const resto = location.pathname.replace(/^\/(en|zh|es)/, '');
        navigate(`/${next}${resto}${location.hash}`);
      },
    };
  }, [language, location.pathname, location.hash, navigate]);

  useEffect(() => {
    if (!language) return;
    const t = translations[language];
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.title = t.meta.title;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.setAttribute('name', 'description');
      document.head.appendChild(desc);
    }
    desc.setAttribute('content', t.meta.description);

    const resto = location.pathname.replace(/^\/(en|zh|es)/, '');
    document.querySelectorAll('link[data-hreflang]').forEach(el => el.remove());
    for (const l of [...SOPORTADOS, 'x-default'] as const) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = l === 'zh' ? 'zh-CN' : l;
      link.href = `${window.location.origin}/${l === 'x-default' ? 'en' : l}${resto}`;
      link.setAttribute('data-hreflang', '1');
      document.head.appendChild(link);
    }
  }, [language, location.pathname]);

  if (!language) return <Navigate to={`/${idiomaGuardado()}`} replace />;
  return (
    <LanguageContext.Provider value={value!}>
      <Outlet />
      {/* El aviso de cookies no pinta nada en la herramienta interna */}
      {!location.pathname.endsWith('/admin') && <CookieBanner />}
    </LanguageContext.Provider>
  );
};

const HomePage = () => {
  const { t } = useLanguage();
  const u = t.ui;
  const location = useLocation();

  // Al llegar con /es#hoteles desde otra página hay que bajar a la sección
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, [location.hash]);

  return (
    <>
      <Header overHero />
      <main>
        <Hero />
        <Statement />
        <Process />
        <Collection id="colecciones" group="iberia" numeroColeccion="I"
          titulo={u.iberiaTitle} descripcion={u.iberiaDesc} />
        <Collection id="china" group="china" numeroColeccion="II"
          titulo={u.chinaTitle} descripcion={u.chinaDesc} />
        <HotelFinder />
        <Credentials />
        <Offices />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

/** /:lang/hotels — el buscador con su propia página, para enlazarlo directo */
const HotelsPage = () => {
  const { t } = useLanguage();
  const u = t.ui;
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <Header />
      <main style={{ paddingTop: 130 }}>
        <div className="wrap pad" style={{ paddingBottom: 30 }}>
          <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.44em', color: '#A6803D' }}>
            {u.htKicker}
          </p>
          <h1 style={{
            margin: '18px 0 0', fontFamily: "'Cormorant Garamond','Noto Serif SC',serif",
            fontSize: 'clamp(34px,4.6vw,60px)', fontWeight: 300,
          }}>
            {u.htTitle}
          </h1>
          <p style={{ margin: '18px 0 0', maxWidth: 620, fontSize: 14, lineHeight: 2, color: 'rgba(16,21,27,0.62)' }}>
            {u.htDesc}
          </p>
        </div>
        <HotelFinder comoSeccion={false} />
      </main>
      <Footer />
    </>
  );
};

/** Enlaces antiguos sin idioma: /route/:id → /es/route/:id */
const RedireccionLegado = () => {
  const { id } = useParams();
  return <Navigate to={`/${idiomaGuardado()}/route/${id}`} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="no-scrollbar">
        <Routes>
          <Route path="/" element={<Navigate to={`/${idiomaGuardado()}`} replace />} />
          <Route path="/route/:id" element={<RedireccionLegado />} />
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="route/:id" element={<RouteDetails />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="privacy" element={<LegalPage doc="privacy" />} />
            <Route path="cookies" element={<LegalPage doc="cookies" />} />
            <Route path="legal" element={<LegalPage doc="legal" />} />
            <Route path="admin" element={<AdminConsole />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<Navigate to={`/${idiomaGuardado()}`} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
