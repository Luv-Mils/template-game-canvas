export interface Body {
  x: number; y: number;
  w: number; h: number;
  vx: number; vy: number;
  grounded: boolean;
  solid: boolean;
  tag?: string;
}

export function applyGravity(body: Body, gravity: number, dt: number) {
  body.vy += gravity * dt;
}

export function moveAndCollide(body: Body, solids: Body[], dt: number): Body | null {
  // Horizontal
  body.x += body.vx * dt;
  let hitX: Body | null = null;
  for (const s of solids) {
    if (s === body || !s.solid) continue;
    if (aabb(body, s)) {
      hitX = s;
      if (body.vx > 0) body.x = s.x - body.w;
      else if (body.vx < 0) body.x = s.x + s.w;
      body.vx = 0;
    }
  }

  // Vertical
  body.y += body.vy * dt;
  body.grounded = false;
  let hitY: Body | null = null;
  for (const s of solids) {
    if (s === body || !s.solid) continue;
    if (aabb(body, s)) {
      hitY = s;
      if (body.vy > 0) { body.y = s.y - body.h; body.grounded = true; }
      else if (body.vy < 0) body.y = s.y + s.h;
      body.vy = 0;
    }
  }

  return hitY ?? hitX;
}

export function aabb(a: Body, b: Body): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInRect(px: number, py: number, b: Body): boolean {
  return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
}
