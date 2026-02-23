/**
 * ProductCatalog -- Commerce Component (COM-01)
 *
 * Product grid/list with filters, categories, search, sort.
 * Image hover swap, badges, rating stars, add to cart.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { ProductCatalogConfig, Product } from './types';

// -- Rating Stars -------------------------------------------------------------

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-muted/30'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-muted ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// -- Product Card (Grid) ------------------------------------------------------

function ProductCard({
  product,
  currency,
  onClick,
  onAddToCart,
}: {
  product: Product;
  currency: string;
  onClick?: (p: Product) => void;
  onAddToCart?: (p: Product) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hoverImage = product.images?.[1];
  const displayImage = hovered && hoverImage ? hoverImage : product.image;
  const inStock = product.inStock !== false;

  return (
    <div
      className={`bg-background border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${!inStock ? 'opacity-60' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(product)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-surface overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        {product.badge && (
          <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded ${
            product.badge === 'Sold Out' ? 'bg-red-500 text-white' : 'bg-primary text-white'
          }`}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
        {product.category && (
          <span className="text-xs text-muted">{product.category}</span>
        )}

        {product.rating != null && (
          <div className="mt-1">
            <RatingStars rating={product.rating} />
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-foreground">{currency}{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted line-through">{currency}{product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {onAddToCart && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            disabled={!inStock}
            className="mt-3 w-full px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors"
          >
            {inStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        )}
      </div>
    </div>
  );
}

// -- Product Row (List) -------------------------------------------------------

function ProductRow({
  product,
  currency,
  onClick,
  onAddToCart,
}: {
  product: Product;
  currency: string;
  onClick?: (p: Product) => void;
  onAddToCart?: (p: Product) => void;
}) {
  const inStock = product.inStock !== false;

  return (
    <div
      className={`flex gap-4 p-4 bg-background border border-border rounded-xl hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${!inStock ? 'opacity-60' : ''}`}
      onClick={() => onClick?.(product)}
    >
      <div className="relative w-32 h-32 bg-surface rounded-lg overflow-hidden flex-shrink-0">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        {product.badge && (
          <span className={`absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold rounded ${
            product.badge === 'Sold Out' ? 'bg-red-500 text-white' : 'bg-primary text-white'
          }`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
        {product.category && <span className="text-xs text-muted">{product.category}</span>}
        {product.description && (
          <p className="text-xs text-muted mt-1 line-clamp-2">{product.description}</p>
        )}
        {product.rating != null && <div className="mt-1"><RatingStars rating={product.rating} /></div>}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-foreground">{currency}{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted line-through">{currency}{product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>

      {onAddToCart && (
        <div className="flex items-center">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            disabled={!inStock}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {inStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      )}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function ProductCatalog({ config }: { config: ProductCatalogConfig }) {
  useTheme();

  const currency = config.currency ?? '$';
  const columns = config.columns ?? 3;
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('');

  const categories = useMemo(() => {
    const cats = [...new Set(config.products.map((p) => p.category).filter(Boolean) as string[])];
    return cats;
  }, [config.products]);

  const filtered = useMemo(() => {
    let result = [...config.products];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Category
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
    }

    return result;
  }, [config.products, search, activeCategory, sortBy]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {config.showSearch && (
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
          />
        )}
        <div className="flex-1" />
        {config.showSort && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-foreground"
          >
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
            <option value="rating">Rating</option>
          </select>
        )}
      </div>

      {/* Category pills */}
      {config.showFilter && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              !activeCategory ? 'bg-primary text-white border-primary' : 'border-border text-muted hover:border-primary/40'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                activeCategory === cat ? 'bg-primary text-white border-primary' : 'border-border text-muted hover:border-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products */}
      {config.layout === 'grid' ? (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={currency}
              onClick={config.onProductClick}
              onAddToCart={config.onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              currency={currency}
              onClick={config.onProductClick}
              onAddToCart={config.onAddToCart}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-muted">No products found</div>
      )}
    </div>
  );
}

export type { ProductCatalogConfig, Product } from './types';
