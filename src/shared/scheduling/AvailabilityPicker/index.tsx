/**
 * AvailabilityPicker -- Scheduling Component (SCH-02)
 *
 * Slot-based time picker showing available/booked/selected states.
 * Two-column layout for AM/PM. Timezone display.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { AvailabilityPickerConfig } from './types';

export default function AvailabilityPicker({ config }: { config: AvailabilityPickerConfig }) {
  useTheme();

  const [selected, setSelected] = useState<string | null>(null);

  const { amSlots, pmSlots } = useMemo(() => {
    const am = config.slots.filter((s) => {
      const hour = parseInt(s.time.split(':')[0], 10);
      return hour < 12;
    });
    const pm = config.slots.filter((s) => {
      const hour = parseInt(s.time.split(':')[0], 10);
      return hour >= 12;
    });
    return { amSlots: am, pmSlots: pm };
  }, [config.slots]);

  const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const handleSelect = (time: string) => {
    setSelected(time);
    config.onSlotSelect(time);
  };

  const renderSlot = (slot: { time: string; available: boolean }) => {
    const isSel = selected === slot.time;
    return (
      <button
        key={slot.time}
        onClick={() => slot.available && handleSelect(slot.time)}
        disabled={!slot.available}
        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
          isSel
            ? 'bg-primary text-white border-primary'
            : slot.available
              ? 'bg-surface border-border text-foreground hover:bg-primary/10 hover:border-primary/40'
              : 'bg-muted/10 border-border text-muted/40 cursor-not-allowed line-through'
        }`}
      >
        {formatTime(slot.time)}
      </button>
    );
  };

  return (
    <div className="bg-background border border-border rounded-xl p-4">
      {/* Timezone */}
      {config.timezone && (
        <div className="text-xs text-muted mb-3">{config.timezone}</div>
      )}

      {/* Date label */}
      <div className="text-sm font-semibold text-foreground mb-4">
        {new Date(config.date).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Morning */}
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Morning</div>
          <div className="flex flex-col gap-2">
            {amSlots.map(renderSlot)}
            {amSlots.length === 0 && (
              <div className="text-xs text-muted py-2">No morning slots</div>
            )}
          </div>
        </div>

        {/* Afternoon */}
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Afternoon</div>
          <div className="flex flex-col gap-2">
            {pmSlots.map(renderSlot)}
            {pmSlots.length === 0 && (
              <div className="text-xs text-muted py-2">No afternoon slots</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { AvailabilityPickerConfig, AvailabilitySlot } from './types';
