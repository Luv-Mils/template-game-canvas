import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'space-shooter',
  name: 'Star Blaster',
  description: 'Vertical shoot-em-up with power-ups, enemy waves, and boss fights',
  icon: '🚀',
  themes: THEMES,
  defaultTheme: 'neon',
};

export default config;
