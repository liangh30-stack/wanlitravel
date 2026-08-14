import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';
import { routeMeta, routeContent, type RouteGroup } from '../../routes-content';
import { C, display, kicker, line, serif, soft } from '../../theme';

/* ─────────────────────────────────────────────────────────────
   COLECCIÓN DE RUTAS — listado editorial, numerado en romanos
───────────────────────────────────────────────────────────── */

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

interface Props {
  id: string;
  group: RouteGroup;
  numeroColeccion: string;
  titulo: string;
  descripcion: string;
}

const Collection = ({ id, group, numeroColeccion, titulo, descripcion }: Props) => {
  const { t, language } = useLanguage();
  const u = t.ui;
  const rutas = routeMeta.filter(r => r.group === group);

  return (
    <section id={id} className="pad" style={{ background: C.bg, paddingBottom: 60, scrollMarginTop: 90 }}>
      <div className="wrap">
        <div className="split-even" style={{ borderBottom: `1px solid ${line(0.16)}`, paddingBottom: 32 }}>
          <div>
            <p style={kicker()}>{u.colKicker} {numeroColeccion}</p>
            <h2 style={{ ...display('clamp(34px,4.4vw,62px)'), marginTop: 18, lineHeight: 1.05 }}>{titulo}</h2>
          </div>
          <p style={{ margin: 0, maxWidth: 480, justifySelf: 'end', fontSize: 14, lineHeight: 2, color: soft() }}>
            {descripcion}
          </p>
        </div>

        <div>
          {rutas.map((r, i) => {
            const c = routeContent[language][r.id];
            return (
              <Link key={r.id} to={`/${language}/route/${r.id}`} className="route-row" style={{ display: 'grid' }}>
                <p className="route-num" style={{ margin: 0, fontFamily: serif, fontSize: 26, fontWeight: 300, color: soft(0.35) }}>
                  {ROMANOS[i]}
                </p>
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3 / 2', background: C.placeholder }}>
                  <img src={r.img} alt="" loading="lazy" decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9)' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.34em', color: C.gold }}>
                    {c.region}
                  </p>
                  <h3 className="route-title" style={{
                    margin: '10px 0 0', fontFamily: serif, fontSize: 'clamp(22px,2.4vw,30px)',
                    fontWeight: 400, color: C.ink, transition: 'color .3s',
                  }}>
                    {c.title}
                  </h3>
                  <p style={{ margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.85, color: soft(), maxWidth: 620 }}>
                    {c.description}
                  </p>
                </div>
                <p className="route-days" style={{
                  margin: 0, textAlign: 'right', fontSize: 10, textTransform: 'uppercase',
                  letterSpacing: '0.3em', color: soft(0.45),
                }}>
                  {c.itinerary.length} {u.days}
                </p>
                <span className="route-arrow" style={{ color: C.gold, transition: 'transform .3s', justifySelf: 'end' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Collection;
