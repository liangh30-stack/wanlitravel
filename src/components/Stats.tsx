import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Globe2, CheckCircle2, Users2, Clock3 } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   STATS — animated numbers
───────────────────────────────────────────────────────────── */
const Stats = () => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const stats = [
    { value: '8,400+', label: t.stats.s1desc, icon: <Globe2 size={20} /> },
    { value: '98.7%',  label: t.stats.s2desc, icon: <CheckCircle2 size={20} /> },
    { value: '120+',   label: t.stats.s3desc, icon: <Users2 size={20} /> },
    { value: '48h',    label: t.stats.s4desc, icon: <Clock3 size={20} /> },
  ];

  return (
    <section ref={ref} className="section-pad" style={{ background: '#0B1628' }}>
      <div className="container">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-8">
          <div>
            <p className="label mb-3" style={{ color: 'rgba(196,146,58,0.7)' }}>{t.stats.label}</p>
            <h2 className="heading text-white" style={{ fontSize: 'clamp(36px,4.5vw,56px)' }}>
              Performance<br />that speaks.
            </h2>
          </div>
          <p className="text-white/35 max-w-xs leading-relaxed" style={{ fontSize: 14 }}>
            {t.trust.label}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="card-dark p-8 group hover:border-gold/20 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-gold/50 mb-5 group-hover:text-gold transition-colors">{s.icon}</div>
              <div className="stat-num text-white mb-2" style={{ fontSize: 'clamp(36px,4vw,52px)' }}>{s.value}</div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
