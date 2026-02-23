/**
 * MediaGallery -- Content Component (CTN-03)
 *
 * Image/video gallery with grid, masonry, and carousel layouts.
 * Lightbox mode opens items in a Modal overlay.
 * Carousel uses CSS scroll-snap (no external library).
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useTheme, Modal } from '../../foundation';
import type { MediaGalleryConfig, MediaItem } from './types';

const COL_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function MediaThumbnail({
  item,
  onClick,
}: {
  item: MediaItem;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative group overflow-hidden rounded-xl bg-surface-alt aspect-video w-full text-left"
    >
      {item.type === 'image' ? (
        <img
          src={item.thumbnail || item.src}
          alt={item.caption || ''}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <video
          src={item.thumbnail || item.src}
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}
      {item.caption && (
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors flex items-end p-4">
          <span className="text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {item.caption}
          </span>
        </div>
      )}
    </button>
  );
}

function LightboxContent({
  item,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  item: MediaItem;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center gap-4">
      {item.type === 'image' ? (
        <img
          src={item.src}
          alt={item.caption || ''}
          className="max-h-[75vh] max-w-full object-contain rounded-lg"
        />
      ) : (
        <video
          src={item.src}
          controls
          autoPlay
          className="max-h-[75vh] max-w-full rounded-lg"
        />
      )}
      {item.caption && (
        <p className="text-sm text-muted text-center">{item.caption}</p>
      )}
      <div className="flex gap-4">
        {hasPrev && (
          <button
            onClick={onPrev}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
          >
            &larr; Prev
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
          >
            Next &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

function CarouselLayout({
  items,
  onItemClick,
}: {
  items: MediaItem[];
  onItemClick?: (index: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0 w-[80%] sm:w-[45%] lg:w-[30%]"
          >
            <MediaThumbnail
              item={item}
              onClick={onItemClick ? () => onItemClick(i) : undefined}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur border border-border rounded-full flex items-center justify-center text-foreground hover:bg-surface transition-colors"
      >
        &larr;
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 backdrop-blur border border-border rounded-full flex items-center justify-center text-foreground hover:bg-surface transition-colors"
      >
        &rarr;
      </button>
    </div>
  );
}

export default function MediaGallery({ config }: { config: MediaGalleryConfig }) {
  useTheme();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    if (!config.filterByCategory) return [];
    const cats = new Set<string>();
    config.items.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [config.items, config.filterByCategory]);

  const filtered = activeCategory
    ? config.items.filter((item) => item.category === activeCategory)
    : config.items;

  const cols = config.columns || 3;
  const openLightbox = config.lightbox
    ? (i: number) => setLightboxIndex(i)
    : undefined;

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {config.layout === 'carousel' ? (
          <CarouselLayout items={filtered} onItemClick={openLightbox} />
        ) : (
          <div
            className={`grid ${COL_CLASSES[cols] || COL_CLASSES[3]} gap-4 ${
              config.layout === 'masonry' ? '[&>*:nth-child(odd)]:mt-8' : ''
            }`}
          >
            {filtered.map((item, i) => (
              <MediaThumbnail
                key={i}
                item={item}
                onClick={openLightbox ? () => openLightbox(i) : undefined}
              />
            ))}
          </div>
        )}

        {lightboxIndex !== null && (
          <Modal open={lightboxIndex !== null} onClose={() => setLightboxIndex(null)} maxWidth="max-w-4xl">
            <LightboxContent
              item={filtered[lightboxIndex]}
              hasPrev={lightboxIndex > 0}
              hasNext={lightboxIndex < filtered.length - 1}
              onPrev={() => setLightboxIndex((p) => Math.max(0, (p ?? 0) - 1))}
              onNext={() =>
                setLightboxIndex((p) =>
                  Math.min(filtered.length - 1, (p ?? 0) + 1),
                )
              }
            />
          </Modal>
        )}
      </div>
    </section>
  );
}

export type { MediaGalleryConfig, MediaItem } from './types';
