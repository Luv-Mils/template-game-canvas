export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  border: string;
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
  chassis: string;
  layout: string;
  theme: string;
  typography: string;
  content?: Record<string, unknown>;
}
