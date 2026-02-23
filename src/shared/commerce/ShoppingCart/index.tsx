/**
 * ShoppingCart -- Commerce Component (COM-02)
 *
 * Slide-out cart panel or full page. Quantity controls, subtotal,
 * promo codes, checkout button.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { ShoppingCartConfig } from './types';

// -- Cart Item Row ------------------------------------------------------------

function CartItemRow({
  item,
  currency,
  onQuantityChange,
  onRemove,
}: {
  item: ShoppingCartConfig['items'][number];
  currency: string;
  onQuantityChange?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border">
      {item.image && (
        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-surface flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">{item.name}</div>
        {item.variant && <div className="text-xs text-muted">{item.variant}</div>}
        <div className="text-sm text-foreground mt-0.5">{currency}{item.price.toFixed(2)}</div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onQuantityChange?.(item.id, Math.max(0, item.quantity - 1))}
          className="w-7 h-7 flex items-center justify-center rounded border border-border text-foreground hover:bg-surface transition-colors text-sm"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
          className="w-7 h-7 flex items-center justify-center rounded border border-border text-foreground hover:bg-surface transition-colors text-sm"
        >
          +
        </button>
      </div>

      {/* Line total */}
      <div className="w-20 text-right text-sm font-semibold text-foreground">
        {currency}{(item.price * item.quantity).toFixed(2)}
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={() => onRemove(item.id)}
          className="text-muted hover:text-red-500 transition-colors text-sm"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// -- Cart Content -------------------------------------------------------------

function CartContent({
  config,
  onClose,
}: {
  config: ShoppingCartConfig;
  onClose?: () => void;
}) {
  const currency = config.currency ?? '$';
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const subtotal = useMemo(
    () => config.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [config.items],
  );

  const discount = useMemo(() => {
    if (!config.promoCode) return 0;
    if (config.promoCode.type === 'percent') return subtotal * (config.promoCode.discount / 100);
    return config.promoCode.discount;
  }, [config.promoCode, subtotal]);

  const tax = (config.taxRate ?? 0) * (subtotal - discount);
  const total = subtotal - discount + tax;

  const handlePromo = useCallback(() => {
    if (promoInput.trim()) {
      config.onPromoApply?.(promoInput.trim());
      setPromoInput('');
      setPromoError('');
    }
  }, [promoInput, config]);

  if (config.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">🛒</div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Your cart is empty</h3>
        <p className="text-sm text-muted">Add some items to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {onClose && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Cart ({config.items.length})
          </h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-lg">✕</button>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-auto px-6">
        {config.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            currency={currency}
            onQuantityChange={config.onQuantityChange}
            onRemove={config.onRemove}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-t border-border space-y-3">
        {/* Promo code */}
        {config.onPromoApply && (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Promo code"
              className="flex-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handlePromo}
              className="px-4 py-1.5 text-sm font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
            >
              Apply
            </button>
          </div>
        )}
        {config.promoCode && (
          <div className="text-xs text-green-500">
            Code "{config.promoCode.code}" applied: {config.promoCode.type === 'percent' ? `${config.promoCode.discount}% off` : `${currency}${config.promoCode.discount} off`}
          </div>
        )}
        {promoError && <div className="text-xs text-red-500">{promoError}</div>}

        {/* Totals */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-foreground">{currency}{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-500">Discount</span>
              <span className="text-green-500">−{currency}{discount.toFixed(2)}</span>
            </div>
          )}
          {config.taxRate != null && config.taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Tax</span>
              <span className="text-foreground">{currency}{tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{currency}{total.toFixed(2)}</span>
          </div>
        </div>

        {config.onCheckout && (
          <button
            onClick={config.onCheckout}
            className="w-full py-3 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Checkout
          </button>
        )}
      </div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function ShoppingCart({ config }: { config: ShoppingCartConfig }) {
  useTheme();

  if (config.variant === 'slideout') {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {}}
        />
        {/* Panel */}
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 shadow-xl">
          <CartContent config={config} onClose={() => {}} />
        </div>
      </>
    );
  }

  // Page variant
  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      <CartContent config={config} />
    </div>
  );
}

export type { ShoppingCartConfig, CartItem, PromoCode } from './types';
