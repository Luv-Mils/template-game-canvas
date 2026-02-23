/**
 * ThemeEngine — CSS Variable Token Registry
 *
 * Single source of truth for the CSS variable names that bridge
 * ThemeProvider (JS) ↔ Tailwind CDN config (CSS) ↔ Components (classes).
 *
 * If a new color token is added, update THREE places:
 * 1. ThemeColors interface (types.ts)
 * 2. COLOR_TOKENS below
 * 3. Tailwind CDN config in index.html
 */

/** Maps ThemeColors keys → CSS custom property names (without --) */
export const COLOR_TOKENS: Record<string, string> = {
  primary: 'color-primary',
  primaryHover: 'color-primary-hover',
  secondary: 'color-secondary',
  background: 'color-background',
  surface: 'color-surface',
  surfaceAlt: 'color-surface-alt',
  foreground: 'color-foreground',
  muted: 'color-muted',
  border: 'color-border',
  accent: 'color-accent',
};

/** Font CSS custom property names */
export const FONT_TOKENS = {
  heading: 'font-heading',
  body: 'font-body',
} as const;
