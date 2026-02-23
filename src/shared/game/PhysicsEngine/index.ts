/**
 * PhysicsEngine -- Game Engine Component (GME-04)
 *
 * AABB collision detection with spatial grid broad phase,
 * gravity, velocity, basic rigid body physics.
 */

import type { PhysicsBody, PhysicsConfig, RaycastHit } from './types';

// -- Spatial Grid (broad phase) -----------------------------------------------

class SpatialGrid {
  private cells = new Map<string, Set<string>>();
  private bodyPositions = new Map<string, string[]>();

  constructor(private cellSize: number) {}

  private key(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  insert(body: PhysicsBody): void {
    this.remove(body.id);

    const minCX = Math.floor(body.x / this.cellSize);
    const minCY = Math.floor(body.y / this.cellSize);
    const maxCX = Math.floor((body.x + body.width) / this.cellSize);
    const maxCY = Math.floor((body.y + body.height) / this.cellSize);

    const keys: string[] = [];
    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const k = this.key(cx, cy);
        if (!this.cells.has(k)) this.cells.set(k, new Set());
        this.cells.get(k)!.add(body.id);
        keys.push(k);
      }
    }
    this.bodyPositions.set(body.id, keys);
  }

  remove(id: string): void {
    const keys = this.bodyPositions.get(id);
    if (!keys) return;
    for (const k of keys) {
      this.cells.get(k)?.delete(id);
    }
    this.bodyPositions.delete(id);
  }

  getCandidates(body: PhysicsBody): Set<string> {
    const candidates = new Set<string>();
    const minCX = Math.floor(body.x / this.cellSize);
    const minCY = Math.floor(body.y / this.cellSize);
    const maxCX = Math.floor((body.x + body.width) / this.cellSize);
    const maxCY = Math.floor((body.y + body.height) / this.cellSize);

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const cell = this.cells.get(this.key(cx, cy));
        if (cell) {
          cell.forEach((id) => {
            if (id !== body.id) candidates.add(id);
          });
        }
      }
    }
    return candidates;
  }

  clear(): void {
    this.cells.clear();
    this.bodyPositions.clear();
  }
}

// -- Physics Engine -----------------------------------------------------------

export class PhysicsEngine {
  private bodies = new Map<string, PhysicsBody>();
  private grid: SpatialGrid;

  constructor(private config: PhysicsConfig) {
    this.grid = new SpatialGrid(config.spatialGridSize ?? 64);
  }

  addBody(body: PhysicsBody): void {
    this.bodies.set(body.id, body);
    this.grid.insert(body);
  }

  removeBody(id: string): void {
    this.bodies.delete(id);
    this.grid.remove(id);
  }

  getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  getAllBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  update(dt: number): void {
    const { gravity, worldBounds } = this.config;

    // 1. Apply gravity + acceleration to velocity, then velocity to position
    this.bodies.forEach((body) => {
      if (body.static) return;

      body.vx += (body.ax + gravity.x) * dt;
      body.vy += (body.ay + gravity.y) * dt;

      body.x += body.vx * dt;
      body.y += body.vy * dt;

      this.grid.insert(body);
    });

    // 2. Collision detection and resolution
    const checked = new Set<string>();

    this.bodies.forEach((bodyA) => {
      const candidates = this.grid.getCandidates(bodyA);

      candidates.forEach((idB) => {
        const pairKey = bodyA.id < idB ? `${bodyA.id}:${idB}` : `${idB}:${bodyA.id}`;
        if (checked.has(pairKey)) return;
        checked.add(pairKey);

        const bodyB = this.bodies.get(idB);
        if (!bodyB) return;

        // Collision layer filtering
        if ((bodyA.collisionLayer & bodyB.collisionMask) === 0 &&
            (bodyB.collisionLayer & bodyA.collisionMask) === 0) return;

        // AABB intersection test
        const overlap = this.getOverlap(bodyA, bodyB);
        if (!overlap) return;

        // Resolve collision
        this.resolve(bodyA, bodyB, overlap);
      });
    });

    // 3. Clamp to world bounds
    if (worldBounds) {
      this.bodies.forEach((body) => {
        if (body.static) return;
        if (body.x < worldBounds.x) {
          body.x = worldBounds.x;
          body.vx = Math.abs(body.vx) * body.restitution;
        }
        if (body.x + body.width > worldBounds.x + worldBounds.width) {
          body.x = worldBounds.x + worldBounds.width - body.width;
          body.vx = -Math.abs(body.vx) * body.restitution;
        }
        if (body.y < worldBounds.y) {
          body.y = worldBounds.y;
          body.vy = Math.abs(body.vy) * body.restitution;
        }
        if (body.y + body.height > worldBounds.y + worldBounds.height) {
          body.y = worldBounds.y + worldBounds.height - body.height;
          body.vy = -Math.abs(body.vy) * body.restitution;
        }
      });
    }
  }

  raycast(
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    maxDistance: number,
  ): RaycastHit | null {
    const len = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (len === 0) return null;
    const dx = direction.x / len;
    const dy = direction.y / len;

    let closest: RaycastHit | null = null;

    this.bodies.forEach((body) => {
      const hit = this.rayAABB(origin, { x: dx, y: dy }, body, maxDistance);
      if (hit && (!closest || hit.distance < closest.distance)) {
        closest = hit;
      }
    });

    return closest;
  }

  private getOverlap(
    a: PhysicsBody,
    b: PhysicsBody,
  ): { x: number; y: number; nx: number; ny: number } | null {
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

    if (overlapX <= 0 || overlapY <= 0) return null;

    // Resolve along minimum overlap axis
    if (overlapX < overlapY) {
      const nx = a.x + a.width / 2 < b.x + b.width / 2 ? -1 : 1;
      return { x: overlapX, y: overlapY, nx, ny: 0 };
    } else {
      const ny = a.y + a.height / 2 < b.y + b.height / 2 ? -1 : 1;
      return { x: overlapX, y: overlapY, nx: 0, ny };
    }
  }

  private resolve(
    a: PhysicsBody,
    b: PhysicsBody,
    overlap: { x: number; y: number; nx: number; ny: number },
  ): void {
    const normal = { x: overlap.nx, y: overlap.ny };
    const separation = overlap.nx !== 0 ? overlap.x : overlap.y;

    // Separate bodies
    if (a.static && !b.static) {
      b.x -= normal.x * separation;
      b.y -= normal.y * separation;
    } else if (!a.static && b.static) {
      a.x += normal.x * separation;
      a.y += normal.y * separation;
    } else if (!a.static && !b.static) {
      const totalMass = a.mass + b.mass;
      a.x += normal.x * separation * (b.mass / totalMass);
      a.y += normal.y * separation * (b.mass / totalMass);
      b.x -= normal.x * separation * (a.mass / totalMass);
      b.y -= normal.y * separation * (a.mass / totalMass);
    }

    // Apply impulse
    const restitution = Math.min(a.restitution, b.restitution);
    const relVelX = a.vx - b.vx;
    const relVelY = a.vy - b.vy;
    const relVelDotN = relVelX * normal.x + relVelY * normal.y;

    if (relVelDotN > 0) return; // Moving apart

    const j = -(1 + restitution) * relVelDotN;
    const totalInvMass = (a.static ? 0 : 1 / a.mass) + (b.static ? 0 : 1 / b.mass);
    if (totalInvMass === 0) return;

    const impulse = j / totalInvMass;

    if (!a.static) {
      a.vx += (impulse / a.mass) * normal.x;
      a.vy += (impulse / a.mass) * normal.y;
    }
    if (!b.static) {
      b.vx -= (impulse / b.mass) * normal.x;
      b.vy -= (impulse / b.mass) * normal.y;
    }

    // Apply friction
    const friction = (a.friction + b.friction) / 2;
    const tangentX = relVelX - relVelDotN * normal.x;
    const tangentY = relVelY - relVelDotN * normal.y;
    const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY);

    if (tangentLen > 0.001) {
      const tx = tangentX / tangentLen;
      const ty = tangentY / tangentLen;
      const frictionImpulse = Math.min(friction * impulse, tangentLen);

      if (!a.static) {
        a.vx -= (frictionImpulse / a.mass) * tx;
        a.vy -= (frictionImpulse / a.mass) * ty;
      }
      if (!b.static) {
        b.vx += (frictionImpulse / b.mass) * tx;
        b.vy += (frictionImpulse / b.mass) * ty;
      }
    }

    // Fire callbacks
    a.onCollision?.(b, { x: -normal.x, y: -normal.y });
    b.onCollision?.(a, { x: normal.x, y: normal.y });

    // Update grid positions
    this.grid.insert(a);
    this.grid.insert(b);
  }

  private rayAABB(
    origin: { x: number; y: number },
    dir: { x: number; y: number },
    body: PhysicsBody,
    maxDist: number,
  ): RaycastHit | null {
    const invDx = dir.x !== 0 ? 1 / dir.x : Infinity;
    const invDy = dir.y !== 0 ? 1 / dir.y : Infinity;

    const t1 = (body.x - origin.x) * invDx;
    const t2 = (body.x + body.width - origin.x) * invDx;
    const t3 = (body.y - origin.y) * invDy;
    const t4 = (body.y + body.height - origin.y) * invDy;

    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    if (tmax < 0 || tmin > tmax || tmin > maxDist) return null;

    const t = tmin >= 0 ? tmin : tmax;
    if (t > maxDist) return null;

    const point = { x: origin.x + dir.x * t, y: origin.y + dir.y * t };

    // Determine hit normal
    let nx = 0, ny = 0;
    if (Math.abs(point.x - body.x) < 0.01) nx = -1;
    else if (Math.abs(point.x - (body.x + body.width)) < 0.01) nx = 1;
    else if (Math.abs(point.y - body.y) < 0.01) ny = -1;
    else if (Math.abs(point.y - (body.y + body.height)) < 0.01) ny = 1;

    return { body, point, distance: t, normal: { x: nx, y: ny } };
  }
}

export type { PhysicsBody, PhysicsConfig, RaycastHit } from './types';
