import React from 'react';
import type { InputProps } from './types';

const INPUT_BASE =
  'w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';

export function Input({ name, label, type = 'text', placeholder, required, value, onChange, error }: InputProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} ${error ? 'border-red-400 focus:ring-red-400/50' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
