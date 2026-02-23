import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'runner',
  name: 'Neon Dash',
  description: 'Endless auto-runner with obstacles, power-ups, and increasing speed',
  icon: '🏃‍♂️',
  themes: THEMES,
  defaultTheme: 'neon',
};

export default config;
