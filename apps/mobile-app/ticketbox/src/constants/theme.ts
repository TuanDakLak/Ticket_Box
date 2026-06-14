export const colors = {
  background: '#07111f',
  backgroundMuted: '#0d1a2b',
  surface: '#10233d',
  surfaceElevated: '#173251',
  surfaceSoft: '#1c3d61',
  border: '#25486d',
  text: '#f3f7fb',
  textMuted: '#9db2c9',
  textSoft: '#7f97b1',
  primary: '#4db3ff',
  primaryPressed: '#2d93df',
  success: '#3dd9a6',
  warning: '#f5b74a',
  danger: '#ff6e7d',
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const Colors = {
  light: {
    text: colors.text,
    background: '#ffffff',
    tint: colors.primary,
    icon: colors.textSoft,
    tabIconDefault: colors.textSoft,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    icon: colors.textSoft,
    tabIconDefault: colors.textSoft,
    tabIconSelected: colors.primary,
  },
};

export const Fonts = {
  regular: 'System',
};
