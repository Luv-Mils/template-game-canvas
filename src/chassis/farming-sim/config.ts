import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'farming-sim',
  name: 'Pixel Farm',
  description: 'Plant crops, water them, harvest, and sell at the market',
  icon: '🌾',
  themes: THEMES,
  defaultTheme: 'forest',
};

export default config;
