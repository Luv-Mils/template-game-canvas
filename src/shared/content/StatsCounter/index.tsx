/**
 * StatsCounter -- Content Component (CTN-08)
 *
 * Animated number counters that trigger on scroll via IntersectionObserver.
 * Counts from 0 to target value using requestAnimationFrame. Animates once only.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { StatsCounterConfig, StatItem } from './types';

function AnimatedNumber({
  value,
  duration,
  shouldAnimate,
}: {
  value: number;
  duration: number;
  shouldAnimate: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [shouldAnimate, value, duration]);

  return <>{display}</>;
}

function StatCard({
  item,
  duration,
  shouldAnimate,
}: {
  item: StatItem;
  duration: number;
  shouldAnimate: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-2">
        {item.prefix && <span>{item.prefix}</span>}
        <AnimatedNumber
          value={item.value}
          duration={duration}
          shouldAnimate={shouldAnimate}
        />
        {item.suffix && <span>{item.suffix}</span>}
      </div>
      <p className="text-sm text-muted">{item.label}</p>
    </div>
  );
}

export default function StatsCounter({
  config,
}: {
  config: StatsCounterConfig;
}) {
  useTheme();

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const animate = config.animateOnScroll !== false;
  const duration = config.duration || 2000;

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting) {
        setVisible(true);
      }
    },
    [],
  );

  useEffect(() => {
    if (!animate) {
      setVisible(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onIntersect, {
      threshold: 0.3,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, onIntersect]);

  const isRow = config.layout === 'row';

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={
            isRow
              ? 'flex flex-wrap justify-center gap-12 sm:gap-16'
              : 'grid grid-cols-2 md:grid-cols-4 gap-8'
          }
        >
          {config.items.map((item, i) => (
            <StatCard
              key={i}
              item={item}
              duration={duration}
              shouldAnimate={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export type { StatsCounterConfig, StatItem } from './types';
