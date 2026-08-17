import { useCallback, useEffect, useState } from 'react';
import { serif, soft } from '../../theme';
import { euros, S } from '../admin/shared';
import { portalApi, PortalApiError } from './PortalPage';

/** MIS RESERVAS — historial del partner (solo las suyas, con PVP) */

interface Props { token: string; onSesionCaducada: () => void }

interface Pedido {
  id: string; clientLocalizer: string; locator?: string;
  status: 'CONFIRMED' | 'PENDING_UNKNOWN' | 'CANCELLED';
  hotelCode?: string; checkIn?: string; checkOut?: string;
  pvp?: string; currencyCode?: string; createdAt: string;
}

const ESTADOS: Record<Pedido['status'], { texto: string; color: string }> = {
  CONFIRMED: { texto: 'Confirmada', color: '#2E5238' },
  PENDING_UNKNOWN: { texto: 'En verificación', color: '#8A6420' },
  CANCELLED: { texto: 'Cancelada', color: '#7A2222' },
};

const PortalOrders = ({ token, onSesionCaducada }: Props) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      setPedidos(await portalApi<Pedido[]>(token, '/api/portal/orders'));
    } catch (e) {
      if (e instanceof PortalApiError && e.status === 401) { onSesionCaducada(); return; }
      setError(e instanceof PortalApiError ? e.message : String(e));
    } finally { setCargando(false); }
  }, [token, onSesionCaducada]);

  useEffect(() => { void cargar(); }, [cargar]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <p style={{ margin: 0, fontFamily: serif, fontSize: 20 }}>
          Mis reservas <span style={{ fontSize: 13, color: soft(0.5) }}>· {pedidos.length}</span>
        </p>
        <button style={S.btnGhost} onClick={cargar} disabled={cargando}>
          {cargando ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {error && <div style={S.warn}>{error}</div>}

      {pedidos.length === 0 && !cargando && (
        <div style={{ ...S.card, textAlign: 'center', color: soft(0.5) }}>
          Aún no hay reservas. La primera se hace en un minuto desde «Reservar hotel».
        </div>
      )}

      {pedidos.map(p => {
        const est = ESTADOS[p.status];
        return (
          <div key={p.id} style={S.card}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'baseline' }}>
              <span style={{ fontFamily: serif, fontSize: 20 }}>{p.locator ?? '(en proceso)'}</span>
              <span style={{ ...S.tag, borderColor: est.color, color: est.color }}>{est.texto}</span>
              <span style={{ fontSize: 12, color: soft(0.5) }}>ref. {p.clientLocalizer}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', marginTop: 8, fontSize: 13, color: soft(0.65) }}>
              {p.hotelCode && <span>Hotel {p.hotelCode}</span>}
              {p.checkIn && <span>{p.checkIn} → {p.checkOut}</span>}
              {p.pvp && <span>PVP {euros(p.pvp, p.currencyCode)}</span>}
              <span style={{ color: soft(0.4) }}>{new Date(p.createdAt).toLocaleString('es-ES')}</span>
            </div>
          </div>
        );
      })}

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: soft(0.45) }}>
        Para cancelar o modificar una reserva, contacte con su mesa de operaciones:
        gestionamos la cancelación comprobando antes los gastos aplicables.
      </p>
    </div>
  );
};

export default PortalOrders;
