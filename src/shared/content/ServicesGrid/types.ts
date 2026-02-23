export interface ServiceItem {
  icon?: string;
  title: string;
  description: string;
  link?: { label: string; href: string };
}

export interface ServicesGridConfig {
  headline?: string;
  subheadline?: string;
  columns?: 2 | 3 | 4;
  items: ServiceItem[];
  variant?: 'card' | 'minimal' | 'icon-left';
}
