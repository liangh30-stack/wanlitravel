/**
 * Tokens del diseño 2026.
 *
 * Todo el sitio se pinta con estos valores: si mañana cambia la paleta, se
 * cambia aquí y no en cuarenta ficheros.
 */

export const C = {
  /** Fondo principal, marfil cálido */
  bg: '#F4F0E9',
  /** Tinta: negro cálido, nunca #000 */
  ink: '#10151B',
  /** Secciones oscuras */
  dark: '#10151B',
  /** Hero y pie, un punto más profundo */
  darker: '#0C1116',
  /** Oro sobre fondo claro */
  gold: '#A6803D',
  /** Oro sobre fondo oscuro (más luminoso para mantener contraste) */
  goldLight: '#C9A25E',
  /** Marcadores de posición de imagen */
  placeholder: '#E6E0D5',
  /** Verde de confirmación */
  ok: '#3F6B4A',
  /** Rojo de aviso */
  warn: '#9B2C2C',
} as const;

/** Líneas divisorias sobre fondo claro / oscuro */
export const line = (a = 0.12) => `rgba(16,21,27,${a})`;
export const lineOn = (a = 0.18) => `rgba(244,240,233,${a})`;
/** Texto secundario sobre fondo claro / oscuro */
export const soft = (a = 0.62) => `rgba(16,21,27,${a})`;
export const softOn = (a = 0.62) => `rgba(244,240,233,${a})`;

/*
 * Las familias CJK van dentro del stack en vez de cargarse como webfont:
 * Noto Sans/Serif SC ocupan 10 MB en subconjuntos y Google Fonts está
 * bloqueado en China continental, justo el mercado que tiene que ver bien
 * esta web. Con las fuentes del sistema el chino se ve nítido y sin esperas.
 */
export const serif =
  "'Cormorant Garamond', 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'SimSun', Georgia, serif";
export const sans =
  "'Jost', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif";

/** Kicker: el texto pequeño en versales que abre cada sección */
export const kicker = (color: string = C.gold, tracking = '0.44em'): React.CSSProperties => ({
  margin: 0,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: tracking,
  color,
});

/** Titular de sección */
export const display = (size = 'clamp(34px,4vw,56px)', weight = 300): React.CSSProperties => ({
  margin: 0,
  fontFamily: serif,
  fontSize: size,
  fontWeight: weight,
  lineHeight: 1.12,
  letterSpacing: '0.005em',
});

/** Botón sólido (fondo claro sobre oscuro o al revés) */
export const solidBtn = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  background: bg,
  color: fg,
  border: 'none',
  cursor: 'pointer',
  padding: '16px 34px',
  fontFamily: 'inherit',
  fontSize: 11,
  fontWeight: 400,
  textTransform: 'uppercase',
  letterSpacing: '0.3em',
  transition: 'background .3s, color .3s, border-color .3s',
});

/** Campo de formulario con subrayado, sobre fondo oscuro */
export const underlineField: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${lineOn(0.25)}`,
  padding: '10px 0',
  fontSize: 15,
  fontFamily: 'inherit',
  fontWeight: 300,
  color: C.bg,
  outline: 'none',
  transition: 'border-color .3s',
};

export const fieldLabel: React.CSSProperties = {
  display: 'block',
  marginBottom: 10,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.3em',
  color: softOn(0.5),
};
