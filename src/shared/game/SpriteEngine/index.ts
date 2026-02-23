/**
 * SpriteEngine -- Game Engine Component (GME-03)
 *
 * Sprite loading, sprite sheet support, animation frames, and canvas drawing.
 * Handles sprite sheets divided into uniform frames with named animations.
 */

import type { SpriteConfig, LoadedSprite } from './types';

export class SpriteEngine {
  private sprites = new Map<string, LoadedSprite>();

  async loadSprite(id: string, config: SpriteConfig): Promise<void> {
    const image = await this.resolveImage(config.image);
    const columns = Math.floor(image.width / config.frameWidth);

    this.sprites.set(id, {
      image,
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      columns,
      animations: config.animations ?? {},
      currentAnimation: null,
      currentFrame: 0,
      frameTimer: 0,
    });
  }

  drawSprite(
    ctx: CanvasRenderingContext2D,
    id: string,
    x: number,
    y: number,
    frame?: number,
    scale?: number,
    flipX?: boolean,
  ): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;

    const f = frame ?? sprite.currentFrame;
    const sx = (f % sprite.columns) * sprite.frameWidth;
    const sy = Math.floor(f / sprite.columns) * sprite.frameHeight;
    const s = scale ?? 1;
    const dw = sprite.frameWidth * s;
    const dh = sprite.frameHeight * s;

    ctx.save();

    if (flipX) {
      ctx.translate(x + dw, y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        sprite.image,
        sx, sy, sprite.frameWidth, sprite.frameHeight,
        0, 0, dw, dh,
      );
    } else {
      ctx.drawImage(
        sprite.image,
        sx, sy, sprite.frameWidth, sprite.frameHeight,
        x, y, dw, dh,
      );
    }

    ctx.restore();
  }

  playAnimation(id: string, animationName: string): void {
    const sprite = this.sprites.get(id);
    if (!sprite) return;

    if (sprite.currentAnimation === animationName) return;

    const anim = sprite.animations[animationName];
    if (!anim) return;

    sprite.currentAnimation = animationName;
    sprite.currentFrame = anim.frames[0];
    sprite.frameTimer = 0;
  }

  stopAnimation(id: string): void {
    const sprite = this.sprites.get(id);
    if (sprite) {
      sprite.currentAnimation = null;
    }
  }

  updateAnimations(dt: number): void {
    this.sprites.forEach((sprite) => {
      if (!sprite.currentAnimation) return;

      const anim = sprite.animations[sprite.currentAnimation];
      if (!anim) return;

      sprite.frameTimer += dt * 1000;

      if (sprite.frameTimer >= anim.speed) {
        sprite.frameTimer -= anim.speed;

        const currentIdx = anim.frames.indexOf(sprite.currentFrame);
        const nextIdx = currentIdx + 1;

        if (nextIdx >= anim.frames.length) {
          if (anim.loop !== false) {
            sprite.currentFrame = anim.frames[0];
          }
          // else stay on last frame
        } else {
          sprite.currentFrame = anim.frames[nextIdx];
        }
      }
    });
  }

  getCurrentFrame(id: string): number {
    return this.sprites.get(id)?.currentFrame ?? 0;
  }

  hasSprite(id: string): boolean {
    return this.sprites.has(id);
  }

  removeSprite(id: string): void {
    this.sprites.delete(id);
  }

  private resolveImage(src: HTMLImageElement | string): Promise<HTMLImageElement> {
    if (src instanceof HTMLImageElement) {
      if (src.complete) return Promise.resolve(src);
      return new Promise((resolve, reject) => {
        src.onload = () => resolve(src);
        src.onerror = reject;
      });
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

export type { SpriteConfig, SpriteAnimation, LoadedSprite } from './types';
