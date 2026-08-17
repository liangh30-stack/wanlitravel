import { useEffect, useMemo, useState } from 'react';
import { C, line, serif, soft } from '../../theme';
import {
  api, ApiError, euros, nuevaReferencia, resumePoliticas, S,
  type AdminOffer, type AdminSearchResponse, type Destination, type ValuedOffer,
} from './shared';

/* ─────────────────────────────────────────────────────────────
   MESA DE RESERVAS — buscar → cotizar (value) → confirmar

   Reglas del flujo, aprendidas en la certificación de Tour10:
   · NUNCA se confirma con el precio de disponibilidad: siempre se
     ejecuta `value` y se confirma con el idOperation que devuelve.
   · Si el neto cambia entre búsqueda y cotización, se avisa en rojo.
   · NS en políticas ≠ gratis: significa "aún sin determinar".
   · Si `confirm` agota el tiempo, el pedido queda PENDING_UNKNOWN
     y lo resuelve la conciliación — NUNCA se reintenta a mano.
───────────────────────────────────────────────────────────── */

interface Props { apiKey: string }

interface Habitacion { adults: number; children: number; ages: number[]; units: number }
interface Pasajero { name: string; firstSurname: string; secondSurname: string; age: number; dni: string }

const masDias = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const BookingDesk = ({ apiKey }: Props) => {
  /* ── búsqueda ── */
  const [destinos, setDestinos] = useState<Destination[]>([]);
  const [destino, setDestino] = useState('');
  const [entrada, setEntrada] = useState(masDias(30));
  const [salida, setSalida] = useState(masDias(33));
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([{ adults: 2, children: 0, ages: [], units: 1 }]);
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<AdminSearchResponse | null>(null);
  const [error, setError] = useState('');

  /* ── cotización ── */
  const [oferta, setOferta] = useState<AdminOffer | null>(null);
  const [cotizando, setCotizando] = useState(false);
  const [cotizacion, setCotizacion] = useState<ValuedOffer | null>(null);

  /* ── confirmación ── */
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [referencia, setReferencia] = useState('');
  const [notas, setNotas] = useState('');
  const [consciente, setConsciente] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState<
    | { tipo: 'ok'; locator: string; neto?: string; currencyCode?: string; priceChanged?: boolean }
    | { tipo: 'timeout'; orderId: string }
    | null
  >(null);

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

  const editarHab = (i: number, patch: Partial<Habitacion>) =>
    setHabitaciones(hs => hs.map((h, j) => {
      if (j !== i) return h;
      const next = { ...h, ...patch };
      next.ages = Array.from({ length: next.children }, (_, k) => next.ages[k] ?? 8);
      return next;
    }));

  const reiniciarSeleccion = () => {
    setOferta(null); setCotizacion(null); setResultadoFinal(null);
    setConsciente(false); setNotas('');
  };

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true); setError(''); setResultado(null); reiniciarSeleccion();
    try {
      const pais = destinos.find(d => d.code === destino)?.countryCode;
      const r = await api<AdminSearchResponse>(apiKey, '/api/admin/search', {
        method: 'POST',
        body: JSON.stringify({
          checkIn: entrada, checkOut: salida, destinationCode: destino,
          ...(pais ? { countryCode: pais } : {}),
          rooms: habitaciones.map(h => ({
            adults: h.adults, children: h.children, units: h.units,
            ...(h.children >= 1 ? { firstChildAge: h.ages[0] } : {}),
            ...(h.children >= 2 ? { secondChildAge: h.ages[1] } : {}),
          })),
        }),
      });
      setResultado(r);
    } catch (err) {
      setError(err instanceof ApiError ? `${err.body?.error ?? err.status}: ${err.message}` : String(err));
    } finally { setBuscando(false); }
  };

  const cotizar = async (a: AdminOffer) => {
    if (!resultado) return;
    setOferta(a); setCotizacion(null); setResultadoFinal(null); setConsciente(false);
    setCotizando(true); setError('');
    try {
      const v = await api<ValuedOffer>(apiKey, '/api/hotels/value', {
        method: 'POST',
        body: JSON.stringify({
          idOperation: resultado.idOperation, code: a.code, idDistributions: a.idDistributions,
        }),
      });
      setCotizacion(v);
      // Preparar la ficha de pasajeros según la ocupación buscada
      const filas: Pasajero[] = [];
      for (const h of habitaciones) {
        for (let u = 0; u < h.units; u++) {
          for (let i = 0; i < h.adults; i++) filas.push({ name: '', firstSurname: '', secondSurname: '', age: 35, dni: '' });
          h.ages.forEach(edad => filas.push({ name: '', firstSurname: '', secondSurname: '', age: edad, dni: '' }));
        }
      }
      setPasajeros(filas);
      setReferencia(nuevaReferencia());
    } catch (err) {
      setError(err instanceof ApiError ? `${err.body?.error ?? err.status}: ${err.message}` : String(err));
      setOferta(null);
    } finally { setCotizando(false); }
  };

  const confirmar = async () => {
    if (!cotizacion || !oferta) return;
    setConfirmando(true); setError('');
    try {
      const r = await api<any>(apiKey, '/api/hotels/confirm', {
        method: 'POST',
        body: JSON.stringify({
          idOperation: cotizacion.idOperation,       // el de VALUE, no el de búsqueda
          code: oferta.code,
          idDistributions: oferta.idDistributions,
          clientLocalizer: referencia,
          ...(notas.trim() ? { remarksForProvider: notas.trim().slice(0, 500) } : {}),
          clients: pasajeros.map(p => ({
            age: p.age, name: p.name.trim(), firstSurname: p.firstSurname.trim(),
            ...(p.secondSurname.trim() ? { secondSurname: p.secondSurname.trim() } : {}),
            ...(p.dni.trim() ? { dni: p.dni.trim() } : {}),
          })),
          expectedNeto: cotizacion.neto,
          hotelCode: oferta.code,
          checkIn: entrada, checkOut: salida,
        }),
      });
      setResultadoFinal({
        tipo: 'ok', locator: r.locator, neto: r.neto,
        currencyCode: r.currencyCode, priceChanged: r.priceChanged,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 504 && err.body?.error === 'CONFIRM_TIMEOUT') {
        setResultadoFinal({ tipo: 'timeout', orderId: err.body.orderId });
      } else if (err instanceof ApiError && err.status === 409 && err.body?.error === 'DUPLICATE_CLIENT_LOCALIZER') {
        setError(`La referencia ${referencia} ya tiene un pedido. Genera otra.`);
      } else {
        setError(err instanceof ApiError ? `${err.body?.error ?? err.status}: ${err.message}` : String(err));
      }
    } finally { setConfirmando(false); }
  };

  const netoCambio = useMemo(() => {
    if (!cotizacion || !oferta?.neto || !cotizacion.neto) return false;
    return Number(cotizacion.neto) !== Number(oferta.neto);
  }, [cotizacion, oferta]);

  const pasajerosCompletos = pasajeros.length > 0 &&
    pasajeros.every(p => p.name.trim() && p.firstSurname.trim());

  /* ── vista ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Paso 1 — búsqueda */}
      <form onSubmit={buscar} style={S.card}>
        <p style={{ margin: '0 0 14px', fontFamily: serif, fontSize: 20 }}>1 · Buscar disponibilidad</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
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
        </div>

        {habitaciones.map((h, i) => (
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end', marginTop: 14 }}>
            <span style={{ ...S.label, margin: 0, alignSelf: 'center' }}>Hab. {i + 1}</span>
            <div>
              <label style={S.label}>Adultos</label>
              <select value={h.adults} onChange={e => editarHab(i, { adults: Number(e.target.value) })} style={S.input}>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Niños</label>
              <select value={h.children} onChange={e => editarHab(i, { children: Number(e.target.value) })} style={S.input}>
                {[0, 1, 2].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {h.ages.map((edad, k) => (
              <div key={k}>
                <label style={S.label}>Edad niño {k + 1}</label>
                <select value={edad} style={S.input}
                  onChange={e => editarHab(i, { ages: h.ages.map((a, j) => j === k ? Number(e.target.value) : a) })}>
                  {Array.from({ length: 18 }, (_, a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={S.label}>Unidades</label>
              <select value={h.units} onChange={e => editarHab(i, { units: Number(e.target.value) })} style={S.input}>
                {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            {i > 0 && (
              <button type="button" style={S.btnGhost}
                onClick={() => setHabitaciones(hs => hs.filter((_, j) => j !== i))}>
                Quitar
              </button>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {habitaciones.length < 3 && (
            <button type="button" style={S.btnGhost}
              onClick={() => setHabitaciones(hs => [...hs, { adults: 2, children: 0, ages: [], units: 1 }])}>
              + Habitación
            </button>
          )}
          <button type="submit" disabled={buscando || !destino} style={{ ...S.btn, opacity: buscando || !destino ? 0.55 : 1 }}>
            {buscando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && <div style={S.warn}>{error}</div>}

      {/* Paso 2 — resultados con neto */}
      {resultado && (
        <div style={S.card}>
          <p style={{ margin: '0 0 4px', fontFamily: serif, fontSize: 20 }}>
            2 · Resultados <span style={{ fontSize: 13, color: soft(0.5) }}>
              · {resultado.accommodations.length} tarifas
              {resultado.filteredOut ? ` · ${resultado.filteredOut} descartadas por restricción` : ''}
              {resultado.demo ? ' · DATOS DE DEMOSTRACIÓN' : ''}
            </span>
          </p>
          {resultado.accommodations.length === 0 && (
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: soft(0.55) }}>
              Sin tarifas para esas fechas y ocupación.
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
                    <span style={{ marginLeft: 8, fontSize: 11, color: soft(0.45) }}>{a.code}</span>
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 6, fontSize: 12, color: soft(0.6) }}>
                    <span>{a.mealPlan ?? '—'}</span>
                    <span style={{ color: a.status === 'SALE' ? C.ok : C.gold }}>
                      {a.status === 'SALE' ? 'Confirmación inmediata' : 'Bajo petición'}
                    </span>
                    {a.nonRefundable && <span style={{ color: C.warn, fontWeight: 600 }}>NO REEMBOLSABLE</span>}
                    {a.restrictions?.filter(r => r.code !== 'NR').map(r => (
                      <span key={r.code} style={S.tag} title={r.description}>{r.code}</span>
                    ))}
                  </div>
                  {politicas.length > 0 && (
                    <p style={{ margin: '6px 0 0', fontSize: 11.5, color: soft(0.5) }}>
                      {politicas.join(' · ')}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', minWidth: 130 }}>
                  <p style={{ margin: 0, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: soft(0.45) }}>Neto</p>
                  <p style={{ margin: 0, fontFamily: serif, fontSize: 24 }}>{euros(a.neto, a.currencyCode)}</p>
                  <p style={{ margin: 0, fontSize: 11, color: soft(0.45) }}>PVP {euros(a.pvp, a.currencyCode)}</p>
                </div>
                <button style={S.btnGhost} disabled={cotizando} onClick={() => cotizar(a)}>
                  {cotizando && elegido ? 'Cotizando…' : 'Cotizar'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Paso 3 — cotización + pasajeros + confirmación */}
      {cotizacion && oferta && !resultadoFinal && (
        <div style={S.card}>
          <p style={{ margin: '0 0 10px', fontFamily: serif, fontSize: 20 }}>
            3 · Confirmar — {oferta.name}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'baseline' }}>
            <div>
              <p style={{ margin: 0, ...S.label }}>Neto validado (el que factura Tour10)</p>
              <p style={{ margin: 0, fontFamily: serif, fontSize: 30 }}>
                {euros(cotizacion.neto, cotizacion.currencyCode)}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: soft(0.55) }}>
              {entrada} → {salida} · {noches} noches · ref. <strong>{referencia}</strong>
            </p>
          </div>

          {netoCambio && (
            <div style={{ ...S.warn, marginTop: 12 }}>
              El neto ha cambiado respecto a la búsqueda ({euros(oferta.neto)} → {euros(cotizacion.neto)}).
              Confirma solo si el cliente acepta el precio nuevo.
            </div>
          )}

          {(() => {
            const politicas = resumePoliticas(cotizacion.structuredCancelPolicies);
            return politicas.length > 0 && (
              <p style={{ margin: '12px 0 0', fontSize: 12.5, color: soft(0.6) }}>
                <strong>Cancelación:</strong> {politicas.join(' · ')}
              </p>
            );
          })()}

          <div style={{ marginTop: 18, borderTop: `1px solid ${line(0.12)}`, paddingTop: 14 }}>
            <p style={{ margin: '0 0 10px', ...S.label }}>Pasajeros ({pasajeros.length})</p>
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
                <input placeholder="DNI/Pasaporte (opc.)" value={p.dni} style={S.input}
                  onChange={e => setPasajeros(ps => ps.map((x, j) => j === i ? { ...x, dni: e.target.value } : x))} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <div>
                <label style={S.label}>Referencia interna (clientLocalizer)</label>
                <input value={referencia} onChange={e => setReferencia(e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={S.label}>Notas para el hotel (opcional)</label>
                <input value={notas} onChange={e => setNotas(e.target.value)} maxLength={500}
                  placeholder="p. ej. llegada tardía, camas separadas" style={S.input} />
              </div>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, fontSize: 13, lineHeight: 1.6, color: soft(0.7), cursor: 'pointer' }}>
            <input type="checkbox" checked={consciente} onChange={e => setConsciente(e.target.checked)}
              style={{ marginTop: 3, accentColor: C.gold }} />
            <span>
              Entiendo que esto crea una <strong>reserva real</strong> por {euros(cotizacion.neto, cotizacion.currencyCode)}
              {' '}que Tour10 facturará, sujeta a las condiciones de cancelación de arriba.
            </span>
          </label>

          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <button style={{ ...S.btn, opacity: !consciente || !pasajerosCompletos || confirmando ? 0.5 : 1 }}
              disabled={!consciente || !pasajerosCompletos || confirmando} onClick={confirmar}>
              {confirmando ? 'Confirmando…' : 'Confirmar reserva'}
            </button>
            <button style={S.btnGhost} onClick={reiniciarSeleccion} disabled={confirmando}>Descartar</button>
          </div>
          {!pasajerosCompletos && pasajeros.length > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: 11.5, color: soft(0.5) }}>
              Falta nombre o primer apellido de algún pasajero.
            </p>
          )}
        </div>
      )}

      {/* Resultado final */}
      {resultadoFinal?.tipo === 'ok' && (
        <div style={S.ok}>
          <p style={{ margin: 0, fontSize: 16 }}>
            ✓ Reserva confirmada — localizador <strong style={{ fontSize: 20 }}>{resultadoFinal.locator}</strong>
          </p>
          <p style={{ margin: '6px 0 0' }}>
            Neto confirmado: {euros(resultadoFinal.neto, resultadoFinal.currencyCode)} · ref. {referencia}
          </p>
          {resultadoFinal.priceChanged && (
            <p style={{ margin: '6px 0 0', color: '#7A2222' }}>
              ⚠ El neto confirmado difiere del cotizado: revisar antes de emitir el bono
              (se puede cancelar dentro del plazo sin gastos).
            </p>
          )}
        </div>
      )}
      {resultadoFinal?.tipo === 'timeout' && (
        <div style={S.warn}>
          Tour10 no respondió a tiempo. El pedido quedó como <strong>PENDING_UNKNOWN</strong> (id {resultadoFinal.orderId}).
          <strong> No repitas la reserva</strong>: la conciliación comprobará si llegó a crearse. Revisa la pestaña Pedidos.
        </div>
      )}
    </div>
  );
};

export default BookingDesk;
