/**
 * Datos de contacto que salen publicados en la web.
 *
 * TODO(antes de publicar): confirmar los tres con Andrés. Vienen del diseño
 * y NO están verificados: si el buzón no existe, cada solicitud que un
 * cliente mande por correo en vez de por el formulario se pierde sin rebote
 * visible para nosotros. El teléfono es un número de ejemplo.
 */
export const CONTACTO = {
  partner: 'partner@wanlitravel.com',
  general: 'hello@wanlitravel.com',
  telefono: '+34 912 345 678',
  ciudades: 'Madrid · Beijing · Shanghai',
} as const;
