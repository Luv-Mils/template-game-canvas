export class Camera {
  x = 0;
  y = 0;

  follow(targetX: number, targetY: number, canvasW: number, canvasH: number, worldW: number, worldH: number) {
    this.x = Math.max(0, Math.min(targetX - canvasW / 2, worldW - canvasW));
    this.y = Math.max(0, Math.min(targetY - canvasH / 2, worldH - canvasH));
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.translate(-this.x, -this.y);
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: sx + this.x, y: sy + this.y };
  }
}
