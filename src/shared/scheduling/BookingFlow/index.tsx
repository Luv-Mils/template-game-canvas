/**
 * BookingFlow -- Scheduling Component (SCH-01)
 *
 * Multi-step booking wizard: select service → pick date/time → enter info → confirm.
 * Composes CalendarPicker + AvailabilityPicker internally.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import CalendarPicker from '../CalendarPicker';
import AvailabilityPicker from '../AvailabilityPicker';
import type { BookingFlowConfig, BookingData, BookingService } from './types';

// -- Step Indicator ------------------------------------------------------------

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                i < current
                  ? 'bg-primary text-white'
                  : i === current
                    ? 'bg-primary/10 text-primary ring-2 ring-primary'
                    : 'bg-surface text-muted'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === current ? 'text-foreground font-medium' : 'text-muted'}`}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px ${i < current ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// -- Service Selection --------------------------------------------------------

function ServiceStep({
  services,
  selected,
  onSelect,
  currency,
}: {
  services: BookingService[];
  selected: BookingService | null;
  onSelect: (s: BookingService) => void;
  currency: string;
}) {
  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))];

  return (
    <div className="space-y-3">
      {categories.length > 0 && (
        <div className="text-xs text-muted uppercase tracking-wider mb-2">Services</div>
      )}
      <div className="grid gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              selected?.id === service.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">{service.name}</div>
                {service.description && (
                  <div className="text-xs text-muted mt-0.5">{service.description}</div>
                )}
              </div>
              <div className="text-right">
                {service.price != null && (
                  <div className="text-sm font-semibold text-foreground">
                    {currency}{service.price}
                  </div>
                )}
                <div className="text-xs text-muted">{service.duration} min</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// -- Date/Time Step -----------------------------------------------------------

function DateTimeStep({
  availability,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: {
  availability: BookingFlowConfig['availability'];
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
}) {
  const availableDates = Object.keys(availability);
  const slots = availability[selectedDate] ?? [];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div>
        <CalendarPicker
          config={{
            mode: 'single',
            selected: selectedDate || undefined,
            onSelect: (d) => onDateSelect(d as string),
            disabledDates: [],
            highlightedDates: availableDates.map((d) => ({ date: d })),
          }}
        />
      </div>
      {selectedDate && slots.length > 0 && (
        <div className="flex-1">
          <AvailabilityPicker
            config={{
              date: selectedDate,
              slots,
              onSlotSelect: onTimeSelect,
            }}
          />
        </div>
      )}
      {selectedDate && slots.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-sm text-muted">
          No available slots for this date
        </div>
      )}
    </div>
  );
}

// -- Info Step ----------------------------------------------------------------

function InfoStep({
  data,
  onChange,
}: {
  data: { name: string; email: string; phone: string; notes: string };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>
    </div>
  );
}

// -- Confirm Step -------------------------------------------------------------

function ConfirmStep({
  service,
  date,
  time,
  info,
  currency,
}: {
  service: BookingService;
  date: string;
  time: string;
  info: { name: string; email: string; phone: string; notes: string };
  currency: string;
}) {
  const formatTime = (t: string): string => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-heading font-semibold text-foreground">Booking Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Service</span>
          <span className="text-foreground font-medium">{service.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Duration</span>
          <span className="text-foreground">{service.duration} min</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Date</span>
          <span className="text-foreground">
            {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Time</span>
          <span className="text-foreground">{formatTime(time)}</span>
        </div>
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Name</span>
            <span className="text-foreground">{info.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Email</span>
            <span className="text-foreground">{info.email}</span>
          </div>
          {info.phone && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Phone</span>
              <span className="text-foreground">{info.phone}</span>
            </div>
          )}
        </div>
        {service.price != null && (
          <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{currency}{service.price}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function BookingFlow({ config }: { config: BookingFlowConfig }) {
  useTheme();

  const currency = config.currency ?? '$';
  const steps = config.steps;
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<BookingService | null>(
    config.services.length === 1 ? config.services[0] : null,
  );
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [info, setInfo] = useState({ name: '', email: '', phone: '', notes: '' });

  // Skip service step if only one service
  const effectiveSteps = config.services.length === 1
    ? steps.filter((s) => s !== 'service')
    : steps;

  const canNext = useCallback((): boolean => {
    const step = effectiveSteps[currentStep];
    switch (step) {
      case 'service': return selectedService !== null;
      case 'datetime': return selectedDate !== '' && selectedTime !== '';
      case 'info': return info.name.trim() !== '' && info.email.trim() !== '';
      case 'confirm': return true;
      default: return true;
    }
  }, [effectiveSteps, currentStep, selectedService, selectedDate, selectedTime, info]);

  const handleNext = () => {
    if (currentStep === effectiveSteps.length - 1) {
      // Complete booking
      config.onComplete({
        service: selectedService!,
        date: selectedDate,
        time: selectedTime,
        name: info.name,
        email: info.email,
        phone: info.phone || undefined,
        notes: info.notes || undefined,
      });
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const currentStepId = effectiveSteps[currentStep];

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <StepIndicator steps={effectiveSteps} current={currentStep} />

      {currentStepId === 'service' && (
        <ServiceStep
          services={config.services}
          selected={selectedService}
          onSelect={setSelectedService}
          currency={currency}
        />
      )}

      {currentStepId === 'datetime' && (
        <DateTimeStep
          availability={config.availability}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateSelect={setSelectedDate}
          onTimeSelect={setSelectedTime}
        />
      )}

      {currentStepId === 'info' && (
        <InfoStep
          data={info}
          onChange={(field, value) => setInfo((prev) => ({ ...prev, [field]: value }))}
        />
      )}

      {currentStepId === 'confirm' && selectedService && (
        <ConfirmStep
          service={selectedService}
          date={selectedDate}
          time={selectedTime}
          info={info}
          currency={currency}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm text-muted hover:text-foreground disabled:opacity-0 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canNext()}
          className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors"
        >
          {currentStep === effectiveSteps.length - 1 ? 'Confirm Booking' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export type { BookingFlowConfig, BookingService, BookingData } from './types';
