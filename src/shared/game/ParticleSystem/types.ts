export interface ParticleEmitterConfig {
  position: { x: number; y: number };
  rate: number;
  lifetime: { min: number; max: number };
  speed: { min: number; max: number };
  direction: { min: number; max: number };
  size: { start: number; end: number };
  color: { start: string; end: string };
  gravity?: { x: number; y: number };
  fadeOut?: boolean;
  burst?: number;
  maxParticles?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  lifetime: number;
  size: number;
  sizeStart: number;
  sizeEnd: number;
  colorStart: [number, number, number];
  colorEnd: [number, number, number];
  active: boolean;
}
