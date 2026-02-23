export interface TestimonialAuthor {
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
}

export interface TestimonialItem {
  quote: string;
  author: TestimonialAuthor;
  rating?: number;
}

export interface TestimonialsConfig {
  headline?: string;
  items: TestimonialItem[];
  layout: 'carousel' | 'grid' | 'single-featured';
  autoRotate?: boolean;
  interval?: number;
}
