import { useEffect, useMemo } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate, Outlet,
  useParams, useNavigate, useLocation,
} from 'react-router-dom';
import { spainRoutes, chinaRoutes } from './data';
import RouteDetails from './RouteDetails';
import { translations, Language } from './translations';
import { LanguageContext, useLanguage } from './context';
import CursorGlow from './components/CursorGlow';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TrustBar from './components/TrustBar';
import Stats from './components/Stats';
import PartnerLogos from './components/PartnerLogos';
import B2BSection from './components/B2BSection';
import RouteGrid from './components/RouteGrid';
import Testimonials from './components/Testimonials';
import PartnerForm from './components/PartnerForm';
import Footer from './components/Footer';

const SUPPORTED: Language[] = ['en', 'zh', 'es'];
const LANG_KEY = 'wanli.lang';

const storedLang = (): Language => {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v && (SUPPORTED as string[]).includes(v)) return v as Language;
  } catch { /* SSR/隐私模式 */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
  return (SUPPORTED as string[]).includes(nav) ? (nav as Language) : 'en';
};

/** 语言路由层：/:lang 前缀 → 提供 LanguageContext，并维护 SEO 标签 */
const LanguageLayout = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const language: Language | null =
    lang && (SUPPORTED as string[]).includes(lang) ? (lang as Language) : null;

  const value = useMemo(() => {
    if (!language) return null;
    return {
      language,
      t: translations[language],
      setLanguage: (next: Language) => {
        try { localStorage.setItem(LANG_KEY, next); } catch { /* noop */ }
        const rest = location.pathname.replace(/^\/(en|zh|es)/, '');
        navigate(`/${next}${rest}${location.hash}`, { replace: false });
      },
    };
  }, [language, location.pathname, location.hash, navigate]);

  // SEO：<html lang>、title、description、hreflang 交替链接
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

    const rest = location.pathname.replace(/^\/(en|zh|es)/, '');
    document.querySelectorAll('link[data-hreflang]').forEach(el => el.remove());
    for (const l of [...SUPPORTED, 'x-default'] as const) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = l === 'zh' ? 'zh-CN' : l;
      link.href = `${window.location.origin}/${l === 'x-default' ? 'en' : l}${rest}`;
      link.setAttribute('data-hreflang', '1');
      document.head.appendChild(link);
    }
  }, [language, location.pathname]);

  if (!language) return <Navigate to={`/${storedLang()}`} replace />;
  return (
    <LanguageContext.Provider value={value!}>
      <Outlet />
    </LanguageContext.Provider>
  );
};

const HomePage = () => {
  const { t } = useLanguage();
  return (
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
  );
};

/** 旧链接 /route/:id → 带语言前缀的新链接 */
const LegacyRouteRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/${storedLang()}/route/${id}`} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="no-scrollbar">
        <CursorGlow />
        <Routes>
          <Route path="/" element={<Navigate to={`/${storedLang()}`} replace />} />
          <Route path="/route/:id" element={<LegacyRouteRedirect />} />
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route index element={<HomePage />} />
            <Route path="route/:id" element={<RouteDetails />} />
          </Route>
          <Route path="*" element={<Navigate to={`/${storedLang()}`} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
