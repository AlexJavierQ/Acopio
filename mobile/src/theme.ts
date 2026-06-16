// Paleta de Acopio (cálida, B2B mayorista) — coherente con el cliente web.
export const colors = {
  bg: '#fdf6ec',         // crema
  card: '#ffffff',
  cardSoft: 'rgba(255, 255, 255, 0.7)',
  border: '#f0e2cc',
  text: '#3a2a1a',       // marrón muy oscuro
  textMuted: '#7a6552',
  textSubtle: '#a89580',
  primary: '#c97b3c',    // amasa-500
  primaryDark: '#a85e26',// amasa-700
  primaryLight: '#f7e8d6',
  primarySoft: '#fbf1e3',
  success: '#15803d',
  successBg: '#dcfce7',
  warning: '#b45309',
  warningBg: '#fef3c7',
  danger: '#b91c1c',
  dangerBg: '#fee2e2',
  white: '#ffffff',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const shadow = {
  shadowColor: '#3a2a1a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

export const fonts = {
  body: 14,
  h1: 28,
  h2: 22,
  h3: 18,
  small: 12,
};
