export interface VibeConfig {
  chassis: string;
  theme: string;
}

export interface GameTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    foreground: string;
    muted: string;
    border: string;
    accent: string;
    danger: string;
    success: string;
  };
  isDark: boolean;
}

export interface ChassisConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  themes: Record<string, GameTheme>;
  defaultTheme: string;
}
