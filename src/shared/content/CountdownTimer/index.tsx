/**
 * CountdownTimer -- Content Component (CTN-11)
 *
 * Event countdown with cards, inline, and minimal display variants.
 * Updates every second via setInterval, cleans up on unmount.
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../foundation';
import type { CountdownConfig } from './types';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function CardsVariant({
  time,
  showDays,
  showSeconds,
}: {
  time: TimeLeft;
  showDays: boolean;
  showSeconds: boolean;
}) {
  const units: { label: string; value: number }[] = [];
  if (showDays) units.push({ label: 'Days', value: time.days });
  units.push({ label: 'Hours', value: time.hours });
  units.push({ label: 'Minutes', value: time.minutes });
  if (showSeconds) units.push({ label: 'Seconds', value: time.seconds });

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="w-24 sm:w-28 p-4 bg-surface rounded-xl border border-border text-center"
        >
          <div className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            {pad(unit.value)}
          </div>
          <div className="text-xs text-muted mt-1 uppercase tracking-wider">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function InlineVariant({
  time,
  showDays,
  showSeconds,
}: {
  time: TimeLeft;
  showDays: boolean;
  showSeconds: boolean;
}) {
  const parts: string[] = [];
  if (showDays) parts.push(`${pad(time.days)}d`);
  parts.push(`${pad(time.hours)}h`);
  parts.push(`${pad(time.minutes)}m`);
  if (showSeconds) parts.push(`${pad(time.seconds)}s`);

  return (
    <div className="text-4xl sm:text-5xl font-heading font-bold text-foreground text-center tracking-wider">
      {parts.join(' : ')}
    </div>
  );
}

function MinimalVariant({
  time,
  showDays,
  showSeconds,
}: {
  time: TimeLeft;
  showDays: boolean;
  showSeconds: boolean;
}) {
  const parts: string[] = [];
  if (showDays) parts.push(pad(time.days));
  parts.push(pad(time.hours));
  parts.push(pad(time.minutes));
  if (showSeconds) parts.push(pad(time.seconds));

  return (
    <div className="text-5xl sm:text-6xl font-heading font-bold text-foreground text-center tracking-widest">
      {parts.join(':')}
    </div>
  );
}

export default function CountdownTimer({
  config,
}: {
  config: CountdownConfig;
}) {
  useTheme();

  const [time, setTime] = useState<TimeLeft>(() =>
    calcTimeLeft(config.targetDate),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calcTimeLeft(config.targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.targetDate]);

  const showDays = config.showDays !== false;
  const showSeconds = config.showSeconds !== false;
  const variant = config.variant || 'cards';

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.headline && (
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-12">
            {config.headline}
          </h2>
        )}

        {time.expired ? (
          <p className="text-xl text-muted text-center">
            {config.expiredMessage || 'The countdown has ended.'}
          </p>
        ) : variant === 'inline' ? (
          <InlineVariant
            time={time}
            showDays={showDays}
            showSeconds={showSeconds}
          />
        ) : variant === 'minimal' ? (
          <MinimalVariant
            time={time}
            showDays={showDays}
            showSeconds={showSeconds}
          />
        ) : (
          <CardsVariant
            time={time}
            showDays={showDays}
            showSeconds={showSeconds}
          />
        )}
      </div>
    </section>
  );
}

export type { CountdownConfig } from './types';
