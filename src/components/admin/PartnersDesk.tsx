import { useCallback, useEffect, useState } from 'react';
import { line, serif, soft } from '../../theme';
import { api, ApiError, S } from './shared';

/* ─────────────────────────────────────────────────────────────
   PARTNERS — cuentas del portal de clientes

   Modelo decidido por Andrés: nada de autorregistro. Operaciones
   da de alta al cliente y le entrega la clave. La clave generada
   se enseña UNA sola vez (no se guarda en claro): cópiala antes
   de cerrar el aviso.
───────────────────────────────────────────────────────────── */

interface Props { apiKey: string }

interface Partner {
  id: string; companyName: string; contactName?: string; email: string;
  status: 'ACTIVE' | 'DISABLED'; notes?: string; createdAt: string; lastLoginAt?: string;
}

const PartnersDesk = ({ apiKey }: Props) => {
  const [lista, setLista] = useState<Partner[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // alta
  const [empresa, setEmpresa] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');
  const [creando, setCreando] = useState(false);
  /** Clave recién generada, se muestra una única vez */
  const [credencial, setCredencial] = useState<{ email: string; password: string } | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try { setLista(await api<Partner[]>(apiKey, '/api/partners')); }
    catch (e) { setError(e instanceof ApiError ? e.message : String(e)); }
    finally { setCargando(false); }
  }, [apiKey]);

  useEffect(() => { void cargar(); }, [cargar]);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true); setError('');
    try {
      const r = await api<{ partner: Partner; password: string }>(apiKey, '/api/partners', {
        method: 'POST',
        body: JSON.stringify({
          companyName: empresa.trim(),
          ...(contacto.trim() ? { contactName: contacto.trim() } : {}),
          email: email.trim(),
          ...(notas.trim() ? { notes: notas.trim() } : {}),
        }),
      });
      setCredencial({ email: r.partner.email, password: r.password });
      setEmpresa(''); setContacto(''); setEmail(''); setNotas('');
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError && e.body?.error === 'EMAIL_EXISTS'
        ? 'Ya existe una cuenta con ese email.'
        : e instanceof ApiError ? e.message : String(e));
    } finally { setCreando(false); }
  };

  const cambiarEstado = async (p: Partner) => {
    await api(apiKey, `/api/partners/${p.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: p.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' }),
    }).catch(() => {});
    void cargar();
  };

  const restablecer = async (p: Partner) => {
    const r = await api<{ ok: boolean; password?: string }>(apiKey, `/api/partners/${p.id}/reset-password`, { method: 'POST' })
      .catch(() => null);
    if (r?.password) setCredencial({ email: p.email, password: r.password });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {credencial && (
        <div style={{ ...S.ok, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <span>
            Credenciales de <strong>{credencial.email}</strong> — entregar al cliente
            (no se volverán a mostrar): clave de acceso{' '}
            <code style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em' }}>{credencial.password}</code>
            {' '}· portal: <code>wanlitravel.com/es/portal</code>
          </span>
          <button style={S.btnGhost} onClick={() => setCredencial(null)}>Entendido, la he copiado</button>
        </div>
      )}

      <form onSubmit={crear} style={S.card}>
        <p style={{ margin: '0 0 14px', fontFamily: serif, fontSize: 20 }}>Dar de alta un partner</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div>
            <label style={S.label}>Empresa</label>
            <input required value={empresa} onChange={e => setEmpresa(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Contacto (opcional)</label>
            <input value={contacto} onChange={e => setContacto(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Email de acceso</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Notas (opcional)</label>
            <input value={notas} onChange={e => setNotas(e.target.value)} style={S.input} />
          </div>
        </div>
        <button type="submit" disabled={creando} style={{ ...S.btn, marginTop: 14, opacity: creando ? 0.6 : 1 }}>
          {creando ? 'Creando…' : 'Crear cuenta y generar clave'}
        </button>
      </form>

      {error && <div style={S.warn}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <p style={{ margin: 0, fontFamily: serif, fontSize: 20 }}>
          Cuentas <span style={{ fontSize: 13, color: soft(0.5) }}>· {lista.length}</span>
        </p>
        <button style={S.btnGhost} onClick={cargar} disabled={cargando}>
          {cargando ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {lista.length === 0 && !cargando && (
        <div style={{ ...S.card, textAlign: 'center', color: soft(0.5) }}>Aún no hay partners dados de alta.</div>
      )}

      {lista.map(p => (
        <div key={p.id} style={{ ...S.card, opacity: p.status === 'DISABLED' ? 0.55 : 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', alignItems: 'baseline' }}>
            <span style={{ fontFamily: serif, fontSize: 19 }}>{p.companyName}</span>
            {p.status === 'DISABLED' && (
              <span style={{ ...S.tag, borderColor: '#7A2222', color: '#7A2222' }}>desactivada</span>
            )}
            <span style={{ fontSize: 12.5, color: soft(0.55) }}>{p.email}</span>
            {p.contactName && <span style={{ fontSize: 12.5, color: soft(0.5) }}>{p.contactName}</span>}
            <span style={{ fontSize: 11.5, color: soft(0.4) }}>
              {p.lastLoginAt ? `último acceso ${new Date(p.lastLoginAt).toLocaleString('es-ES')}` : 'nunca ha entrado'}
            </span>
          </div>
          {p.notes && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: soft(0.55) }}>{p.notes}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, borderTop: `1px solid ${line(0.1)}`, paddingTop: 10 }}>
            <button style={S.btnGhost} onClick={() => restablecer(p)}>Restablecer clave</button>
            <button style={{ ...S.btnGhost, color: p.status === 'ACTIVE' ? '#7A2222' : '#2E5238' }}
              onClick={() => cambiarEstado(p)}>
              {p.status === 'ACTIVE' ? 'Desactivar' : 'Reactivar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartnersDesk;
