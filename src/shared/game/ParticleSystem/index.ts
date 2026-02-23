/**
 * ParticleSystem -- Game Engine Component (GME-07)
 *
 * Particle emitter with lifetime, velocity, fade, color transitions.
 * Uses object pooling to minimize garbage collection.
 */

import type { ParticleEmitterConfig, Particle } from './types';

// -- Helpers ------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// -- Emitter ------------------------------------------------------------------

interface Emitter {
  config: ParticleEmitterConfig;
  timer: number;
  active: boolean;
}

// -- Particle System ----------------------------------------------------------

export class ParticleSystem {
  private emitters = new Map<string, Emitter>();
  private pool: Particle[] = [];
  private active: Particle[] = [];

  addEmitter(id: string, config: ParticleEmitterConfig): void {
    this.emitters.set(id, { config, timer: 0, active: true });
  }

  removeEmitter(id: string): void {
    this.emitters.delete(id);
  }

  setEmitterPosition(id: string, x: number, y: number): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.config.position = { x, y };
    }
  }

  burst(id: string, count?: number): void {
    const emitter = this.emitters.get(id);
    if (!emitter) return;

    const n = count ?? emitter.config.burst ?? 10;
    for (let i = 0; i < n; i++) {
      this.spawnParticle(emitter.config);
    }
  }

  update(dt: number): void {
    // Spawn particles from active emitters
    this.emitters.forEach((emitter) => {
      if (!emitter.active) return;
      const { config } = emitter;

      emitter.timer += dt;
      const interval = 1 / config.rate;

      while (emitter.timer >= interval) {
        emitter.timer -= interval;
        const max = config.maxParticles ?? 500;
        if (this.active.length < max) {
          this.spawnParticle(config);
        }
      }
    });

    // Update particles
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.age += dt;

      if (p.age >= p.lifetime) {
        p.active = false;
        this.pool.push(p);
        this.active.splice(i, 1);
        continue;
      }

      // Apply gravity from any emitter (use first emitter's gravity as default)
      const firstEmitter = this.emitters.values().next().value as Emitter | undefined;
      const gravity = firstEmitter?.config.gravity;
      if (gravity) {
        p.vx += gravity.x * dt;
        p.vy += gravity.y * dt;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.active) {
      const t = p.age / p.lifetime;
      const size = lerp(p.sizeStart, p.sizeEnd, t);

      const r = Math.round(lerp(p.colorStart[0], p.colorEnd[0], t));
      const g = Math.round(lerp(p.colorStart[1], p.colorEnd[1], t));
      const b = Math.round(lerp(p.colorStart[2], p.colorEnd[2], t));
      const alpha = 1 - (t * t); // Quadratic fade out

      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getParticleCount(): number {
    return this.active.length;
  }

  clear(): void {
    this.pool.push(...this.active);
    this.active = [];
  }

  private spawnParticle(config: ParticleEmitterConfig): void {
    const p = this.pool.pop() ?? this.createParticle();

    const angle = rand(config.direction.min, config.direction.max);
    const speed = rand(config.speed.min, config.speed.max);

    p.x = config.position.x;
    p.y = config.position.y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.age = 0;
    p.lifetime = rand(config.lifetime.min, config.lifetime.max);
    p.sizeStart = config.size.start;
    p.sizeEnd = config.size.end;
    p.colorStart = hexToRgb(config.color.start);
    p.colorEnd = hexToRgb(config.color.end);
    p.active = true;

    this.active.push(p);
  }

  private createParticle(): Particle {
    return {
      x: 0, y: 0,
      vx: 0, vy: 0,
      age: 0, lifetime: 1,
      size: 1,
      sizeStart: 1, sizeEnd: 0,
      colorStart: [255, 255, 255],
      colorEnd: [255, 255, 255],
      active: false,
    };
  }
}

export type { ParticleEmitterConfig, Particle } from './types';
