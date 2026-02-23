import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'tower-defense',
  name: 'Tower Guard',
  description: 'Place towers along a path to defeat waves of enemies',
  icon: '🏰',
  themes: THEMES,
  defaultTheme: 'forest',
};

export default config;
