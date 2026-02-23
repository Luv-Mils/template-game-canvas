/**
 * ThemeEngine — Foundation Type Definitions
 *
 * Shared across ALL templates. Game templates extend ThemeColors
 * with domain-specific tokens (floodColors, grid highlights, etc.)
 */

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  foreground: string;
  muted: string;
  border: string;
  accent: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  isDark: boolean;
}

export interface TypographyConfig {
  heading: string;
  body: string;
}

export interface ThemeContextValue {
  theme: ThemeConfig;
  typography: TypographyConfig;
  isDark: boolean;
}

export interface VibeConfig {
  layout: string;
  theme: string;
  typography: string;
  [key: string]: string; // game axes: mode, gridStyle, density, etc.
}
