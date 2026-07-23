import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   TRUST BAR
───────────────────────────────────────────────────────────── */
const TrustBar = () => {
  const { t } = useLanguage();
  const items = [t.trust.item1, t.trust.item2, t.trust.item3, t.trust.item4];
  return (
    <div className="bg-[#0B1628] text-white overflow-hidden relative" style={{ borderBottom: '1px solid rgba(196,146,58,0.15)' }}>
      <div className="marquee-wrap py-4">
        <div className="marquee-track items-center gap-16">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-3 shrink-0"
              style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4923A', display: 'inline-block', flexShrink: 0 }} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
