/**
 * AISearchBar -- AI & Integration Component (AII-02)
 *
 * Search input with AI-powered suggestions, recent searches,
 * keyboard navigation, and Cmd+K hotkey to focus.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { AISearchBarConfig } from './types';

// -- Icons (inline SVG) -------------------------------------------------------

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}

// -- Main Component -----------------------------------------------------------

export default function AISearchBar({ config }: { config: AISearchBarConfig }) {
  useTheme();

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Hotkey (Cmd+K / Ctrl+K)
  useEffect(() => {
    const hotkey = config.hotkey ?? 'k';
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === hotkey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [config.hotkey]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) return;
    debounceRef.current = setTimeout(() => {
      config.onSearch(query.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, config.onSearch]);

  // Build dropdown items
  const items: Array<{ text: string; type: 'recent' | 'suggested' | 'ai'; icon: React.ReactNode }> = [];

  if (!query.trim() && config.recentSearches) {
    for (const search of config.recentSearches.slice(0, 5)) {
      items.push({ text: search, type: 'recent', icon: <ClockIcon /> });
    }
  }

  if (config.suggestions) {
    for (const s of config.suggestions) {
      items.push({
        text: s.text,
        type: s.type ?? 'suggested',
        icon: s.type === 'ai' ? <SparkleIcon /> : <SearchIcon />,
      });
    }
  }

  const showDropdown = isFocused && items.length > 0;

  const handleSelect = useCallback(
    (text: string) => {
      setQuery(text);
      config.onSuggestionSelect?.(text);
      config.onSearch(text);
      setIsFocused(false);
    },
    [config],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) {
        if (e.key === 'Enter') {
          config.onSearch(query.trim());
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSelect(items[selectedIndex].text);
        } else {
          config.onSearch(query.trim());
          setIsFocused(false);
        }
      } else if (e.key === 'Escape') {
        setIsFocused(false);
      }
    },
    [showDropdown, items, selectedIndex, query, config, handleSelect],
  );

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const variant = config.variant ?? 'default';
  const isMinimal = variant === 'minimal';

  return (
    <div className="relative">
      {/* Input */}
      <div className={`flex items-center gap-2 ${
        isMinimal
          ? 'border-b border-border'
          : 'border border-border rounded-lg bg-surface'
      } px-3 py-2`}>
        <span className="text-muted"><SearchIcon /></span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={config.placeholder ?? `Search... (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl+'}${config.hotkey ?? 'K'})`}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
        {config.isLoading && (
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl z-50 py-1 max-h-[240px] overflow-y-auto">
          {items.map((item, i) => (
            <button
              key={`${item.type}-${item.text}-${i}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item.text)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                selectedIndex === i ? 'bg-primary/10' : 'hover:bg-surface'
              }`}
            >
              <span className="text-muted flex-shrink-0">{item.icon}</span>
              <span className="text-sm text-foreground truncate">{item.text}</span>
              {item.type === 'ai' && (
                <span className="ml-auto text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  AI
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type { AISearchBarConfig, SearchSuggestion } from './types';
