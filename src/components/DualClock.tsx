import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   DUAL CLOCK — Madrid / Beijing (carried over from static site v1)
───────────────────────────────────────────────────────────── */
const DualClock = ({ solid }: { solid: boolean }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const fmt = (tz: string) =>
    now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
  return (
    <div className="hidden xl:flex items-center gap-4"
      style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', fontFamily: 'monospace',
        color: solid ? 'rgba(14,17,23,0.35)' : 'rgba(255,255,255,0.45)' }}>
      <span>MAD {fmt('Europe/Madrid')}</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>BJS {fmt('Asia/Shanghai')}</span>
    </div>
  );
};

export default DualClock;
