import React, { useState, useEffect, Suspense } from 'react';
import type { VibeConfig, GameTheme, ChassisConfig } from './types';
import { getTheme, hexToRgb } from './themes';
import { loadChassis, loadGame } from './chassis';

// @ts-expect-error vite json import
import defaultConfig from '../vibe.config.json';

function resolveConfig(): VibeConfig {
  const cfg = { ...(defaultConfig as VibeConfig) };
  const params = new URLSearchParams(window.location.search);
  const chassis = params.get('chassis');
  if (chassis) cfg.chassis = chassis;
  const theme = params.get('theme');
  if (theme) cfg.theme = theme;
  return cfg;
}

function applyThemeToCSS(theme: GameTheme) {
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty('--color-primary', hexToRgb(c.primary));
  root.style.setProperty('--color-accent', hexToRgb(c.accent));
  root.style.setProperty('--color-background', hexToRgb(c.background));
  root.style.setProperty('--color-surface', hexToRgb(c.surface));
  root.style.setProperty('--color-surface-alt', hexToRgb(c.surfaceAlt));
  root.style.setProperty('--color-foreground', hexToRgb(c.foreground));
  root.style.setProperty('--color-muted', hexToRgb(c.muted));
  root.style.setProperty('--color-border', hexToRgb(c.border));
}

export default function App() {
  const [config] = useState(resolveConfig);
  const [chassisConfig, setChassisConfig] = useState<ChassisConfig | null>(null);
  const [GameComponent, setGameComponent] = useState<React.ComponentType<{ theme: GameTheme }> | null>(null);
  const [theme, setTheme] = useState<GameTheme | null>(null);

  useEffect(() => {
    (async () => {
      const cc = await loadChassis(config.chassis);
      setChassisConfig(cc);
      const t = cc.themes[config.theme] ?? cc.themes[cc.defaultTheme] ?? getTheme(config.theme);
      setTheme(t);
      applyThemeToCSS(t);
      document.title = cc.name;

      const Game = await loadGame(config.chassis);
      setGameComponent(() => Game);
    })();
  }, [config]);

  if (!theme || !GameComponent || !chassisConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted animate-pulse">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GameComponent theme={theme} />
    </div>
  );
}
