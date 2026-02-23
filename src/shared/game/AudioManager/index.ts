/**
 * AudioManager -- Game Engine Component (GME-08)
 *
 * Sound effect + music playback via Web Audio API.
 * Category-based volume control with mobile unlock support.
 */

import type { AudioConfig } from './types';

type Category = 'master' | 'sfx' | 'music' | 'ui';

export class AudioManager {
  private context: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private sources = new Map<string, AudioBufferSourceNode>();
  private gainNodes: Record<Category, GainNode | null> = {
    master: null,
    sfx: null,
    music: null,
    ui: null,
  };
  private volumes: Record<Category, number>;

  constructor(private config: AudioConfig) {
    this.volumes = {
      master: config.masterVolume ?? 1,
      sfx: config.sfxVolume ?? 1,
      music: config.musicVolume ?? 1,
      ui: 1,
    };
  }

  async init(): Promise<void> {
    this.context = new AudioContext();

    // Set up gain node chain: source → category → master → destination
    this.gainNodes.master = this.context.createGain();
    this.gainNodes.master.gain.value = this.volumes.master;
    this.gainNodes.master.connect(this.context.destination);

    for (const cat of ['sfx', 'music', 'ui'] as const) {
      this.gainNodes[cat] = this.context.createGain();
      this.gainNodes[cat]!.gain.value = this.volumes[cat];
      this.gainNodes[cat]!.connect(this.gainNodes.master);
    }

    // Load all sounds
    const entries = Object.entries(this.config.sounds);
    await Promise.all(
      entries.map(async ([id, sound]) => {
        try {
          const response = await fetch(sound.src);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
          this.buffers.set(id, audioBuffer);
        } catch {
          // Silently skip failed loads — game continues without this sound
        }
      }),
    );
  }

  unlock(): void {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  play(id: string): void {
    if (!this.context || !this.gainNodes.master) return;

    const buffer = this.buffers.get(id);
    if (!buffer) return;

    const soundConfig = this.config.sounds[id];
    if (!soundConfig) return;

    // Stop existing instance if playing
    this.stop(id);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = soundConfig.loop ?? false;

    // Create per-source gain for individual volume
    const sourceGain = this.context.createGain();
    sourceGain.gain.value = soundConfig.volume ?? 1;

    const categoryGain = this.gainNodes[soundConfig.category];
    source.connect(sourceGain);
    sourceGain.connect(categoryGain ?? this.gainNodes.master!);

    source.start(0);
    this.sources.set(id, source);

    source.onended = () => {
      this.sources.delete(id);
    };
  }

  stop(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
      this.sources.delete(id);
    }
  }

  stopAll(): void {
    this.sources.forEach((source, id) => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
      this.sources.delete(id);
    });
  }

  isPlaying(id: string): boolean {
    return this.sources.has(id);
  }

  setVolume(category: Category, volume: number): void {
    this.volumes[category] = Math.max(0, Math.min(1, volume));
    const node = this.gainNodes[category];
    if (node) {
      node.gain.value = this.volumes[category];
    }
  }

  getVolume(category: Category): number {
    return this.volumes[category];
  }

  dispose(): void {
    this.stopAll();
    this.buffers.clear();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

export type { AudioConfig, SoundConfig } from './types';
