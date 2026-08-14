import { useLanguage } from '../../context';
import { C, lineOn, serif, softOn } from '../../theme';

/**
 * Garantías.
 *
 * TODO(antes de publicar): cada una de estas cuatro afirmaciones tiene que
 * corresponder con un documento real (licencia de agencia, póliza de RC…).
 * Andrés ya pidió retirar IATA/UNWTO por este mismo motivo: declarar
 * acreditaciones que no se tienen es sancionable en España.
 */
const Credentials = () => {
  const { t } = useLanguage();
  const u = t.ui;
  return (
    <section className="pad" style={{ background: C.dark, color: C.bg, paddingTop: 110, paddingBottom: 110 }}>
      <div className="wrap">
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24,
          flexWrap: 'wrap', borderBottom: `1px solid ${lineOn(0.18)}`, paddingBottom: 24,
        }}>
          <h2 style={{ margin: 0, fontFamily: serif, fontSize: 34, fontWeight: 400 }}>{u.crTitle}</h2>
          <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.34em', color: softOn(0.45) }}>
            {u.crKicker}
          </p>
        </div>
        <div className="cols-4" style={{ paddingTop: 48 }}>
          {u.credentials.map(([titulo, texto]) => (
            <div key={titulo}>
              <p style={{ margin: 0, fontFamily: serif, fontSize: 24, fontWeight: 400, color: C.goldLight, lineHeight: 1.3 }}>
                {titulo}
              </p>
              <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.9, color: softOn() }}>{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Credentials;
