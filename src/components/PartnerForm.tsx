import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { CheckCircle2, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context';
import { submitInquiry, type InquiryStatus } from '../lib/inquiries';

/* ─────────────────────────────────────────────────────────────
   PARTNER INQUIRY FORM — 提交到 /api/inquiries
───────────────────────────────────────────────────────────── */
const PartnerForm = () => {
  const { t, language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const [fields, setFields] = useState({
    companyName: '', businessType: '', workEmail: '',
    region: '', monthlyPax: '< 50', message: '',
  });
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<InquiryStatus>('idle');

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setStatus('needConsent'); return; }
    setStatus('sending');
    const ok = await submitInquiry({
      type: 'partner',
      companyName: fields.companyName,
      businessType: fields.businessType || undefined,
      workEmail: fields.workEmail,
      region: fields.region || undefined,
      monthlyPax: fields.monthlyPax,
      message: fields.message || undefined,
      language,
      consent: true,
      website: honeypot,
    });
    setStatus(ok ? 'success' : 'error');
  };

  return (
    <section id="partner-form" ref={ref} className="section-pad relative overflow-hidden" style={{ background: '#F8F6F2' }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/about-team.jpg" alt="" loading="lazy" decoding="async" className="img-cover" style={{ opacity: 0.18 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, #F8F6F2 45%, rgba(248,246,242,0.5) 100%)' }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left */}
          <motion.div initial={{ opacity:0, x:-32 }} animate={inView?{opacity:1,x:0}:{}} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}>
            <p className="label mb-5">{t.community.subtitle}</p>
            <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:'clamp(48px,6vw,80px)', color:'#0E1117', lineHeight:0.9, marginBottom:24 }}>
              {t.community.title}
            </h2>
            <p style={{ fontSize:15, color:'rgba(14,17,23,0.55)', lineHeight:1.65, maxWidth:380, marginBottom:40 }}>
              {t.community.description}
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2 mb-12">
              {[t.trust.item1, t.trust.item2, t.trust.item3].map((item,i)=>(
                <span key={i} className="tag tag-light">
                  <CheckCircle2 size={10} style={{ color:'#B31C2E' }} />{item}
                </span>
              ))}
            </div>

            {/* Contact info */}
            <div style={{ paddingTop:28, borderTop:'1px solid rgba(14,17,23,0.08)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Mail size={14} style={{ color:'#B31C2E', flexShrink:0 }} />
                <span style={{ fontSize:14, color:'rgba(14,17,23,0.55)' }}>partnerships@wanlitravel.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} style={{ color:'#B31C2E', flexShrink:0 }} />
                <span style={{ fontSize:14, color:'rgba(14,17,23,0.55)' }}>+34 91 000 0000 · +86 10 0000 0000</span>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div initial={{ opacity:0, x:32 }} animate={inView?{opacity:1,x:0}:{}} transition={{ delay:0.15, duration:0.7, ease:[0.22,1,0.36,1] }}>
            <div className="card-glass" style={{ padding: '40px' }}>
              {status === 'success' ? (
                <div className="text-center py-16">
                  <CheckCircle2 size={40} style={{ color:'#1B8A4C', margin:'0 auto 20px' }} />
                  <h3 className="heading mb-3" style={{ fontSize:24 }}>{t.form.successTitle}</h3>
                  <p style={{ fontSize:14, color:'rgba(14,17,23,0.55)' }}>{t.form.successDesc}</p>
                </div>
              ) : (
              <>
              <h3 className="heading mb-8" style={{ fontSize:22 }}>{t.community.inquiry}</h3>
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t.community.companyName}</label>
                    <input type="text" required value={fields.companyName} onChange={set('companyName')}
                      placeholder={t.community.companyPlaceholder} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">{t.community.businessType}</label>
                    <select className="form-input" value={fields.businessType} onChange={set('businessType')}>
                      <option>{t.community.tourOperator}</option>
                      <option>{t.community.travelAgency}</option>
                      <option>{t.community.corporateTMC}</option>
                      <option>{t.community.other}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t.community.workEmail}</label>
                  <input type="email" required value={fields.workEmail} onChange={set('workEmail')}
                    placeholder={t.community.emailPlaceholder} className="form-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t.community.region}</label>
                    <input type="text" value={fields.region} onChange={set('region')}
                      placeholder={t.community.regionPlaceholder} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">{t.community.monthlyPax}</label>
                    <select className="form-input" value={fields.monthlyPax} onChange={set('monthlyPax')}>
                      <option>&lt; 50</option>
                      <option>50–200</option>
                      <option>200–500</option>
                      <option>500+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t.community.primaryInterest}</label>
                  <textarea value={fields.message} onChange={set('message')}
                    placeholder={t.community.interestPlaceholder} className="form-input" rows={4} style={{ resize:'none' }} />
                </div>

                {/* 蜜罐字段：对人不可见，机器人会填 */}
                <input type="text" value={honeypot} onChange={e=>setHoneypot(e.target.value)}
                  name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />

                {/* GDPR 同意 */}
                <label className="flex items-start gap-2 cursor-pointer" style={{ fontSize:12, color:'rgba(14,17,23,0.55)' }}>
                  <input type="checkbox" checked={consent} onChange={e=>{ setConsent(e.target.checked); if (status==='needConsent') setStatus('idle'); }}
                    style={{ marginTop:2, accentColor:'#B31C2E' }} />
                  <span>
                    {t.form.consentPrefix}{' '}
                    <Link to={`/${language}/privacy`} target="_blank" style={{ color:'#B31C2E', textDecoration:'underline' }}>
                      {t.form.privacyPolicy}
                    </Link>
                  </span>
                </label>
                {status === 'needConsent' && (
                  <p style={{ fontSize:11, color:'#B31C2E' }}>{t.form.consentRequired}</p>
                )}
                {status === 'error' && (
                  <p style={{ fontSize:11, color:'#B31C2E' }}>{t.form.error}</p>
                )}

                <button type="submit" disabled={status === 'sending'}
                  className="btn btn-primary w-full justify-center" style={{ width:'100%', fontSize:10, opacity: status==='sending' ? 0.6 : 1 }}>
                  {status === 'sending' ? t.form.sending : t.community.submit}
                </button>
                <p style={{ fontSize:10, textAlign:'center', color:'rgba(14,17,23,0.3)', marginTop:12 }}>{t.community.privacy}</p>
              </form>
              </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnerForm;
