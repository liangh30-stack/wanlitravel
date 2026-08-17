import { useEffect, useState } from 'react';
import { C, line, serif, soft } from '../../theme';
import { euros, resumePoliticas, S, type Destination, type StructuredCancelPolicy } from '../admin/shared';
import { portalApi, PortalApiError } from './PortalPage';

/* ─────────────────────────────────────────────────────────────
   RESERVA DESDE EL PORTAL — buscar → cotizar → confirmar

   El partner ve el PVP orientativo; su precio neto se aplica según
   su acuerdo comercial y lo factura operaciones. El mismo flujo de
   tres pasos del panel interno, con el neto fuera de la pantalla.
───────────────────────────────────────────────────────────── */

interface Props { token: string; onSesionCaducada: () => void }

interface Oferta {
  code: string; name?: string; category?: string; mealPlan?: string;
  pvp?: string; currencyCode?: string; status?: string; idDistributions?: string;
  structuredCancelPolicies?: StructuredCancelPolicy[];
  cancelPoliciesPending?: boolean; nonRefundable?: boolean;
  restrictions?: { code: string; description?: string }[];
}
interface Busqueda { idOperation: string; accommodations: Oferta[] }
interface Cotizacion {
  idOperation: string; pvp?: string; currencyCode?: string; quoteRef: string;
  structuredCancelPolicies?: StructuredCancelPolicy[];
}
interface Pasajero { name: string; firstSurname: string; secondSurname: string; age: number }

const masDias = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const nuevaRef = () => {
  const d = new Date();
  return `PT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

const PortalBooking = ({ token, onSesionCaducada }: Props) => {
  const [destinos, setDestinos] = useState<Destination[]>([]);
  const [destino, setDestino] = useState('');
  const [entrada, setEntrada] = useState(masDias(30));
  const [salida, setSalida] = useState(masDias(33));
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [edades, setEdades] = useState<number[]>([]);

  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<Busqueda | null>(null);
  const [error, setError] = useState('');

  const [oferta, setOferta] = useState<Oferta | null>(null);
  const [cotizando, setCotizando] = useState(false);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);

  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [referencia, setReferencia] = useState('');
  const [notas, setNotas] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [final, setFinal] = useState<
    | { tipo: 'ok'; locator: string; pvp?: string; currencyCode?: string }
    | { tipo: 'timeout' }
    | null>(null);

  useEffect(() => {
    fetch('/api/hotels/destinations')
      .then(r => r.json())
      .then(d => {
        const lista: Destination[] = d.destinations ?? [];
        setDestinos(lista);
        if (lista.length) setDestino(prev => (lista.some(x => x.code === prev) ? prev : lista[0].code));
      })
      .catch(() => setDestinos([]));
  }, []);

  const noches = Math.max(1, Math.round(
    (new Date(salida).getTime() - new Date(entrada).getTime()) / 86_400_000));

  const trata = (e: unknown): string => {
    if (e instanceof PortalApiError) {
      if (e.status === 401) { onSesionCaducada(); return 'Sesión caducada.'; }
      return e.body?.retryable ? 'El proveedor no respondió; inténtelo de nuevo en unos segundos.' : e.message;
    }
    return String(e);
  };

  const limpiarSeleccion = () => {
    setOferta(null); setCotizacion(null); setFinal(null); setAcepta(false); setNotas('');
  };

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true); setError(''); setResultado(null); limpiarSeleccion();
    try {
      const pais = destinos.find(d => d.code === destino)?.countryCode;
      const r = await portalApi<Busqueda>(token, '/api/portal/search', {
        method: 'POST',
        body: JSON.stringify({
          checkIn: entrada, checkOut: salida, destinationCode: destino,
          ...(pais ? { countryCode: pais } : {}),
          rooms: [{
            adults: adultos, children: ninos, units: 1,
            ...(ninos >= 1 ? { firstChildAge: edades[0] } : {}),
            ...(ninos >= 2 ? { secondChildAge: edades[1] } : {}),
          }],
        }),
      });
      setResultado(r);
    } catch (e) { setError(trata(e)); } finally { setBuscando(false); }
  };

  const cotizar = async (a: Oferta) => {
    if (!resultado) return;
    setOferta(a); setCotizacion(null); setFinal(null); setAcepta(false);
    setCotizando(true); setError('');
    try {
      const v = await portalApi<Cotizacion>(token, '/api/portal/value', {
        method: 'POST',
        body: JSON.stringify({ idOperation: resultado.idOperation, code: a.code, idDistributions: a.idDistributions }),
      });
      setCotizacion(v);
      const filas: Pasajero[] = [];
      for (let i = 0; i < adultos; i++) filas.push({ name: '', firstSurname: '', secondSurname: '', age: 35 });
      edades.slice(0, ninos).forEach(edad => filas.push({ name: '', firstSurname: '', secondSurname: '', age: edad }));
      setPasajeros(filas);
      setReferencia(nuevaRef());
    } catch (e) { setError(trata(e)); setOferta(null); } finally { setCotizando(false); }
  };

  const confirmar = async () => {
    if (!cotizacion || !oferta) return;
    setConfirmando(true); setError('');
    try {
      const r = await portalApi<any>(token, '/api/portal/confirm', {
        method: 'POST',
        body: JSON.stringify({
          idOperation: cotizacion.idOperation,
          code: oferta.code,
          idDistributions: oferta.idDistributions,
          clientLocalizer: referencia,
          quoteRef: cotizacion.quoteRef,
          ...(notas.trim() ? { remarksForProvider: notas.trim().slice(0, 500) } : {}),
          clients: pasajeros.map(p => ({
            age: p.age, name: p.name.trim(), firstSurname: p.firstSurname.trim(),
            ...(p.secondSurname.trim() ? { secondSurname: p.secondSurname.trim() } : {}),
          })),
          hotelCode: oferta.code,
          checkIn: entrada, checkOut: salida,
        }),
      });
      setFinal({ tipo: 'ok', locator: r.locator, pvp: r.pvp, currencyCode: r.currencyCode });
    } catch (e) {
      if (e instanceof PortalApiError && e.status === 504) { setFinal({ tipo: 'timeout' }); return; }
      if (e instanceof PortalApiError && e.status === 409 && e.body?.error === 'DUPLICATE_CLIENT_LOCALIZER') {
        setError('Esa referencia ya se usó: genere otra reserva.'); return;
      }
      setError(trata(e));
    } finally { setConfirmando(false); }
  };

  const completos = pasajeros.length > 0 && pasajeros.every(p => p.name.trim() && p.firstSurname.trim());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <form onSubmit={buscar} style={S.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          <div>
            <label style={S.label}>Destino</label>
            <select value={destino} onChange={e => setDestino(e.target.value)} style={S.input}>
              {!destinos.length && <option value="">—</option>}
              {destinos.map(d => (
                <option key={d.code} value={d.code}>{d.label}{d.hotels ? ` (${d.hotels})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Entrada</label>
            <input type="date" required value={entrada} min={masDias(1)}
              onChange={e => setEntrada(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Salida · {noches} noches</label>
            <input type="date" required value={salida} min={entrada}
              onChange={e => setSalida(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Adultos</label>
            <select value={adultos} onChange={e => setAdultos(Number(e.target.value))} style={S.input}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Niños</label>
            <select value={ninos} onChange={e => {
              const n = Number(e.target.value); setNinos(n);
              setEdades(prev => Array.from({ length: n }, (_, i) => prev[i] ?? 8));
            }} style={S.input}>
              {[0, 1, 2].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {edades.slice(0, ninos).map((edad, i) => (
            <div key={i}>
              <label style={S.label}>Edad niño {i + 1}</label>
              <select value={edad} style={S.input}
                onChange={e => setEdades(a => a.map((x, j) => j === i ? Number(e.target.value) : x))}>
                {Array.from({ length: 18 }, (_, a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button type="submit" disabled={buscando || !destino}
          style={{ ...S.btn, marginTop: 14, opacity: buscando || !destino ? 0.55 : 1 }}>
          {buscando ? 'Buscando…' : 'Buscar disponibilidad'}
        </button>
      </form>

      {error && <div style={S.warn}>{error}</div>}

      {resultado && (
        <div style={S.card}>
          <p style={{ margin: '0 0 4px', fontFamily: serif, fontSize: 20 }}>
            Disponibilidad <span style={{ fontSize: 13, color: soft(0.5) }}>· {resultado.accommodations.length} tarifas</span>
          </p>
          {resultado.accommodations.length === 0 && (
            <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.8, color: soft(0.55) }}>
              Sin disponibilidad para esas fechas. Pruebe otras fechas o pídanoslo por el canal
              habitual: la mesa de operaciones puede buscar fuera de catálogo.
            </p>
          )}
          {resultado.accommodations.map((a, i) => {
            const politicas = resumePoliticas(a.structuredCancelPolicies, a.cancelPoliciesPending);
            const elegido = oferta === a;
            return (
              <div key={`${a.code}-${i}`} style={{
                borderTop: `1px solid ${line(0.12)}`, padding: '14px 0',
                display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center',
                background: elegido ? 'rgba(166,128,61,0.06)' : 'transparent',
              }}>
                <div style={{ flex: '1 1 260px', minWidth: 220 }}>
                  <p style={{ margin: 0, fontSize: 15.5, fontWeight: 500 }}>
                    {a.name} <span style={{ color: C.gold }}>{'★'.repeat(Number(a.category) || 0)}</span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 6, fontSize: 12, color: soft(0.6) }}>
                    <span>{a.mealPlan ?? '—'}</span>
                    <span style={{ color: a.status === 'SALE' ? C.ok : C.gold }}>
                      {a.status === 'SALE' ? 'Confirmación inmediata' : 'Bajo petición'}
                    </span>
                    {a.nonRefundable && <span style={{ color: C.warn, fontWeight: 600 }}>NO REEMBOLSABLE</span>}
                  </div>
                  {politicas.length > 0 && (
                    <p style={{ margin: '6px 0 0', fontSize: 11.5, color: soft(0.5) }}>{politicas.join(' · ')}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: soft(0.45) }}>
                    PVP orientativo
                  </p>
                  <p style={{ margin: 0, fontFamily: serif, fontSize: 24 }}>{euros(a.pvp, a.currencyCode)}</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: soft(0.4) }}>{noches} noches</p>
                </div>
                <button style={S.btnGhost} disabled={cotizando} onClick={() => cotizar(a)}>
                  {cotizando && elegido ? 'Verificando…' : 'Reservar'}
                </button>
              </div>
            );
          })}
          <p style={{ margin: '12px 0 0', fontSize: 11.5, lineHeight: 1.8, color: soft(0.45) }}>
            El PVP es el precio de venta orientativo del proveedor. Su tarifa neta se aplica
            según su acuerdo comercial con Wanli y se refleja en la factura.
          </p>
        </div>
      )}

      {cotizacion && oferta && !final && (
        <div style={S.card}>
          <p style={{ margin: '0 0 10px', fontFamily: serif, fontSize: 20 }}>
            Confirmar — {oferta.name}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'baseline' }}>
            <div>
              <p style={{ margin: 0, ...S.label }}>Precio verificado (PVP)</p>
              <p style={{ margin: 0, fontFamily: serif, fontSize: 28 }}>
                {euros(cotizacion.pvp ?? oferta.pvp, cotizacion.currencyCode)}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: soft(0.55) }}>
              {entrada} → {salida} · {noches} noches · ref. <strong>{referencia}</strong>
            </p>
          </div>

          {(() => {
            const politicas = resumePoliticas(cotizacion.structuredCancelPolicies);
            return politicas.length > 0 && (
              <p style={{ margin: '12px 0 0', fontSize: 12.5, color: soft(0.6) }}>
                <strong>Cancelación:</strong> {politicas.join(' · ')}
              </p>
            );
          })()}

          <div style={{ marginTop: 16, borderTop: `1px solid ${line(0.12)}`, paddingTop: 14 }}>
            <p style={{ margin: '0 0 10px', ...S.label }}>Huéspedes ({pasajeros.length})</p>
            {pasajeros.map((p, i) => (
              <div key={i} className="pax-grid">
                <input placeholder="Nombre" value={p.name} style={S.input}
                  onChange={e => setPasajeros(ps => ps.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <input placeholder="Primer apellido" value={p.firstSurname} style={S.input}
                  onChange={e => setPasajeros(ps => ps.map((x, j) => j === i ? { ...x, firstSurname: e.target.value } : x))} />
                <input placeholder="Segundo apellido (opc.)" value={p.secondSurname} style={S.input}
                  onChange={e => setPasajeros(ps => ps.map((x, j) => j === i ? { ...x, secondSurname: e.target.value } : x))} />
                <input type="number" min={0} max={120} value={p.age} title="Edad" style={S.input}
                  onChange={e => setPasajeros(ps => ps.map((x, j) => j === i ? { ...x, age: Number(e.target.value) } : x))} />
                <span />
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <label style={S.label}>Peticiones al hotel (opcional)</label>
              <input value={notas} onChange={e => setNotas(e.target.value)} maxLength={500}
                placeholder="p. ej. llegada tardía, habitaciones contiguas" style={S.input} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, fontSize: 12.5, lineHeight: 1.7, color: soft(0.65), cursor: 'pointer' }}>
            <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)}
              style={{ marginTop: 3, accentColor: C.gold }} />
            <span>
              Confirmo esta reserva en firme para mi agencia, sujeta a las condiciones de
              cancelación indicadas y a mi acuerdo comercial con Wanli.
            </span>
          </label>

          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <button style={{ ...S.btn, opacity: !acepta || !completos || confirmando ? 0.5 : 1 }}
              disabled={!acepta || !completos || confirmando} onClick={confirmar}>
              {confirmando ? 'Confirmando…' : 'Confirmar reserva'}
            </button>
            <button style={S.btnGhost} onClick={limpiarSeleccion} disabled={confirmando}>Descartar</button>
          </div>
        </div>
      )}

      {final?.tipo === 'ok' && (
        <div style={S.ok}>
          <p style={{ margin: 0, fontSize: 16 }}>
            ✓ Reserva confirmada — localizador <strong style={{ fontSize: 20 }}>{final.locator}</strong>
          </p>
          <p style={{ margin: '6px 0 0' }}>
            PVP {euros(final.pvp, final.currencyCode)} · ref. {referencia} · la verá en «Mis reservas».
          </p>
        </div>
      )}
      {final?.tipo === 'timeout' && (
        <div style={S.warn}>
          El proveedor no respondió a tiempo. <strong>No repita la reserva</strong>: nuestro equipo
          comprobará si llegó a crearse y la verá reflejada en «Mis reservas». Si tiene prisa,
          contacte con su mesa de operaciones.
        </div>
      )}
    </div>
  );
};

export default PortalBooking;
