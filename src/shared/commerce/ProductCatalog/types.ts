export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category?: string;
  tags?: string[];
  rating?: number;
  inStock?: boolean;
  description?: string;
  badge?: string;
}

export interface ProductCatalogConfig {
  products: Product[];
  layout: 'grid' | 'list';
  columns?: 2 | 3 | 4;
  showFilter?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  currency?: string;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}
