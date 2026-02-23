/**
 * ServicesGrid -- Content Component (CTN-02)
 *
 * Grid of service/feature cards with configurable columns and layout variants.
 * Variants: card (bg-surface cards), minimal (no card bg), icon-left (horizontal).
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type { ServicesGridConfig, ServiceItem } from './types';

const COL_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function CardItem({ item }: { item: ServiceItem }) {
  return (
    <div className="p-6 bg-surface rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all">
      {item.icon && <div className="text-3xl mb-4">{item.icon}</div>}
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
        {item.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed">{item.description}</p>
      {item.link && (
        <a
          href={item.link.href}
          className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {item.link.label} &rarr;
        </a>
      )}
    </div>
  );
}

function MinimalItem({ item }: { item: ServiceItem }) {
  return (
    <div className="py-6">
      {item.icon && <div className="text-3xl mb-4">{item.icon}</div>}
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
        {item.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed">{item.description}</p>
      {item.link && (
        <a
          href={item.link.href}
          className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {item.link.label} &rarr;
        </a>
      )}
    </div>
  );
}

function IconLeftItem({ item }: { item: ServiceItem }) {
  return (
    <div className="flex gap-4">
      {item.icon && (
        <div className="text-3xl flex-shrink-0 mt-1">{item.icon}</div>
      )}
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed">{item.description}</p>
        {item.link && (
          <a
            href={item.link.href}
            className="inline-block mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {item.link.label} &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

export default function ServicesGrid({ config }: { config: ServicesGridConfig }) {
  useTheme();

  const cols = config.columns || 3;
  const variant = config.variant || 'card';
  const ItemComponent =
    variant === 'minimal'
      ? MinimalItem
      : variant === 'icon-left'
        ? IconLeftItem
        : CardItem;

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(config.headline || config.subheadline) && (
          <div className="text-center mb-16">
            {config.headline && (
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                {config.headline}
              </h2>
            )}
            {config.subheadline && (
              <p className="text-lg text-muted max-w-2xl mx-auto">
                {config.subheadline}
              </p>
            )}
          </div>
        )}
        <div className={`grid ${COL_CLASSES[cols] || COL_CLASSES[3]} gap-8`}>
          {config.items.map((item, i) => (
            <ItemComponent key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export type { ServicesGridConfig, ServiceItem } from './types';
