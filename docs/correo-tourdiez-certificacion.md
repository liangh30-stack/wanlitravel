# Correo a Tour10 — dudas para cerrar la certificación

**Para:** el contacto técnico de Tour10 (quien envió las credenciales)
**De:** Andrés Feal — ONBUS TRAVEL
**Asunto:** Certificación APIs 2.9 / 3.1 — tres consultas para poder cerrarla

---

Buenas tardes,

Gracias por los accesos y la documentación. Ya tenemos integrados los tres APIs
(Booking 2.9, Reservations 3.1 y Mapping 3.1) contra el entorno de test y hemos
completado la batería de reservas de certificación: nueve reservas con distintas
combinaciones de habitaciones y ocupaciones, más las cancelaciones, todas
visibles en vuestro sistema con localizadores del 1031163 al 1031172. El Excel
de Reservations 3.1 lo tenemos ya cumplimentado.

Antes de dar la certificación por cerrada nos quedan tres consultas.

**1. Tarifas EPKT y +55 en el entorno de test**

El formulario de certificación del API 2.9 nos pide documentar el tratamiento de
las tarifas EPKT y +55. Siguiendo vuestra recomendación de buscar con varias
duraciones y varios meses de antelación, hemos hecho un barrido sistemático
sobre ES00634: 168 búsquedas combinando duraciones de 1 a 10 noches, seis meses
de antelación y cuatro ocupaciones distintas (1 adulto, 2 adultos, 3 adultos y
2 adultos + 1 niño). Han salido 1.694 tarifas, y los únicos códigos de
restricción devueltos han sido cuatro: OTR (980), +60 (336), NR (210) y ADLT
(168). Ni EPKT ni +55 aparecen en ninguna respuesta.

Entendemos que puede ser una limitación del entorno de test, como la que nos
comentabais con las políticas de cancelación NS. ¿Sería posible cargar esas dos
tarifas en alguno de los cuatro hoteles de prueba? Si no lo es, ¿cómo preferís
que resolvamos esos apartados del formulario: los dejamos justificados con esta
explicación, o hay alguna otra vía?

**2. Búsqueda por `accomodationsCode`**

La búsqueda por ciudad funciona correctamente, pero la búsqueda por listado de
establecimientos no nos devuelve resultados en ningún caso. Con la misma sesión,
las mismas fechas y la misma ocupación:

- `<city>ES00634</city>` → 4 alojamientos, `M1 Operación correcta`
- `<accomodationsCode>Mlg0846,Mlg1295,Mlg1141,Mlg0902</accomodationsCode>` → 0
  alojamientos, `M1 Operación correcta. No existen datos para la consulta realizada.`

Hemos probado varias formas por si fuera cuestión de formato — un solo código,
separadores distintos, mayúsculas, la etiqueta antes y después de `room1`, y
combinando ciudad y códigos a la vez — y todas devuelven cero. Los códigos son
exactamente los que devuelve vuestra propia respuesta de disponibilidad en el
tag `<code>` de cada `<accomodation>`. ¿Nos falta algún parámetro, o es también
una limitación del entorno de test?

**3. Paso a producción**

Para planificar la puesta en marcha, ¿qué requisitos hay que cumplir para
obtener las credenciales y los endpoints de producción, y qué plazo estimáis
desde que la certificación quede aprobada?

Aprovecho para pediros, si no es molestia, que nos reenviéis el Excel de
certificación del API 3.1 Mapping; se nos ha traspapelado en la cadena de
correos.

Quedamos a la espera.

Un saludo,

Andrés Feal
ONBUS TRAVEL
