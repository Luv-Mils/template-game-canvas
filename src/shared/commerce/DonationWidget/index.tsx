/**
 * DonationWidget -- Commerce Component (COM-06)
 *
 * One-time or recurring donation with preset amounts + custom.
 * Card / inline / full-page variants. No real payment processing.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { DonationWidgetConfig } from './types';

export default function DonationWidget({ config }: { config: DonationWidgetConfig }) {
  useTheme();

  const currency = config.currency ?? '$';
  const [selectedAmount, setSelectedAmount] = useState<number | null>(config.presetAmounts[0] ?? null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const finalAmount = isCustom ? Number(customAmount) || 0 : selectedAmount ?? 0;

  const handlePreset = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  }, []);

  const handleCustom = useCallback(() => {
    setIsCustom(true);
    setSelectedAmount(null);
  }, []);

  const handleDonate = useCallback(() => {
    if (finalAmount > 0) {
      config.onDonate?.(finalAmount, isRecurring);
    }
  }, [finalAmount, isRecurring, config]);

  const variant = config.variant ?? 'card';
  const isInline = variant === 'inline';
  const isFullPage = variant === 'full-page';

  const content = (
    <>
      {/* Headline/description */}
      {!isInline && config.headline && (
        <h2 className={`font-heading font-semibold text-foreground ${isFullPage ? 'text-2xl mb-2' : 'text-lg mb-1'}`}>
          {config.headline}
        </h2>
      )}
      {!isInline && config.description && (
        <p className={`text-muted ${isFullPage ? 'text-base mb-6' : 'text-sm mb-4'}`}>{config.description}</p>
      )}

      {/* Amount buttons */}
      <div className={`${isInline ? 'flex items-center gap-2' : 'grid grid-cols-2 gap-2 mb-4'}`}>
        {config.presetAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handlePreset(amount)}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
              !isCustom && selectedAmount === amount
                ? 'bg-primary text-white border-primary ring-2 ring-primary/30'
                : 'border-border text-foreground hover:border-primary/40'
            }`}
          >
            {currency}{amount}
          </button>
        ))}

        {/* Custom amount */}
        {config.allowCustom !== false && (
          isCustom ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">{currency}</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Amount"
                autoFocus
                className="w-full pl-7 pr-3 py-2.5 text-sm border border-primary rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                min={1}
              />
            </div>
          ) : (
            <button
              onClick={handleCustom}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-border text-muted hover:border-primary/40 hover:text-foreground transition-colors"
            >
              Custom
            </button>
          )
        )}
      </div>

      {/* Recurring toggle */}
      {config.recurring && !isInline && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsRecurring(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              !isRecurring ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted'
            }`}
          >
            One-time
          </button>
          <button
            onClick={() => setIsRecurring(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              isRecurring ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted'
            }`}
          >
            Monthly
          </button>
        </div>
      )}

      {/* Payment element slot */}
      {config.paymentElement && !isInline && (
        <div className="mb-4">{config.paymentElement}</div>
      )}

      {/* Donate button */}
      <button
        onClick={handleDonate}
        disabled={finalAmount <= 0}
        className={`font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors ${
          isInline ? 'px-5 py-2.5 text-sm' : 'w-full py-3 text-base'
        }`}
      >
        Donate {finalAmount > 0 ? `${currency}${finalAmount}` : ''}
        {isRecurring ? '/month' : ''}
      </button>
    </>
  );

  if (isInline) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {config.headline && <span className="text-sm font-medium text-foreground mr-2">{config.headline}</span>}
        {content}
      </div>
    );
  }

  return (
    <div className={`bg-background border border-border rounded-xl ${isFullPage ? 'max-w-md mx-auto p-8' : 'p-6'}`}>
      {content}
    </div>
  );
}

export type { DonationWidgetConfig } from './types';
