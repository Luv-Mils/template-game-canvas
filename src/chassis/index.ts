import type { ChassisConfig } from '../types';

const chassisModules: Record<string, () => Promise<{ default: ChassisConfig }>> = {
  'platformer':     () => import('./platformer/config'),
  'tower-defense':  () => import('./tower-defense/config'),
  'roguelike':      () => import('./roguelike/config'),
  'farming-sim':    () => import('./farming-sim/config'),
  'runner':         () => import('./runner/config'),
  'space-shooter':  () => import('./space-shooter/config'),
};

export async function loadChassis(id: string): Promise<ChassisConfig> {
  const loader = chassisModules[id] ?? chassisModules['platformer'];
  const mod = await loader();
  return mod.default;
}

const gameModules: Record<string, () => Promise<{ default: React.ComponentType<{ theme: import('../types').GameTheme }> }>> = {
  'platformer':     () => import('./platformer/Game'),
  'tower-defense':  () => import('./tower-defense/Game'),
  'roguelike':      () => import('./roguelike/Game'),
  'farming-sim':    () => import('./farming-sim/Game'),
  'runner':         () => import('./runner/Game'),
  'space-shooter':  () => import('./space-shooter/Game'),
};

export async function loadGame(id: string): Promise<React.ComponentType<{ theme: import('../types').GameTheme }>> {
  const loader = gameModules[id] ?? gameModules['platformer'];
  const mod = await loader();
  return mod.default;
}
