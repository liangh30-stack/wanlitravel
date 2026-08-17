import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';
import { C, line, serif, soft } from '../../theme';
import { api, ApiError, S } from './shared';
import InquiriesDesk from './InquiriesDesk';
import BookingDesk from './BookingDesk';
import OrdersDesk from './OrdersDesk';
import PartnersDesk from './PartnersDesk';

/* ─────────────────────────────────────────────────────────────
   CENTRO DE OPERACIONES — /:lang/admin

   Herramienta interna, en castellano (el idioma de la operación y
   del proveedor). Tres mesas:
   · Solicitudes — lo que entra por los formularios de la web
   · Reservar    — buscar → cotizar → confirmar contra Tour10
   · Pedidos     — estado, gastos de cancelación, cancelar

   Con esto se puede vender de forma manual desde el primer día de
   producción, sin esperar al portal de clientes.
───────────────────────────────────────────────────────────── */

type Mesa = 'solicitudes' | 'reservar' | 'pedidos' | 'partners';

const MESAS: { id: Mesa; texto: string }[] = [
  { id: 'solicitudes', texto: 'Solicitudes' },
  { id: 'reservar', texto: 'Reservar' },
  { id: 'pedidos', texto: 'Pedidos' },
  { id: 'partners', texto: 'Partners' },
];

const AdminConsole = () => {
  const { language } = useLanguage();
  const [clave, setClave] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [dentro, setDentro] = useState(false);
  const [error, setError] = useState('');
  const [mesa, setMesa] = useState<Mesa>('solicitudes');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntrando(true); setError('');
    try {
      // Validar la clave con una llamada inocua antes de dar por buena la sesión
      await api(clave, '/api/inquiries');
      setDentro(true);
    } catch (err) {
      setError(err instanceof ApiError && (err.status === 401 || err.status === 403)
        ? 'Clave incorrecta.'
        : 'No se pudo conectar con el servidor.');
    } finally { setEntrando(false); }
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      {/* Barra superior propia (sin la navegación pública: esto es una herramienta) */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: 'rgba(244,240,233,0.96)',
        backdropFilter: 'blur(14px)', borderBottom: `1px solid ${line(0.12)}`,
      }}>
        <Link to={`/${language}`} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.24em', color: soft(0.55) }}>
          ← Web
        </Link>
        <p style={{ margin: 0, fontFamily: serif, fontSize: 17 }}>
          Wanli · Centro de operaciones
        </p>
        <div style={{ width: 46 }} />
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '96px 24px 80px' }}>
        {!dentro ? (
          <form onSubmit={entrar} style={{ ...S.card, maxWidth: 440, margin: '10vh auto 0' }}>
            <p style={{ margin: '0 0 14px', fontFamily: serif, fontSize: 22 }}>Acceso</p>
            <label style={S.label}>Clave de operaciones (API_SHARED_KEY)</label>
            <input type="password" autoComplete="off" value={clave}
              onChange={e => setClave(e.target.value)} style={S.input} placeholder="••••••••" />
            <p style={{ margin: '8px 0 0', fontSize: 11.5, lineHeight: 1.6, color: soft(0.5) }}>
              La clave no se guarda en el navegador: al recargar habrá que volver a escribirla.
            </p>
            {error && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#7A2222' }}>{error}</p>}
            <button type="submit" disabled={!clave || entrando}
              style={{ ...S.btn, marginTop: 14, opacity: !clave || entrando ? 0.55 : 1 }}>
              {entrando ? 'Comprobando…' : 'Entrar'}
            </button>
          </form>
        ) : (
          <>
            <nav style={{ display: 'flex', gap: 6, borderBottom: `1px solid ${line(0.16)}`, marginBottom: 22 }}>
              {MESAS.map(m => (
                <button key={m.id} onClick={() => setMesa(m.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  padding: '12px 18px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em',
                  color: mesa === m.id ? C.ink : soft(0.45),
                  borderBottom: `2px solid ${mesa === m.id ? C.gold : 'transparent'}`,
                  marginBottom: -1,
                }}>
                  {m.texto}
                </button>
              ))}
            </nav>
            {mesa === 'solicitudes' && <InquiriesDesk apiKey={clave} />}
            {mesa === 'reservar' && <BookingDesk apiKey={clave} />}
            {mesa === 'pedidos' && <OrdersDesk apiKey={clave} />}
            {mesa === 'partners' && <PartnersDesk apiKey={clave} />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminConsole;
