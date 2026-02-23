export interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

export interface StatsCounterConfig {
  items: StatItem[];
  layout?: 'row' | 'grid';
  animateOnScroll?: boolean;
  duration?: number;
}
