export interface PhysicsBody {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  mass: number;
  static: boolean;
  restitution: number;
  friction: number;
  collisionLayer: number;
  collisionMask: number;
  onCollision?: (other: PhysicsBody, normal: { x: number; y: number }) => void;
}

export interface PhysicsConfig {
  gravity: { x: number; y: number };
  worldBounds?: { x: number; y: number; width: number; height: number };
  spatialGridSize?: number;
}

export interface RaycastHit {
  body: PhysicsBody;
  point: { x: number; y: number };
  distance: number;
  normal: { x: number; y: number };
}
