/**
 * InputManager -- Game Engine Component (GME-05)
 *
 * Keyboard, mouse, and touch input with action mapping and input buffering.
 * Games define actions ("jump", "attack") mapped to keys/mouse/touch.
 */

import type { InputConfig } from './types';

const MOUSE_BUTTON_MAP: Record<string, number> = { left: 0, right: 2, middle: 1 };

export class InputManager {
  private keyState = new Map<string, boolean>();
  private keyPressed = new Map<string, boolean>();
  private keyReleased = new Map<string, boolean>();
  private mouseState = new Map<number, boolean>();
  private mousePressed = new Map<number, boolean>();
  private mousePosition = { x: 0, y: 0 };
  private touchActive = false;
  private buffer: Array<{ action: string; time: number }> = [];
  private cleanups: Array<() => void> = [];
  private bufferDuration: number;

  constructor(private config: InputConfig) {
    this.bufferDuration = config.bufferDuration ?? 100;
  }

  bind(target: HTMLElement | Window): void {
    const el = target as EventTarget;

    const onKeyDown = (e: Event) => {
      const key = (e as KeyboardEvent).key;
      if (!this.keyState.get(key)) {
        this.keyPressed.set(key, true);
        this.bufferActions(key, 'key');
      }
      this.keyState.set(key, true);
    };

    const onKeyUp = (e: Event) => {
      const key = (e as KeyboardEvent).key;
      this.keyState.set(key, false);
      this.keyReleased.set(key, true);
    };

    const onMouseDown = (e: Event) => {
      const btn = (e as MouseEvent).button;
      this.mouseState.set(btn, true);
      this.mousePressed.set(btn, true);
      this.bufferActions(String(btn), 'mouse');
    };

    const onMouseUp = (e: Event) => {
      const btn = (e as MouseEvent).button;
      this.mouseState.set(btn, false);
    };

    const onMouseMove = (e: Event) => {
      const me = e as MouseEvent;
      const rect = (target instanceof HTMLElement) ? target.getBoundingClientRect() : { left: 0, top: 0 };
      this.mousePosition.x = me.clientX - rect.left;
      this.mousePosition.y = me.clientY - rect.top;
    };

    const onTouchStart = () => {
      this.touchActive = true;
      this.bufferActions('touch', 'touch');
    };

    const onTouchEnd = () => {
      this.touchActive = false;
    };

    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('keyup', onKeyUp);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchend', onTouchEnd);

    this.cleanups.push(() => {
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('keyup', onKeyUp);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    });
  }

  unbind(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }

  isActionDown(action: string): boolean {
    const binding = this.config.actions[action];
    if (!binding) return false;

    if (binding.keys) {
      for (const key of binding.keys) {
        if (this.keyState.get(key)) return true;
      }
    }
    if (binding.mouse) {
      for (const btn of binding.mouse) {
        if (this.mouseState.get(MOUSE_BUTTON_MAP[btn])) return true;
      }
    }
    if (binding.touch && this.touchActive) return true;

    return false;
  }

  isActionPressed(action: string): boolean {
    const binding = this.config.actions[action];
    if (!binding) return false;

    if (binding.keys) {
      for (const key of binding.keys) {
        if (this.keyPressed.get(key)) return true;
      }
    }
    if (binding.mouse) {
      for (const btn of binding.mouse) {
        if (this.mousePressed.get(MOUSE_BUTTON_MAP[btn])) return true;
      }
    }
    return false;
  }

  isActionReleased(action: string): boolean {
    const binding = this.config.actions[action];
    if (!binding) return false;

    if (binding.keys) {
      for (const key of binding.keys) {
        if (this.keyReleased.get(key)) return true;
      }
    }
    return false;
  }

  wasActionBuffered(action: string): boolean {
    const now = performance.now();
    return this.buffer.some(
      (entry) => entry.action === action && now - entry.time <= this.bufferDuration,
    );
  }

  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  update(): void {
    this.keyPressed.clear();
    this.keyReleased.clear();
    this.mousePressed.clear();

    // Expire old buffer entries
    const now = performance.now();
    const cutoff = now - this.bufferDuration * 2;
    this.buffer = this.buffer.filter((entry) => entry.time > cutoff);
  }

  private bufferActions(input: string, type: 'key' | 'mouse' | 'touch'): void {
    const now = performance.now();
    for (const [action, binding] of Object.entries(this.config.actions)) {
      let matches = false;
      if (type === 'key' && binding.keys?.includes(input)) matches = true;
      if (type === 'mouse') {
        const btnNames = Object.entries(MOUSE_BUTTON_MAP)
          .filter(([, v]) => String(v) === input)
          .map(([k]) => k);
        if (binding.mouse?.some((b) => btnNames.includes(b))) matches = true;
      }
      if (type === 'touch' && binding.touch) matches = true;

      if (matches) {
        this.buffer.push({ action, time: now });
      }
    }
  }
}

export type { InputConfig, ActionBinding } from './types';
