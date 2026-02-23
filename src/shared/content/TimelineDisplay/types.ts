export interface TimelineMedia {
  type: 'image';
  src: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  icon?: string;
  media?: TimelineMedia;
}

export interface TimelineConfig {
  headline?: string;
  items: TimelineItem[];
  layout: 'vertical' | 'horizontal';
  alternating?: boolean;
}
