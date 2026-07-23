import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { formatDuration } from '../data';
import type { TravelRoute } from '../data';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   ROUTE GRID
───────────────────────────────────────────────────────────── */
const RouteGrid = ({ routes, title, subtitle, id, dark = false }: {
  routes: TravelRoute[]; title: string; subtitle: string; id: string; dark?: boolean;
}) => {
  const { t, language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id={id} ref={ref} className="section-pad" style={{ background: dark ? '#0E1117' : '#F8F6F2' }}>
      <div className="container">
        {/* Section header */}
        <motion.div initial={{ opacity:0, y:24 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.6 }}
          className="flex items-end justify-between mb-14 flex-wrap gap-6">
          <div>
            <p className="label mb-3" style={{ color: dark ? 'rgba(196,146,58,0.6)' : '#B31C2E' }}>{subtitle}</p>
            <h2 className="heading" style={{ fontSize:'clamp(40px,5vw,64px)', color: dark ? 'white' : '#0E1117' }}>
              {title}
            </h2>
          </div>
          <p style={{ fontSize:14, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(14,17,23,0.5)', maxWidth:320, lineHeight:1.6 }}>
            {dark ? t.china.description : t.spain.description}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {routes.map((route, i) => {
            const tr = t.routes[route.id as keyof typeof t.routes];
            return (
              <motion.div key={route.id}
                initial={{ opacity:0, y:32 }} animate={inView?{opacity:1,y:0}:{}}
                transition={{ delay: i*0.12, duration:0.65, ease:[0.22,1,0.36,1] }}>
                <Link to={`/${language}/route/${route.id}`} className="route-card block" style={{ aspectRatio:'3/4' }}>
                  <img src={route.img} alt={tr?.title} loading="lazy" decoding="async" className="img-cover w-full h-full" />
                  {/* Content overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-7">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={10} style={{ color: '#C4923A' }} />
                        <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(196,146,58,0.85)' }}>
                          {tr?.region}
                        </p>
                      </div>
                      <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.2em', fontFamily:'monospace', color:'rgba(255,255,255,0.4)' }}>
                        {route.code}
                      </span>
                    </div>
                    <h3 className="heading text-white mb-1" style={{ fontSize: 22 }}>{tr?.title}</h3>
                    <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'#C4923A', marginBottom:10 }}>
                      {formatDuration(t.routeDetails.durationFormat, route.days, route.nights)} · {t.routeDetails.netFrom} €{route.netFrom}
                    </p>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {tr?.description}
                    </p>
                    <div className="flex items-center gap-2 mt-5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      style={{ transition:'all 0.3s ease' }}>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>View Route</span>
                      <ArrowRight size={12} style={{ color: '#C4923A' }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RouteGrid;
