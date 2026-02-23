import { VibeConfig } from './types';

// Import the default config
import defaultConfig from '../../vibe.config.json';

// Import variant presets
import agencyMidnight from '../../variants/agency-midnight.json';
import corporateOcean from '../../variants/corporate-ocean.json';
import starterSunset from '../../variants/starter-sunset.json';

const VARIANTS: Record<string, VibeConfig> = {
  'agency-midnight': agencyMidnight as VibeConfig,
  'corporate-ocean': corporateOcean as VibeConfig,
  'starter-sunset': starterSunset as VibeConfig,
};

export function resolveConfig(): VibeConfig {
  const params = new URLSearchParams(window.location.search);

  // Start with defaults from vibe.config.json
  let config: VibeConfig = { ...(defaultConfig as VibeConfig) };

  // If ?variant=name, override all axes
  const variant = params.get('variant');
  if (variant && VARIANTS[variant]) {
    config = { ...VARIANTS[variant] };
  }

  // Individual axis params override
  const layout = params.get('layout');
  const theme = params.get('theme');
  const typography = params.get('typography');
  if (layout) config.layout = layout;
  if (theme) config.theme = theme;
  if (typography) config.typography = typography;

  return config;
}
