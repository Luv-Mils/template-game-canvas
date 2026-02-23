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

export interface VibeConfig {
  layout: string;
  theme: string;
  typography: string;
}
