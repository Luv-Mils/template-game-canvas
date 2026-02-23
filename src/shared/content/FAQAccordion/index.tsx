/**
 * FAQAccordion -- Content Component (CTN-05)
 *
 * Expandable FAQ with smooth height animation, optional search filter,
 * category grouping, and configurable single/multi-open behavior.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../../foundation';
import type { FAQConfig, FAQItem } from './types';

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-foreground font-medium pr-4 group-hover:text-primary transition-colors">
          {item.question}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      <div
        style={{ maxHeight: height }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div ref={contentRef} className="pb-5 text-sm text-muted leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQAccordion({ config }: { config: FAQConfig }) {
  useTheme();

  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return config.items;
    const q = search.toLowerCase();
    return config.items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [config.items, search]);

  const grouped = useMemo(() => {
    if (!config.groupByCategory) return null;
    const groups: Record<string, FAQItem[]> = {};
    filtered.forEach((item) => {
      const cat = item.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filtered, config.groupByCategory]);

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!config.allowMultipleOpen) next.clear();
        next.add(index);
      }
      return next;
    });
  };

  // Map filtered items back to their global index for open state tracking
  const globalIndex = (item: FAQItem) => config.items.indexOf(item);

  const renderItems = (items: FAQItem[]) =>
    items.map((item) => {
      const idx = globalIndex(item);
      return (
        <AccordionItem
          key={idx}
          item={item}
          isOpen={openItems.has(idx)}
          onToggle={() => toggle(idx)}
        />
      );
    });

  return (
    <section className="py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.headline && (
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-12">
            {config.headline}
          </h2>
        )}

        {config.searchable && (
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}

        {grouped ? (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-8">
              <h3 className="text-sm font-heading font-semibold text-primary uppercase tracking-wider mb-4">
                {category}
              </h3>
              {renderItems(items)}
            </div>
          ))
        ) : (
          <div>{renderItems(filtered)}</div>
        )}

        {filtered.length === 0 && (
          <p className="text-center text-muted py-8">
            No matching questions found.
          </p>
        )}
      </div>
    </section>
  );
}

export type { FAQConfig, FAQItem } from './types';
