import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { CheckCircle2, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   PARTNER INQUIRY FORM
───────────────────────────────────────────────────────────── */
const PartnerForm = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

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
              <h3 className="heading mb-8" style={{ fontSize:22 }}>{t.community.inquiry}</h3>
              <form className="space-y-5" onSubmit={e=>e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t.community.companyName}</label>
                    <input type="text" placeholder={t.community.companyPlaceholder} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">{t.community.businessType}</label>
                    <select className="form-input">
                      <option>{t.community.tourOperator}</option>
                      <option>{t.community.travelAgency}</option>
                      <option>{t.community.corporateTMC}</option>
                      <option>{t.community.other}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t.community.workEmail}</label>
                  <input type="email" placeholder={t.community.emailPlaceholder} className="form-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t.community.region}</label>
                    <input type="text" placeholder={t.community.regionPlaceholder} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">{t.community.monthlyPax}</label>
                    <select className="form-input">
                      <option>&lt; 50</option>
                      <option>50–200</option>
                      <option>200–500</option>
                      <option>500+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">{t.community.primaryInterest}</label>
                  <textarea placeholder={t.community.interestPlaceholder} className="form-input" rows={4} style={{ resize:'none' }} />
                </div>
                <button type="submit" className="btn btn-primary w-full justify-center" style={{ width:'100%', fontSize:10 }}>
                  {t.community.submit}
                </button>
                <p style={{ fontSize:10, textAlign:'center', color:'rgba(14,17,23,0.3)', marginTop:12 }}>{t.community.privacy}</p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnerForm;
