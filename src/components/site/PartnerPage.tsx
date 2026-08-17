import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';
import { submitInquiry, type InquiryStatus } from '../../lib/inquiries';
import { CONTACTO } from '../../contact';
import { C, line, lineOn, serif, soft, softOn } from '../../theme';
import Header from './Header';
import Footer from './Footer';

/* ─────────────────────────────────────────────────────────────
   /:lang/partner — SOLICITUD DE ACCESO A WANLI PARTNER

   Diseño enviado por Andrés (17/08): mitad izquierda, la promesa
   («Su equipo local en China») sobre la Gran Muralla; mitad
   derecha, el formulario de acceso con perfil comercial completo
   (país, mercado, tipo, volumen anual y servicios que necesita).

   Escribe en /api/inquiries (type: partner) como el resto de
   formularios: SQLite + panel /admin + aviso por correo. El campo
   «Empresa» y el consentimiento RGPD no salen en el diseño pero
   son imprescindibles (el primero para poder priorizar la
   solicitud, el segundo por ley) — añadidos con la misma estética.
───────────────────────────────────────────────────────────── */

/** Iconos de línea, trazo fino, para los cinco servicios */
const ICONOS = [
  // mapa / itinerario
  <path key="i" d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14" />,
  // grupos
  <g key="g"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.4c2.9.3 5 2.7 5 5.6" /></g>,
  // servicios terrestres (maleta)
  <g key="s"><rect x="4" y="8" width="16" height="12" rx="1.5" /><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8m-6 4h6" /></g>,
  // white-label (etiqueta)
  <g key="w"><path d="M4 4h7l9 9-7 7-9-9V4z" /><circle cx="8.5" cy="8.5" r="1.4" /></g>,
  // negocio China ↔ Iberia
  <g key="n"><rect x="3" y="9" width="8" height="11" rx="1" /><path d="M13 20h8V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v14zM6 13h2m-2 3h2m8-9h2m-2 3h2m-2 3h2" /></g>,
];

const inputEstilo: React.CSSProperties = {
  width: '100%', background: '#FFFFFF', border: `1px solid ${line(0.22)}`,
  padding: '13px 15px', fontFamily: 'inherit', fontSize: 13.5, color: C.ink,
  outline: 'none', borderRadius: 2, appearance: 'none', WebkitAppearance: 'none',
};

const etiqueta: React.CSSProperties = {
  display: 'block', fontSize: 10, textTransform: 'uppercase',
  letterSpacing: '0.22em', color: soft(0.6), marginBottom: 8,
};

const PartnerPage = () => {
  const { t, language } = useLanguage();
  const p = t.partner;
  const c = t.community;

  const [campos, setCampos] = useState({
    email: '', empresa: '', pais: '', region: '', tipo: '', pax: '',
  });
  const [servicios, setServicios] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [trampa, setTrampa] = useState('');
  const [estado, setEstado] = useState<InquiryStatus>('idle');

  useEffect(() => {
    window.scrollTo(0, 0);
    const previo = document.title;
    document.title = p.metaTitle;
    return () => { document.title = previo; };
  }, [p.metaTitle]);

  const set = (k: keyof typeof campos) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setCampos(f => ({ ...f, [k]: e.target.value }));

  const alternarServicio = (s: string) =>
    setServicios(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setEstado('needConsent'); return; }
    setEstado('sending');
    const ok = await submitInquiry({
      type: 'partner',
      companyName: campos.empresa,
      businessType: campos.tipo || undefined,
      workEmail: campos.email,
      region: [campos.pais, campos.region].filter(Boolean).join(' · ') || undefined,
      message: [
        `${p.paxYear}: ${campos.pax}`,
        servicios.length ? `${p.needs.split('?')[0]}?: ${servicios.join(', ')}` : '',
      ].filter(Boolean).join('\n'),
      language, consent: true, website: trampa,
    });
    setEstado(ok ? 'success' : 'error');
  };

  const selectVacio = (v: string): React.CSSProperties =>
    ({ ...inputEstilo, color: v ? C.ink : soft(0.42) });

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="split-partner" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 104 }}>

        {/* ── Izquierda: la promesa sobre la Gran Muralla ── */}
        <section aria-labelledby="partner-hero" style={{
          position: 'relative', color: C.bg, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 'clamp(32px,5vw,72px)', minHeight: 560, overflow: 'hidden',
        }}>
          <img src="/photos/gran-muralla-hero.jpg" alt="" aria-hidden
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(12,17,22,0.55) 0%, rgba(12,17,22,0.25) 45%, rgba(12,17,22,0.72) 100%)',
          }} />

          <div style={{ position: 'relative' }}>
            <h1 id="partner-hero" style={{
              margin: 0, fontFamily: serif, fontWeight: 300, whiteSpace: 'pre-line',
              fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: 1.12, textWrap: 'balance',
            }}>
              {p.heroTitle}
            </h1>
            <p style={{ margin: '26px 0 0', maxWidth: 440, fontSize: 14.5, lineHeight: 1.95, color: softOn(0.88) }}>
              {p.heroDesc}
            </p>
            <div style={{ marginTop: 30, width: 150, borderTop: `1px solid ${C.goldLight}` }} />

            <div style={{
              marginTop: 42, display: 'grid', gap: '34px 26px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(108px, 1fr))', maxWidth: 640,
            }}>
              {p.services.map((s, i) => (
                <div key={s}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.goldLight}
                    strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {ICONOS[i]}
                  </svg>
                  <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-line' }}>{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            position: 'relative', marginTop: 48, borderTop: `1px solid ${lineOn(0.24)}`, paddingTop: 24,
            display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14,
          }}>
            <a href={`mailto:${CONTACTO.partner}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.goldLight} strokeWidth="1.3" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3 7 9 6 9-6" />
              </svg>
              {CONTACTO.partner}
            </a>
            <a href={`tel:${CONTACTO.telefono.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.goldLight} strokeWidth="1.3" aria-hidden>
                <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              {CONTACTO.telefono}
            </a>
            <p style={{ margin: '4px 0 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3em', color: softOn(0.6) }}>
              {CONTACTO.ciudades}
            </p>
          </div>
        </section>

        {/* ── Derecha: el formulario de acceso ── */}
        <section aria-labelledby="partner-form" style={{
          background: C.bg, padding: 'clamp(28px,4.5vw,64px) clamp(24px,4.5vw,72px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {estado === 'success' ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                margin: '0 auto', width: 56, height: 56, border: `1px solid ${C.gold}`, borderRadius: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 12 3 3 8-8" />
                </svg>
              </div>
              <h2 style={{ margin: '26px 0 0', fontFamily: serif, fontSize: 30, fontWeight: 400 }}>{t.form.successTitle}</h2>
              <p style={{ margin: '12px auto 0', maxWidth: 380, fontSize: 14, lineHeight: 1.9, color: soft(0.65) }}>
                {t.form.successDesc}
              </p>
              <p style={{ margin: '28px 0 0', fontSize: 13 }}>
                {p.alreadyPartner}{' '}
                <Link to={`/${language}/portal`} style={{ color: C.gold, borderBottom: `1px solid ${C.gold}` }}>
                  {p.goPortal}
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={enviar} style={{ maxWidth: 560, width: '100%' }}>
              <h2 id="partner-form" style={{
                margin: 0, fontFamily: serif, fontWeight: 400, whiteSpace: 'pre-line',
                fontSize: 'clamp(28px,2.6vw,38px)', lineHeight: 1.2,
              }}>
                {p.formTitle}
              </h2>
              <p style={{ margin: '14px 0 28px', fontSize: 13, lineHeight: 1.8, color: soft(0.58), maxWidth: 420 }}>
                {p.formDesc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={etiqueta}>{p.email} *</label>
                  <input type="email" required value={campos.email} onChange={set('email')}
                    placeholder={p.emailPh} autoComplete="email" className="field-light" style={inputEstilo} />
                </div>

                <div>
                  <label style={etiqueta}>{p.company} *</label>
                  <input type="text" required value={campos.empresa} onChange={set('empresa')}
                    placeholder={p.companyPh} autoComplete="organization" className="field-light" style={inputEstilo} />
                </div>

                <div className="hotel-pax">
                  <div>
                    <label style={etiqueta}>{p.country} *</label>
                    <select required value={campos.pais} onChange={set('pais')} className="field-light" style={selectVacio(campos.pais)}>
                      <option value="">{p.countryPh}</option>
                      {p.countries.map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={etiqueta}>{p.region} *</label>
                    <select required value={campos.region} onChange={set('region')} className="field-light" style={selectVacio(campos.region)}>
                      <option value="">{p.regionPh}</option>
                      {p.regions.map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={etiqueta}>{p.companyType} *</label>
                  <select required value={campos.tipo} onChange={set('tipo')} className="field-light" style={selectVacio(campos.tipo)}>
                    <option value="">{p.companyTypePh}</option>
                    {[c.tourOperator, c.travelAgency, c.corporateTMC, c.other].map(x => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={etiqueta}>{p.paxYear} *</label>
                  <select required value={campos.pax} onChange={set('pax')} className="field-light" style={selectVacio(campos.pax)}>
                    <option value="">{p.paxYearPh}</option>
                    {p.paxRanges.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>

                <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                  <legend style={{ ...etiqueta, padding: 0 }}>{p.needs}</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 10 }}>
                    {p.needOptions.map(op => {
                      const activo = servicios.includes(op);
                      return (
                        <label key={op} style={{
                          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                          background: '#FFFFFF', border: `1px solid ${activo ? C.gold : line(0.18)}`,
                          padding: '11px 13px', fontSize: 12.5, lineHeight: 1.45, borderRadius: 2,
                          transition: 'border-color .2s',
                        }}>
                          <input type="checkbox" checked={activo} onChange={() => alternarServicio(op)}
                            style={{ accentColor: C.gold, flexShrink: 0 }} />
                          {op}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Trampa para bots: invisible para las personas */}
                <input type="text" name="website" value={trampa} onChange={e => setTrampa(e.target.value)}
                  tabIndex={-1} autoComplete="off" aria-hidden
                  style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, lineHeight: 1.7, color: soft(0.6), cursor: 'pointer' }}>
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

                {estado === 'needConsent' && <p style={{ margin: 0, fontSize: 12, color: '#7A2222' }}>{t.form.consentRequired}</p>}
                {estado === 'error' && <p style={{ margin: 0, fontSize: 12, color: '#7A2222' }}>{t.form.error}</p>}

                <button type="submit" disabled={estado === 'sending'} className="btn-solid" style={{
                  width: '100%', background: C.ink, color: C.bg, border: 'none', cursor: 'pointer',
                  padding: 18, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.32em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
                  transition: 'all .3s', opacity: estado === 'sending' ? 0.6 : 1,
                }}>
                  {estado === 'sending' ? t.form.sending : p.submit}
                  {estado !== 'sending' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 12h16m-6-6 6 6-6 6" />
                    </svg>
                  )}
                </button>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: soft(0.5) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
                      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                    </svg>
                    {p.sla}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: soft(0.5) }}>
                    {p.alreadyPartner}{' '}
                    <Link to={`/${language}/portal`} style={{ color: C.gold, borderBottom: `1px solid ${C.gold}` }}>
                      {p.goPortal}
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerPage;
