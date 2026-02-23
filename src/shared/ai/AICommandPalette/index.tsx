/**
 * AICommandPalette -- AI & Integration Component (AII-06)
 *
 * Cmd+K command palette with fuzzy search, recent commands,
 * keyboard navigation, and optional AI action suggestions.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { AICommandPaletteConfig, Command } from './types';

// -- Fuzzy match: all query chars appear in order in the target ---------------

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let score = 0;
  let qi = 0;
  let lastMatchIndex = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 1;
      // Bonus for consecutive matches
      if (lastMatchIndex === ti - 1) score += 2;
      // Bonus for matching at start
      if (ti === 0) score += 3;
      lastMatchIndex = ti;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

// -- Main Component -----------------------------------------------------------

export default function AICommandPalette({ config }: { config: AICommandPaletteConfig }) {
  useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiResults, setAiResults] = useState<Array<{ label: string; action: () => void }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Register Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setAiResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // AI search callback
  useEffect(() => {
    if (!config.onSearch || !query.trim()) {
      setAiResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const results = config.onSearch!(query);
      setAiResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, config.onSearch]);

  // Filter commands
  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show recent commands first, then all
      const recent = config.recentCommands
        ?.map((id) => config.commands.find((c) => c.id === id))
        .filter(Boolean) as Command[] ?? [];
      const rest = config.commands.filter(
        (c) => !config.recentCommands?.includes(c.id),
      );
      return { recent, commands: rest };
    }

    const scored = config.commands
      .map((cmd) => ({
        cmd,
        score: Math.max(
          fuzzyScore(query, cmd.label),
          fuzzyScore(query, cmd.description ?? ''),
        ),
      }))
      .filter((item) => item.score > 0 || fuzzyMatch(query, item.cmd.label))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.cmd);

    return { recent: [], commands: scored };
  }, [query, config.commands, config.recentCommands]);

  const allItems = [...filtered.recent, ...filtered.commands];
  const totalItems = allItems.length + aiResults.length;

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeItem = useCallback(
    (index: number) => {
      if (index < allItems.length) {
        allItems[index].action();
      } else {
        const aiIdx = index - allItems.length;
        aiResults[aiIdx]?.action();
      }
      setOpen(false);
    },
    [allItems, aiResults],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (totalItems > 0) executeItem(selectedIndex);
        return;
      }
    },
    [totalItems, selectedIndex, executeItem],
  );

  if (!open) return null;

  // Group commands by category
  const categories = new Map<string, Command[]>();
  for (const cmd of filtered.commands) {
    const cat = cmd.category ?? 'General';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(cmd);
  }

  let itemIndex = filtered.recent.length; // Start after recent items

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)} />

      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
        {/* Search input */}
        <div className="px-4 py-3 border-b border-border">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder ?? 'Type a command...'}
            className="w-full bg-transparent text-foreground text-sm placeholder:text-muted focus:outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-2">
          {/* Recent commands */}
          {filtered.recent.length > 0 && (
            <>
              <div className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider">
                Recent
              </div>
              {filtered.recent.map((cmd, i) => (
                <CommandItem
                  key={cmd.id}
                  command={cmd}
                  selected={selectedIndex === i}
                  onSelect={() => executeItem(i)}
                />
              ))}
            </>
          )}

          {/* Categorized commands */}
          {Array.from(categories.entries()).map(([category, cmds]) => {
            const startIdx = itemIndex;
            itemIndex += cmds.length;

            return (
              <React.Fragment key={category}>
                <div className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider mt-1">
                  {category}
                </div>
                {cmds.map((cmd, i) => (
                  <CommandItem
                    key={cmd.id}
                    command={cmd}
                    selected={selectedIndex === startIdx + i}
                    onSelect={() => executeItem(startIdx + i)}
                  />
                ))}
              </React.Fragment>
            );
          })}

          {/* AI suggestions */}
          {aiResults.length > 0 && (
            <>
              <div className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider mt-1">
                AI Suggestions
              </div>
              {aiResults.map((result, i) => {
                const idx = allItems.length + i;
                return (
                  <button
                    key={i}
                    onClick={() => executeItem(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      selectedIndex === idx ? 'bg-primary/10' : 'hover:bg-surface'
                    }`}
                  >
                    <span className="text-sm">✨</span>
                    <span className="text-sm text-foreground">{result.label}</span>
                  </button>
                );
              })}
            </>
          )}

          {/* Empty state */}
          {totalItems === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">No results found</div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[10px] text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </>
  );
}

// -- Command item -------------------------------------------------------------

function CommandItem({
  command,
  selected,
  onSelect,
}: {
  command: Command;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
        selected ? 'bg-primary/10' : 'hover:bg-surface'
      }`}
    >
      {command.icon && <span className="text-sm flex-shrink-0">{command.icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">{command.label}</div>
        {command.description && (
          <div className="text-xs text-muted truncate">{command.description}</div>
        )}
      </div>
      {command.shortcut && (
        <span className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded flex-shrink-0">
          {command.shortcut}
        </span>
      )}
    </button>
  );
}

export type { AICommandPaletteConfig, Command } from './types';
