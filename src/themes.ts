import type { GameTheme } from './types';

export const THEMES: Record<string, GameTheme> = {
  retro: {
    id: 'retro', name: 'Retro',
    colors: {
      primary: '#6366F1', primaryLight: '#818CF8', secondary: '#A78BFA',
      background: '#0A0A0F', surface: '#111827', surfaceAlt: '#1F2937',
      foreground: '#F9FAFB', muted: '#6B7280', border: '#374151',
      accent: '#F59E0B', danger: '#EF4444', success: '#22C55E',
    },
    isDark: true,
  },
  neon: {
    id: 'neon', name: 'Neon',
    colors: {
      primary: '#06B6D4', primaryLight: '#22D3EE', secondary: '#EC4899',
      background: '#030712', surface: '#0A0F1A', surfaceAlt: '#111827',
      foreground: '#E0F7FA', muted: '#4B5563', border: '#1A2332',
      accent: '#FACC15', danger: '#F43F5E', success: '#10B981',
    },
    isDark: true,
  },
  forest: {
    id: 'forest', name: 'Forest',
    colors: {
      primary: '#22C55E', primaryLight: '#4ADE80', secondary: '#A3E635',
      background: '#0C1A0C', surface: '#132613', surfaceAlt: '#1A3018',
      foreground: '#E2E8D0', muted: '#8B9A78', border: '#1F3A1F',
      accent: '#F59E0B', danger: '#EF4444', success: '#34D399',
    },
    isDark: true,
  },
};

export function getTheme(id: string): GameTheme {
  return THEMES[id] ?? THEMES.retro;
}

export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return parseInt(h.substring(0, 2), 16) + ' ' + parseInt(h.substring(2, 4), 16) + ' ' + parseInt(h.substring(4, 6), 16);
}
