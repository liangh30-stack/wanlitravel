import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   PARTNER LOGOS
───────────────────────────────────────────────────────────── */
const PartnerLogos = () => {
  const { t } = useLanguage();
  // 注意：不得在未授权的情况下展示真实公司名/商标作为合作背书。
  // 以下为行业类别占位，上线前替换为已授权的真实合作伙伴 logo。
  const logos = [
    'Tour Operators · Spain', 'OTAs · Iberia', 'China Specialists · UK',
    'Corporate TMCs · EU', 'Wholesalers · LATAM', 'DMCs · Portugal',
    'Agency Groups · France', 'MICE Planners · China',
  ];
  return (
    <section className="section-pad-sm bg-bg">
      <div className="container">
        <p className="label text-center mb-10" style={{ color: 'rgba(14,17,23,0.2)' }}>{t.trust.label}</p>
      </div>
      <div className="marquee-wrap relative">
        <div className="absolute left-0 inset-y-0 w-24 z-10" style={{ background: 'linear-gradient(to right, #F8F6F2, transparent)' }} />
        <div className="absolute right-0 inset-y-0 w-24 z-10" style={{ background: 'linear-gradient(to left, #F8F6F2, transparent)' }} />
        <div className="marquee-track items-center gap-20">
          {[...logos, ...logos].map((name, i) => (
            <span key={i} className="shrink-0"
              style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(14,17,23,0.18)', whiteSpace: 'nowrap' }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
