export interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  caption?: string;
  category?: string;
}

export interface MediaGalleryConfig {
  items: MediaItem[];
  layout: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4;
  lightbox?: boolean;
  filterByCategory?: boolean;
}
