/**
 * GameLoop -- Game Engine Component (GME-02)
 *
 * Fixed timestep update loop with variable timestep rendering.
 * Provides deterministic game logic + smooth visuals.
 */

import type { GameLoopConfig } from './types';

export class GameLoop {
  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private frameCount = 0;
  private fpsTimer = 0;
  private fixedDt: number;

  constructor(private config: GameLoopConfig) {
    this.fixedDt = config.fixedTimestep ?? 1000 / (config.targetFPS ?? 60);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  pause(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  resume(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  isRunning(): boolean {
    return this.running;
  }

  private tick(now: number): void {
    if (!this.running) return;
    this.rafId = requestAnimationFrame((t) => this.tick(t));

    let dt = now - this.lastTime;
    this.lastTime = now;

    // Clamp large dt (e.g. tab was in background)
    if (dt > 250) dt = 250;

    // Fixed timestep updates (deterministic game logic)
    this.accumulator += dt;
    while (this.accumulator >= this.fixedDt) {
      this.config.onUpdate(this.fixedDt / 1000);
      this.accumulator -= this.fixedDt;
    }

    // Variable timestep render (smooth visuals)
    const interpolation = this.accumulator / this.fixedDt;
    this.config.onRender(interpolation);

    // FPS counter
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1000) {
      this.config.onFPSUpdate?.(this.frameCount);
      this.frameCount = 0;
      this.fpsTimer -= 1000;
    }
  }
}

export type { GameLoopConfig } from './types';
