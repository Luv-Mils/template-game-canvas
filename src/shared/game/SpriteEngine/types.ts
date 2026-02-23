export interface SpriteAnimation {
  frames: number[];
  speed: number;
  loop?: boolean;
}

export interface SpriteConfig {
  image: HTMLImageElement | string;
  frameWidth: number;
  frameHeight: number;
  animations?: Record<string, SpriteAnimation>;
}

export interface LoadedSprite {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  animations: Record<string, SpriteAnimation>;
  currentAnimation: string | null;
  currentFrame: number;
  frameTimer: number;
}
