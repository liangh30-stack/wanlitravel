import { useLanguage } from '../../context';
import { C, lineOn, serif, softOn, solidBtn } from '../../theme';

/* ─────────────────────────────────────────────────────────────
   HERO — foto a pantalla completa y la franja de las tres mesas
───────────────────────────────────────────────────────────── */

const irA = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Hero = () => {
  const { t } = useLanguage();
  const u = t.ui;

  const mesas = [
    { ciudad: 'Madrid', texto: u.deskMadrid },
    { ciudad: 'Beijing · 北京', texto: u.deskBeijing },
    { ciudad: 'Shanghai · 上海', texto: u.deskShanghai },
  ];

  return (
    <section style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      background: C.darker, color: '#fff', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src="/hero-spain-arrival.jpg" alt="" fetchPriority="high"
          style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg,rgba(8,11,15,0.52) 0%,rgba(8,11,15,0.30) 40%,rgba(8,11,15,0.62) 78%,rgba(8,11,15,0.88) 100%)',
        }} />
      </div>

      <div className="pad" style={{
        position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        paddingTop: 'clamp(120px,18vh,160px)', paddingBottom: 'clamp(48px,8vh,80px)',
      }}>
        <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5em', color: 'rgba(255,255,255,0.72)' }}>
          {u.heroKicker}
        </p>
        <div style={{ margin: 'clamp(20px,3vh,32px) 0 0', width: 1, height: 'clamp(32px,6vh,56px)', background: 'linear-gradient(rgba(196,148,74,0),#A6803D)' }} />
        <h1 style={{
          margin: 'clamp(22px,4vh,36px) 0 0', maxWidth: 1000, fontFamily: serif,
          fontSize: 'clamp(40px,6.4vw,92px)', fontWeight: 300, lineHeight: 1.06,
          letterSpacing: '0.01em', color: '#fff', textWrap: 'balance',
        }}>
          {u.heroTitle}
        </h1>
        <p style={{ margin: 'clamp(20px,3vh,32px) 0 0', maxWidth: 620, fontSize: 16, fontWeight: 300, lineHeight: 1.9, color: 'rgba(255,255,255,0.8)' }}>
          {u.heroDesc}
        </p>
        <div style={{ marginTop: 'clamp(30px,5vh,48px)', display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#colecciones" onClick={irA('colecciones')} className="btn-solid"
            style={{ ...solidBtn(C.bg, C.ink), padding: '17px 38px' }}>
            {u.heroCta1}
          </a>
          <a href="#contacto" onClick={irA('contacto')} className="btn-ghost"
            style={{ ...solidBtn('transparent', '#fff'), border: '1px solid rgba(255,255,255,0.45)', padding: '17px 38px' }}>
            {u.heroCta2}
          </a>
        </div>
      </div>

      <div style={{ position: 'relative', borderTop: `1px solid ${lineOn(0.16)}` }}>
        <div className="wrap pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
          {mesas.map((m, i) => (
            <div key={m.ciudad} style={{
              flex: '1 1 190px', padding: i === 0 ? '22px 0' : '22px 0 22px 32px',
              borderRight: `1px solid ${lineOn(0.14)}`,
            }}>
              <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.34em', color: 'rgba(255,255,255,0.45)' }}>
                {m.ciudad}
              </p>
              <p style={{ margin: '7px 0 0', fontSize: 13, color: softOn(0.82) }}>{m.texto}</p>
            </div>
          ))}
          <div style={{ flex: '1 1 190px', padding: '22px 0 22px 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.34em', color: 'rgba(255,255,255,0.45)' }}>
              {u.since}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
