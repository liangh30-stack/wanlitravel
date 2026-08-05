import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import {
  ArrowLeft, MapPin, Calendar, Users, Star, CheckCircle2,
  ArrowRight, Clock, ShieldCheck, Mail, Phone, ArrowUpRight,
} from 'lucide-react';
import { allRoutes, formatDuration } from './data';
import { useLanguage } from './context';
import { submitInquiry, type InquiryStatus } from './lib/inquiries';

export default function RouteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);

  // 报价请求表单状态
  const [qCompany, setQCompany] = useState('');
  const [qEmail, setQEmail] = useState('');
  const [qPax, setQPax] = useState('');
  const [qConsent, setQConsent] = useState(false);
  const [qHoneypot, setQHoneypot] = useState('');
  const [quoteStatus, setQuoteStatus] = useState<InquiryStatus>('idle');

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImgY   = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const route = allRoutes.find(r => r.id === id);
  const tr    = t.routes[id as keyof typeof t.routes];

  if (!route || !tr) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6 bg-bg">
        <h1 className="heading" style={{ fontSize: 40 }}>{t.routeDetails.routeNotFound}</h1>
        <Link to={`/${language}`} className="btn btn-primary">{t.routeDetails.returnHome}</Link>
      </div>
    );
  }

  const onQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qConsent) { setQuoteStatus('needConsent'); return; }
    setQuoteStatus('sending');
    const ok = await submitInquiry({
      type: 'quote', companyName: qCompany, workEmail: qEmail,
      message: qPax ? `Annual PAX volume: ${qPax}` : undefined,
      routeCode: route.code, language, consent: true, website: qHoneypot,
    });
    setQuoteStatus(ok ? 'success' : 'error');
  };

  const isSpain   = id?.startsWith('spain');
  const siblings  = allRoutes.filter(r => r.id !== id).slice(0, 3);

  return (
    <div className="bg-bg min-h-screen">

      {/* ── Fixed top bar ── */}
      <div className="fixed top-0 inset-x-0 z-[999] flex items-center justify-between px-8 lg:px-16"
        style={{ height: 64, background: 'rgba(248,246,242,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(14,17,23,0.07)' }}>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 transition-colors group"
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(14,17,23,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#B31C2E')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(14,17,23,0.5)')}>
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {t.routeDetails.backToHome}
        </button>

        <Link to={`/${language}`}><img src="/logo-light-bg.jpeg" alt="Wanlitravel" style={{ height: 36, objectFit:'contain', borderRadius:8 }} /></Link>

        <button onClick={() => document.getElementById('rd-quote')?.scrollIntoView({ behavior:'smooth' })}
          className="btn btn-primary" style={{ padding:'10px 20px', fontSize:9 }}>
          {t.routeDetails.requestQuote}
        </button>
      </div>

      {/* ── Hero ── */}
      <div ref={heroRef} className="relative overflow-hidden" style={{ height: '88vh', marginTop: 64 }}>
        <motion.div style={{ y: heroImgY }} className="absolute inset-0 scale-110 origin-center">
          <img src={route.img} alt={tr.title} className="img-cover" style={{ filter:'brightness(0.82) saturate(1.05)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(5,8,15,0.1) 0%, rgba(5,8,15,0.08) 40%, rgba(5,8,15,0.72) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(5,8,15,0.35) 0%, transparent 50%)' }} />
        </motion.div>

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity }}
          className="absolute inset-0 flex flex-col justify-end px-8 lg:px-20 pb-16 z-10">
          <motion.div initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, ease:[0.22,1,0.36,1] }}>
            {/* Region tag + product code */}
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={12} style={{ color:'#C4923A' }} />
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(196,146,58,0.9)' }}>
                {tr.region}
              </p>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', fontFamily:'monospace', color:'rgba(255,255,255,0.45)',
                border:'1px solid rgba(255,255,255,0.18)', borderRadius:99, padding:'3px 10px', marginLeft:8 }}>
                {route.code}
              </span>
            </div>

            <h1 className="text-white mb-6"
              style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:'clamp(52px,7vw,100px)', lineHeight:0.9 }}>
              {tr.title}
            </h1>

            <p className="text-white/60 mb-10" style={{ fontSize:15, maxWidth:520, lineHeight:1.65 }}>{tr.description}</p>

            {/* Quick specs */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Calendar size={13}/>, label: t.routeDetails.duration, val: formatDuration(t.routeDetails.durationFormat, route.days, route.nights) },
                { icon: <Users size={13}/>,    label: t.routeDetails.groupSize, val: t.routeDetails.groupSizeValue },
                { icon: <Star size={13}/>,     label: t.routeDetails.serviceLevel, val: t.routeDetails.serviceLevelValue },
                { icon: <ShieldCheck size={13}/>, label: t.routeDetails.netFrom, val: `€${route.netFrom} / PAX` },
              ].map((s,i)=>(
                <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl"
                  style={{ background:'rgba(5,8,15,0.55)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color:'#C4923A' }}>{s.icon}</span>
                  <div>
                    <p style={{ fontSize:8, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>{s.label}</p>
                    <p style={{ fontSize:12, fontWeight:700, color:'white' }}>{s.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Body ── */}
      <div className="container py-24">
        <div className="grid lg:grid-cols-12 gap-16">

          {/* Main: Itinerary */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-14">
              <div style={{ width:32, height:1, background:'#B31C2E' }} />
              <p className="label">{t.routeDetails.theJourney}</p>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="timeline-line" />

              <div className="space-y-0">
                {/* El TEXTO del itinerario es el traducido (tr.itinerary, 3 idiomas);
                    la imagen se toma de data.ts por índice si existe. */}
                {tr.itinerary.map((step, i) => (
                  <ItineraryStep key={i} step={step} img={route.itinerary[i]?.img}
                    index={i} total={tr.itinerary.length} badges={t.routeDetails.stepBadges} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 space-y-6">

            {/* Included */}
            <IncludedCard t={t} />

            {/* Quote form */}
            <div id="rd-quote" className="rounded-3xl overflow-hidden" style={{ background:'#0B1628' }}>
              <div className="p-8">
                <ShieldCheck size={20} style={{ color:'#C4923A', marginBottom:14 }} />
                <h3 className="heading text-white mb-2" style={{ fontSize:20 }}>
                  {t.routeDetails.requestQuote.replace(' →','')}
                </h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24, lineHeight:1.6 }}>
                  Net rates within 48h. White-label itinerary included. No commitment.
                </p>
                {quoteStatus === 'success' ? (
                  <div className="text-center py-8">
                    <p style={{ fontSize:16, fontWeight:700, color:'white', marginBottom:8 }}>{t.form.successTitle}</p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>{t.form.successDesc}</p>
                  </div>
                ) : (
                <form className="space-y-3" onSubmit={onQuoteSubmit}>
                  <input type="text" required placeholder="Company name" value={qCompany} onChange={e=>setQCompany(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}
                    onFocus={e=>(e.currentTarget.style.borderColor='#C4923A')}
                    onBlur={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.1)')} />
                  <input type="email" required placeholder="Work email" value={qEmail} onChange={e=>setQEmail(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white' }}
                    onFocus={e=>(e.currentTarget.style.borderColor='#C4923A')}
                    onBlur={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.1)')} />
                  <select className="w-full rounded-xl px-4 py-3 text-sm outline-none" value={qPax} onChange={e=>setQPax(e.target.value)}
                    style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}>
                    <option value="">Annual PAX volume</option>
                    <option>Under 100 PAX</option>
                    <option>100–500 PAX</option>
                    <option>500–2,000 PAX</option>
                    <option>2,000+ PAX</option>
                  </select>
                  <input type="text" value={qHoneypot} onChange={e=>setQHoneypot(e.target.value)}
                    name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                    style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />
                  <label className="flex items-start gap-2 cursor-pointer" style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>
                    <input type="checkbox" checked={qConsent} onChange={e=>setQConsent(e.target.checked)}
                      style={{ marginTop:2, accentColor:'#C4923A' }} />
                    <span>
                      {t.form.consentPrefix}{' '}
                      <Link to={`/${language}/privacy`} target="_blank" style={{ color:'#C4923A', textDecoration:'underline' }}>
                        {t.form.privacyPolicy}
                      </Link>
                    </span>
                  </label>
                  {quoteStatus === 'needConsent' && <p style={{ fontSize:11, color:'#E5484D' }}>{t.form.consentRequired}</p>}
                  {quoteStatus === 'error' && <p style={{ fontSize:11, color:'#E5484D' }}>{t.form.error}</p>}
                  <button type="submit" disabled={quoteStatus==='sending'}
                    className="btn btn-primary w-full justify-center" style={{ width:'100%', fontSize:10, opacity: quoteStatus==='sending' ? 0.6 : 1 }}>
                    {quoteStatus === 'sending' ? t.form.sending : t.routeDetails.requestQuote}
                  </button>
                </form>
                )}
                <p style={{ fontSize:9, textAlign:'center', color:'rgba(255,255,255,0.22)', marginTop:14 }}>
                  Response within 48h · No commitment
                </p>
              </div>

              {/* Contact strip */}
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'20px 32px' }} className="space-y-3">
                {[
                  { icon:<Mail size={13}/>, text:'partnerships@wanlitravel.com' },
                  { icon:<Phone size={13}/>, text:'+34 91 000 0000 · +86 10 0000 0000' },
                  { icon:<Clock size={13}/>, text:'48h SLA · Mon–Fri 9:00–18:00 CET' },
                ].map((c,i)=>(
                  <div key={i} className="flex items-center gap-3"
                    style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                    <span style={{ color:'#C4923A', flexShrink:0 }}>{c.icon}</span>{c.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* More routes */}
        <MoreRoutes routes={siblings} t={t} />
      </div>

      {/* Footer strip */}
      <div style={{ background:'#05080F', padding:'32px 0' }}>
        <div className="container flex items-center justify-between">
          <img src="/logo-dark-bg.jpeg" alt="Wanlitravel" style={{ height:40, objectFit:'contain', borderRadius:8, opacity:0.75 }} />
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.18)' }}>
            © 2025 Wanlitravel
          </span>
          <Link to={`/${language}`} className="flex items-center gap-2 transition-colors"
            style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#C4923A')}
            onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.35)')}>
            Back to Home <ArrowRight size={11}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Itinerary Step ─────────────────────────────────────────── */
function ItineraryStep({ step, img, index, badges }: {
  step: { location: string; activity: string };
  img?: string;
  index: number; total: number; badges: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div ref={ref}
      initial={{ opacity:0, x:-16 }}
      animate={inView ? { opacity:1, x:0 } : {}}
      transition={{ duration:0.55, ease:[0.22,1,0.36,1], delay: index * 0.06 }}
      className="relative pl-12 pb-16">

      {/* Step dot */}
      <div className="absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center z-10"
        style={{ background: '#0E1117', border: '2px solid rgba(14,17,23,0.08)' }}>
        <span style={{ fontSize:11, fontWeight:900, color:'white' }}>{index + 1}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Text */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={11} style={{ color:'#B31C2E', flexShrink:0 }} />
            <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'#B31C2E' }}>
              {step.location}
            </p>
          </div>
          <p style={{ fontSize:14, color:'rgba(14,17,23,0.65)', lineHeight:1.65 }}>{step.activity}</p>

          <div className="flex flex-wrap gap-2 mt-5">
            {badges.map((b,i)=>(
              <span key={i} className="tag tag-light" style={{ fontSize:8 }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Image (opcional: solo las primeras etapas tienen foto en data.ts) */}
        {img && (
          <div className="img-zoom-wrap rounded-2xl overflow-hidden" style={{ aspectRatio:'4/3', background:'#F0EDE8' }}>
            <img src={img} alt={step.location} loading="lazy" decoding="async" className="img-cover" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Included Card ──────────────────────────────────────────── */
function IncludedCard({ t }: { t: typeof import('./translations').translations.en }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} initial={{ opacity:0, y:20 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.5 }}
      className="card" style={{ padding:28 }}>
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck size={16} style={{ color:'#B31C2E' }} />
        <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#0E1117' }}>
          {t.routeDetails.includedInThisRoute}
        </p>
      </div>
      <ul className="space-y-3">
        {t.routeDetails.includedItems.map((item, i) => (
          <motion.li key={i}
            initial={{ opacity:0, x:-10 }} animate={inView?{opacity:1,x:0}:{}} transition={{ delay:0.05 + i*0.05 }}
            className="flex items-start gap-3">
            <CheckCircle2 size={13} style={{ color:'#B31C2E', flexShrink:0, marginTop:2 }} />
            <span style={{ fontSize:13, color:'rgba(14,17,23,0.65)', lineHeight:1.5 }}>{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── More Routes ────────────────────────────────────────────── */
function MoreRoutes({ routes, t }: { routes: typeof allRoutes; t: typeof import('./translations').translations.en }) {
  const { language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="mt-28 pt-20" style={{ borderTop:'1px solid rgba(14,17,23,0.08)' }}>
      <div className="flex items-center gap-4 mb-12">
        <div style={{ width:28, height:1, background:'#B31C2E' }} />
        <p className="label">More Routes</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {routes.map((r, i) => {
          const tr = t.routes[r.id as keyof typeof t.routes];
          return (
            <motion.div key={r.id}
              initial={{ opacity:0, y:28 }} animate={inView?{opacity:1,y:0}:{}} transition={{ delay:i*0.1, duration:0.6 }}>
              <Link to={`/${language}/route/${r.id}`} className="route-card block" style={{ aspectRatio:'3/4' }}>
                <img src={r.img} alt={tr?.title} loading="lazy" decoding="async" className="img-cover w-full h-full" />
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-6">
                  <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(196,146,58,0.85)', marginBottom:6 }}>
                    {tr?.region}
                  </p>
                  <h3 className="heading text-white" style={{ fontSize:20 }}>{tr?.title}</h3>
                  <div className="flex items-center gap-2 mt-4" style={{ opacity:0, transform:'translateY(6px)', transition:'all 0.3s ease' }}
                    onMouseEnter={e=>{
                      const p = e.currentTarget; p.style.opacity='1'; p.style.transform='translateY(0)';
                    }}>
                    <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.18em', color:'rgba(255,255,255,0.5)' }}>View</span>
                    <ArrowRight size={11} style={{ color:'#C4923A' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
