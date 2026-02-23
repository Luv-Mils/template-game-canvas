/**
 * CheckoutFlow -- Commerce Component (COM-03)
 *
 * Multi-step checkout: info → shipping → payment → review.
 * Does NOT process real payments — UI flow with paymentElement injection point.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { CheckoutFlowConfig, OrderData, ShippingOption } from './types';

// -- Step Indicator -----------------------------------------------------------

function StepBar({ steps, current }: { steps: string[]; current: number }) {
  const labels: Record<string, string> = {
    info: 'Information',
    shipping: 'Shipping',
    payment: 'Payment',
    review: 'Review',
  };

  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className={`flex items-center gap-1.5 ${i <= current ? 'text-primary' : 'text-muted'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i < current ? 'bg-primary text-white' : i === current ? 'ring-2 ring-primary bg-primary/10' : 'bg-surface'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-sm hidden sm:inline">{labels[step] ?? step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px ${i < current ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// -- Info Step ----------------------------------------------------------------

function InfoStep({
  data,
  onChange,
  errors,
}: {
  data: OrderData['info'];
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}) {
  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone', type: 'tel', required: false },
    { key: 'address', label: 'Address', type: 'text', required: true, full: true },
    { key: 'city', label: 'City', type: 'text', required: true },
    { key: 'zip', label: 'ZIP / Postal Code', type: 'text', required: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
      {fields.map((f) => (
        <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
          <label className="block text-sm font-medium text-foreground mb-1">
            {f.label}{f.required && ' *'}
          </label>
          <input
            type={f.type}
            value={(data as Record<string, string>)[f.key] ?? ''}
            onChange={(e) => onChange(f.key, e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
        </div>
      ))}
    </div>
  );
}

// -- Shipping Step ------------------------------------------------------------

function ShippingStep({
  options,
  selected,
  onSelect,
  currency,
}: {
  options: ShippingOption[];
  selected: string;
  onSelect: (id: string) => void;
  currency: string;
}) {
  return (
    <div className="space-y-3 max-w-lg">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`w-full text-left p-4 rounded-xl border transition-colors ${
            selected === opt.id
              ? 'border-primary bg-primary/5 ring-1 ring-primary'
              : 'border-border hover:border-primary/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{opt.label}</div>
              <div className="text-xs text-muted">{opt.estimate}</div>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {opt.price === 0 ? 'Free' : `${currency}${opt.price.toFixed(2)}`}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// -- Payment Step -------------------------------------------------------------

function PaymentStep({ paymentElement }: { paymentElement?: React.ReactNode }) {
  if (paymentElement) {
    return <div className="max-w-lg">{paymentElement}</div>;
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600">
        Demo mode — no real charges will be made
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Card Number</label>
        <input
          type="text"
          placeholder="4242 4242 4242 4242"
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Expiry</label>
          <input
            type="text"
            placeholder="MM/YY"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">CVC</label>
          <input
            type="text"
            placeholder="123"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
}

// -- Review Step --------------------------------------------------------------

function ReviewStep({
  info,
  shipping,
  cart,
  currency,
  taxRate,
}: {
  info: OrderData['info'];
  shipping?: ShippingOption;
  cart: CheckoutFlowConfig['cart'];
  currency: string;
  taxRate: number;
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shipping?.price ?? 0;
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <div className="text-sm text-muted">{info.name} · {info.email}</div>
        <div className="text-sm text-muted">{info.address}, {info.city} {info.zip}</div>
      </div>

      {shipping && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Shipping</h3>
          <div className="text-sm text-muted">{shipping.label} — {shipping.estimate}</div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Items</h3>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-foreground">{item.name} × {item.quantity}</span>
            <span className="text-foreground">{currency}{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="text-foreground">{currency}{subtotal.toFixed(2)}</span></div>
        {shippingCost > 0 && <div className="flex justify-between text-sm"><span className="text-muted">Shipping</span><span className="text-foreground">{currency}{shippingCost.toFixed(2)}</span></div>}
        {tax > 0 && <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span className="text-foreground">{currency}{tax.toFixed(2)}</span></div>}
        <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">{currency}{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function CheckoutFlow({ config }: { config: CheckoutFlowConfig }) {
  useTheme();

  const currency = config.currency ?? '$';
  const taxRate = config.taxRate ?? 0;
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<OrderData['info']>({
    name: '', email: '', phone: '', address: '', city: '', zip: '',
  });
  const [selectedShipping, setSelectedShipping] = useState(
    config.shippingOptions?.[0]?.id ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingOption = config.shippingOptions?.find((o) => o.id === selectedShipping);

  const validateInfo = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!info.name.trim()) e.name = 'Required';
    if (!info.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) e.email = 'Invalid email';
    if (!info.address.trim()) e.address = 'Required';
    if (!info.city.trim()) e.city = 'Required';
    if (!info.zip.trim()) e.zip = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [info]);

  const canNext = useCallback((): boolean => {
    const s = config.steps[step];
    if (s === 'info') return info.name.trim() !== '' && info.email.trim() !== '';
    if (s === 'shipping') return selectedShipping !== '';
    return true;
  }, [config.steps, step, info, selectedShipping]);

  const handleNext = () => {
    const s = config.steps[step];
    if (s === 'info' && !validateInfo()) return;

    if (step === config.steps.length - 1) {
      const subtotal = config.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * taxRate;
      const shippingCost = shippingOption?.price ?? 0;
      const order: OrderData = {
        info,
        shipping: shippingOption,
        items: config.cart,
        subtotal,
        tax,
        shippingCost,
        total: subtotal + tax + shippingCost,
      };
      config.onComplete?.(order);
      return;
    }
    setStep((s) => s + 1);
  };

  const currentStepId = config.steps[step];

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <StepBar steps={config.steps} current={step} />

      {currentStepId === 'info' && (
        <InfoStep
          data={info}
          onChange={(field, value) => setInfo((prev) => ({ ...prev, [field]: value }))}
          errors={errors}
        />
      )}
      {currentStepId === 'shipping' && config.shippingOptions && (
        <ShippingStep
          options={config.shippingOptions}
          selected={selectedShipping}
          onSelect={setSelectedShipping}
          currency={currency}
        />
      )}
      {currentStepId === 'payment' && (
        <PaymentStep paymentElement={config.paymentElement} />
      )}
      {currentStepId === 'review' && (
        <ReviewStep
          info={info}
          shipping={shippingOption}
          cart={config.cart}
          currency={currency}
          taxRate={taxRate}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-muted hover:text-foreground disabled:opacity-0 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canNext()}
          className="px-6 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors"
        >
          {step === config.steps.length - 1 ? 'Place Order' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export type { CheckoutFlowConfig, OrderData, ShippingOption } from './types';
