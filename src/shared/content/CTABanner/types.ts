export interface CTABannerConfig {
  headline: string;
  description?: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  variant?: 'simple' | 'gradient' | 'image';
  backgroundImage?: string;
  alignment?: 'left' | 'center';
}
