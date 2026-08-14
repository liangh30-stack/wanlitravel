/**
 * Avisos de nuevas solicitudes.
 *
 * Sin esto, una solicitud entra en la base de datos y nadie se entera hasta
 * que alguien abre el panel: el primer cliente que llegue se pierde. Por eso
 * el aviso se envía por dos vías independientes y ninguna de las dos puede
 * tumbar el guardado — si fallan, se registra el error y la solicitud sigue
 * guardada.
 *
 * Configuración (variables de entorno, todas opcionales):
 *   INQUIRY_EMAIL_TO    destinatario del aviso, p. ej. liangh30@gmail.com
 *   RESEND_API_KEY      clave de Resend (https://resend.com, plan gratuito)
 *   INQUIRY_EMAIL_FROM  remitente; por defecto el de pruebas de Resend
 *   INQUIRY_WEBHOOK_URL webhook genérico (Slack, Telegram, pasarela WhatsApp…)
 *   ADMIN_URL           enlace al panel que se incluye en el aviso
 */

export interface InquiryNotice {
  id?: string;
  type: string;
  companyName: string;
  workEmail: string;
  businessType?: string;
  region?: string;
  monthlyPax?: string;
  message?: string;
  routeCode?: string;
  language?: string;
  createdAt?: string;
}

const {
  INQUIRY_EMAIL_TO,
  INQUIRY_EMAIL_FROM = 'Wanlitravel <onboarding@resend.dev>',
  RESEND_API_KEY,
  INQUIRY_WEBHOOK_URL,
  ADMIN_URL = 'https://wanlitravel.vercel.app/es/admin',
} = process.env;

const TIPO: Record<string, string> = {
  partner: 'Solicitud de colaboración',
  quote: 'Petición de cotización',
};

function asunto(r: InquiryNotice): string {
  const tipo = TIPO[r.type] ?? r.type;
  return `[Wanlitravel] ${tipo} — ${r.companyName}`;
}

/** Cuerpo en texto plano: se lee igual en el móvil que en el escritorio. */
function cuerpoTexto(r: InquiryNotice): string {
  const lineas = [
    TIPO[r.type] ?? r.type,
    '',
    `Empresa:      ${r.companyName}`,
    `Email:        ${r.workEmail}`,
  ];
  if (r.businessType) lineas.push(`Tipo:         ${r.businessType}`);
  if (r.region) lineas.push(`Región:       ${r.region}`);
  if (r.monthlyPax) lineas.push(`PAX/mes:      ${r.monthlyPax}`);
  if (r.routeCode) lineas.push(`Ruta:         ${r.routeCode}`);
  if (r.language) lineas.push(`Idioma web:   ${r.language.toUpperCase()}`);
  if (r.createdAt) lineas.push(`Recibida:     ${r.createdAt}`);
  if (r.message) lineas.push('', 'Mensaje:', r.message);
  lineas.push('', `Responder: ${r.workEmail}`, `Panel: ${ADMIN_URL}`);
  return lineas.join('\n');
}

async function porEmail(r: InquiryNotice): Promise<void> {
  if (!INQUIRY_EMAIL_TO || !RESEND_API_KEY) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: INQUIRY_EMAIL_FROM,
      to: INQUIRY_EMAIL_TO.split(',').map(s => s.trim()).filter(Boolean),
      // Así, responder al aviso escribe directamente al cliente
      reply_to: r.workEmail,
      subject: asunto(r),
      text: cuerpoTexto(r),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

async function porWebhook(r: InquiryNotice): Promise<void> {
  if (!INQUIRY_WEBHOOK_URL) return;
  const text = `📩 ${asunto(r)}\n\n${cuerpoTexto(r)}`;
  const res = await fetch(INQUIRY_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Formato compatible con Slack, Telegram (vía pasarela), Feishu y WeCom
    body: JSON.stringify({ text, msg_type: 'text', content: { text } }),
  });
  if (!res.ok) {
    throw new Error(`Webhook ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

/**
 * Envía el aviso por todas las vías configuradas. Nunca lanza: un fallo de
 * notificación no puede hacer fracasar una solicitud ya guardada.
 */
export async function notifyInquiry(r: InquiryNotice): Promise<void> {
  const vias: [string, Promise<void>][] = [
    ['email', porEmail(r)],
    ['webhook', porWebhook(r)],
  ];
  const resultados = await Promise.allSettled(vias.map(([, p]) => p));
  resultados.forEach((resultado, i) => {
    const via = vias[i][0];
    if (resultado.status === 'rejected') {
      console.error(`[inquiries] aviso por ${via} FALLIDO:`, resultado.reason);
    }
  });
  if (!INQUIRY_EMAIL_TO && !INQUIRY_WEBHOOK_URL) {
    console.warn(
      `[inquiries] solicitud ${r.id ?? ''} de "${r.companyName}" guardada SIN AVISO: ` +
      'no hay INQUIRY_EMAIL_TO ni INQUIRY_WEBHOOK_URL configurados',
    );
  }
}
