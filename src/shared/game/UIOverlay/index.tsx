/**
 * UIOverlay -- Game Engine Component (GME-10)
 *
 * HUD elements (health bar, score, timer, minimap) rendered as
 * positioned HTML over the canvas. pointer-events: none so clicks
 * pass through to the game canvas.
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type {
  UIOverlayConfig,
  UIElementConfig,
  HealthBarConfig,
  ScoreConfig,
  TimerConfig,
  MinimapConfig,
  TextConfig,
} from './types';

// -- Position helpers ---------------------------------------------------------

function getPositionClasses(position: UIElementConfig['position']): string {
  const base = 'absolute p-3';
  switch (position) {
    case 'top-left': return `${base} top-0 left-0`;
    case 'top-right': return `${base} top-0 right-0`;
    case 'top-center': return `${base} top-0 left-1/2 -translate-x-1/2`;
    case 'bottom-left': return `${base} bottom-0 left-0`;
    case 'bottom-right': return `${base} bottom-0 right-0`;
    case 'bottom-center': return `${base} bottom-0 left-1/2 -translate-x-1/2`;
    default: return base;
  }
}

// -- Health Bar ---------------------------------------------------------------

function HealthBar({ config }: { config: HealthBarConfig }) {
  const pct = Math.max(0, Math.min(100, (config.current / config.max) * 100));
  const barColor =
    config.color ??
    (pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444');

  return (
    <div className="min-w-[120px]">
      {config.label && (
        <div className="text-xs text-white/80 mb-0.5 font-medium">{config.label}</div>
      )}
      <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="text-[10px] text-white/60 mt-0.5">
        {config.current}/{config.max}
      </div>
    </div>
  );
}

// -- Score --------------------------------------------------------------------

function Score({ config }: { config: ScoreConfig }) {
  return (
    <div className="text-center">
      {config.label && (
        <div className="text-xs text-white/60 uppercase tracking-wider">{config.label}</div>
      )}
      <div className="text-2xl font-bold text-white tabular-nums">
        {config.value.toLocaleString()}
      </div>
    </div>
  );
}

// -- Timer --------------------------------------------------------------------

function Timer({ config }: { config: TimerConfig }) {
  const secs = Math.max(0, Math.floor(config.seconds));
  const mins = Math.floor(secs / 60);
  const remaining = secs % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  const isLow = config.countDown && secs < 10;

  return (
    <div
      className={`text-xl font-bold tabular-nums ${
        isLow ? 'text-red-400 animate-pulse' : 'text-white'
      }`}
    >
      {display}
    </div>
  );
}

// -- Minimap ------------------------------------------------------------------

function Minimap({ config }: { config: MinimapConfig }) {
  const width = 120;
  const height = (config.mapHeight / config.mapWidth) * width;
  const scaleX = width / config.mapWidth;
  const scaleY = height / config.mapHeight;

  return (
    <div
      className="relative border border-white/20 rounded bg-black/50"
      style={{ width, height }}
    >
      {/* Viewport rectangle */}
      <div
        className="absolute border border-white/70 bg-white/10"
        style={{
          left: config.viewportX * scaleX,
          top: config.viewportY * scaleY,
          width: config.viewportWidth * scaleX,
          height: config.viewportHeight * scaleY,
        }}
      />
      {/* Dots (enemies, items, etc.) */}
      {config.dots?.map((dot, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: dot.x * scaleX - 3,
            top: dot.y * scaleY - 3,
            backgroundColor: dot.color,
          }}
        />
      ))}
    </div>
  );
}

// -- Text ---------------------------------------------------------------------

function TextElement({ config }: { config: TextConfig }) {
  return (
    <div
      className="font-bold text-white"
      style={{ fontSize: config.size ?? '14px' }}
    >
      {config.text}
    </div>
  );
}

// -- Element renderer ---------------------------------------------------------

function renderElement(el: UIElementConfig): React.ReactNode {
  switch (el.type) {
    case 'healthBar':
      return <HealthBar config={el.config} />;
    case 'score':
      return <Score config={el.config} />;
    case 'timer':
      return <Timer config={el.config} />;
    case 'minimap':
      return <Minimap config={el.config} />;
    case 'text':
      return <TextElement config={el.config} />;
    case 'custom':
      return el.config.render();
    default:
      return null;
  }
}

// -- Main Component -----------------------------------------------------------

export default function UIOverlay({ config }: { config: UIOverlayConfig }) {
  useTheme();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {config.elements.map((el, i) => (
        <div key={i} className={getPositionClasses(el.position)}>
          {renderElement(el)}
        </div>
      ))}
    </div>
  );
}

export type {
  UIOverlayConfig,
  UIElementConfig,
  HealthBarConfig,
  ScoreConfig,
  TimerConfig,
  MinimapConfig,
  TextConfig,
} from './types';
