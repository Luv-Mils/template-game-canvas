/**
 * CalendarPicker -- Scheduling Component (SCH-03)
 *
 * Compact date picker for forms and booking flows.
 * Single date or date range selection, min/max constraints, disabled dates/days.
 * Native Date math — no date libraries.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { CalendarPickerConfig } from './types';

// -- Date helpers -------------------------------------------------------------

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getMonthGrid(year: number, month: number, firstDay: 0 | 1): Date[] {
  const first = new Date(year, month, 1);
  let startDow = first.getDay() - firstDay;
  if (startDow < 0) startDow += 7;
  const start = addDays(first, -startDow);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

// -- Main Component -----------------------------------------------------------

export default function CalendarPicker({ config }: { config: CalendarPickerConfig }) {
  useTheme();

  const firstDay = config.firstDayOfWeek ?? 0;
  const today = new Date();

  const [viewYear, setViewYear] = useState(() => {
    if (config.selected) {
      const d = typeof config.selected === 'string' ? config.selected : config.selected.start;
      return new Date(d).getFullYear();
    }
    return today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (config.selected) {
      const d = typeof config.selected === 'string' ? config.selected : config.selected.start;
      return new Date(d).getMonth();
    }
    return today.getMonth();
  });

  const [rangeStart, setRangeStart] = useState<string | null>(() => {
    if (config.mode === 'range' && config.selected && typeof config.selected === 'object') {
      return config.selected.start;
    }
    return null;
  });
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const days = useMemo(() => getMonthGrid(viewYear, viewMonth, firstDay), [viewYear, viewMonth, firstDay]);

  const dayHeaders = useMemo(() => {
    if (firstDay === 1) return [...DAY_NAMES.slice(1), DAY_NAMES[0]];
    return DAY_NAMES;
  }, [firstDay]);

  const disabledSet = useMemo(() => new Set(config.disabledDates ?? []), [config.disabledDates]);
  const highlightMap = useMemo(() => {
    const m = new Map<string, { color?: string; label?: string }>();
    (config.highlightedDates ?? []).forEach((h) => m.set(h.date, h));
    return m;
  }, [config.highlightedDates]);

  const isDisabled = useCallback((d: Date): boolean => {
    const ds = formatDate(d);
    if (disabledSet.has(ds)) return true;
    if (config.disabledDays?.includes(d.getDay())) return true;
    if (config.minDate && ds < config.minDate) return true;
    if (config.maxDate && ds > config.maxDate) return true;
    return false;
  }, [disabledSet, config.disabledDays, config.minDate, config.maxDate]);

  const isSelected = useCallback((d: Date): boolean => {
    const ds = formatDate(d);
    if (config.mode === 'single') {
      return typeof config.selected === 'string' && config.selected === ds;
    }
    if (typeof config.selected === 'object' && config.selected) {
      return ds === config.selected.start || ds === config.selected.end;
    }
    return false;
  }, [config.selected, config.mode]);

  const isInRange = useCallback((d: Date): boolean => {
    if (config.mode !== 'range') return false;
    const ds = formatDate(d);

    // Completed range
    if (typeof config.selected === 'object' && config.selected?.start && config.selected?.end) {
      return ds > config.selected.start && ds < config.selected.end;
    }

    // Selecting range (start picked, hovering)
    if (rangeStart && hoverDate) {
      const lo = rangeStart < hoverDate ? rangeStart : hoverDate;
      const hi = rangeStart < hoverDate ? hoverDate : rangeStart;
      return ds > lo && ds < hi;
    }

    return false;
  }, [config.mode, config.selected, rangeStart, hoverDate]);

  const handleClick = useCallback((d: Date) => {
    if (isDisabled(d)) return;
    const ds = formatDate(d);

    if (config.mode === 'single') {
      config.onSelect(ds);
    } else {
      // Range mode
      if (!rangeStart) {
        setRangeStart(ds);
        config.onSelect({ start: ds, end: ds });
      } else {
        const start = rangeStart < ds ? rangeStart : ds;
        const end = rangeStart < ds ? ds : rangeStart;
        config.onSelect({ start, end });
        setRangeStart(null);
        setHoverDate(null);
      }
    }
  }, [config, rangeStart, isDisabled]);

  const navigate = useCallback((dir: -1 | 1) => {
    setViewMonth((m) => {
      const next = m + dir;
      if (next < 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  }, []);

  return (
    <div className="bg-background border border-border rounded-xl p-4 w-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-foreground transition-colors"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface text-foreground transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayHeaders.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const ds = formatDate(day);
          const isCurrentMonth = day.getMonth() === viewMonth;
          const isToday = isSameDay(day, today);
          const sel = isSelected(day);
          const inRange = isInRange(day);
          const disabled = isDisabled(day);
          const highlight = highlightMap.get(ds);

          return (
            <button
              key={i}
              onClick={() => handleClick(day)}
              onMouseEnter={() => {
                if (config.mode === 'range' && rangeStart) setHoverDate(ds);
              }}
              disabled={disabled}
              className={`relative w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                disabled
                  ? 'text-muted/40 cursor-not-allowed'
                  : sel
                    ? 'bg-primary text-white font-bold'
                    : inRange
                      ? 'bg-primary/10 text-foreground'
                      : isToday
                        ? 'ring-1 ring-primary text-primary font-semibold'
                        : isCurrentMonth
                          ? 'text-foreground hover:bg-surface'
                          : 'text-muted/40'
              }`}
              title={highlight?.label}
            >
              {day.getDate()}
              {highlight && (
                <span
                  className="absolute bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: highlight.color || 'var(--color-primary, #3b82f6)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { CalendarPickerConfig } from './types';
