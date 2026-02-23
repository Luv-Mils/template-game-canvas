export interface SoundConfig {
  src: string;
  volume?: number;
  loop?: boolean;
  category: 'sfx' | 'music' | 'ui';
}

export interface AudioConfig {
  sounds: Record<string, SoundConfig>;
  masterVolume?: number;
  sfxVolume?: number;
  musicVolume?: number;
}
