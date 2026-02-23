/**
 * FormsEngine — Foundation Component (FND-06)
 *
 * Reusable form system for ALL templates:
 * - Config-driven form generation from field definitions
 * - Built-in validation (required, pattern, email format)
 * - Themed input primitives (Input, Textarea, Select)
 * - Responsive grid layout (1 or 2 columns)
 *
 * Usage:
 *   <Form config={{
 *     fields: [
 *       { name: 'email', label: 'Email', type: 'email', required: true },
 *       { name: 'message', label: 'Message', type: 'textarea', rows: 4 },
 *     ],
 *     submitLabel: 'Send Message',
 *     onSubmit: (data) => console.log(data),
 *     columns: 2,
 *   }} />
 *
 * Or use primitives directly:
 *   <Input name="email" label="Email" value={val} onChange={setVal} />
 */

import React, { useState } from 'react';
import type { FormConfig, FormField } from './types';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';

function validateField(field: FormField, value: string): string | undefined {
  if (field.required && !value.trim()) {
    return field.errorMessage ?? `${field.label} is required`;
  }
  if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return field.errorMessage ?? 'Please enter a valid email address';
  }
  if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
    return field.errorMessage ?? `${field.label} is not valid`;
  }
  return undefined;
}

interface FormProps {
  config: FormConfig;
  /** Optional className for the form wrapper */
  className?: string;
}

export function Form({ config, className }: FormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of config.fields) init[f.name] = '';
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    for (const field of config.fields) {
      const err = validateField(field, values[field.name] ?? '');
      if (err) newErrors[field.name] = err;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await config.onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const cols = config.columns ?? 1;
  const gridClass = cols === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-6';

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={gridClass}>
        {config.fields.map((field) => {
          const spanClass = cols === 2 && field.colSpan === 2 ? 'sm:col-span-2' : '';
          const value = values[field.name] ?? '';
          const error = errors[field.name];

          if (field.type === 'textarea') {
            return (
              <div key={field.name} className={spanClass}>
                <Textarea
                  name={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows}
                  value={value}
                  onChange={(v) => setValue(field.name, v)}
                  error={error}
                />
              </div>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.name} className={spanClass}>
                <Select
                  name={field.name}
                  label={field.label}
                  options={field.options ?? []}
                  required={field.required}
                  value={value}
                  onChange={(v) => setValue(field.name, v)}
                  error={error}
                />
              </div>
            );
          }

          return (
            <div key={field.name} className={spanClass}>
              <Input
                name={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                value={value}
                onChange={(v) => setValue(field.name, v)}
                error={error}
              />
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full px-8 py-4 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending...' : config.submitLabel}
      </button>
    </form>
  );
}

// Re-export primitives for direct use
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Select } from './Select';
export type { FormConfig, FormField, FieldType, SelectOption, InputProps, TextareaProps, SelectProps } from './types';
