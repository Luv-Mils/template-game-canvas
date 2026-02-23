/**
 * RSVPForm -- Communication Component (CMM-06)
 *
 * Event RSVP with guest count, dietary prefs, message, +1 option.
 * Uses foundation inputs for consistent styling.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { RSVPFormConfig, RSVPData } from './types';

export default function RSVPForm({ config }: { config: RSVPFormConfig }) {
  useTheme();

  const [attending, setAttending] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({
    name: '',
    email: '',
    phone: '',
    message: '',
    plusOne: '',
  });
  const [guests, setGuests] = useState(1);
  const [dietary, setDietary] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxGuests = config.maxGuests ?? 10;
  const dietaryOptions = config.dietaryOptions ?? ['Vegetarian', 'Vegan', 'Gluten-free', 'None'];

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = 'Name is required';
    if (!values.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [values]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: RSVPData = {
      attending,
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      guests: attending ? guests : undefined,
      dietary: attending && dietary.length > 0 ? dietary : undefined,
      message: values.message || undefined,
      plusOne: values.plusOne || undefined,
    };
    config.onSubmit(data);
    setSubmitted(true);
  }, [attending, values, guests, dietary, validate, config]);

  if (submitted) {
    return (
      <div className="bg-background border border-border rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">🎉</div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          {config.successMessage ?? (attending ? 'See you there!' : 'Thanks for letting us know')}
        </h3>
        <p className="text-sm text-muted">
          {attending ? `We've confirmed your RSVP for ${config.eventName}.` : 'We understand, maybe next time!'}
        </p>
      </div>
    );
  }

  const activeFields = attending
    ? config.fields
    : config.fields.filter((f) => f === 'name' || f === 'email' || f === 'message');

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <h2 className="text-xl font-heading font-semibold text-foreground mb-1">
        RSVP — {config.eventName}
      </h2>
      {config.eventDate && (
        <p className="text-sm text-muted mb-6">
          {new Date(config.eventDate).toLocaleDateString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          })}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Attending toggle */}
        {config.declineOption && (
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors ${
                attending ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted hover:border-primary/40'
              }`}
            >
              Joyfully Accept
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors ${
                !attending ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'border-border text-muted hover:border-red-500/40'
              }`}
            >
              Regretfully Decline
            </button>
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeFields.includes('name') && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
              <input
                type="text"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          )}

          {activeFields.includes('email') && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
              <input
                type="email"
                value={values.email}
                onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          )}

          {activeFields.includes('phone') && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
              <input
                type="tel"
                value={values.phone}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {activeFields.includes('plusOne') && attending && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Plus One</label>
              <input
                type="text"
                value={values.plusOne}
                onChange={(e) => setValues((v) => ({ ...v, plusOne: e.target.value }))}
                placeholder="Guest name"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
        </div>

        {/* Guest count */}
        {activeFields.includes('guests') && attending && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Number of Guests</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface transition-colors"
              >
                −
              </button>
              <span className="text-lg font-semibold text-foreground w-8 text-center">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Dietary */}
        {activeFields.includes('dietary') && attending && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Dietary Requirements</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setDietary((d) =>
                      d.includes(opt) ? d.filter((x) => x !== opt) : [...d, opt],
                    );
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    dietary.includes(opt)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted hover:border-primary/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        {activeFields.includes('message') && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              rows={3}
              placeholder={attending ? 'Any special requests or notes...' : 'Optional message...'}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          {attending ? 'Confirm RSVP' : 'Send Response'}
        </button>
      </form>
    </div>
  );
}

export type { RSVPFormConfig, RSVPData } from './types';
