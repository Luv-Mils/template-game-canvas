export interface SpriteFrame {
  x: number; y: number;
  w: number; h: number;
}

export class AnimatedSprite {
  private frame = 0;
  private timer = 0;
  flipX = false;

  constructor(
    private frames: SpriteFrame[],
    private fps = 8,
  ) {}

  update(dt: number) {
    this.timer += dt;
    if (this.timer >= 1 / this.fps) {
      this.timer -= 1 / this.fps;
      this.frame = (this.frame + 1) % this.frames.length;
    }
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.save();
    if (this.flipX) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  reset() { this.frame = 0; this.timer = 0; }
}

export function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size = 14, align: CanvasTextAlign = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}
