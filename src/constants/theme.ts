import { Appearance } from 'react-native';

const sharedColors = {
  primary: '#FE802A',
  buttonPrimary: '#110376', // Primary action color

  accent: '#00D2FF',
  accentLight: '#74E8FF',

  success: '#00C9A7',
  warning: '#FFC107',
  error: '#FF6B6B',
  errorLight: '#FF8E8E',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export const LightTheme = {
  ...sharedColors,
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E9ECEF',
  textPrimary: '#1A1D1E',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  textInverse: '#FFFFFF',
} as const;

export const DarkTheme = {
  ...sharedColors,
  background: '#0A0E1A',
  surface: '#131829',
  surfaceElevated: '#1A2035',
  surfaceBorder: '#242B45',
  textPrimary: '#F0F2F8',
  textSecondary: '#8892B0',
  textMuted: '#5C6480',
  textInverse: '#0A0E1A',
} as const;

// Dynamically evaluate theme using a Proxy (fallback without hook)
export const Colors = new Proxy({} as typeof LightTheme, {
  get(_, prop) {
    const scheme = Appearance.getColorScheme();
    const currentTheme = scheme === 'dark' ? DarkTheme : LightTheme;
    return currentTheme[prop as keyof typeof LightTheme];
  }
});

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: sharedColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: sharedColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;
