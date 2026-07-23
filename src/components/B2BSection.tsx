import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   B2B SECTION
───────────────────────────────────────────────────────────── */
const B2BSection = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const features = [
    { icon: <Zap size={18}/>,        title: t.b2b.inventory, desc: t.b2b.inventoryDesc,  tag: 'Real-time' },
    { icon: <Sparkles size={18}/>,   title: t.b2b.dynamic,   desc: t.b2b.dynamicDesc,    tag: 'White-label' },
    { icon: <ShieldCheck size={18}/>,title: t.b2b.api,       desc: t.b2b.apiDesc,         tag: 'API-first' },
  ];

  return (
    <section id="b2b" ref={ref} className="section-pad relative overflow-hidden" style={{ background: '#0B1628' }}>
      {/* Subtle background */}
      <div className="absolute inset-0 z-0">
        <img src="/b2b-tech.jpg" alt="" loading="lazy" decoding="async" className="img-cover" style={{ opacity: 0.12, mixBlendMode: 'luminosity' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0B1628 30%, rgba(22,34,64,0.9) 100%)' }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left text */}
          <div>
            <motion.div initial={{ opacity:0, y:24 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration: 0.7, ease:[0.22,1,0.36,1] }}>
              <p className="label mb-5" style={{ color: 'rgba(196,146,58,0.65)' }}>{t.b2b.subtitle}</p>
              <h2 className="heading text-white mb-6" style={{ fontSize: 'clamp(40px,5vw,64px)' }}>
                {t.b2b.title}
              </h2>
              <p className="text-white/40 leading-relaxed mb-10" style={{ fontSize: 15, maxWidth: 400 }}>
                {t.curation.description}
              </p>

              {/* Features */}
              <div className="space-y-4">
                {features.map((f, i) => (
                  <motion.div key={i}
                    initial={{ opacity:0, x:-20 }} animate={inView?{opacity:1,x:0}:{}} transition={{ delay: 0.2 + i*0.1 }}
                    className="card-dark flex items-start gap-5 p-5 group hover:border-gold/15 transition-colors cursor-default"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(196,146,58,0.1)', color: '#C4923A' }}>
                      {f.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{f.title}</p>
                        <span className="tag tag-gold">{f.tag}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity:0 }} animate={inView?{opacity:1}:{}} transition={{ delay: 0.6 }}
                onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-primary mt-10">
                {t.b2b.requestDemo}
              </motion.button>
            </motion.div>
          </div>

          {/* Right — Dashboard mockup */}
          <motion.div
            initial={{ opacity:0, y:40 }} animate={inView?{opacity:1,y:0}:{}} transition={{ delay: 0.25, duration: 0.8, ease:[0.22,1,0.36,1] }}>
            <div className="card-glass-dark overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Titlebar */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex gap-1.5">
                  {['#FF5F57','#FEBC2E','#28C840'].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>{t.b2b.dashboard.title}</p>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="pulse-dot" style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block' }} />
                  <span style={{ fontSize: 8, fontWeight:700, color:'#22C55E', letterSpacing:'0.2em', textTransform:'uppercase' }}>LIVE</span>
                </div>
              </div>

              {/* Metric cards */}
              <div className="p-5 grid grid-cols-2 gap-3">
                {[
                  { l: t.b2b.dashboard.bookings,   v: '2,847', change: '+24%', c: '#22C55E' },
                  { l: t.b2b.dashboard.revenue,     v: '€4.2M', change: '+18%', c: '#C4923A' },
                  { l: t.b2b.dashboard.allotment,   v: '94%',   change: 'LIVE',  c: '#B31C2E' },
                  { l: t.b2b.dashboard.topRoutes,   v: '12',    change: 'ACTIVE',c: '#60A5FA' },
                ].map((d,i)=>(
                  <div key={i} className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize:8, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:8 }}>{d.l}</p>
                    <p className="stat-num" style={{ fontSize: 28, color: d.c, marginBottom:4 }}>{d.v}</p>
                    <span style={{ fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.07)', padding:'3px 8px', borderRadius:99 }}>{d.change}</span>
                  </div>
                ))}
              </div>

              {/* Top routes list */}
              <div className="px-5 pb-5">
                <div className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize:8, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.22)', marginBottom:12 }}>Top Revenue Routes</p>
                  {[
                    { name:'Costa del Sol Classic', net:'€850 net/pax', trend: '+12%' },
                    { name:'Imperial Capitals',     net:'€720 net/pax', trend: '+8%' },
                    { name:'Karst Landscapes',      net:'€680 net/pax', trend: '+21%' },
                  ].map((r,i)=>(
                    <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i<2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:'#C4923A', flexShrink:0 }} />
                      <span style={{ fontSize:12, color:'rgba(255,255,255,0.55)', flex:1 }}>{r.name}</span>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{r.net}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:'#22C55E' }}>{r.trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default B2BSection;
