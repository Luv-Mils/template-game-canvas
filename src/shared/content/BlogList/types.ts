export interface BlogAuthor {
  name: string;
  avatar?: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  thumbnail?: string;
  date: string;
  author?: BlogAuthor;
  category?: string;
  href: string;
}

export interface BlogListConfig {
  headline?: string;
  posts: BlogPost[];
  layout: 'grid' | 'list' | 'featured';
  columns?: 2 | 3;
  showCategories?: boolean;
}
