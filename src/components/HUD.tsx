import React from 'react';

interface HUDProps {
  items: Array<{ label: string; value: string | number; icon?: string }>;
  position?: 'top-left' | 'top-right' | 'bottom-left';
}

export default function HUD({ items, position = 'top-left' }: HUDProps) {
  const pos = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }[position];

  return (
    <div className={`absolute ${pos} pointer-events-none z-10 flex gap-3`}>
      {items.map((item, i) => (
        <div key={i} className="bg-surface/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-2">
          {item.icon && <span className="text-sm">{item.icon}</span>}
          <span className="text-xs text-muted uppercase tracking-wide">{item.label}</span>
          <span className="text-sm font-bold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
