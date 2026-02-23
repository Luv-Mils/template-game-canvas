/**
 * Template-specific theme configuration
 *
 * - getTheme() / getTypography(): resolve theme/typography string IDs to config objects
 * - useTheme: re-exported from foundation for backward compatibility
 *
 * All section components that import { useTheme } from '../../config/theme'
 * will get the foundation version, which reads the same ThemeContext.
 */

import { ThemeConfig, TypographyConfig } from './types';
import { midnight } from './themes/midnight';
import { ocean } from './themes/ocean';
import { sunset } from './themes/sunset';
import { modern } from './typography/modern';
import { editorial } from './typography/editorial';
import { technical } from './typography/technical';

const THEMES: Record<string, ThemeConfig> = { midnight, ocean, sunset };
const TYPOGRAPHY: Record<string, TypographyConfig> = { modern, editorial, technical };

export function getTheme(id: string): ThemeConfig {
  return THEMES[id] || midnight;
}

export function getTypography(id: string): TypographyConfig {
  return TYPOGRAPHY[id] || modern;
}

// Re-export useTheme from foundation so existing components
// that import from '../../config/theme' continue to work.
export { useTheme } from '../shared/foundation';
