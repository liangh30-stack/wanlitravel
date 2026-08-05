import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Check, Trash2, Mail, Building2, Globe, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context';

/* ─────────────────────────────────────────────────────────────
   PANEL DE SOLICITUDES — /:lang/admin

   Sin esta pantalla, las solicitudes de partners caen en la base de
   datos y nadie las ve: el sitio captaría clientes y se perderían.

   La clave de API NO se guarda en el navegador (ni localStorage ni
   cookies): vive solo en memoria mientras la pestaña está abierta.
   Al recargar hay que volver a introducirla — es una molestia
   deliberada a cambio de no dejar la credencial escrita en el disco
   de un portátil que se puede perder.
───────────────────────────────────────────────────────────── */

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
  consentAt: string;
  createdAt: string;
  handled: boolean;
}

const AdminInquiries = () => {
  const { t, language } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHandled, setShowHandled] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const load = useCallback(async (key: string) => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/inquiries', { headers: { 'X-Api-Key': key } });
      if (res.status === 401 || res.status === 403) throw new Error('AUTH');
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setAuthed(true);
    } catch (e) {
      setError((e as Error).message === 'AUTH' ? t.admin.badKey : t.admin.loadError);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, [t.admin.badKey, t.admin.loadError]);

  const markHandled = async (id: string) => {
    await fetch(`/api/inquiries/${id}/handled`, { method: 'POST', headers: { 'X-Api-Key': apiKey } });
    load(apiKey);
  };

  const remove = async (id: string) => {
    await fetch(`/api/inquiries/${id}`, { method: 'DELETE', headers: { 'X-Api-Key': apiKey } });
    load(apiKey);
  };

  const card: React.CSSProperties = {
    background: 'white', border: '1px solid rgba(14,17,23,0.09)', borderRadius: 16, padding: 20,
  };
  const input: React.CSSProperties = {
    background: 'white', border: '1px solid rgba(14,17,23,0.12)', borderRadius: 12,
    padding: '12px 14px', fontSize: 14, color: '#0E1117', width: '100%', outline: 'none',
  };
  const label: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
    color: 'rgba(14,17,23,0.4)', display: 'block', marginBottom: 6,
  };

  const visibles = showHandled ? items : items.filter(i => !i.handled);
  const pendientes = items.filter(i => !i.handled).length;

  return (
    <div className="bg-bg min-h-screen">
      <div className="fixed top-0 inset-x-0 z-[999] flex items-center justify-between px-8 lg:px-16"
        style={{ height: 64, background: 'rgba(248,246,242,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(14,17,23,0.07)' }}>
        <Link to={`/${language}`} className="flex items-center gap-2 group"
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(14,17,23,0.5)' }}>
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {t.routeDetails.backToHome}
        </Link>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(14,17,23,0.35)' }}>
          {t.admin.title}
        </p>
        <div style={{ width: 80 }} />
      </div>

      <div className="container" style={{ maxWidth: 900, paddingTop: 120, paddingBottom: 80 }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(34px,5vw,52px)', color: '#0E1117', lineHeight: 1, marginBottom: 28 }}>
          {t.admin.heading}
        </h1>

        {!authed ? (
          <form style={{ ...card, maxWidth: 460 }}
            onSubmit={e => { e.preventDefault(); load(apiKey); }}>
            <label style={label}>{t.admin.apiKey}</label>
            <input type="password" value={apiKey} autoComplete="off"
              onChange={e => setApiKey(e.target.value)} style={input} placeholder="••••••••" />
            <p style={{ fontSize: 11, color: 'rgba(14,17,23,0.45)', marginTop: 8, lineHeight: 1.5 }}>
              {t.admin.keyHint}
            </p>
            {error && <p style={{ fontSize: 12, color: '#B31C2E', marginTop: 10 }}>{error}</p>}
            <button type="submit" disabled={!apiKey || loading} className="btn btn-primary mt-4"
              style={{ fontSize: 10, padding: '12px 20px', opacity: !apiKey || loading ? 0.6 : 1 }}>
              {loading ? t.admin.loading : t.admin.enter}
            </button>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <p style={{ fontSize: 14, color: 'rgba(14,17,23,0.6)' }}>
                <strong style={{ color: '#B31C2E', fontSize: 20 }}>{pendientes}</strong> {t.admin.pending}
                <span style={{ opacity: 0.5 }}> · {items.length} {t.admin.total}</span>
              </p>
              <button onClick={() => load(apiKey)} className="btn btn-ghost" style={{ fontSize: 9, padding: '9px 14px' }}>
                <RefreshCw size={12} /> {t.admin.refresh}
              </button>
              <label className="flex items-center gap-2" style={{ fontSize: 12, color: 'rgba(14,17,23,0.55)', cursor: 'pointer' }}>
                <input type="checkbox" checked={showHandled} onChange={e => setShowHandled(e.target.checked)} />
                {t.admin.showHandled}
              </label>
            </div>

            {visibles.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: 'rgba(14,17,23,0.45)' }}>{t.admin.empty}</div>
            ) : (
              <div className="space-y-3">
                {visibles.map(i => (
                  <div key={i.id} style={{ ...card, opacity: i.handled ? 0.6 : 1 }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="tag tag-light" style={{ fontSize: 8 }}>
                            {i.type === 'partner' ? t.admin.typePartner : t.admin.typeQuote}
                          </span>
                          {i.routeCode && <span className="tag tag-light" style={{ fontSize: 8 }}>{i.routeCode}</span>}
                          {i.handled && <span className="tag tag-light" style={{ fontSize: 8, color: '#1B8A4C' }}>✓ {t.admin.handled}</span>}
                          <span style={{ fontSize: 11, color: 'rgba(14,17,23,0.4)' }}>
                            {new Date(i.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="flex items-center gap-2" style={{ fontSize: 16, fontWeight: 700, color: '#0E1117', marginBottom: 6 }}>
                          <Building2 size={13} style={{ color: '#B31C2E' }} /> {i.companyName}
                        </h3>
                        <div className="flex flex-wrap gap-4" style={{ fontSize: 12, color: 'rgba(14,17,23,0.6)' }}>
                          <a href={`mailto:${i.workEmail}`} className="flex items-center gap-1.5" style={{ color: '#B31C2E' }}>
                            <Mail size={11} /> {i.workEmail}
                          </a>
                          {i.region && <span className="flex items-center gap-1.5"><Globe size={11} />{i.region}</span>}
                          {i.businessType && <span>{i.businessType}</span>}
                          {i.monthlyPax && <span>{i.monthlyPax} PAX/mes</span>}
                          {i.language && <span style={{ opacity: 0.6 }}>{i.language.toUpperCase()}</span>}
                        </div>
                        {i.message && (
                          <p className="flex items-start gap-2" style={{ fontSize: 13, color: 'rgba(14,17,23,0.7)', marginTop: 10, lineHeight: 1.55 }}>
                            <MessageSquare size={12} style={{ marginTop: 3, flexShrink: 0, opacity: 0.5 }} />
                            {i.message}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!i.handled && (
                          <button onClick={() => markHandled(i.id)} className="btn btn-ghost"
                            style={{ fontSize: 9, padding: '8px 12px' }} title={t.admin.markHandled}>
                            <Check size={12} />
                          </button>
                        )}
                        <button onClick={() => remove(i.id)} className="btn btn-ghost"
                          style={{ fontSize: 9, padding: '8px 12px', color: '#B31C2E' }} title={t.admin.deleteGdpr}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;
