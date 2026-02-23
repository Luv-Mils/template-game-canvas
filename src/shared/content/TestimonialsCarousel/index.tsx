/**
 * TestimonialsCarousel -- Content Component (CTN-04)
 *
 * Customer testimonials with carousel, grid, and single-featured layouts.
 * Carousel uses CSS scroll-snap. Star ratings via filled/empty SVGs.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../foundation';
import type { TestimonialsConfig, TestimonialItem } from './types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-accent' : 'text-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="p-6 bg-surface rounded-xl border border-border flex flex-col gap-4">
      {item.rating != null && <StarRating rating={item.rating} />}
      <blockquote className="text-foreground leading-relaxed flex-1">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3 pt-2">
        {item.author.avatar ? (
          <img
            src={item.author.avatar}
            alt={item.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {item.author.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {item.author.name}
          </p>
          {(item.author.role || item.author.company) && (
            <p className="text-xs text-muted">
              {[item.author.role, item.author.company]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CarouselLayout({
  items,
  autoRotate,
  interval,
}: {
  items: TestimonialItem[];
  autoRotate?: boolean;
  interval: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % items.length;
        scrollRef.current?.children[next]?.scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
          block: 'nearest',
        });
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [autoRotate, interval, items.length]);

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0 w-[85%] sm:w-[45%] lg:w-[32%]"
          >
            <TestimonialCard item={item} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveIndex(i);
              scrollRef.current?.children[i]?.scrollIntoView({
                behavior: 'smooth',
                inline: 'start',
                block: 'nearest',
              });
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === activeIndex ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SingleFeatured({ items }: { items: TestimonialItem[] }) {
  const [active, setActive] = useState(0);
  const item = items[active];
  if (!item) return null;

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="p-8 bg-surface rounded-2xl border border-border">
        {item.rating != null && (
          <div className="flex justify-center mb-4">
            <StarRating rating={item.rating} />
          </div>
        )}
        <blockquote className="text-xl text-foreground leading-relaxed mb-6">
          &ldquo;{item.quote}&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          {item.author.avatar ? (
            <img
              src={item.author.avatar}
              alt={item.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {item.author.name.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold text-foreground">{item.author.name}</p>
            {(item.author.role || item.author.company) && (
              <p className="text-sm text-muted">
                {[item.author.role, item.author.company]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === active ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestimonialsCarousel({
  config,
}: {
  config: TestimonialsConfig;
}) {
  useTheme();

  const interval = config.interval || 5000;

  return (
    <section className="py-20 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.headline && (
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-12">
            {config.headline}
          </h2>
        )}

        {config.layout === 'single-featured' ? (
          <SingleFeatured items={config.items} />
        ) : config.layout === 'carousel' ? (
          <CarouselLayout
            items={config.items}
            autoRotate={config.autoRotate}
            interval={interval}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.items.map((item, i) => (
              <TestimonialCard key={i} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export type { TestimonialsConfig, TestimonialItem, TestimonialAuthor } from './types';
