export type KeyState = Record<string, boolean>;

export class Input {
  keys: KeyState = {};
  private justPressed: Set<string> = new Set();
  private listeners: (() => void)[] = [];

  constructor(private el: HTMLElement | Window = window) {
    const down = (e: KeyboardEvent) => {
      if (!this.keys[e.key]) this.justPressed.add(e.key);
      this.keys[e.key] = true;
    };
    const up = (e: KeyboardEvent) => { this.keys[e.key] = false; };
    el.addEventListener('keydown', down as EventListener);
    el.addEventListener('keyup', up as EventListener);
    this.listeners.push(
      () => el.removeEventListener('keydown', down as EventListener),
      () => el.removeEventListener('keyup', up as EventListener),
    );
  }

  isDown(key: string): boolean { return !!this.keys[key]; }
  wasPressed(key: string): boolean { return this.justPressed.has(key); }
  clearFrame() { this.justPressed.clear(); }

  destroy() { this.listeners.forEach(fn => fn()); }
}
