export interface SocialShareBarConfig {
  url: string;
  title: string;
  description?: string;
  platforms: Array<'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy'>;
  variant?: 'horizontal' | 'vertical' | 'floating';
  showLabels?: boolean;
}
