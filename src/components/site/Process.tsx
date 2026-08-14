import { useLanguage } from '../../context';
import { C, line, serif, soft } from '../../theme';

/** Método: de la consulta a la operación, en tres pasos */
const Process = () => {
  const { t } = useLanguage();
  const u = t.ui;
  return (
    <section id="proceso" className="pad" style={{ background: C.bg, paddingBottom: 130, scrollMarginTop: 90 }}>
      <div className="wrap">
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24,
          flexWrap: 'wrap', borderBottom: `1px solid ${line(0.16)}`, paddingBottom: 24,
        }}>
          <h2 style={{ margin: 0, fontFamily: serif, fontSize: 34, fontWeight: 400, letterSpacing: '0.01em' }}>
            {u.prTitle}
          </h2>
          <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.34em', color: soft(0.45) }}>
            {u.prKicker}
          </p>
        </div>
        <div className="cols-3" style={{ paddingTop: 52 }}>
          {u.process.map(([num, titulo, texto]) => (
            <article key={num}>
              <p style={{ margin: 0, fontFamily: serif, fontSize: 52, fontWeight: 300, color: C.gold, lineHeight: 1 }}>{num}</p>
              <h3 style={{ margin: '20px 0 0', fontFamily: serif, fontSize: 26, fontWeight: 400, color: C.ink }}>{titulo}</h3>
              <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.95, color: soft() }}>{texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
