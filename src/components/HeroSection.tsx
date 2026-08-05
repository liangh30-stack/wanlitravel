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

/* Medidas tomadas sobre la foto (1376×768):
   la fila de ventanillas desciende hacia la derecha ~27°; la ventanilla
   elegida está centrada en (588.8, 318.8) px y mide ~4.6×7.6 px. */
const IMG_W = 1376;
const IMG_H = 768;
const WIN_PX = 588.8;      // centro de la ventanilla, en px de la foto
const WIN_PY = 318.8;
const WIN_X = (WIN_PX / IMG_W) * 100;  // 42.79 %
const WIN_Y = (WIN_PY / IMG_H) * 100;  // 41.51 %
const TILT = 27;           // inclinación del fuselaje (grados, horario)
const BASE_RX = 4.3;       // semiejes del agujero en px de la foto (×1.8 la ventanilla real)
const BASE_RY = 6.9;
const HOLE_GROW = 15;      // factor de crecimiento del agujero en la fase final
const AR = IMG_W / IMG_H;

/** Trazado SVG de una elipse rotada (dos arcos con x-axis-rotation) */
const rotatedEllipsePath = (cx: number, cy: number, rx: number, ry: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  const dx = rx * Math.cos(rad);
  const dy = rx * Math.sin(rad);
  const x1 = (cx + dx).toFixed(1), y1 = (cy + dy).toFixed(1);
  const x2 = (cx - dx).toFixed(1), y2 = (cy - dy).toFixed(1);
  return `M${x1} ${y1}A${rx.toFixed(1)} ${ry.toFixed(1)} ${deg} 1 0 ${x2} ${y2}A${rx.toFixed(1)} ${ry.toFixed(1)} ${deg} 1 0 ${x1} ${y1}Z`;
};

/**
 * Máscara SVG: rectángulo opaco con un agujero elíptico ROTADO 27° que
 * coincide exactamente con la ventanilla de la foto (evenodd = agujero
 * transparente). El borde se suaviza con un blur proporcional al radio.
 */
const useWindowMask = (ref: React.RefObject<HTMLDivElement | null>, progress: MotionValue<number>) => {
  useEffect(() => {
    const apply = (v: number) => {
      if (!ref.current) return;
      const grow = Math.max(0, Math.min(1, (v - 0.5) / 0.35));
      const g = 1 + grow * (HOLE_GROW - 1);
      const rx = BASE_RX * g;
      const ry = BASE_RY * g;
      const blur = 0.35 + rx * 0.05;
      const hole = rotatedEllipsePath(WIN_PX, WIN_PY, rx, ry, TILT);
      const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${IMG_W} ${IMG_H}' preserveAspectRatio='none'>` +
        `<filter id='f' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='${blur.toFixed(2)}'/></filter>` +
        `<path filter='url(%23f)' fill='white' fill-rule='evenodd' d='M0 0H${IMG_W}V${IMG_H}H0Z ${hole}'/>` +
        `</svg>`;
      const url = `url("data:image/svg+xml,${svg.replace(/#/g, '%23')}")`;
      const s = ref.current.style as any;
      s.webkitMaskImage = url; s.maskImage = url;
      s.webkitMaskSize = '100% 100%'; s.maskSize = '100% 100%';
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
  /* De lejos, el paisaje se ve oscurecido y teñido por el atardecer;
     se aclara según nos acercamos al cristal */
  const spainTint    = useTransform(smooth, [0, 0.4, 0.62], [0.65, 0.45, 0]);

  /* Cristal de la ventanilla: brillo que desaparece al atravesarlo */
  const glassOpacity = useTransform(smooth, [0, 0.45, 0.68], [0.9, 0.7, 0]);
  /* El marco crece al mismo ritmo que el agujero de la máscara */
  const frameScale = useTransform(smooth, [0.5, 0.85], [1, HOLE_GROW]);

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
          <motion.div style={{ opacity: spainTint, background: 'linear-gradient(180deg, rgba(64,32,8,0.85) 0%, rgba(40,22,10,0.8) 100%)' }}
            className="absolute inset-0" aria-hidden />
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

            {/* Marco y cristal de LA ventanilla: mismo centro, misma
                inclinación (27°) y mismo tamaño que el agujero; crece con él */}
            <motion.div className="absolute pointer-events-none" style={{
              left: `${WIN_X}%`, top: `${WIN_Y}%`,
              width: `${((2 * BASE_RX) / IMG_W) * 100}%`,
              aspectRatio: `${BASE_RX} / ${BASE_RY}`,
              x: '-50%', y: '-50%',
              rotate: TILT,
              scale: frameScale,
              opacity: glassOpacity,
            }}>
              {/* Aro del marco, sutil como el de las ventanillas vecinas */}
              <div className="absolute" style={{
                inset: '-14%',
                borderRadius: '50%',
                boxShadow: 'inset 0 0 0.09vw rgba(235,240,250,0.75), inset 0 0.05vw 0.22vw rgba(0,0,0,0.5)',
              }} />
              {/* Cristal: reflejo del atardecer, como en el resto del fuselaje */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '50%' }}>
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(155deg, rgba(255,205,140,0.5) 0%, rgba(255,170,90,0.18) 38%, transparent 62%)',
                }} />
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(ellipse at 34% 18%, rgba(255,240,220,0.55) 0%, transparent 45%)',
                  mixBlendMode: 'screen',
                }} />
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
