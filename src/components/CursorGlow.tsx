import { useEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';

/* ─────────────────────────────────────────────────────────────
   CURSOR GLOW
───────────────────────────────────────────────────────────── */
const CursorGlow = () => {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <motion.div className="cursor-glow"
      style={{ left: x, top: y, position: 'fixed', pointerEvents: 'none', zIndex: 9000 }} />
  );
};

export default CursorGlow;
