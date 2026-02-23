/**
 * BlogList -- Content Component (CTN-07)
 *
 * Blog post cards with grid, list, and featured layouts.
 * Featured layout: first post rendered large, rest in a smaller grid.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { BlogListConfig, BlogPost } from './types';

function PostCard({ post, large }: { post: BlogPost; large?: boolean }) {
  return (
    <a
      href={post.href}
      className={`group block bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all ${
        large ? 'md:grid md:grid-cols-2' : ''
      }`}
    >
      {post.thumbnail && (
        <div
          className={`bg-surface-alt overflow-hidden ${large ? 'aspect-[16/10]' : 'aspect-video'}`}
        >
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-xs text-muted">
          {post.category && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">
              {post.category}
            </span>
          )}
          <time>{post.date}</time>
        </div>
        <h3
          className={`font-heading font-bold text-foreground group-hover:text-primary transition-colors ${
            large ? 'text-2xl' : 'text-lg'
          }`}
        >
          {post.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        {post.author && (
          <div className="flex items-center gap-2 pt-2">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {post.author.name.charAt(0)}
              </div>
            )}
            <span className="text-xs text-muted">{post.author.name}</span>
          </div>
        )}
      </div>
    </a>
  );
}

function ListItem({ post }: { post: BlogPost }) {
  return (
    <a
      href={post.href}
      className="group flex gap-6 py-6 border-b border-border hover:bg-surface/50 transition-colors"
    >
      {post.thumbnail && (
        <div className="flex-shrink-0 w-48 aspect-video bg-surface-alt rounded-lg overflow-hidden">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-3 text-xs text-muted">
          {post.category && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">
              {post.category}
            </span>
          )}
          <time>{post.date}</time>
        </div>
        <h3 className="text-lg font-heading font-bold text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      </div>
    </a>
  );
}

export default function BlogList({ config }: { config: BlogListConfig }) {
  useTheme();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    if (!config.showCategories) return [];
    const cats = new Set<string>();
    config.posts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [config.posts, config.showCategories]);

  const filtered = activeCategory
    ? config.posts.filter((p) => p.category === activeCategory)
    : config.posts;

  const cols = config.columns || 3;
  const colClass =
    cols === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.headline && (
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-12">
            {config.headline}
          </h2>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                !activeCategory
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:text-foreground border border-border'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {config.layout === 'list' ? (
          <div className="max-w-4xl mx-auto">
            {filtered.map((post, i) => (
              <ListItem key={i} post={post} />
            ))}
          </div>
        ) : config.layout === 'featured' && filtered.length > 0 ? (
          <div className="space-y-8">
            <PostCard post={filtered[0]} large />
            {filtered.length > 1 && (
              <div className={`grid ${colClass} gap-6`}>
                {filtered.slice(1).map((post, i) => (
                  <PostCard key={i} post={post} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`grid ${colClass} gap-6`}>
            {filtered.map((post, i) => (
              <PostCard key={i} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export type { BlogListConfig, BlogPost, BlogAuthor } from './types';
