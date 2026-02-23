/**
 * ContactForm -- Communication Component (CMM-01)
 *
 * Name/email/phone/message form with validation, honeypot spam protection.
 * Uses FormsEngine from foundation for form rendering.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../foundation';
import type { ContactFormConfig } from './types';

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  subject: 'Subject',
  message: 'Message',
};

const FIELD_TYPES: Record<string, string> = {
  name: 'text',
  email: 'email',
  phone: 'tel',
  company: 'text',
  subject: 'text',
  message: 'textarea',
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  name: 'Your name',
  email: 'you@example.com',
  phone: '+1 (555) 000-0000',
  company: 'Your company',
  subject: 'How can we help?',
  message: 'Tell us more...',
};

export default function ContactForm({ config }: { config: ContactFormConfig }) {
  useTheme();

  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    config.fields.forEach((f) => { v[f] = ''; });
    return v;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const requiredFields = config.requiredFields ?? config.fields.filter((f) => f === 'name' || f === 'email');

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((f) => {
      if (!values[f]?.trim()) {
        newErrors[f] = `${FIELD_LABELS[f]} is required`;
      }
    });
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, requiredFields]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (config.honeypot !== false && honeypotRef.current?.value) {
      // Bot detected — silently pretend success
      setSubmitted(true);
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      await config.onSubmit(values);
      setSubmitted(true);
    } catch {
      // Let parent handle errors
    } finally {
      setSubmitting(false);
    }
  }, [values, validate, config]);

  if (submitted) {
    return (
      <div className="bg-background border border-border rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          {config.successMessage ?? 'Message sent!'}
        </h3>
        <p className="text-sm text-muted">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      {config.headline && (
        <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
          {config.headline}
        </h2>
      )}
      {config.description && (
        <p className="text-sm text-muted mb-6">{config.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot — hidden from real users */}
        {config.honeypot !== false && (
          <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <input
              ref={honeypotRef}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.fields.map((field) => {
            const isRequired = requiredFields.includes(field);
            const isTextarea = FIELD_TYPES[field] === 'textarea';

            return (
              <div key={field} className={isTextarea ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {FIELD_LABELS[field]}{isRequired && ' *'}
                </label>
                {isTextarea ? (
                  <textarea
                    value={values[field]}
                    onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                    placeholder={FIELD_PLACEHOLDERS[field]}
                    rows={4}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                ) : (
                  <input
                    type={FIELD_TYPES[field]}
                    value={values[field]}
                    onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                    placeholder={FIELD_PLACEHOLDERS[field]}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
                {errors[field] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Sending...' : config.submitLabel ?? 'Send Message'}
        </button>
      </form>
    </div>
  );
}

export type { ContactFormConfig } from './types';
