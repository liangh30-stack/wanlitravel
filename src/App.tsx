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
import Credentials from './components/site/Credentials';
import Offices from './components/site/Offices';
import Contact from './components/site/Contact';
import Footer from './components/site/Footer';
import CookieBanner from './components/site/CookieBanner';
import RouteDetails from './RouteDetails';
import LegalPage from './components/LegalPage';
import NotFound from './components/NotFound';
import AdminConsole from './components/admin/AdminConsole';
import PortalPage from './components/portal/PortalPage';
import PartnerPage from './components/site/PartnerPage';

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
      {!/\/(admin|portal)$/.test(location.pathname) && <CookieBanner />}
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
        <Credentials />
        <Offices />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

/**
 * /:lang/hotels — RETIRADO de la web pública (decisión de Andrés, 20/08):
 * las tarifas hoteleras son B2B y solo se muestran dentro del portal de
 * partners con sesión. El enlace antiguo lleva a la solicitud de acceso.
 */
const RedireccionHoteles = () => {
  const { lang } = useParams();
  return <Navigate to={`/${lang ?? idiomaGuardado()}/partner`} replace />;
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
            <Route path="hotels" element={<RedireccionHoteles />} />
            <Route path="partner" element={<PartnerPage />} />
            <Route path="privacy" element={<LegalPage doc="privacy" />} />
            <Route path="cookies" element={<LegalPage doc="cookies" />} />
            <Route path="legal" element={<LegalPage doc="legal" />} />
            <Route path="admin" element={<AdminConsole />} />
            <Route path="portal" element={<PortalPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<Navigate to={`/${idiomaGuardado()}`} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
