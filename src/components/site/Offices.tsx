import { useLanguage } from '../../context';
import { C, display, kicker, line, serif, soft } from '../../theme';

/** Presencia: las tres mesas y las cifras de estructura */
const Offices = () => {
  const { t } = useLanguage();
  const u = t.ui;

  const cifras = [
    { valor: '3', texto: u.statOffices },
    { valor: '24/7', texto: u.statSupport },
    { valor: '4', texto: u.statLangs },
  ];

  return (
    <section id="oficinas" className="sec pad" style={{ background: C.bg, scrollMarginTop: 90 }}>
      <div className="wrap split">
        <div>
          <p style={kicker()}>{u.ofKicker}</p>
          <h2 style={{ ...display('clamp(32px,4vw,54px)'), marginTop: 20, textWrap: 'balance' }}>{u.ofTitle}</h2>
          <p style={{ margin: '24px 0 0', maxWidth: 460, fontSize: 14, lineHeight: 2, color: soft() }}>{u.ofDesc}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {u.offices.map(([ciudad, papel, idiomas]) => (
            <div key={ciudad} className="office-row" style={{ borderBottom: `1px solid ${line(0.12)}`, padding: '26px 0' }}>
              <h3 style={{ margin: 0, fontFamily: serif, fontSize: 30, fontWeight: 400 }}>{ciudad}</h3>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.85, color: soft() }}>{papel}</p>
              <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.24em', color: soft(0.5), textAlign: 'right' }}>
                {idiomas}
              </p>
            </div>
          ))}
          <div className="stats-3" style={{ paddingTop: 34 }}>
            {cifras.map(c => (
              <div key={c.texto}>
                <p style={{ margin: 0, fontFamily: serif, fontSize: 40, fontWeight: 300, color: C.ink }}>{c.valor}</p>
                <p style={{ margin: '6px 0 0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.26em', color: soft(0.5) }}>
                  {c.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offices;
