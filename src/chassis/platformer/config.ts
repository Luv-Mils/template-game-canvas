import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'platformer',
  name: 'Pixel Jumper',
  description: 'Side-scrolling platformer with physics, coins, enemies, and multiple levels',
  icon: '🏃',
  themes: THEMES,
  defaultTheme: 'retro',
};

export default config;
