import React from 'react';
import type { TextareaProps } from './types';

const TEXTAREA_BASE =
  'w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none';

export function Textarea({ name, label, placeholder, required, rows = 4, value, onChange, error }: TextareaProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${TEXTAREA_BASE} ${error ? 'border-red-400 focus:ring-red-400/50' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
