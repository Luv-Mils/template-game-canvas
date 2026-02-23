import React from 'react';

interface GameMenuProps {
  title: string;
  subtitle?: string;
  buttons: Array<{ label: string; onClick: () => void; primary?: boolean }>;
  stats?: Array<{ label: string; value: string | number }>;
  icon?: string;
}

export default function GameMenu({ title, subtitle, buttons, stats, icon }: GameMenuProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        {icon && <div className="text-5xl mb-4">{icon}</div>}
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        {subtitle && <p className="text-muted text-sm mb-6">{subtitle}</p>}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-surface-alt rounded-lg p-3">
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className={
                btn.primary
                  ? 'w-full py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary/80 transition-colors'
                  : 'w-full py-3 rounded-xl font-semibold text-foreground bg-surface-alt hover:bg-border transition-colors'
              }
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
