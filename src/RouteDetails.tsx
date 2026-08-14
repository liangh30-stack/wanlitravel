import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useLanguage } from './context';
import { routeMeta, routeContent, rutasAntiguas } from './routes-content';
import { submitInquiry, type InquiryStatus } from './lib/inquiries';
import Header from './components/site/Header';
import Footer from './components/site/Footer';
import { C, display, kicker, line, serif, soft, solidBtn } from './theme';

/* ─────────────────────────────────────────────────────────────
   FICHA DE RUTA

   El botón de cotización no lleva al formulario general: abre el
   de esta página, que envía el código de la ruta en la solicitud.
   Sin ese dato, quien recibe el aviso no sabe de qué ruta hablan.
───────────────────────────────────────────────────────────── */

const RouteDetails = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const u = t.ui;
  const rd = t.routeDetails;

  const cotizacion = useRef<HTMLDivElement>(null);
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [pax, setPax] = useState('');
  const [consent, setConsent] = useState(false);
  const [estado, setEstado] = useState<InquiryStatus>('idle');

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const alias = id ? rutasAntiguas[id] : undefined;
  if (alias) return <Navigate to={`/${language}/route/${alias}`} replace />;

  const meta = routeMeta.find(r => r.id === id);
  const c = id ? routeContent[language][id] : undefined;
  if (!meta || !c) return <Navigate to={`/${language}/404`} replace />;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setEstado('needConsent'); return; }
    setEstado('sending');
    const ok = await submitInquiry({
      type: 'quote', companyName: empresa, workEmail: email,
      routeCode: meta.id, monthlyPax: pax || undefined,
      message: `${c.title} · ${c.itinerary.length} ${u.days}`,
      language, consent: true,
    });
    setEstado(ok ? 'success' : 'error');
  };

  const irACotizar = (e: React.MouseEvent) => {
    e.preventDefault();
    cotizacion.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const campo: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none',
    borderBottom: `1px solid ${line(0.25)}`, padding: '9px 0', fontSize: 14,
    fontFamily: 'inherit', fontWeight: 300, color: C.ink, outline: 'none',
  };
  const etiqueta: React.CSSProperties = {
    display: 'block', marginBottom: 6, fontSize: 10,
    textTransform: 'uppercase', letterSpacing: '0.26em', color: soft(0.5),
  };

  const datos = [
    { k: u.dtDuration, v: `${c.itinerary.length} ${u.days}` },
    { k: u.dtGroup, v: u.dtGroupVal },
    { k: u.dtLevel, v: u.dtLevelVal },
  ];

  return (
    <>
      <Header />
      <div style={{ background: C.bg, minHeight: '100vh' }}>
        <div style={{ position: 'relative', height: '62vh', minHeight: 340, overflow: 'hidden', background: C.darker }}>
          <img src={meta.hero} alt={c.title} fetchPriority="high"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.88)' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg,rgba(8,11,15,0.5) 0%,rgba(8,11,15,0.1) 45%,rgba(8,11,15,0.35) 100%)',
          }} />
        </div>

        <div className="wrap pad">
          <div style={{ borderBottom: `1px solid ${line(0.16)}`, padding: '56px 0 44px' }}>
            <Link to={`/${language}`} style={{ ...kicker(soft(0.55), '0.3em'), fontSize: 10, display: 'inline-block' }}>
              ← {u.dtBack}
            </Link>
            <p style={{ ...kicker(), marginTop: 32 }}>{c.region}</p>
            <h1 style={{ ...display('clamp(36px,5.6vw,78px)'), marginTop: 18, maxWidth: 900, lineHeight: 1.05 }}>
              {c.title}
            </h1>
            <p style={{ margin: '22px 0 0', maxWidth: 660, fontSize: 15.5, lineHeight: 1.95, color: soft(0.65) }}>
              {c.description}
            </p>
          </div>

          <div className="detail-meta" style={{ borderBottom: `1px solid ${line(0.16)}` }}>
            {datos.map((d, i) => (
              <div key={d.k} style={{
                padding: i === 0 ? '24px 0' : '24px 0 24px 30px',
                borderRight: `1px solid ${line(0.12)}`,
              }}>
                <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.3em', color: soft(0.45) }}>{d.k}</p>
                <p style={{ margin: '8px 0 0', fontFamily: serif, fontSize: 22 }}>{d.v}</p>
              </div>
            ))}
            <div style={{ padding: '24px 0 24px 30px', display: 'flex', alignItems: 'center' }}>
              <a href="#cotizar" onClick={irACotizar} className="btn-solid"
                style={{ ...solidBtn(C.ink, C.bg), width: '100%', padding: '15px 18px', fontSize: 10 }}>
                {u.dtQuote}
              </a>
            </div>
          </div>

          <div className="detail-grid" style={{ padding: '70px 0 110px' }}>
            <div>
              <h2 style={{ margin: '0 0 16px', fontFamily: serif, fontSize: 32, fontWeight: 400 }}>{u.dtJourney}</h2>
              <div>
                {c.itinerary.map((paso, i) => {
                  const foto = meta.stepImgs?.[i];
                  return (
                    <div key={i} className="step-row" style={{ borderBottom: `1px solid ${line(0.12)}`, padding: '26px 0' }}>
                      <p style={{ margin: 0, fontFamily: serif, fontSize: 30, fontWeight: 300, color: C.gold }}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <div>
                        <h3 style={{ margin: 0, fontFamily: serif, fontSize: 22, fontWeight: 400, color: C.ink }}>
                          {paso.location}
                        </h3>
                        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.9, color: soft() }}>{paso.activity}</p>
                      </div>
                      <div className="step-img" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3 / 2' }}>
                        {foto && (
                          <img src={foto} alt="" loading="lazy" decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.88)' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ position: 'sticky', top: 110 }}>
                <div style={{ border: `1px solid ${line(0.16)}`, padding: 32 }}>
                  <p style={{ ...kicker(C.gold, '0.34em'), fontSize: 10 }}>{u.dtIncluded}</p>
                  <ul style={{ margin: '20px 0 0', padding: 0, listStyle: 'none' }}>
                    {u.included.map(item => (
                      <li key={item} style={{
                        display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 14, lineHeight: 1.8,
                        color: soft(0.7), borderBottom: `1px solid ${line(0.08)}`, padding: '12px 0',
                      }}>
                        <span style={{ color: C.gold, fontSize: 11 }}>—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: '22px 0 0', fontSize: 12.5, lineHeight: 1.9, color: soft(0.5) }}>{u.dtNote}</p>
                </div>

                {/* ── Cotización de ESTA ruta ── */}
                <div id="cotizar" ref={cotizacion} style={{
                  marginTop: 20, border: `1px solid ${line(0.16)}`, padding: 32, background: '#EFEAE1',
                }}>
                  {estado === 'success' ? (
                    <div>
                      <p style={{ margin: 0, fontFamily: serif, fontSize: 24 }}>{t.form.successTitle}</p>
                      <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.8, color: soft(0.6) }}>{t.form.successDesc}</p>
                    </div>
                  ) : (
                    <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div>
                        <p style={{ ...kicker(C.gold, '0.34em'), fontSize: 10 }}>{u.dtQuote}</p>
                        <p style={{ margin: '10px 0 0', fontSize: 12.5, lineHeight: 1.8, color: soft(0.6) }}>{rd.quoteSub}</p>
                      </div>
                      <div>
                        <label style={etiqueta}>{rd.quoteCompany}</label>
                        <input type="text" required value={empresa} onChange={e => setEmpresa(e.target.value)}
                          className="field-light" style={campo} />
                      </div>
                      <div>
                        <label style={etiqueta}>{rd.quoteEmail}</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          className="field-light" style={campo} />
                      </div>
                      <div>
                        <label style={etiqueta}>{rd.quotePax}</label>
                        <select value={pax} onChange={e => setPax(e.target.value)} className="field-light" style={campo}>
                          <option value="">—</option>
                          {rd.quotePaxOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 11.5, lineHeight: 1.6, color: soft(0.55), cursor: 'pointer' }}>
                        <input type="checkbox" checked={consent}
                          onChange={e => { setConsent(e.target.checked); if (estado === 'needConsent') setEstado('idle'); }}
                          style={{ marginTop: 3, accentColor: C.gold }} />
                        <span>
                          {t.form.consentPrefix}{' '}
                          <Link to={`/${language}/privacy`} target="_blank" style={{ color: C.gold, borderBottom: `1px solid ${C.gold}` }}>
                            {t.form.privacyPolicy}
                          </Link>
                        </span>
                      </label>
                      {estado === 'needConsent' && <p style={{ margin: 0, fontSize: 11.5, color: C.warn }}>{t.form.consentRequired}</p>}
                      {estado === 'error' && <p style={{ margin: 0, fontSize: 11.5, color: C.warn }}>{t.form.error}</p>}
                      <button type="submit" disabled={estado === 'sending'} className="btn-solid" style={{
                        ...solidBtn(C.ink, C.bg), width: '100%', padding: '15px 18px', fontSize: 10,
                        opacity: estado === 'sending' ? 0.6 : 1,
                      }}>
                        {estado === 'sending' ? t.form.sending : u.dtQuote}
                      </button>
                      <p style={{ margin: 0, fontSize: 10.5, textAlign: 'center', color: soft(0.4) }}>{rd.quoteSla}</p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RouteDetails;
