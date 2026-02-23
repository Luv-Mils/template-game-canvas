export interface HeroCTA {
  label: string;
  href: string;
}

export interface HeroMedia {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

export interface HeroConfig {
  variant: 'centered' | 'split' | 'minimal' | 'video' | 'gradient';
  headline: string;
  subheadline?: string;
  primaryCTA?: HeroCTA;
  secondaryCTA?: HeroCTA;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundOverlay?: boolean;
  media?: HeroMedia;
  badges?: string[];
  alignment?: 'left' | 'center' | 'right';
  minHeight?: string;
}
