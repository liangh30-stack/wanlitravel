import { useCallback, useEffect, useState } from 'react';
import { serif, soft } from '../../theme';
import { api, ApiError, S } from './shared';

/* ─────────────────────────────────────────────────────────────
   SOLICITUDES — lo que entra por los formularios de la web
───────────────────────────────────────────────────────────── */

interface Props { apiKey: string }

interface Inquiry {
  id: string;
  type: 'partner' | 'quote';
  companyName: string;
  businessType?: string;
  workEmail: string;
  region?: string;
  monthlyPax?: string;
  message?: string;
  routeCode?: string;
  language?: string;
  createdAt: string;
  handled: boolean;
}

const InquiriesDesk = ({ apiKey }: Props) => {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [verTratadas, setVerTratadas] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const data = await api<Inquiry[]>(apiKey, '/api/inquiries');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally { setCargando(false); }
  }, [apiKey]);

  useEffect(() => { void cargar(); }, [cargar]);

  const marcar = async (id: string) => {
    await api(apiKey, `/api/inquiries/${id}/handled`, { method: 'POST' }).catch(() => {});
    void cargar();
  };
  const borrar = async (id: string) => {
    await api(apiKey, `/api/inquiries/${id}`, { method: 'DELETE' }).catch(() => {});
    void cargar();
  };

  const visibles = verTratadas ? items : items.filter(i => !i.handled);
  const pendientes = items.filter(i => !i.handled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontFamily: serif, fontSize: 20 }}>
          Solicitudes <span style={{ fontSize: 13, color: soft(0.5) }}>
            · {pendientes} pendientes · {items.length} en total
          </span>
        </p>
        <button style={S.btnGhost} onClick={cargar} disabled={cargando}>
          {cargando ? 'Cargando…' : 'Actualizar'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: soft(0.6), cursor: 'pointer' }}>
          <input type="checkbox" checked={verTratadas} onChange={e => setVerTratadas(e.target.checked)} />
          ver tratadas
        </label>
      </div>

      {error && <div style={S.warn}>{error}</div>}

      {visibles.length === 0 && !cargando && (
        <div style={{ ...S.card, textAlign: 'center', color: soft(0.5) }}>Nada pendiente.</div>
      )}

      {visibles.map(i => (
        <div key={i.id} style={{ ...S.card, opacity: i.handled ? 0.6 : 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', alignItems: 'baseline' }}>
            <span style={S.tag}>{i.type === 'partner' ? 'Colaboración' : 'Cotización'}</span>
            {i.routeCode && <span style={S.tag}>{i.routeCode}</span>}
            {i.handled && <span style={{ ...S.tag, color: '#2E5238', borderColor: '#2E5238' }}>tratada</span>}
            <span style={{ fontSize: 11.5, color: soft(0.45) }}>
              {new Date(i.createdAt).toLocaleString('es-ES')}
            </span>
          </div>
          <p style={{ margin: '10px 0 4px', fontSize: 16, fontWeight: 500 }}>{i.companyName}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12.5, color: soft(0.6) }}>
            <a href={`mailto:${i.workEmail}`} style={{ color: '#A6803D' }}>{i.workEmail}</a>
            {i.businessType && <span>{i.businessType}</span>}
            {i.region && <span>{i.region}</span>}
            {i.monthlyPax && <span>{i.monthlyPax} PAX/mes</span>}
            {i.language && <span style={{ opacity: 0.6 }}>{i.language.toUpperCase()}</span>}
          </div>
          {i.message && (
            <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.7, color: soft(0.75) }}>{i.message}</p>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {!i.handled && <button style={S.btnGhost} onClick={() => marcar(i.id)}>Marcar tratada</button>}
            <button style={{ ...S.btnGhost, color: '#7A2222' }} onClick={() => borrar(i.id)}
              title="Eliminar definitivamente (derecho de supresión RGPD)">
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InquiriesDesk;
