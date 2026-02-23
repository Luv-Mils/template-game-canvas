/**
 * TimelineDisplay -- Content Component (CTN-09)
 *
 * Vertical or horizontal timeline with dates, titles, descriptions.
 * Vertical supports alternating mode (items switch left/right).
 * Horizontal scrolls with CSS scroll-snap.
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type { TimelineConfig, TimelineItem } from './types';

function VerticalTimeline({
  items,
  alternating,
}: {
  items: TimelineItem[];
  alternating?: boolean;
}) {
  return (
    <div className="relative">
      {/* Center line */}
      <div
        className={`absolute top-0 bottom-0 w-px bg-border ${
          alternating ? 'left-1/2 -translate-x-1/2' : 'left-6'
        }`}
      />

      <div className="space-y-12">
        {items.map((item, i) => {
          const isRight = alternating && i % 2 === 1;

          return (
            <div
              key={i}
              className={`relative flex items-start gap-6 ${
                alternating
                  ? isRight
                    ? 'flex-row-reverse text-right'
                    : 'flex-row text-left'
                  : 'flex-row'
              }`}
            >
              {/* Dot */}
              <div
                className={`absolute w-3 h-3 bg-primary rounded-full ring-4 ring-background ${
                  alternating
                    ? 'left-1/2 -translate-x-1/2'
                    : 'left-[1.3rem]'
                } top-1`}
              />

              {/* Spacer for non-alternating */}
              {!alternating && <div className="w-12 flex-shrink-0" />}

              {/* Content */}
              <div
                className={`flex-1 ${
                  alternating ? (isRight ? 'pr-10' : 'pl-10') : ''
                }`}
              >
                <div className="p-6 bg-surface rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon && <span className="text-xl">{item.icon}</span>}
                    <time className="text-xs font-medium text-primary uppercase tracking-wider">
                      {item.date}
                    </time>
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                  {item.media && (
                    <img
                      src={item.media.src}
                      alt={item.title}
                      className="mt-4 rounded-lg w-full object-cover max-h-48"
                    />
                  )}
                </div>
              </div>

              {/* Spacer for alternating */}
              {alternating && <div className="flex-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HorizontalTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative">
      {/* Horizontal line */}
      <div className="absolute top-6 left-0 right-0 h-px bg-border" />

      <div
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, i) => (
          <div key={i} className="snap-start flex-shrink-0 w-72 relative pt-12">
            {/* Dot */}
            <div className="absolute top-[1.1rem] left-6 w-3 h-3 bg-primary rounded-full ring-4 ring-background" />

            <div className="p-5 bg-surface rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <time className="text-xs font-medium text-primary uppercase tracking-wider">
                  {item.date}
                </time>
              </div>
              <h3 className="text-base font-heading font-semibold text-foreground mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {item.description}
              </p>
              {item.media && (
                <img
                  src={item.media.src}
                  alt={item.title}
                  className="mt-3 rounded-lg w-full object-cover max-h-32"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimelineDisplay({
  config,
}: {
  config: TimelineConfig;
}) {
  useTheme();

  return (
    <section className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.headline && (
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-16">
            {config.headline}
          </h2>
        )}

        {config.layout === 'horizontal' ? (
          <HorizontalTimeline items={config.items} />
        ) : (
          <VerticalTimeline
            items={config.items}
            alternating={config.alternating}
          />
        )}
      </div>
    </section>
  );
}

export type { TimelineConfig, TimelineItem } from './types';
