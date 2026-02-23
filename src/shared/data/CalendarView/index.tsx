/**
 * CalendarView -- Data Component (DAT-03)
 *
 * Month / week / day views with native Date math, event rendering,
 * navigation (prev/next/today), view switcher. No date libraries.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { CalendarViewConfig, CalendarEvent } from './types';

// -- Date Helpers (native Date, no libraries) ---------------------------------

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function getWeekNumber(d: Date): number {
  const temp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number, firstDay: 0 | 1): Date[] {
  const first = new Date(year, month, 1);
  let startDow = first.getDay() - firstDay;
  if (startDow < 0) startDow += 7;
  const start = addDays(first, -startDow);

  const days: Date[] = [];
  const d = new Date(start);
  // Always show 6 weeks (42 days) for consistent grid height
  for (let i = 0; i < 42; i++) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getWeekDays(date: Date, firstDay: 0 | 1): Date[] {
  let dow = date.getDay() - firstDay;
  if (dow < 0) dow += 7;
  const weekStart = addDays(date, -dow);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function getHourSlots(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

// -- Event positioning --------------------------------------------------------

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((ev) => {
    const evStart = startOfDay(new Date(ev.start));
    const evEnd = ev.end ? startOfDay(new Date(ev.end)) : evStart;
    const d = startOfDay(day);
    return d >= evStart && d <= evEnd;
  });
}

function getEventsForHour(events: CalendarEvent[], day: Date, hour: number): CalendarEvent[] {
  return events.filter((ev) => {
    if (ev.allDay) return false;
    const evStart = new Date(ev.start);
    if (!isSameDay(evStart, day)) return false;
    return evStart.getHours() === hour;
  });
}

// -- Sub-components -----------------------------------------------------------

function MonthView({
  currentDate,
  events,
  firstDay,
  showWeekNumbers,
  onEventClick,
  onDateClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  firstDay: 0 | 1;
  showWeekNumbers: boolean;
  onEventClick?: (ev: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
}) {
  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth(), firstDay);
  const today = startOfDay(new Date());
  const dayHeaders = firstDay === 1
    ? [...DAY_NAMES_SHORT.slice(1), DAY_NAMES_SHORT[0]]
    : DAY_NAMES_SHORT;

  return (
    <div>
      {/* Day headers */}
      <div className={`grid ${showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'} border-b border-border`}>
        {showWeekNumbers && <div className="px-2 py-2 text-xs text-muted text-center">Wk</div>}
        {dayHeaders.map((d) => (
          <div key={d} className="px-2 py-2 text-xs font-semibold text-muted text-center uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className={`grid ${showWeekNumbers ? 'grid-cols-8' : 'grid-cols-7'}`}>
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, today);
          const dayEvents = getEventsForDay(events, day);
          const showWeekNum = showWeekNumbers && i % 7 === 0;

          return (
            <React.Fragment key={i}>
              {showWeekNum && (
                <div className="px-2 py-1 text-xs text-muted text-center border-r border-border flex items-start justify-center pt-2">
                  {getWeekNumber(day)}
                </div>
              )}
              <div
                className={`min-h-[80px] p-1 border-b border-r border-border cursor-pointer hover:bg-surface/50 transition-colors ${
                  !isCurrentMonth ? 'opacity-40' : ''
                }`}
                onClick={() => onDateClick?.(formatDate(day))}
              >
                <div className={`text-sm mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-primary text-white font-bold' : 'text-foreground'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                      className="block w-full text-left px-1.5 py-0.5 text-xs rounded truncate text-white"
                      style={{ backgroundColor: ev.color || 'var(--color-primary, #3b82f6)' }}
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted px-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  currentDate,
  events,
  firstDay,
  onEventClick,
  onDateClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  firstDay: 0 | 1;
  onEventClick?: (ev: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
}) {
  const weekDays = getWeekDays(currentDate, firstDay);
  const hours = getHourSlots();
  const today = startOfDay(new Date());

  return (
    <div className="overflow-auto max-h-[600px]">
      {/* Day headers */}
      <div className="grid grid-cols-8 sticky top-0 z-10 bg-surface border-b border-border">
        <div className="px-2 py-2 text-xs text-muted border-r border-border" />
        {weekDays.map((day) => (
          <div
            key={formatDate(day)}
            className={`px-2 py-2 text-center border-r border-border ${
              isSameDay(day, today) ? 'bg-primary/10' : ''
            }`}
          >
            <div className="text-xs text-muted">{DAY_NAMES_SHORT[day.getDay()]}</div>
            <div className={`text-lg font-semibold ${isSameDay(day, today) ? 'text-primary' : 'text-foreground'}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      {hours.map((hour) => (
        <div key={hour} className="grid grid-cols-8 border-b border-border min-h-[48px]">
          <div className="px-2 py-1 text-xs text-muted text-right border-r border-border">
            {formatHour(hour)}
          </div>
          {weekDays.map((day) => {
            const hourEvents = getEventsForHour(events, day, hour);
            return (
              <div
                key={formatDate(day)}
                className="border-r border-border p-0.5 cursor-pointer hover:bg-surface/50"
                onClick={() => onDateClick?.(formatDate(day))}
              >
                {hourEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                    className="block w-full text-left px-1.5 py-0.5 text-xs rounded truncate text-white mb-0.5"
                    style={{ backgroundColor: ev.color || 'var(--color-primary, #3b82f6)' }}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function DayView({
  currentDate,
  events,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (ev: CalendarEvent) => void;
}) {
  const hours = getHourSlots();
  const allDayEvents = events.filter((ev) => {
    const evStart = startOfDay(new Date(ev.start));
    return isSameDay(evStart, startOfDay(currentDate)) && ev.allDay;
  });

  return (
    <div className="overflow-auto max-h-[600px]">
      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="px-4 py-2 border-b border-border bg-surface">
          <div className="text-xs text-muted mb-1">All Day</div>
          <div className="flex flex-wrap gap-1">
            {allDayEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => onEventClick?.(ev)}
                className="px-2 py-1 text-xs rounded text-white"
                style={{ backgroundColor: ev.color || 'var(--color-primary, #3b82f6)' }}
              >
                {ev.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time slots */}
      {hours.map((hour) => {
        const hourEvents = getEventsForHour(events, currentDate, hour);
        return (
          <div key={hour} className="flex border-b border-border min-h-[48px]">
            <div className="w-20 px-3 py-1 text-xs text-muted text-right border-r border-border flex-shrink-0">
              {formatHour(hour)}
            </div>
            <div className="flex-1 p-0.5">
              {hourEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => onEventClick?.(ev)}
                  className="block w-full text-left px-2 py-1 text-sm rounded text-white mb-0.5"
                  style={{ backgroundColor: ev.color || 'var(--color-primary, #3b82f6)' }}
                >
                  <span className="font-medium">{ev.title}</span>
                  {ev.description && <span className="ml-2 opacity-80 text-xs">{ev.description}</span>}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function CalendarView({ config }: { config: CalendarViewConfig }) {
  useTheme();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>(config.view);
  const firstDay = config.firstDayOfWeek ?? 0;

  const navigate = useCallback((dir: -1 | 0 | 1) => {
    if (dir === 0) {
      setCurrentDate(new Date());
      return;
    }
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'month') {
        d.setMonth(d.getMonth() + dir);
      } else if (view === 'week') {
        d.setDate(d.getDate() + dir * 7);
      } else {
        d.setDate(d.getDate() + dir);
      }
      return d;
    });
  }, [view]);

  const headerText = useMemo(() => {
    if (view === 'month') {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (view === 'week') {
      const weekDays = getWeekDays(currentDate, firstDay);
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [currentDate, view, firstDay]);

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-2 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-alt transition-colors text-foreground"
          >
            ‹
          </button>
          <button
            onClick={() => navigate(0)}
            className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-alt transition-colors text-foreground"
          >
            Today
          </button>
          <button
            onClick={() => navigate(1)}
            className="px-2 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-alt transition-colors text-foreground"
          >
            ›
          </button>
          <h2 className="text-lg font-heading font-semibold text-foreground ml-4">
            {headerText}
          </h2>
        </div>

        {/* View switcher */}
        <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                view === v
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-surface-alt'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Body */}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={config.events}
          firstDay={firstDay}
          showWeekNumbers={config.showWeekNumbers ?? false}
          onEventClick={config.onEventClick}
          onDateClick={config.onDateClick}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={config.events}
          firstDay={firstDay}
          onEventClick={config.onEventClick}
          onDateClick={config.onDateClick}
        />
      )}
      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          events={config.events}
          onEventClick={config.onEventClick}
        />
      )}
    </div>
  );
}

export type { CalendarViewConfig, CalendarEvent } from './types';
