# Despliegue de wanlitravel.com

Arquitectura: **frontend estático en Vercel** + **backend Node en Railway** +
**dominio en Arsys** (solo hay que tocar DNS; el dominio puede seguir donde está).

```
navegador ──► Vercel (React/Vite, wanlitravel.com)
                 └── /api/* ──proxy──► Railway (Express + SQLite + TourDiez)
                                          └──► testapi.tourdiez.com
```

El proxy de Vercel hace que el frontend llame a `/api/...` en su propio dominio:
no hay CORS y la URL del backend no queda expuesta.

---

## 1. Backend en Railway

1. Crear proyecto → *Deploy from GitHub repo* → `liangh30-stack/wanlitravel`.
2. **Volumen persistente** (imprescindible: la base SQLite vive ahí; sin volumen
   se pierden pedidos e inquiries en cada despliegue):
   *Settings → Volumes → New Volume*, mount path `/data`.
3. Variables de entorno:

   | Variable | Valor |
   |---|---|
   | `T10_BOOKING_URL` | `http://testapi.tourdiez.com/2.9/booking/ApiServlet.Srv` |
   | `T10_MAPPING_URL` | `http://testapi.tourdiez.com/3.1/mapping/ApiServlet.Srv` |
   | `T10_RESERVATIONS_URL` | `http://testapi.tourdiez.com/3.1/reservations/ApiServlet.Srv` |
   | `T10_USER` | (credencial de TourDiez) |
   | `T10_PASSWORD` | (credencial de TourDiez) |
   | `T10_LOG_DIR` | `/data/logs/t10` |
   | `DATA_DIR` | `/data` |
   | `API_SHARED_KEY` | `openssl rand -hex 32` |
   | `TRUST_PROXY` | `2` (Vercel + Railway) |
   | `INQUIRY_WEBHOOK_URL` | (opcional: Slack/Feishu para avisar de nuevas inquiries) |

4. Comprobar: `https://<proyecto>.up.railway.app/api/health` → `{"ok":true,"configured":true}`.
5. Primera sincronización del catálogo de destinos:
   `npm run sync:mapping` (desde la consola de Railway o en local con `--env-file=.env.local`).

## 2. Frontend en Vercel

1. *Add New Project* → importar el mismo repo. Framework: **Vite** (autodetectado).
2. El `rewrite` de `/api/*` en `vercel.json` ya apunta al backend real
   (`wanlitravel-production.up.railway.app`). Si cambia la URL de Railway,
   hay que actualizar esa linea: es lo unico que conecta front y back.
3. Desplegar. Probar en la URL temporal `*.vercel.app` **antes** de tocar el dominio.

### Por qué el arranque no pasa por `npm run`

`railway.json` arranca `./node_modules/.bin/tsx` directamente y no
`npm run server:start`. Con npm de por medio, el SIGTERM que Railway envía en
cada redespliegue se queda en el proceso de npm y no llega a Node: el servidor
muere de golpe con código 143, Railway lo cuenta como caída y manda un correo
de *Deploy Crashed* en cada despliegue. Lanzando tsx directamente, el proceso
recibe la señal, cierra ordenadamente y sale con 0.

## 2.b Avisos de nuevas solicitudes

Sin esto una solicitud se guarda y nadie se entera hasta que alguien abre el
panel `/es/admin`. Configurar al menos un canal en Railway:

| Variable | Para qué |
|---|---|
| `INQUIRY_EMAIL_TO` | Destinatario del aviso (varios separados por coma) |
| `RESEND_API_KEY` | Clave de https://resend.com (plan gratuito: 3.000 correos/mes) |
| `INQUIRY_EMAIL_FROM` | Remitente. Sin dominio propio verificado, dejar el valor por defecto |
| `INQUIRY_WEBHOOK_URL` | Alternativa o complemento: Slack, Telegram, pasarela de WhatsApp |

Con el remitente de pruebas de Resend (`onboarding@resend.dev`) solo se puede
escribir a la dirección de la cuenta de Resend. Para enviar a cualquier
destinatario hay que verificar wanlitravel.com en Resend y poner algo como
`Wanlitravel <avisos@wanlitravel.com>`.

Si no hay ningún canal configurado, el servidor avisa al arrancar y en cada
solicitud recibida.

## 3. Dominio (Arsys — lo gestiona Andrés)

Solo hacen falta dos registros DNS. Vercel indica los valores exactos en
*Project → Settings → Domains*; normalmente:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

⚠ **No tocar los registros MX** ni los TXT de correo: el buzón
`@wanlitravel.com` está en Arsys y se cortaría el correo.

El certificado HTTPS lo emite Vercel automáticamente (unos minutos tras propagar DNS).

## 3.b Tipografías y fotos

Las fuentes (Cormorant Garamond y Jost) se sirven desde `/public/fonts`, no desde
Google Fonts: en China continental Google está bloqueado y allí está media
clientela. Para el chino se usa la fuente del sistema (`Noto Serif SC`,
`Songti SC`…) en vez de cargar 10 MB de subconjuntos CJK.

Las fotos de rutas están en `/public/photos`, descargadas de Wikimedia Commons
con su licencia anotada en `CREDITOS-FOTOS.md`. Si se cambia alguna, hay que
actualizar ese fichero: es la prueba de que tenemos derecho a usarlas.

## 4. Tareas programadas (cron)

- **Conciliación diaria** con T10 (detecta reservas huérfanas y resuelve
  confirmaciones con estado desconocido): `npm run reconcile`
- **Copia de seguridad diaria** de la base de datos (`/data/wanli.db` es el
  libro de pedidos; el volumen protege de redespliegues, no de borrados):
  `npm run backup` — escribe en `/data/backups/` y rota a 14 días.
- **Sincronización semanal** del catálogo: `npm run sync:mapping`

En Railway: *Settings → Cron Schedule* sobre un servicio duplicado, o un
scheduler externo.

---

## Antes de publicar — pendientes NO técnicos

- [ ] **Datos de contacto** (`src/contact.ts`): `partner@wanlitravel.com`,
      `hello@wanlitravel.com` y `+34 912 345 678` vienen del diseño y **no están
      verificados**. Si un buzón no existe, cada cliente que escriba por correo en
      vez de por el formulario se pierde sin que nos enteremos.
- [ ] **Las cuatro garantías** de la sección «Una casa acreditada» (agencia
      licenciada, seguro de RC, DMC certificado, facturación B2B) tienen que
      corresponder a documentos reales. Es el mismo motivo por el que se retiró
      IATA/UNWTO. Ver `src/components/site/Credentials.tsx`.
- [x] Datos reales de la empresa en privacidad y aviso legal: Wanli opera como
      marca de **ONBUS TRAVEL, LDA** (NIF PT518615120, Praça da República 1,
      4980-619 Ponte da Barca) mientras no exista la sociedad propia — decisión
      de Andrés (nota del 17/08). **Pendiente: el número RNAVT** — pedírselo a
      Andrés y sustituir "en trámite de publicación" en `src/translations.ts`.
- [ ] Decidir si son **tres oficinas o cuatro**: el diseño dice Madrid, Pekín y
      Shanghái; el texto que aprobó Andrés en agosto decía «Madrid, Lisboa, Pekín
      y Shanghái». Hoy la web dice tres.
- [ ] Certificación de TourDiez (formulario Booking 2.9 + Excel de Mapping y
      Reservations) y sustituir las URLs de test por las de producción.
- [ ] Confirmar que las URLs de producción de T10 son **HTTPS** (las de test son HTTP).
