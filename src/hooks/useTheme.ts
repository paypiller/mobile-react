import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { LightTheme, DarkTheme } from '../constants/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: (isDark ? DarkTheme : LightTheme) as typeof LightTheme,
    isDark,
  };
}

export function useThemeStyles<T>(createStyles: (colors: typeof LightTheme) => T): T {
  const { colors } = useTheme();
  return useMemo(() => createStyles(colors), [colors]);
}
