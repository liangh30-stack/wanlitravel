# Formulario de certificación XML Tour10 — respuestas preparadas

Formulario: https://docs.google.com/forms/d/1TBZzqRYn6UuXJy6NeFeO8EvGBdrU4aF7Sjn58qdwhD8

Son 5 páginas y 37 campos. Abajo está todo en el mismo orden en que aparece,
listo para copiar y pegar. Lo que hay que **decidir** o **rellenar a mano** va
marcado con ⚠.

---

## Página 1 — Identificación

| Campo | Respuesta |
|---|---|
| Correo | ⚠ el correo de Andrés |
| Nombre AGENCIA | ⚠ razón social exacta — ¿ONBUS TRAVEL, LDA. o Wanlitravel? |
| Email contacto | ⚠ andresfeal@onbus.pt |
| Fecha del TEST | 12/08/2026 |

⚠ La primera decisión de verdad es el **Nombre AGENCIA**: las credenciales de
producción se emitirán a nombre de quien figure aquí, y esa es la empresa que
Tour10 facturará. Si la web es de Wanlitravel pero quien tiene contrato con
Tour10 es ONBUS, conviene aclararlo con Simo antes de enviar.

---

## Página 2 — Reservas de TEST

Las nueve reservas ya están hechas y son visibles en el sistema de Tour10.
Todas sobre Torremolinos (ES00634), entrada 10/11/2026 y salida 15/11/2026.

| Pregunta | Localizador |
|---|---|
| 1 reserva de 1 habitación de 2 adultos | **1031163** |
| 1 habitación de 2 adultos y 1 niño de 10 años | **1031164** |
| 1 habitación de 2 adultos y 1 niño de 1 año | **1031165** |
| 1 habitación de 2 adultos y 2 niños de 5 y 10 años | **1031166** |
| 1 habitación de 2 adultos y 1 niño de 15 años | **1031167** |
| 2 habitaciones: 2 adultos + 3 adultos | **1031168** |
| 2 habitaciones: 3 adultos + (2 adultos y 1 niño de 10) | **1031169** |
| 2 habitaciones: 2 adultos + (2 adultos y 2 niños de 9 y 10) | **1031170** |
| 3 habitaciones: dos de 2 adultos + (2 adultos y 2 niños de 9 y 10) | **1031171** |
| Cancelar la reserva de 2 adultos y 1 niño de 15 años | **1031167** — cancelada, estado CANCELLED |
| Cancelar la reserva de 2 habitaciones (2 adultos + 3 adultos) | **1031168** — cancelada, estado CANCELLED |

---

## Página 3 — Reservas con restricciones

**1 reserva No reembolsable (NR)**

> 1031172

**1 reserva TARIFA EMPAQUETADA (EPKT)**

> 1031219
>
> Nota: la tarifa EPKT no existe en el entorno de test. Siguiendo su
> indicación del 11/08/2026, se sustituye por una tarifa ADLT (solo adultos).
> Hotel Mlg0902 (Roc Costa Park), neto 270,00 EUR.

**1 reserva Mayores de 55 años (+55)**

> 1031220
>
> Nota: la tarifa +55 tampoco existe en el entorno de test. Siguiendo su
> indicación del 11/08/2026, se sustituye por una tarifa +60, con pasajeros
> de 66 y 63 años. Hotel Mlg0902 (Roc Costa Park), neto 260,00 EUR.

**¿Ha contemplado y mapeado el listado de restricciones `<restrictions>`?**

> ☑ Sí. Somos conscientes de su existencia y hemos realizado las acciones
> convenientes para tratar estas restricciones de forma adecuada.

Es cierto: hay un módulo dedicado (`server/src/t10/restrictions.ts`) que lee
las restricciones de cada distribución, decide si la tarifa es vendible y, si
no lo es, la descarta antes de mostrarla. En la última búsqueda de producción
se filtraron 6 tarifas de 30 por este motivo.

**¿Venderá tarifas con las siguientes restricciones?** (cuadrícula)

| Restricción | Respuesta |
|---|---|
| NO REEMBOLSABLE | SÍ |
| EMPAQUETADAS | SÍ |
| +55 AÑOS | NO. Las hemos bloqueado. |
| +60 AÑOS | NO. Las hemos bloqueado. |
| +65 AÑOS | NO. Las hemos bloqueado. |
| RESIDENTES CANARIOS | NO. Las hemos bloqueado. |
| RESIDENTES BALEARES | NO. Las hemos bloqueado. |
| DESEMPLEADOS | NO. Las hemos bloqueado. |
| COLECTIVOS | NO. Las hemos bloqueado. |
| FUNCIONARIOS | NO. Las hemos bloqueado. |
| SOLO ADULTOS | SÍ |

⚠ **Esta es la segunda decisión de negocio.** Lo de arriba es lo que hace el
código hoy y es la postura prudente: solo vendemos lo que no exige acreditar
un perfil que no podemos verificar. Si vendiéramos una tarifa de mayores de
65 a un cliente de 40, el hotel lo rechaza en recepción y el problema es
nuestro. Ya nos pasó en pruebas: la reserva 1031163 salió con una tarifa +60
y pasajeros de 30-45 años; ese incidente es lo que motivó el filtro.

Si más adelante queréis vender alguna de las bloqueadas —por ejemplo la de
residentes canarios, si el sistema pide el DNI al reservar— se cambia con una
variable de entorno (`T10_SELLABLE_RESTRICTIONS`), sin tocar código.

---

## Página 4 — Consideraciones de interés

**¿Es consciente de que precio, disponibilidad y políticas de cancelación
pueden variar entre disponibilidad y validación?**

> ☑ Sí. Lo tenemos contemplado.

**¿Qué acción realiza si eso ocurre?**

> Nunca reservamos con el precio de disponibilidad. Antes de cada confirmación
> ejecutamos siempre `value`, y es el resultado de esa validación el que se
> muestra al cliente y el que se envía a `confirm`.
>
> Si al validar cambia el precio, la disponibilidad o las políticas de
> cancelación, la operación se detiene y se presentan al cliente las
> condiciones nuevas para que las acepte de forma explícita. No se confirma
> nada sin esa aceptación.
>
> En disponibilidad el entorno devuelve `NS` (Next Step) en el 100 % de las
> distribuciones, tal como nos indicaron. Nuestro sistema lo trata como
> "condiciones aún no determinadas" y así se lo indica al cliente; las
> políticas reales se recogen de la respuesta de validación.

**¿Es consciente de que el precio puede variar entre `value` y `confirm`?**

> ☑ Sí. Lo tenemos contemplado.

**¿Qué acción realiza si eso ocurre?**

> En la llamada de confirmación enviamos el neto validado como valor esperado.
> Al recibir la respuesta comparamos el `<neto>` confirmado con ese valor y,
> si difieren, la reserva se marca internamente con el indicador
> `priceChanged` y se avisa al operador antes de emitir el bono, para decidir
> si se mantiene o se cancela dentro del plazo sin gastos.
>
> Sobre el riesgo de doble reserva: si `confirm` no responde dentro del
> tiempo de espera, no reintentamos. La reserva se guarda como
> `PENDING_UNKNOWN` y un proceso de conciliación consulta `getReservations`
> por nuestro `clientLocalizer` para averiguar si llegó a crearse. Además,
> un mismo `clientLocalizer` no puede confirmarse dos veces: el segundo
> intento se rechaza.

**¿Es consciente de que Tour10 SIEMPRE facturará por el importe del `<neto>`?**

> ☑ Sí

**¿Es consciente de que `<mandatory_pvp>` es informativo y solo puede
alterarse al alza?**

> ☑ Sí

---

## Página 5 — Configuración de claves y mapeos

**¿Necesita claves de mercado internacional?**

> ⚠ **Decisión de negocio.** Nuestra recomendación: **Sí**. El negocio consiste
> en vender producto europeo a agencias chinas, así que la venta se origina
> fuera de España. Conviene confirmarlo con Simo, porque de esto dependen las
> tarifas que veremos.

**¿Necesita claves b2b y b2c?**

> ☑ No. Solo b2b

La web no vende al consumidor final: es un portal para agencias y
turoperadores, con acceso por solicitud.

**¿Cómo nos realizará búsquedas de disponibilidad?** (varias opciones)

> ☑ Por un listado de n hoteles
> ☑ Por población

Las dos están implementadas y probadas. Aprovechamos para agradecer el aviso
sobre `countryCode`: era justo lo que faltaba en nuestras peticiones por
listado de hoteles y ya está corregido.

**Describa cómo va a proceder al mapeo de poblaciones y destinos**

> Descargamos el catálogo completo del API 3.1 Mapping (`getCountries`,
> `getProvinces`, `getZones`, `getCities`, `getAllHotels`, paginando con
> `operationCode`) y lo guardamos en nuestra propia base de datos, con la
> fecha de sincronización. El desplegable de destinos de la web se sirve
> siempre de esa copia local, nunca de una llamada en vivo, y se refresca de
> forma periódica.
>
> Trabajamos con sus códigos como identificador principal —`cityCode` tipo
> ES00634 y `hotelID` tipo Mlg0846— sin inventar una codificación propia, de
> modo que no hay que traducir nada al llamar a disponibilidad.
>
> En esta fase piloto el buscador muestra únicamente los destinos con
> inventario real; el resto del catálogo queda oculto para no ofrecer
> búsquedas vacías.

**¿Cómo gestiona los contenidos de sus fichas de hotel?**

> El contenido estático (nombre, dirección, categoría, coordenadas, teléfono)
> se obtiene de `getAllHotels` y `getHotelDetails` del API 3.1 Mapping y se
> almacena en nuestra base de datos junto con la fecha de descarga. No
> reescribimos ni editamos sus descripciones. Las fotografías y los textos
> comerciales propios de nuestras rutas se gestionan aparte y no se mezclan
> con los datos que ustedes suministran.

**Tiempo de respuesta máximo en la llamada de disponibilidad**

> ☑ por defecto según el API de Tour10

Nuestro cliente corta a los 35 segundos, que es el margen sobre los 30
segundos del lado de ustedes.

**Tiempo de respuesta máximo en la llamada de confirmación**

> ☑ por defecto según el API de tour10

Nuestro cliente corta a los 155 segundos, margen sobre los 150 de ustedes. Si
se agota, no se reintenta: se concilia por `clientLocalizer`, como se explica
en la página 4.

---

## Antes de enviar

Tres cosas que solo puede decidir la empresa:

1. **Nombre AGENCIA** — a nombre de quién se emiten las credenciales de
   producción y a quién factura Tour10.
2. **La cuadrícula de restricciones** — la propuesta de arriba es la prudente;
   si comercialmente interesa vender alguna más, hay que decirlo aquí.
3. **Claves de mercado internacional** — recomendamos Sí; conviene
   confirmarlo con Simo.

Según Simo, una vez enviado el formulario y avisado por correo, la revisión y
la entrega de credenciales de producción llevan unos pocos días. Los APIs 3.1
Mapping y Reservations pueden certificarse aparte y no bloquean el arranque.
