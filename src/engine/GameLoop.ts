export type UpdateFn = (dt: number) => void;
export type RenderFn = (interp: number) => void;

export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt: number;
  private running = false;

  constructor(
    private onUpdate: UpdateFn,
    private onRender: RenderFn,
    fps = 60,
  ) {
    this.fixedDt = 1 / fps;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = () => {
    if (!this.running) return;
    const now = performance.now() / 1000;
    let rawDt = now - this.lastTime;
    this.lastTime = now;
    if (rawDt > 0.25) rawDt = 0.25; // clamp for tab-in-background

    this.accumulator += rawDt;
    while (this.accumulator >= this.fixedDt) {
      this.onUpdate(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }
    this.onRender(this.accumulator / this.fixedDt);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
