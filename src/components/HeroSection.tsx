import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   HERO — vuelo → zoom hacia UNA ventanilla real del fuselaje →
   atravesamos el cristal → España a pantalla completa.

   Técnica: la foto del avión vive en un wrapper con la MISMA
   proporción que la imagen (1380×768), de modo que las coordenadas
   en % del wrapper son coordenadas de la foto. La ventanilla elegida
   está en (44.5%, 41.5%). El wrapper se ESCALA con transform-origin
   en la ventanilla (la cámara "vuela" hacia ella) y lleva una máscara
   radial en ese mismo punto cuyo agujero crece en el espacio de la
   imagen — al multiplicarse por la escala, acaba tragándose la
   pantalla y revelando España detrás.
───────────────────────────────────────────────────────────── */

const WIN_X = 44.5;   // % de la foto — ventanilla del fuselaje
const WIN_Y = 41.5;
const AR = 1380 / 768; // proporción de hero-plane-sky.jpg

/** Actualiza la máscara: agujero elíptico que crece en espacio-imagen */
const useWindowMask = (ref: React.RefObject<HTMLDivElement | null>, progress: MotionValue<number>) => {
  useEffect(() => {
    const apply = (v: number) => {
      if (!ref.current) return;
      // rx en % del ancho: 0.8% (tamaño ventanilla) → 6% a partir de v=0.5
      const grow = Math.max(0, Math.min(1, (v - 0.5) / 0.35));
      const rx = 0.8 + grow * 5.2;
      const ry = rx * 3; // ventanilla vertical (en % de alto ≈ ×3 por la proporción)
      const mask = `radial-gradient(ellipse ${rx}% ${ry}% at ${WIN_X}% ${WIN_Y}%, transparent 88%, black 100%)`;
      ref.current.style.webkitMaskImage = mask;
      (ref.current.style as any).maskImage = mask;
    };
    apply(progress.get());
    return progress.on('change', apply);
  }, [ref, progress]);
};

const HeroSection = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  // 'end end': el progreso llega a 1 justo cuando el sticky se suelta —
  // con 'end start' el tramo visible solo alcanzaba 0.7 y el final nunca se veía
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { damping: 30, stiffness: 90, restDelta: 0.001 });

  useWindowMask(planeRef, smooth);

  /* La cámara: quieta al principio (el avión "vuela"), luego acelera hacia la ventanilla */
  const planeScale   = useTransform(smooth, [0, 0.15, 0.35, 0.55, 0.85], [1, 1.05, 2.2, 7, 26]);
  const planeDriftY  = useTransform(smooth, [0, 0.15], ['0%', '-1.5%']);   // deriva sutil de vuelo
  const planeOpacity = useTransform(smooth, [0, 0.74, 0.9], [1, 1, 0]);    // nos "colamos" dentro
  const planeBlur    = useTransform(smooth, [0.55, 0.85], ['blur(0px)', 'blur(5px)']); // velocidad
  const vignette     = useTransform(smooth, [0, 0.4, 0.7], [0.5, 0.35, 0]);

  /* España, detrás: respira hacia su encuadre final mientras se revela */
  const spainScale   = useTransform(smooth, [0.2, 0.95], [1.18, 1]);
  const spainOpacity = useTransform(smooth, [0, 0.3], [0.85, 1]);

  /* Cristal de la ventanilla: brillo que desaparece al atravesarlo */
  const glassOpacity = useTransform(smooth, [0, 0.45, 0.68], [0.9, 0.7, 0]);

  /* Texto y señales */
  const textOpacity    = useTransform(smooth, [0, 0.08], [1, 0]);
  const textY          = useTransform(smooth, [0, 0.08], [0, -32]);
  const scrollHint     = useTransform(smooth, [0, 0.06], [1, 0]);
  const arrivedOpacity = useTransform(smooth, [0.78, 0.92], [0, 1]);
  const arrivedY       = useTransform(smooth, [0.78, 0.92], [24, 0]);

  return (
    <div ref={containerRef} style={{ height: '340vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#05080f]">

        {/* ESPAÑA — el destino, visible a través de la ventanilla */}
        <motion.div style={{ opacity: spainOpacity, scale: spainScale }}
          className="absolute inset-0 z-0 origin-center">
          <img src="/hero-spain-arrival.jpg" alt="España" className="img-cover"
            style={{ filter: 'brightness(0.92) saturate(1.1)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
        </motion.div>

        {/* AVIÓN — wrapper con proporción de la foto; escala hacia la ventanilla */}
        <motion.div style={{ opacity: planeOpacity, filter: planeBlur }} className="absolute inset-0 z-10">
          <motion.div
            ref={planeRef}
            className="absolute left-1/2 top-1/2"
            style={{
              width: `max(100vw, ${(AR * 100).toFixed(1)}vh)`,
              aspectRatio: `${AR}`,
              x: '-50%', y: '-50%',
              translateY: planeDriftY,
              scale: planeScale,
              transformOrigin: `${WIN_X}% ${WIN_Y}%`,
            }}>
            <img src="/hero-plane-sky.jpg" alt="Avión sobre nubes al atardecer"
              className="absolute inset-0 w-full h-full object-fill"
              style={{ filter: 'brightness(0.85) saturate(1.05)' }} />

            {/* Marco y cristal de LA ventanilla (viaja y escala con la foto) */}
            <motion.div style={{ opacity: glassOpacity }}
              className="absolute pointer-events-none"
              // mismo punto y tamaño que el agujero de la máscara
              // (1.6% de ancho ≈ la ventanilla, con margen para el marco)
              // eslint-disable-next-line react/no-unknown-property
            >
              <div className="absolute" style={{
                left: `${WIN_X}%`, top: `${WIN_Y}%`, width: '1.9%', aspectRatio: '0.62 / 1',
                transform: 'translate(-50%, -50%)',
              }}>
                <div className="absolute inset-0" style={{
                  borderRadius: '46%',
                  border: '0.18vw solid rgba(215,225,245,0.55)',
                  boxShadow: 'inset 0 0.1vw 0.35vw rgba(255,255,255,0.4), 0 0 0.4vw rgba(0,0,0,0.35)',
                }} />
                <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '46%' }}>
                  <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse at 32% 20%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 30%, transparent 60%)',
                  }} />
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(180deg, rgba(140,180,255,0.14) 0%, transparent 55%)',
                    mixBlendMode: 'screen',
                  }} />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Viñeta atmosférica */}
          <motion.div style={{ opacity: vignette }}
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60 pointer-events-none" />
        </motion.div>

        {/* Titular */}
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

        {/* Indicación de scroll */}
        <motion.div style={{ opacity: scrollHint }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
          <p className="label text-white/35" style={{ letterSpacing: '0.38em' }}>{t.hero.scroll}</p>
          <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/45 to-transparent" />
          </motion.div>
        </motion.div>

        {/* Rótulo de llegada tras cruzar la ventanilla */}
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
