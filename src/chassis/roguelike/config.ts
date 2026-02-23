import type { ChassisConfig } from '../../types';
import { THEMES } from '../../themes';

const config: ChassisConfig = {
  id: 'roguelike',
  name: 'Dungeon Descent',
  description: 'Procedural dungeon crawler with turn-based combat and permadeath',
  icon: '⚔️',
  themes: THEMES,
  defaultTheme: 'retro',
};

export default config;
