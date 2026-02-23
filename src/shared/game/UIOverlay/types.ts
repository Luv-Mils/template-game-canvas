export interface HealthBarConfig {
  current: number;
  max: number;
  label?: string;
  color?: string;
}

export interface ScoreConfig {
  value: number;
  label?: string;
}

export interface TimerConfig {
  seconds: number;
  countDown?: boolean;
}

export interface MinimapConfig {
  mapWidth: number;
  mapHeight: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  dots?: Array<{ x: number; y: number; color: string }>;
}

export interface TextConfig {
  text: string;
  size?: string;
}

export type UIElementPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

export type UIElementConfig =
  | { type: 'healthBar'; position: UIElementPosition; config: HealthBarConfig }
  | { type: 'score'; position: UIElementPosition; config: ScoreConfig }
  | { type: 'timer'; position: UIElementPosition; config: TimerConfig }
  | { type: 'minimap'; position: UIElementPosition; config: MinimapConfig }
  | { type: 'text'; position: UIElementPosition; config: TextConfig }
  | { type: 'custom'; position: UIElementPosition; config: { render: () => React.ReactNode } };

export interface UIOverlayConfig {
  elements: UIElementConfig[];
}
