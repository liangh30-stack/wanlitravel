import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, Star, CheckCircle2, Clock3, Utensils,
  CalendarX2, ArrowRight, Info,
} from 'lucide-react';
import { useLanguage } from '../context';
import { submitInquiry, type InquiryStatus } from '../lib/inquiries';

/* ─────────────────────────────────────────────────────────────
   HOTEL SEARCH — /:lang/hotels
   演示数据模式：后端未配置 T10 凭证时返回 demo:true，
   页面显示"演示数据"横幅；接入真实凭证后自动展示实时库存。
───────────────────────────────────────────────────────────── */

interface RoomOffer { code: string; name?: string; units?: number; adults?: number; children?: number }
interface Accommodation {
  code: string; name?: string; category?: string; mealPlan?: string; pvp?: string; neto?: string;
  currencyCode?: string; status?: string; rooms: RoomOffer[];
  cancelPolicies?: { from?: string; amount?: string }[];
  /* T10: NS en disponibilidad — las condiciones de cancelación llegan en el paso de cotización */
  cancelPoliciesPending?: boolean;
}
interface SearchResponse { demo: boolean; idOperation: string; accommodations: Accommodation[] }
interface Destination { code: string; label: string }

const plus = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const HotelSearch = () => {
  const { t, language } = useLanguage();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destination, setDestination] = useState('AGP');
  const [checkIn, setCheckIn] = useState(plus(30));
  const [checkOut, setCheckOut] = useState(plus(34));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  // Edad real de cada niño (T10 tarifica por edad; 0–17). Sin default inventado.
  const [childAges, setChildAges] = useState<number[]>([]);
  const setChildCount = (n: number) => {
    setChildren(n);
    setChildAges(prev => Array.from({ length: n }, (_, i) => prev[i] ?? 6));
  };

  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState(false);

  // 报价请求（选中某家酒店后展开）
  const [quoteFor, setQuoteFor] = useState<Accommodation | null>(null);
  const [qCompany, setQCompany] = useState('');
  const [qEmail, setQEmail] = useState('');
  const [qConsent, setQConsent] = useState(false);
  const [qStatus, setQStatus] = useState<InquiryStatus>('idle');

  useEffect(() => {
    fetch('/api/hotels/destinations')
      .then(r => r.json())
      .then(d => setDestinations(d.destinations ?? []))
      .catch(() => setDestinations([]));
  }, []);

  const nights = Math.max(1, Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000));

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true); setSearchError(false); setResult(null); setQuoteFor(null);
    try {
      const res = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn, checkOut, destinationCode: destination,
          rooms: [{
            adults, children, units: 1,
            ...(children >= 1 ? { firstChildAge: childAges[0] } : {}),
            ...(children >= 2 ? { secondChildAge: childAges[1] } : {}),
          }],
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
    } catch {
      setSearchError(true);
    } finally {
      setSearching(false);
    }
  };

  const onQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteFor) return;
    if (!qConsent) { setQStatus('needConsent'); return; }
    setQStatus('sending');
    const ok = await submitInquiry({
      type: 'quote', companyName: qCompany, workEmail: qEmail,
      routeCode: quoteFor.code,
      message: `Hotel: ${quoteFor.name} · ${checkIn} → ${checkOut} · ${adults} adults ${children} children`,
      language, consent: true,
    });
    setQStatus(ok ? 'success' : 'error');
  };

  const mealLabel = (mp?: string) =>
    mp === 'BB' ? t.hotels.mealBB : mp === 'HB' ? t.hotels.mealHB : t.hotels.mealSA;

  const inputStyle: React.CSSProperties = {
    background: 'white', border: '1px solid rgba(14,17,23,0.12)', borderRadius: 12,
    padding: '12px 14px', fontSize: 14, color: '#0E1117', width: '100%', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(14,17,23,0.4)', display: 'block', marginBottom: 6,
  };

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

      <div className="container" style={{ maxWidth: 1080, paddingTop: 130, paddingBottom: 100 }}>
        {/* Heading */}
        <p className="label mb-3" style={{ color: '#B31C2E' }}>{t.hotels.subtitle}</p>
        <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(40px,6vw,64px)', color: '#0E1117', lineHeight: 1, marginBottom: 36 }}>
          {t.hotels.title}
        </h1>

        {/* Search form */}
        <form onSubmit={onSearch} className="card" style={{ padding: 24, marginBottom: 28 }}>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="col-span-2">
              <label style={labelStyle}>{t.hotels.destination}</label>
              <select value={destination} onChange={e => setDestination(e.target.value)} style={inputStyle}>
                {destinations.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.hotels.checkIn}</label>
              <input type="date" required value={checkIn} min={plus(1)} onChange={e => setCheckIn(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.hotels.checkOut}</label>
              <input type="date" required value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.hotels.adults} / {t.hotels.children}</label>
              <div className="flex gap-2">
                <select value={adults} onChange={e => setAdults(Number(e.target.value))} style={inputStyle}>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={children} onChange={e => setChildCount(Number(e.target.value))} style={inputStyle}>
                  {[0, 1, 2].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {children > 0 && (
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: children }, (_, i) => (
                    <select key={i} value={childAges[i] ?? 6} aria-label={`${t.hotels.childAge} ${i + 1}`}
                      onChange={e => setChildAges(a => { const n = [...a]; n[i] = Number(e.target.value); return n; })}
                      style={inputStyle}>
                      {Array.from({ length: 18 }, (_, age) => (
                        <option key={age} value={age}>{age} {t.hotels.yearsShort}</option>
                      ))}
                    </select>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={searching} className="btn btn-primary justify-center"
              style={{ fontSize: 10, padding: '13px 18px', opacity: searching ? 0.6 : 1 }}>
              <Search size={13} /> {searching ? t.hotels.searching : t.hotels.search}
            </button>
          </div>
        </form>

        {/* Demo banner */}
        {result?.demo && (
          <div className="flex items-center gap-3 rounded-xl px-5 py-3 mb-8"
            style={{ background: 'rgba(196,146,58,0.1)', border: '1px solid rgba(196,146,58,0.35)' }}>
            <Info size={15} style={{ color: '#8A6420', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#6B4E17' }}>{t.hotels.demoBanner}</p>
          </div>
        )}

        {searchError && (
          <p style={{ fontSize: 14, color: '#B31C2E', marginBottom: 24 }}>{t.form.error}</p>
        )}

        {/* Results */}
        {result && (
          result.accommodations.length === 0 ? (
            <p style={{ fontSize: 15, color: 'rgba(14,17,23,0.5)' }}>{t.hotels.noResults}</p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'rgba(14,17,23,0.45)', marginBottom: 20 }}>
                {result.accommodations.length} {t.hotels.resultsCount} · {nights} {t.hotels.nightsLabel}
              </p>
              <div className="space-y-4">
                {result.accommodations.map((a, i) => (
                  <motion.div key={a.code}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="card" style={{ padding: 22 }}>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      {/* Name + stars */}
                      <div style={{ flex: '1 1 240px', minWidth: 220 }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0E1117' }}>{a.name}</h3>
                          <span className="flex" aria-label={`${a.category ?? '4'} stars`}>
                            {[...Array(Number(a.category) || 4)].map((_, j) =>
                              <Star key={j} size={11} style={{ fill: '#C4923A', color: '#C4923A' }} />)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3" style={{ fontSize: 12, color: 'rgba(14,17,23,0.5)' }}>
                          <span className="flex items-center gap-1.5"><Utensils size={11} />{mealLabel(a.mealPlan)}</span>
                          {a.status === 'SALE'
                            ? <span className="flex items-center gap-1.5" style={{ color: '#1B8A4C' }}><CheckCircle2 size={11} />{t.hotels.instantConfirm}</span>
                            : <span className="flex items-center gap-1.5" style={{ color: '#8A6420' }}><Clock3 size={11} />{t.hotels.onRequest}</span>}
                          {a.cancelPolicies?.[0]?.from ? (
                            <span className="flex items-center gap-1.5"><CalendarX2 size={11} />{t.hotels.freeCancelBefore} {a.cancelPolicies[0].from}</span>
                          ) : a.cancelPoliciesPending ? (
                            <span className="flex items-center gap-1.5"><CalendarX2 size={11} />{t.hotels.cancelAtQuote}</span>
                          ) : null}
                        </div>
                      </div>
                      {/* Price */}
                      <div className="text-right" style={{ minWidth: 130 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(14,17,23,0.35)' }}>
                          {t.hotels.netTotal}
                        </p>
                        <p style={{ fontSize: 26, fontWeight: 800, color: '#B31C2E', lineHeight: 1.2 }}>
                          €{a.pvp ?? a.neto}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(14,17,23,0.35)' }}>{nights} {t.hotels.nightsLabel} · {a.code}</p>
                      </div>
                      {/* CTA */}
                      <button onClick={() => { setQuoteFor(quoteFor?.code === a.code ? null : a); setQStatus('idle'); }}
                        className="btn btn-primary" style={{ fontSize: 9, padding: '11px 18px' }}>
                        {t.hotels.requestQuote} <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* Inline quote form */}
                    <AnimatePresence>
                      {quoteFor?.code === a.code && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                          <div style={{ borderTop: '1px solid rgba(14,17,23,0.08)', marginTop: 18, paddingTop: 18 }}>
                            {qStatus === 'success' ? (
                              <div className="flex items-center gap-3">
                                <CheckCircle2 size={18} style={{ color: '#1B8A4C' }} />
                                <div>
                                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0E1117' }}>{t.form.successTitle}</p>
                                  <p style={{ fontSize: 12, color: 'rgba(14,17,23,0.5)' }}>{t.form.successDesc}</p>
                                </div>
                              </div>
                            ) : (
                              <form onSubmit={onQuoteSubmit} className="flex flex-wrap items-center gap-3">
                                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(14,17,23,0.55)', width: '100%' }}>
                                  {t.hotels.quoteHeading} — {a.name}
                                </p>
                                <input type="text" required placeholder={t.community.companyName} value={qCompany}
                                  onChange={e => setQCompany(e.target.value)} style={{ ...inputStyle, flex: '1 1 180px' }} />
                                <input type="email" required placeholder={t.community.workEmail} value={qEmail}
                                  onChange={e => setQEmail(e.target.value)} style={{ ...inputStyle, flex: '1 1 180px' }} />
                                <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 11, color: 'rgba(14,17,23,0.55)' }}>
                                  <input type="checkbox" checked={qConsent} onChange={e => setQConsent(e.target.checked)} style={{ accentColor: '#B31C2E' }} />
                                  <span>
                                    {t.form.consentPrefix}{' '}
                                    <Link to={`/${language}/privacy`} target="_blank" style={{ color: '#B31C2E', textDecoration: 'underline' }}>
                                      {t.form.privacyPolicy}
                                    </Link>
                                  </span>
                                </label>
                                <button type="submit" disabled={qStatus === 'sending'} className="btn btn-primary"
                                  style={{ fontSize: 9, padding: '11px 18px', opacity: qStatus === 'sending' ? 0.6 : 1 }}>
                                  {qStatus === 'sending' ? t.form.sending : t.hotels.requestQuote}
                                </button>
                                {qStatus === 'needConsent' && <p style={{ fontSize: 11, color: '#B31C2E', width: '100%' }}>{t.form.consentRequired}</p>}
                                {qStatus === 'error' && <p style={{ fontSize: 11, color: '#B31C2E', width: '100%' }}>{t.form.error}</p>}
                              </form>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </>
          )
        )}
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

export default HotelSearch;
