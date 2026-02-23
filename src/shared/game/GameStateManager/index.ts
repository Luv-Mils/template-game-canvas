/**
 * GameStateManager -- Game Engine Component (GME-09)
 *
 * State machine for game states (menu/playing/paused/gameover).
 * Manages transitions with enter/exit hooks and persistent game data.
 */

import type { GameStateConfig, GameState } from './types';

export class GameStateManager {
  private currentState: string;
  private states: Map<string, GameState>;
  private data = new Map<string, unknown>();

  constructor(private config: GameStateConfig) {
    this.states = new Map(Object.entries(config.states));
    this.currentState = config.initialState;
    this.states.get(this.currentState)?.onEnter?.();
  }

  transition(newState: string): void {
    if (!this.states.has(newState)) return;
    if (newState === this.currentState) return;

    this.states.get(this.currentState)?.onExit?.();
    this.currentState = newState;
    this.states.get(newState)?.onEnter?.();
  }

  getCurrentState(): string {
    return this.currentState;
  }

  update(dt: number): void {
    this.states.get(this.currentState)?.onUpdate?.(dt);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.states.get(this.currentState)?.onRender?.(ctx);
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  save(): string {
    const obj: Record<string, unknown> = {};
    this.data.forEach((value, key) => {
      obj[key] = value;
    });
    return JSON.stringify(obj);
  }

  load(json: string): void {
    const parsed = JSON.parse(json);
    this.data.clear();
    for (const [key, value] of Object.entries(parsed)) {
      this.data.set(key, value);
    }
  }
}

export type { GameStateConfig, GameState } from './types';
