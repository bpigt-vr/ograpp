import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  darkColors,
  fonts,
  gradients,
  lightColors,
  limits,
  radius,
  spacing,
  typography,
  type ColorSchemeName,
  type ThemeColors,
} from './tokens';

export type AppTheme = {
  mode: ColorSchemeName;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fonts: typeof fonts;
  gradients: typeof gradients;
  limits: typeof limits;
};

const ThemeContext = createContext<AppTheme | null>(null);

export type ThemePreference = 'system' | ColorSchemeName;

export function buildTheme(preference: ThemePreference, systemScheme: ColorSchemeName): AppTheme {
  const mode: ColorSchemeName =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    fonts,
    gradients,
    limits,
  };
}

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: ReactNode;
}) {
  const systemScheme = useColorScheme();
  const theme = useMemo(
    () => buildTheme(preference, systemScheme === 'light' ? 'light' : 'dark'),
    [preference, systemScheme]
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return theme;
}

/**
 * Creates a memoised stylesheet that is rebuilt only when the theme changes.
 */
export function useThemedStyles<T extends Record<string, unknown>>(
  factory: (theme: AppTheme) => T
): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}

export { brand, fonts, spacing, radius, typography, gradients } from './tokens';
export type { ThemeColors, ColorSchemeName } from './tokens';
