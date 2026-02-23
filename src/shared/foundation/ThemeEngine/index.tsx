/**
 * ThemeEngine — Foundation Component (FND-01)
 *
 * Provides the theme system for ALL Vibe Engine templates:
 * - ThemeProvider: injects CSS custom properties (space-separated RGB) onto <html>
 * - useTheme(): hook to access theme + typography + isDark in any component
 * - hexToRgb(): converts hex colors to space-separated RGB for Tailwind CDN
 *
 * CRITICAL: CSS vars MUST be space-separated RGB channels (e.g. "99 102 241"),
 * NOT hex values. Tailwind CDN wraps them in rgb() for opacity support:
 *   primary: 'rgb(var(--color-primary) / <alpha-value>)'
 *   rgb(#hex / 1) = INVALID CSS
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { ThemeConfig, TypographyConfig, ThemeContextValue } from './types';
import { COLOR_TOKENS, FONT_TOKENS } from './tokens';

// ── Hex → RGB ────────────────────────────────────────────────────────────────

/** Convert hex color (#RRGGBB) to space-separated RGB channels for Tailwind CSS var support */
export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return (
    parseInt(h.substring(0, 2), 16) +
    ' ' +
    parseInt(h.substring(2, 4), 16) +
    ' ' +
    parseInt(h.substring(4, 6), 16)
  );
}

// ── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Access the current theme, typography, and isDark flag.
 * Must be called inside a <ThemeProvider>.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() must be used within a <ThemeProvider>');
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  theme: ThemeConfig;
  typography: TypographyConfig;
  children: React.ReactNode;
}

/**
 * Injects theme colors as CSS custom properties on <html> and provides
 * theme context to all descendants.
 *
 * Usage:
 *   <ThemeProvider theme={getTheme('midnight')} typography={getTypography('modern')}>
 *     <App />
 *   </ThemeProvider>
 */
export function ThemeProvider({ theme, typography, children }: ThemeProviderProps) {
  // Set CSS custom properties on document root
  useEffect(() => {
    const root = document.documentElement;
    const colors = theme.colors as unknown as Record<string, string>;

    // Color tokens → space-separated RGB
    for (const [key, cssVar] of Object.entries(COLOR_TOKENS)) {
      if (colors[key]) {
        root.style.setProperty(`--${cssVar}`, hexToRgb(colors[key]));
      }
    }

    // Font tokens
    root.style.setProperty(`--${FONT_TOKENS.heading}`, typography.heading);
    root.style.setProperty(`--${FONT_TOKENS.body}`, typography.body);
  }, [theme, typography]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, typography, isDark: theme.isDark }),
    [theme, typography],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

// ── Re-exports ───────────────────────────────────────────────────────────────

export type { ThemeConfig, TypographyConfig, ThemeContextValue, ThemeColors, VibeConfig } from './types';
export { COLOR_TOKENS, FONT_TOKENS } from './tokens';
