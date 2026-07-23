import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────────────────────── */
const Testimonials = () => {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const items = t.testimonials.items;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section-pad" style={{ background: '#F0EDE8' }}>
      <div className="container">
        <motion.div initial={{ opacity:0, y:24 }} animate={inView?{opacity:1,y:0}:{}} transition={{ duration:0.6 }}
          className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="label mb-3">{t.testimonials.label}</p>
            <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:'clamp(40px,5vw,64px)', color:'#0E1117', lineHeight:0.92 }}>
              What our<br />partners say.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {[ChevronLeft, ChevronRight].map((Icon, i) => (
              <button key={i} aria-label={i === 0 ? 'Previous testimonial' : 'Next testimonial'}
                onClick={() => setActive((active + (i===0?-1:1) + items.length) % items.length)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                style={{ border:'1px solid rgba(14,17,23,0.12)', color:'rgba(14,17,23,0.5)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#B31C2E'; (e.currentTarget as HTMLElement).style.color = '#B31C2E'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,17,23,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(14,17,23,0.5)'; }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:28 }} animate={inView?{opacity:1,y:0}:{}} transition={{ delay: i*0.1, duration:0.6 }}
              onClick={() => setActive(i)}
              className="card cursor-pointer"
              style={{
                padding: 32,
                opacity: i === active ? 1 : 0.48,
                transform: i === active ? 'scale(1)' : 'scale(0.985)',
                transition: 'all 0.35s ease',
                outline: i === active ? '1.5px solid rgba(196,146,58,0.3)' : '1.5px solid transparent',
              }}>
              <Quote size={22} style={{ color: 'rgba(179,28,46,0.18)', marginBottom: 20 }} />
              <p style={{ fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', fontSize:17, color:'rgba(14,17,23,0.75)', lineHeight:1.65, marginBottom:24 }}>
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3" style={{ paddingTop:20, borderTop:'1px solid rgba(14,17,23,0.07)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{ background:'#B31C2E', fontSize:13, fontWeight:900 }}>{item.name[0]}</div>
                <div className="flex-1">
                  <p style={{ fontSize:13, fontWeight:700, color:'#0E1117' }}>{item.name}</p>
                  <p style={{ fontSize:10, color:'rgba(14,17,23,0.4)', marginTop:1 }}>{item.title}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,j)=><Star key={j} size={9} style={{ fill:'#C4923A', color:'#C4923A' }} />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
