import { useCallback, useEffect, useState } from 'react';
import { C, line, serif, soft } from '../../theme';
import { api, ApiError, euros, S, type OrderRecord } from './shared';

/* ─────────────────────────────────────────────────────────────
   PEDIDOS — lista, gastos de cancelación y cancelación

   La cancelación es en dos pasos deliberadamente: primero se piden
   los gastos (execute:0) y se muestran; solo entonces se habilita
   el botón de ejecutar. Nadie cancela sin ver cuánto cuesta.
───────────────────────────────────────────────────────────── */

interface Props { apiKey: string }

interface Gastos { locator: string; cancellationCost?: string; currencyCode?: string }

const ESTADOS: Record<OrderRecord['status'], { texto: string; color: string }> = {
  CONFIRMED: { texto: 'Confirmado', color: '#2E5238' },
  PENDING_UNKNOWN: { texto: 'Pendiente de conciliar', color: '#8A6420' },
  CANCELLED: { texto: 'Cancelado', color: '#7A2222' },
};

const OrdersDesk = ({ apiKey }: Props) => {
  const [pedidos, setPedidos] = useState<OrderRecord[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [gastos, setGastos] = useState<Record<string, Gastos | 'cargando'>>({});
  const [cancelando, setCancelando] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      setPedidos(await api<OrderRecord[]>(apiKey, '/api/orders'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally { setCargando(false); }
  }, [apiKey]);

  useEffect(() => { void cargar(); }, [cargar]);

  const verGastos = async (locator: string) => {
    setGastos(g => ({ ...g, [locator]: 'cargando' }));
    try {
      const r = await api<Gastos>(apiKey, '/api/hotels/cancel-quote', {
        method: 'POST', body: JSON.stringify({ locator }),
      });
      setGastos(g => ({ ...g, [locator]: r }));
    } catch (err) {
      setError(err instanceof ApiError ? `${err.body?.error ?? ''} ${err.message}` : String(err));
      setGastos(g => { const { [locator]: _, ...rest } = g; return rest; });
    }
  };

  const cancelar = async (locator: string) => {
    setCancelando(locator); setError('');
    try {
      await api(apiKey, '/api/hotels/cancel', {
        method: 'POST', body: JSON.stringify({ locator }),
      });
      setGastos(g => { const { [locator]: _, ...rest } = g; return rest; });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? `${err.body?.error ?? ''} ${err.message}` : String(err));
    } finally { setCancelando(''); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontFamily: serif, fontSize: 20 }}>
          Pedidos <span style={{ fontSize: 13, color: soft(0.5) }}>· {pedidos.length}</span>
        </p>
        <button style={S.btnGhost} onClick={cargar} disabled={cargando}>
          {cargando ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {error && <div style={S.warn}>{error}</div>}

      {pedidos.some(p => p.status === 'PENDING_UNKNOWN') && (
        <div style={S.warn}>
          Hay pedidos <strong>pendientes de conciliar</strong> (confirm sin respuesta). No los repitas a mano:
          ejecuta <code>npm run reconcile</code> o espera a la conciliación diaria.
        </div>
      )}

      {pedidos.length === 0 && !cargando && (
        <div style={{ ...S.card, textAlign: 'center', color: soft(0.5) }}>Aún no hay pedidos.</div>
      )}

      {pedidos.map(p => {
        const est = ESTADOS[p.status];
        const g = p.locator ? gastos[p.locator] : undefined;
        return (
          <div key={p.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'baseline' }}>
              <span style={{ fontFamily: serif, fontSize: 20 }}>
                {p.locator ?? '— sin localizador —'}
              </span>
              <span style={{ ...S.tag, borderColor: est.color, color: est.color }}>{est.texto}</span>
              {p.priceChanged && (
                <span style={{ ...S.tag, borderColor: '#8A6420', color: '#8A6420' }}>PRECIO CAMBIÓ EN CONFIRM</span>
              )}
              <span style={{ fontSize: 12, color: soft(0.5) }}>ref. {p.clientLocalizer}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 13, color: soft(0.65) }}>
              {p.hotelCode && <span>Hotel {p.hotelCode}</span>}
              {p.checkIn && <span>{p.checkIn} → {p.checkOut}</span>}
              <span>Neto {euros(p.confirmedNeto ?? p.valuedNeto, p.currencyCode)}</span>
              <span style={{ color: soft(0.4) }}>{new Date(p.createdAt).toLocaleString('es-ES')}</span>
            </div>

            {p.status === 'CONFIRMED' && p.locator && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', borderTop: `1px solid ${line(0.1)}`, paddingTop: 10 }}>
                {g === undefined && (
                  <button style={S.btnGhost} onClick={() => verGastos(p.locator!)}>
                    Ver gastos de cancelación
                  </button>
                )}
                {g === 'cargando' && <span style={{ fontSize: 12, color: soft(0.5) }}>Consultando gastos…</span>}
                {g && g !== 'cargando' && (
                  <>
                    <span style={{ fontSize: 13.5 }}>
                      Cancelar ahora cuesta: <strong style={{ color: Number(g.cancellationCost ?? 0) > 0 ? C.warn : C.ok }}>
                        {euros(g.cancellationCost ?? 0, g.currencyCode)}
                      </strong>
                    </span>
                    <button
                      style={{ ...S.btn, background: '#7A2222', opacity: cancelando === p.locator ? 0.6 : 1 }}
                      disabled={cancelando === p.locator}
                      onClick={() => cancelar(p.locator!)}>
                      {cancelando === p.locator ? 'Cancelando…' : `Confirmar cancelación`}
                    </button>
                    <button style={S.btnGhost}
                      onClick={() => setGastos(x => { const { [p.locator!]: _, ...rest } = x; return rest; })}>
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrdersDesk;
