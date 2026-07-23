import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   HERO — Airplane → Window → Spain
───────────────────────────────────────────────────────────── */
const PlaneMask = ({ progress }: { progress: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return progress.on('change', (v: number) => {
      if (!ref.current) return;
      // v goes 0→1 over 300vh. Mask hole grows from 9vw to 300vw
      const size = 9 + v * 291; // vw equivalent
      const mask = `radial-gradient(ellipse ${size * 0.88}vw ${size}vw at 50% 50%, transparent 98%, black 100%)`;
      ref.current.style.webkitMaskImage = mask;
      (ref.current.style as any).maskImage = mask;
    });
  }, [progress]);

  return (
    <div ref={ref} className="absolute inset-0"
      style={{
        backgroundImage: 'url(/hero-plane-sky.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        WebkitMaskImage: 'radial-gradient(ellipse 7.9vw 9vw at 50% 50%, transparent 98%, black 100%)',
        maskImage: 'radial-gradient(ellipse 7.9vw 9vw at 50% 50%, transparent 98%, black 100%)',
      }} />
  );
};

const HeroSection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const smooth = useSpring(scrollYProgress, { damping: 28, stiffness: 100, restDelta: 0.001 });

  const planeOpacity   = useTransform(smooth, [0, 0.05, 0.62, 0.78], [1, 1, 1, 0]);
  const spainOpacity   = useTransform(smooth, [0.1, 0.35], [0, 1]);
  const spainScale     = useTransform(smooth, [0.1, 0.78], [1.12, 1.0]);
  const textOpacity    = useTransform(smooth, [0, 0.08], [1, 0]);
  const textY          = useTransform(smooth, [0, 0.08], [0, -32]);
  const scrollHint     = useTransform(smooth, [0, 0.06], [1, 0]);
  const glareOpacity   = useTransform(smooth, [0, 0.05, 0.55, 0.7], [0, 1, 1, 0]);
  const arrivedOpacity = useTransform(smooth, [0.65, 0.82], [0, 1]);
  const arrivedY       = useTransform(smooth, [0.65, 0.82], [24, 0]);
  const overlayOpacity = useTransform(smooth, [0, 0.06, 0.55, 0.75], [0.55, 0.55, 0.55, 0]);

  return (
    <div ref={containerRef} style={{ height: '320vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#05080f]">

        {/* Spain landscape — revealed through the growing window */}
        <motion.div style={{ opacity: spainOpacity, scale: spainScale }}
          className="absolute inset-0 z-0 origin-center">
          <img src="/hero-spain-arrival.jpg" alt="Spain" className="img-cover" style={{ filter: 'brightness(0.9) saturate(1.1)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
        </motion.div>

        {/* Plane layer — full bleed, fades out */}
        <motion.div style={{ opacity: planeOpacity }} className="absolute inset-0 z-10">
          <img src="/hero-plane-sky.jpg" alt="Airplane" className="img-cover"
            style={{ objectPosition: 'center 60%', filter: 'brightness(0.82) saturate(1.05)' }} />
          {/* Atmospheric vignette */}
          <motion.div style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60" />
        </motion.div>

        {/* Plane mask — punches growing hole to show Spain */}
        <motion.div style={{ opacity: planeOpacity }} className="absolute inset-0 z-20">
          <PlaneMask progress={smooth} />
        </motion.div>

        {/* Window ring — visible while plane is showing */}
        <motion.div style={{ opacity: glareOpacity }}
          className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
          <motion.div
            style={{ width: useTransform(smooth, [0, 0.62], ['18vw', '310vw']), aspectRatio: '0.88 / 1' }}
            className="relative shrink-0">
            {/* Outer frame */}
            <div className="absolute inset-0 rounded-[50%]"
              style={{ border: '5px solid rgba(200,215,240,0.35)', boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.35), 0 0 0 1px rgba(0,0,0,0.25)' }} />
            {/* Glass glare */}
            <div className="absolute inset-0 rounded-[50%] overflow-hidden">
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 30% 22%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.1) 28%, transparent 58%)' }} />
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at 68% 12%, rgba(255,255,255,0.2) 0%, transparent 35%)' }} />
              {/* Sky tint */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(130,175,255,0.1) 0%, transparent 55%)', mixBlendMode: 'screen' }} />
            </div>
          </motion.div>
        </motion.div>

        {/* Hero headline */}
        <motion.div style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="label text-white/50 mb-8">{t.hero.subtitle}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease: [0.22,1,0.36,1] }}
            className="text-white mb-6 leading-[0.88]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(64px, 10vw, 140px)' }}>
            Wan<span style={{ color: '#C4923A' }}>li</span>travel.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="text-white/55 max-w-md leading-relaxed mb-10" style={{ fontSize: 15 }}>
            {t.hero.description}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            className="flex items-center gap-3 pointer-events-auto">
            <button onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-primary">
              {t.hero.cta} <ArrowRight size={13} />
            </button>
            <button onClick={() => document.getElementById('routes-spain')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-ghost">
              Explore Routes
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div style={{ opacity: scrollHint }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
          <p className="label text-white/35" style={{ letterSpacing: '0.38em' }}>{t.hero.scroll}</p>
          <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/45 to-transparent" />
          </motion.div>
        </motion.div>

        {/* "Arrived" caption after zoom */}
        <motion.div style={{ opacity: arrivedOpacity, y: arrivedY }}
          className="absolute bottom-16 right-12 lg:right-20 z-40 text-right pointer-events-none">
          <p className="label text-white/50 mb-2">Now Arriving</p>
          <h2 className="text-white leading-[0.88]"
            style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle:'italic', fontWeight:300, fontSize:'clamp(42px,6vw,88px)' }}>
            España.<br /><span style={{ color:'#C4923A' }}>Welcome.</span>
          </h2>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
