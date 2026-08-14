import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';
import { submitInquiry, type InquiryStatus } from '../../lib/inquiries';
import { CONTACTO } from '../../contact';
import { C, display, fieldLabel, kicker, lineOn, serif, softOn, underlineField } from '../../theme';

/* ─────────────────────────────────────────────────────────────
   CANAL PRIVADO — el formulario de partners

   Escribe en /api/inquiries igual que antes: se guarda en SQLite,
   se ve en /admin y dispara el aviso por correo. Se mantienen los
   campos de negocio (tipo, región, PAX/mes) porque son los que
   permiten priorizar una solicitud sin tener que escribir al cliente.
───────────────────────────────────────────────────────────── */

const Contact = () => {
  const { t, language } = useLanguage();
  const u = t.ui;
  const c = t.community;

  const [campos, setCampos] = useState({
    companyName: '', businessType: '', workEmail: '',
    region: '', monthlyPax: '< 50', message: '',
  });
  const [consent, setConsent] = useState(false);
  const [trampa, setTrampa] = useState('');   // honeypot: sólo lo rellenan los bots
  const [estado, setEstado] = useState<InquiryStatus>('idle');

  const set = (k: keyof typeof campos) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setCampos(f => ({ ...f, [k]: e.target.value }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setEstado('needConsent'); return; }
    setEstado('sending');
    const ok = await submitInquiry({
      type: 'partner',
      companyName: campos.companyName,
      businessType: campos.businessType || undefined,
      workEmail: campos.workEmail,
      region: campos.region || undefined,
      monthlyPax: campos.monthlyPax,
      message: campos.message || undefined,
      language, consent: true, website: trampa,
    });
    setEstado(ok ? 'success' : 'error');
  };

  const grupo = (etiqueta: string, control: React.ReactNode) => (
    <div>
      <label style={fieldLabel}>{etiqueta}</label>
      {control}
    </div>
  );

  return (
    <section id="contacto" className="pad" style={{
      background: C.dark, color: C.bg, paddingTop: 120, paddingBottom: 120, scrollMarginTop: 60,
    }}>
      <div className="wrap split" style={{ gap: 90 }}>
        <div>
          <p style={kicker(C.goldLight)}>{u.ctKicker}</p>
          <h2 style={{ ...display('clamp(32px,4vw,54px)'), marginTop: 22, maxWidth: 520, textWrap: 'balance' }}>
            {u.ctTitle}
          </h2>
          <p style={{ margin: '26px 0 0', maxWidth: 460, fontSize: 14, lineHeight: 2, color: softOn() }}>{u.ctDesc}</p>
          <div style={{
            marginTop: 44, borderTop: `1px solid ${lineOn(0.18)}`, paddingTop: 26,
            display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: softOn(0.75),
          }}>
            <a href={`mailto:${CONTACTO.partner}`}>{CONTACTO.partner}</a>
            <a href={`tel:${CONTACTO.telefono.replace(/\s/g, '')}`}>{CONTACTO.telefono}</a>
            <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.26em', color: softOn(0.45) }}>
              {CONTACTO.ciudades}
            </p>
          </div>
        </div>

        <div style={{ border: `1px solid ${lineOn(0.18)}`, padding: 'clamp(24px,4vw,52px)' }}>
          {estado === 'success' ? (
            <div style={{ textAlign: 'center', padding: '36px 0' }}>
              <div style={{
                margin: '0 auto', width: 56, height: 56, border: `1px solid ${C.goldLight}`,
                borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldLight,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 12 3 3 8-8" />
                </svg>
              </div>
              <h3 style={{ margin: '26px 0 0', fontFamily: serif, fontSize: 30, fontWeight: 400 }}>{u.fmDoneTitle}</h3>
              <p style={{ margin: '12px auto 0', maxWidth: 380, fontSize: 14, lineHeight: 1.9, color: softOn() }}>
                {u.fmDoneDesc}
              </p>
              <button onClick={() => setEstado('idle')} style={{
                marginTop: 26, background: 'none', border: 'none', borderBottom: `1px solid ${C.goldLight}`,
                cursor: 'pointer', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.28em',
                color: C.goldLight, padding: '0 0 4px',
              }}>
                {u.fmAgain}
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              {grupo(u.fmCompany,
                <input type="text" required value={campos.companyName} onChange={set('companyName')}
                  placeholder={u.fmCompanyPh} className="field-underline" style={underlineField} />)}

              {grupo(c.businessType,
                <select value={campos.businessType} onChange={set('businessType')}
                  className="field-underline" style={{ ...underlineField, color: campos.businessType ? C.bg : softOn(0.45) }}>
                  <option value="" style={{ color: C.ink }}>—</option>
                  {[c.tourOperator, c.travelAgency, c.corporateTMC, c.other].map(o => (
                    <option key={o} value={o} style={{ color: C.ink }}>{o}</option>
                  ))}
                </select>)}

              {grupo(u.fmEmail,
                <input type="email" required value={campos.workEmail} onChange={set('workEmail')}
                  placeholder="partner@company.com" className="field-underline" style={underlineField} />)}

              <div className="hotel-pax">
                {grupo(c.region,
                  <input type="text" value={campos.region} onChange={set('region')}
                    placeholder={c.regionPlaceholder} className="field-underline" style={underlineField} />)}
                {grupo(c.monthlyPax,
                  <select value={campos.monthlyPax} onChange={set('monthlyPax')}
                    className="field-underline" style={underlineField}>
                    {['< 50', '50–200', '200–500', '500+'].map(o => (
                      <option key={o} value={o} style={{ color: C.ink }}>{o}</option>
                    ))}
                  </select>)}
              </div>

              {grupo(u.fmInterest,
                <textarea rows={4} value={campos.message} onChange={set('message')}
                  placeholder={u.fmInterestPh} className="field-underline"
                  style={{ ...underlineField, resize: 'none', lineHeight: 1.8 }} />)}

              {/* Trampa para bots: invisible para las personas */}
              <input type="text" name="website" value={trampa} onChange={e => setTrampa(e.target.value)}
                tabIndex={-1} autoComplete="off" aria-hidden
                style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, lineHeight: 1.7, color: softOn(0.6), cursor: 'pointer' }}>
                <input type="checkbox" checked={consent}
                  onChange={e => { setConsent(e.target.checked); if (estado === 'needConsent') setEstado('idle'); }}
                  style={{ marginTop: 3, accentColor: C.goldLight }} />
                <span>
                  {t.form.consentPrefix}{' '}
                  <Link to={`/${language}/privacy`} target="_blank" style={{ color: C.goldLight, borderBottom: `1px solid ${C.goldLight}` }}>
                    {t.form.privacyPolicy}
                  </Link>
                </span>
              </label>

              {estado === 'needConsent' && <p style={{ margin: 0, fontSize: 12, color: '#E0A0A0' }}>{t.form.consentRequired}</p>}
              {estado === 'error' && <p style={{ margin: 0, fontSize: 12, color: '#E0A0A0' }}>{t.form.error}</p>}

              <button type="submit" disabled={estado === 'sending'} className="btn-solid" style={{
                marginTop: 6, width: '100%', background: C.bg, color: C.ink, border: 'none',
                cursor: 'pointer', padding: 18, fontSize: 11, textTransform: 'uppercase',
                letterSpacing: '0.32em', transition: 'all .3s', opacity: estado === 'sending' ? 0.6 : 1,
              }}>
                {estado === 'sending' ? u.fmSending : u.fmSubmit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
