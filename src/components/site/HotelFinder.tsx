import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context';
import { submitInquiry, type InquiryStatus } from '../../lib/inquiries';
import { C, display, kicker, line, serif, soft } from '../../theme';

/* ─────────────────────────────────────────────────────────────
   BUSCADOR DE HOTELES — disponibilidad REAL de Tour10 (API 2.9)

   Es el mismo motor que estaba en /hotels: catálogo de destinos
   del módulo Mapping, búsqueda por fechas y ocupación, tarifas
   netas, políticas de cancelación y petición de cotización que
   entra en /api/inquiries. Aquí sólo cambia la piel.

   Ojo con dos cosas que costaron caras en la certificación:
   · countryCode es obligatorio en toda búsqueda de disponibilidad.
   · Las políticas NS ("Next Step") NO son cancelación gratuita:
     significan "aún sin determinar" y se resuelven al cotizar.
───────────────────────────────────────────────────────────── */

interface RoomOffer { code: string; name?: string; units?: number; adults?: number; children?: number }
interface Accommodation {
  code: string; name?: string; category?: string; mealPlan?: string; pvp?: string; neto?: string;
  currencyCode?: string; status?: string; rooms: RoomOffer[];
  cancelPolicies?: { from?: string; amount?: string }[];
  structuredCancelPolicies?: { hoursFrom?: string; calculationType?: string; amountType?: string; amount?: string }[];
  cancelPoliciesPending?: boolean;
  nonRefundable?: boolean;
  restrictions?: { code: string; description?: string }[];
}
interface SearchResponse { demo: boolean; idOperation: string; accommodations: Accommodation[] }
interface Destination { code: string; label: string; countryCode?: string; hotels?: number }
interface DestinationsResponse { destinations?: Destination[]; limited?: boolean; catalogTotal?: number }

const masDias = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
};

interface Props {
  /** En la página /hotels no repetimos la cabecera de la sección */
  comoSeccion?: boolean;
}

const HotelFinder = ({ comoSeccion = true }: Props) => {
  const { t, language } = useLanguage();
  const u = t.ui;
  const h = t.hotels;

  const [destinos, setDestinos] = useState<Destination[]>([]);
  const [limitado, setLimitado] = useState<{ total: number } | null>(null);
  const [destino, setDestino] = useState('');
  const [entrada, setEntrada] = useState(masDias(30));
  const [salida, setSalida] = useState(masDias(34));
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [edades, setEdades] = useState<number[]>([]);

  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<SearchResponse | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState(false);

  const [cotizar, setCotizar] = useState<Accommodation | null>(null);
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [envio, setEnvio] = useState<InquiryStatus>('idle');

  useEffect(() => {
    fetch('/api/hotels/destinations')
      .then(r => r.json())
      .then((d: DestinationsResponse) => {
        const lista = d.destinations ?? [];
        setDestinos(lista);
        if (d.limited && d.catalogTotal) setLimitado({ total: d.catalogTotal });
        if (lista.length) setDestino(prev => (lista.some(x => x.code === prev) ? prev : lista[0].code));
      })
      .catch(() => setDestinos([]));
  }, []);

  const noches = Math.max(1, Math.round(
    (new Date(salida).getTime() - new Date(entrada).getTime()) / 86_400_000));

  const cambiarNinos = (n: number) => {
    setNinos(n);
    setEdades(prev => Array.from({ length: n }, (_, i) => prev[i] ?? 6));
  };

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true); setErrorBusqueda(false); setResultado(null); setCotizar(null);
    try {
      const pais = destinos.find(d => d.code === destino)?.countryCode;
      const res = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (!res.ok) throw new Error(String(res.status));
      setResultado(await res.json());
    } catch {
      setErrorBusqueda(true);
    } finally {
      setBuscando(false);
    }
  };

  const enviarCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cotizar) return;
    if (!consent) { setEnvio('needConsent'); return; }
    setEnvio('sending');
    const ok = await submitInquiry({
      type: 'quote', companyName: empresa, workEmail: email,
      routeCode: cotizar.code,
      message: `Hotel: ${cotizar.name} · ${entrada} → ${salida} · ${adultos} ad. ${ninos} ni.`,
      language, consent: true,
    });
    setEnvio(ok ? 'success' : 'error');
  };

  /* Los 13 regímenes de Tour10. Si aparece uno desconocido se muestra el
     código tal cual: etiquetar un TI (todo incluido) como "solo alojamiento"
     sería un error de cotización caro. */
  const regimen = (mp?: string) => {
    if (!mp) return h.mealUnknown;
    const m = h.mealPlans as Record<string, string>;
    return m[mp.toUpperCase()] ?? mp.toUpperCase();
  };

  /** Primer tramo con importe 0 = hasta cuándo se cancela sin gastos */
  const cancelaGratisHasta = (a: Accommodation): string | null => {
    const gratis = (a.structuredCancelPolicies ?? []).find(p =>
      p.calculationType !== 'NS' && p.amountType !== 'NS' &&
      p.amount !== undefined && Number(p.amount) === 0 && p.hoursFrom);
    if (!gratis?.hoursFrom) return null;
    const horas = Number(gratis.hoursFrom);
    if (!Number.isFinite(horas) || horas >= 9999) return null;
    return horas >= 48 ? `${Math.round(horas / 24)} ${h.daysBefore}` : `${horas} ${h.hoursBefore}`;
  };

  const campo: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'transparent',
    border: 'none', borderBottom: `1px solid ${line(0.25)}`, borderRadius: 0,
    padding: '9px 0', fontSize: 14, fontFamily: 'inherit', fontWeight: 300,
    color: C.ink, outline: 'none', transition: 'border-color .3s',
  };
  const etiqueta: React.CSSProperties = {
    display: 'block', marginBottom: 8, fontSize: 10,
    textTransform: 'uppercase', letterSpacing: '0.28em', color: soft(0.5),
  };
  const celdaCab: React.CSSProperties = {
    fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.26em', color: soft(0.42),
  };

  const porPais = destinos.reduce<Record<string, Destination[]>>((acc, d) => {
    (acc[d.countryCode ?? ''] ??= []).push(d);
    return acc;
  }, {});

  return (
    <section id="hoteles" className="pad" style={{ background: C.bg, paddingBottom: 120, scrollMarginTop: 90 }}>
      <div className="wrap">
        {comoSeccion && (
          <div className="split-even" style={{ alignItems: 'end', marginBottom: 40 }}>
            <div>
              <p style={kicker()}>{u.htKicker}</p>
              <h2 style={{ ...display('clamp(32px,4.2vw,58px)'), marginTop: 18 }}>{u.htTitle}</h2>
            </div>
            <p style={{ margin: 0, maxWidth: 480, justifySelf: 'end', fontSize: 14, lineHeight: 2, color: soft() }}>
              {u.htDesc}
            </p>
          </div>
        )}

        {limitado && (
          <p style={{
            margin: '0 0 26px', padding: '13px 18px', fontSize: 12.5, lineHeight: 1.7,
            color: '#6B4F19', background: 'rgba(166,128,61,0.08)', border: `1px solid rgba(166,128,61,0.28)`,
          }}>
            {h.limitedDestinations.replace('{total}', String(limitado.total))}
          </p>
        )}

        {/* ── Formulario de búsqueda ── */}
        <form onSubmit={buscar} style={{ borderTop: `1px solid ${line(0.16)}`, paddingTop: 30 }}>
          <div className="hotel-filters">
            <div>
              <label style={etiqueta} htmlFor="hf-destino">
                {h.destination}{destinos.length > 1 ? ` · ${destinos.length}` : ''}
              </label>
              <select id="hf-destino" value={destino} onChange={e => setDestino(e.target.value)}
                className="field-light" style={campo}>
                {!destinos.length && <option value="">—</option>}
                {Object.entries(porPais).map(([cc, lista]) =>
                  cc ? (
                    <optgroup key={cc} label={(h.countries as Record<string, string>)?.[cc] ?? cc}>
                      {lista.map(d => (
                        <option key={d.code} value={d.code}>{d.label}{d.hotels ? ` (${d.hotels})` : ''}</option>
                      ))}
                    </optgroup>
                  ) : lista.map(d => <option key={d.code} value={d.code}>{d.label}</option>),
                )}
              </select>
            </div>

            <div>
              <label style={etiqueta} htmlFor="hf-in">{h.checkIn}</label>
              <input id="hf-in" type="date" required value={entrada} min={masDias(1)}
                onChange={e => setEntrada(e.target.value)} className="field-light" style={campo} />
            </div>

            <div>
              <label style={etiqueta} htmlFor="hf-out">{h.checkOut}</label>
              <input id="hf-out" type="date" required value={salida} min={entrada}
                onChange={e => setSalida(e.target.value)} className="field-light" style={campo} />
            </div>

            <button type="submit" disabled={buscando || !destinos.length} className="btn-solid" style={{
              background: C.ink, color: C.bg, border: 'none', cursor: 'pointer',
              padding: '15px 30px', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.3em', opacity: buscando || !destinos.length ? 0.55 : 1,
              transition: 'background .3s', whiteSpace: 'nowrap',
            }}>
              {buscando ? h.searching : h.search}
            </button>
          </div>

          <div className="hotel-pax" style={{ marginTop: 24, maxWidth: 620 }}>
            <div>
              <label style={etiqueta} htmlFor="hf-ad">{h.adults}</label>
              <select id="hf-ad" value={adultos} onChange={e => setAdultos(Number(e.target.value))}
                className="field-light" style={campo}>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={etiqueta} htmlFor="hf-ni">{h.children}</label>
              <select id="hf-ni" value={ninos} onChange={e => cambiarNinos(Number(e.target.value))}
                className="field-light" style={campo}>
                {[0, 1, 2].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {ninos > 0 && (
                <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                  {Array.from({ length: ninos }, (_, i) => (
                    <select key={i} value={edades[i] ?? 6} aria-label={`${h.childAge} ${i + 1}`}
                      onChange={e => setEdades(a => { const n = [...a]; n[i] = Number(e.target.value); return n; })}
                      className="field-light" style={campo}>
                      {Array.from({ length: 18 }, (_, edad) => (
                        <option key={edad} value={edad}>{edad} {h.yearsShort}</option>
                      ))}
                    </select>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* ── Resultados ── */}
        {resultado?.demo && (
          <p style={{ margin: '30px 0 0', fontSize: 12.5, color: '#6B4F19' }}>{h.demoBanner}</p>
        )}
        {errorBusqueda && (
          <p style={{ margin: '30px 0 0', fontSize: 13, color: C.warn }}>{t.form.error}</p>
        )}

        {resultado && (
          resultado.accommodations.length === 0 ? (
            <p style={{ margin: '40px 0 0', fontSize: 14.5, lineHeight: 1.9, color: soft(0.5), maxWidth: 560 }}>
              {u.htEmpty}
            </p>
          ) : (
            <div style={{ marginTop: 44 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                borderBottom: `1px solid ${line(0.2)}`, paddingBottom: 12, gap: 16, flexWrap: 'wrap',
              }}>
                <span style={celdaCab}>
                  {destinos.find(d => d.code === destino)?.label ?? h.destination} · {noches} {h.nightsLabel}
                </span>
                <span style={celdaCab}>{resultado.accommodations.length} {h.resultsCount}</span>
              </div>

              {resultado.accommodations.map(a => {
                const abierto = cotizar?.code === a.code;
                return (
                  <div key={a.code} style={{ borderBottom: `1px solid ${line(0.12)}`, padding: '26px 0' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                      <div style={{ flex: '1 1 300px', minWidth: 240 }}>
                        <h3 style={{ margin: 0, fontFamily: serif, fontSize: 24, fontWeight: 400, color: C.ink }}>
                          {a.name}
                          <span style={{ marginLeft: 10, fontSize: 13, color: C.gold, letterSpacing: '0.1em' }}>
                            {'★'.repeat(Number(a.category) || 4)}
                          </span>
                        </h3>
                        <div style={{
                          display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginTop: 10,
                          fontSize: 12, color: soft(0.55),
                        }}>
                          <span>{regimen(a.mealPlan)}</span>
                          <span style={{ color: a.status === 'SALE' ? C.ok : C.gold }}>
                            {a.status === 'SALE' ? h.instantConfirm : h.onRequest}
                          </span>
                          {a.nonRefundable ? (
                            <span style={{ color: C.warn }}>{h.nonRefundable}</span>
                          ) : a.cancelPolicies?.[0]?.from ? (
                            <span>{h.freeCancelBefore} {a.cancelPolicies[0].from}</span>
                          ) : cancelaGratisHasta(a) ? (
                            <span>{h.freeCancelUntil} {cancelaGratisHasta(a)}</span>
                          ) : a.cancelPoliciesPending ? (
                            <span>{h.cancelAtQuote}</span>
                          ) : null}
                          {a.restrictions?.filter(r => r.code !== 'NR').map(r => (
                            <span key={r.code} title={r.description} style={{ letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 9.5 }}>
                              {(h.restrictionLabels as Record<string, string>)?.[r.code] ?? r.code}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ minWidth: 120, textAlign: 'right' }}>
                        <p style={{ margin: 0, ...celdaCab }}>{h.netTotal}</p>
                        <p style={{ margin: '4px 0 0', fontFamily: serif, fontSize: 30, fontWeight: 400, color: C.ink, lineHeight: 1.1 }}>
                          €{a.pvp ?? a.neto}
                        </p>
                        <p style={{ margin: 0, fontSize: 10.5, color: soft(0.4) }}>{noches} {h.nightsLabel} · {a.code}</p>
                      </div>

                      <button onClick={() => { setCotizar(abierto ? null : a); setEnvio('idle'); }}
                        aria-expanded={abierto} className="btn-solid" style={{
                          border: `1px solid ${abierto ? C.ink : line(0.35)}`,
                          background: abierto ? C.ink : 'transparent', color: abierto ? C.bg : C.ink,
                          cursor: 'pointer', padding: '13px 22px', fontSize: 9.5,
                          textTransform: 'uppercase', letterSpacing: '0.28em', whiteSpace: 'nowrap',
                        }}>
                        {u.htCta}
                      </button>
                    </div>

                    {abierto && (
                      <div style={{ marginTop: 22, paddingTop: 22, borderTop: `1px solid ${line(0.1)}` }}>
                        {envio === 'success' ? (
                          <div>
                            <p style={{ margin: 0, fontFamily: serif, fontSize: 22, color: C.ink }}>{t.form.successTitle}</p>
                            <p style={{ margin: '6px 0 0', fontSize: 13, color: soft(0.55) }}>{t.form.successDesc}</p>
                          </div>
                        ) : (
                          <form onSubmit={enviarCotizacion} style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
                            <p style={{ width: '100%', margin: 0, ...celdaCab }}>{h.quoteHeading} — {a.name}</p>
                            <div style={{ flex: '1 1 200px' }}>
                              <label style={etiqueta}>{t.community.companyName}</label>
                              <input type="text" required value={empresa} onChange={e => setEmpresa(e.target.value)}
                                className="field-light" style={campo} />
                            </div>
                            <div style={{ flex: '1 1 200px' }}>
                              <label style={etiqueta}>{t.community.workEmail}</label>
                              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="field-light" style={campo} />
                            </div>
                            <button type="submit" disabled={envio === 'sending'} className="btn-solid" style={{
                              background: C.ink, color: C.bg, border: 'none', cursor: 'pointer',
                              padding: '13px 24px', fontSize: 9.5, textTransform: 'uppercase',
                              letterSpacing: '0.28em', opacity: envio === 'sending' ? 0.6 : 1,
                            }}>
                              {envio === 'sending' ? t.form.sending : h.requestQuote}
                            </button>
                            <label style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: soft(0.55), cursor: 'pointer' }}>
                              <input type="checkbox" checked={consent}
                                onChange={e => { setConsent(e.target.checked); if (envio === 'needConsent') setEnvio('idle'); }}
                                style={{ accentColor: C.gold }} />
                              <span>
                                {t.form.consentPrefix}{' '}
                                <Link to={`/${language}/privacy`} target="_blank" style={{ color: C.gold, borderBottom: `1px solid ${C.gold}` }}>
                                  {t.form.privacyPolicy}
                                </Link>
                              </span>
                            </label>
                            {envio === 'needConsent' && <p style={{ width: '100%', margin: 0, fontSize: 11.5, color: C.warn }}>{t.form.consentRequired}</p>}
                            {envio === 'error' && <p style={{ width: '100%', margin: 0, fontSize: 11.5, color: C.warn }}>{t.form.error}</p>}
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        <p style={{ margin: '30px 0 0', fontSize: 12, lineHeight: 1.9, color: soft(0.45), maxWidth: 620 }}>
          {u.htNote}
        </p>
      </div>
    </section>
  );
};

export default HotelFinder;
