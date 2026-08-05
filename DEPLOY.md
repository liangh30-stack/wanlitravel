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
2. En `vercel.json`, sustituir `wanlitravel-production.up.railway.app` por la URL real
   de Railway del paso 1.
3. Desplegar. Probar en la URL temporal `*.vercel.app` **antes** de tocar el dominio.

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

## 4. Tareas programadas (cron)

- **Conciliación diaria** con T10 (detecta reservas huérfanas y resuelve
  confirmaciones con estado desconocido): `npm run reconcile`
- **Sincronización semanal** del catálogo: `npm run sync:mapping`

En Railway: *Settings → Cron Schedule* sobre un servicio duplicado, o un
scheduler externo.

---

## Antes de publicar — pendientes NO técnicos

- [ ] **Verificar o eliminar** las cifras y acreditaciones de la web (120+ agencias,
      8.400+ grupos, IATA/UNWTO, testimonios). Hoy son texto de relleno; declarar
      acreditaciones falsas tiene riesgo legal en España. Ver TODOs en `src/translations.ts`.
- [ ] Rellenar los datos reales de la empresa en la política de privacidad
      (razón social, CIF, domicilio) y añadir Aviso Legal.
- [ ] Certificación de TourDiez (formulario Booking 2.9 + Excel de Mapping y
      Reservations) y sustituir las URLs de test por las de producción.
- [ ] Confirmar que las URLs de producción de T10 son **HTTPS** (las de test son HTTP).
