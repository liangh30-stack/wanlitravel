import { useLanguage } from '../../context';
import { C, display, kicker, soft } from '../../theme';

/** Declaración de principios: el respiro entre el hero y el método */
const Statement = () => {
  const { t } = useLanguage();
  const u = t.ui;
  return (
    <section className="sec pad" style={{ background: C.bg }}>
      <div className="wrap" style={{ maxWidth: 900, textAlign: 'center' }}>
        <p style={kicker()}>{u.stKicker}</p>
        <h2 style={{ ...display('clamp(30px,4vw,56px)'), marginTop: 32, lineHeight: 1.25, textWrap: 'balance' }}>
          {u.stTitle}
        </h2>
        <p style={{ margin: '28px auto 0', maxWidth: 640, fontSize: 15, lineHeight: 2, color: soft() }}>
          {u.stDesc}
        </p>
      </div>
    </section>
  );
};

export default Statement;
