/**
 * DataTable -- Data Component (DAT-01)
 *
 * Full-featured table: sort, filter, search, pagination, row selection,
 * inline edit, sticky header, virtual scrolling for 10K+ rows.
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../../foundation';
import type { DataTableConfig, DataTableColumn } from './types';

// -- Virtual Scroll -----------------------------------------------------------

const ROW_HEIGHT_NORMAL = 48;
const ROW_HEIGHT_COMPACT = 36;
const VIRTUAL_THRESHOLD = 200;
const BUFFER_ROWS = 10;

function useVirtualScroll(
  rowCount: number,
  rowHeight: number,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const handleScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + BUFFER_ROWS * 2;
  const endIndex = Math.min(rowCount, startIndex + visibleCount);

  return { startIndex, endIndex, totalHeight: rowCount * rowHeight };
}

// -- Sort Indicator -----------------------------------------------------------

function SortArrow({ dir }: { dir: 'asc' | 'desc' | null }) {
  return (
    <span className="inline-block ml-1 w-3">
      {dir === 'asc' && '▲'}
      {dir === 'desc' && '▼'}
    </span>
  );
}

// -- Inline Edit Cell ---------------------------------------------------------

function EditableCell({
  value,
  column,
  onSave,
  onCancel,
}: {
  value: unknown;
  column: DataTableColumn<Record<string, unknown>>;
  onSave: (val: unknown) => void;
  onCancel: () => void;
}) {
  const [editVal, setEditVal] = useState(String(value ?? ''));
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const parsed = column.type === 'number' ? Number(editVal) : editVal;
      onSave(parsed);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (column.type === 'select' && column.options) {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={editVal}
        onChange={(e) => setEditVal(e.target.value)}
        onBlur={() => onSave(editVal)}
        onKeyDown={handleKeyDown}
        className="w-full bg-surface border border-primary rounded px-2 py-1 text-sm text-foreground focus:outline-none"
      >
        {column.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
      value={editVal}
      onChange={(e) => setEditVal(e.target.value)}
      onBlur={() => {
        const parsed = column.type === 'number' ? Number(editVal) : editVal;
        onSave(parsed);
      }}
      onKeyDown={handleKeyDown}
      className="w-full bg-surface border border-primary rounded px-2 py-1 text-sm text-foreground focus:outline-none"
    />
  );
}

// -- Main Component -----------------------------------------------------------

export default function DataTable<T extends Record<string, unknown>>({
  config,
}: {
  config: DataTableConfig<T>;
}) {
  useTheme();

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(config.pageSize || 25);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null);
  const [showFilters, setShowFilters] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Process data: filter → search → sort
  const processed = useMemo(() => {
    let result = [...config.data];

    // Global search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((row) =>
        config.columns.some((col) =>
          String(row[col.key] ?? '').toLowerCase().includes(q),
        ),
      );
    }

    // Per-column filters
    for (const [key, val] of Object.entries(filters)) {
      if (!val) continue;
      const q = val.toLowerCase();
      result = result.filter((row) =>
        String(row[key] ?? '').toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [config.data, config.columns, debouncedSearch, filters, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(processed.length / pageSize);
  const pageData = processed.slice(page * pageSize, (page + 1) * pageSize);

  // Virtual scroll
  const rowHeight = config.compact ? ROW_HEIGHT_COMPACT : ROW_HEIGHT_NORMAL;
  const useVirtual = pageData.length > VIRTUAL_THRESHOLD;
  const { startIndex, endIndex, totalHeight } = useVirtualScroll(
    useVirtual ? pageData.length : 0,
    rowHeight,
    containerRef,
  );

  const visibleRows = useVirtual ? pageData.slice(startIndex, endIndex) : pageData;
  const topPad = useVirtual ? startIndex * rowHeight : 0;
  const bottomPad = useVirtual ? (pageData.length - endIndex) * rowHeight : 0;

  // Handlers
  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === pageData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageData.map((_, i) => i)));
    }
  };

  // Notify selection changes
  useEffect(() => {
    if (config.onSelectionChange) {
      config.onSelectionChange(
        Array.from(selected).map((i) => pageData[i]).filter(Boolean),
      );
    }
  }, [selected]);

  const selectedRows = Array.from(selected).map((i) => pageData[i]).filter(Boolean);
  const cellPad = config.compact ? 'px-3 py-2' : 'px-4 py-3';

  // Empty state
  if (config.data.length === 0 && config.emptyState) {
    const es = config.emptyState;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {es.icon && <div className="text-4xl mb-4">{es.icon}</div>}
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{es.title}</h3>
        {es.description && <p className="text-sm text-muted mb-4">{es.description}</p>}
        {es.action && (
          <button onClick={es.action.onClick} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
            {es.action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Toolbar: search + bulk actions */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
        {config.searchable && (
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
          />
        )}
        <div className="flex-1" />
        {config.actions && selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">{selected.size} selected</span>
            {config.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => action.onClick(selectedRows)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  action.variant === 'danger'
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div ref={containerRef} className="overflow-auto max-h-[600px]">
        <table className="w-full border-collapse">
          <thead className={config.stickyHeader !== false ? 'sticky top-0 z-10' : ''}>
            <tr className="bg-surface">
              {config.selectable && (
                <th className={`${cellPad} w-10`}>
                  <input
                    type="checkbox"
                    checked={selected.size === pageData.length && pageData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
              )}
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  className={`${cellPad} text-left text-xs font-semibold text-muted uppercase tracking-wider`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.sortable ? (
                      <button onClick={() => toggleSort(col.key)} className="hover:text-foreground transition-colors">
                        {col.label}
                        <SortArrow dir={sortKey === col.key ? sortDir : null} />
                      </button>
                    ) : (
                      col.label
                    )}
                    {col.filterable && (
                      <button
                        onClick={() => setShowFilters(showFilters === col.key ? null : col.key)}
                        className="ml-1 text-muted hover:text-foreground"
                      >
                        ▾
                      </button>
                    )}
                  </div>
                  {showFilters === col.key && (
                    <input
                      type="text"
                      placeholder={`Filter ${col.label}...`}
                      value={filters[col.key] || ''}
                      onChange={(e) => {
                        setFilters((f) => ({ ...f, [col.key]: e.target.value }));
                        setPage(0);
                      }}
                      className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topPad > 0 && <tr style={{ height: topPad }}><td colSpan={config.columns.length + (config.selectable ? 1 : 0)} /></tr>}
            {visibleRows.map((row, ri) => {
              const globalIdx = useVirtual ? startIndex + ri : ri;
              const isSelected = selected.has(globalIdx);

              return (
                <tr
                  key={globalIdx}
                  onClick={() => config.onRowClick?.(row)}
                  className={`border-t border-border transition-colors ${
                    config.onRowClick ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-primary/5' : config.striped && globalIdx % 2 === 1 ? 'bg-surface/50' : 'hover:bg-surface/30'}`}
                  style={useVirtual ? { height: rowHeight } : undefined}
                >
                  {config.selectable && (
                    <td className={cellPad} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(globalIdx)}
                        className="rounded border-border"
                      />
                    </td>
                  )}
                  {config.columns.map((col) => {
                    const val = row[col.key];
                    const isEditing = editCell?.row === globalIdx && editCell?.col === col.key;

                    return (
                      <td
                        key={col.key}
                        className={`${cellPad} text-sm text-foreground`}
                        onDoubleClick={() => {
                          if (col.editable) setEditCell({ row: globalIdx, col: col.key });
                        }}
                      >
                        {isEditing ? (
                          <EditableCell
                            value={val}
                            column={col as DataTableColumn<Record<string, unknown>>}
                            onSave={(newVal) => {
                              config.onEdit?.(row, col.key, newVal);
                              setEditCell(null);
                            }}
                            onCancel={() => setEditCell(null)}
                          />
                        ) : col.render ? (
                          col.render(val, row)
                        ) : col.type === 'boolean' ? (
                          val ? '✓' : '✗'
                        ) : (
                          String(val ?? '')
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {bottomPad > 0 && <tr style={{ height: bottomPad }}><td colSpan={config.columns.length + (config.selectable ? 1 : 0)} /></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <span className="text-sm text-muted">
          Showing {processed.length === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, processed.length)} of {processed.length}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="px-2 py-1 text-sm bg-surface border border-border rounded text-foreground"
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm bg-surface border border-border rounded disabled:opacity-40 text-foreground hover:bg-surface-alt transition-colors"
          >
            Prev
          </button>
          <span className="text-sm text-muted">
            {page + 1} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-sm bg-surface border border-border rounded disabled:opacity-40 text-foreground hover:bg-surface-alt transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export type { DataTableConfig, DataTableColumn, DataTableAction, DataTableEmptyState } from './types';
