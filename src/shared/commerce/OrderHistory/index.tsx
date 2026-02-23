/**
 * OrderHistory -- Commerce Component (COM-05)
 *
 * Order list with status badges, expandable details, tracking, re-order.
 */

import React, { useState } from 'react';
import { useTheme } from '../../foundation';
import type { OrderHistoryConfig, Order } from './types';

// -- Status Badge -------------------------------------------------------------

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-surface', text: 'text-muted' },
  processing: { bg: 'bg-primary/10', text: 'text-primary' },
  shipped: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  delivered: { bg: 'bg-green-500/10', text: 'text-green-500' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

// -- Order Row ----------------------------------------------------------------

function OrderRow({
  order,
  currency,
  expanded,
  onToggle,
  onReorder,
  onViewDetails,
}: {
  order: Order;
  currency: string;
  expanded: boolean;
  onToggle: () => void;
  onReorder?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}) {
  const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-surface/50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Order #{order.id}</span>
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${style.bg} ${style.text}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div className="text-xs text-muted mt-0.5">
            {new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '}{order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-sm font-semibold text-foreground">
          {currency}{order.total.toFixed(2)}
        </div>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          {/* Items */}
          <div className="space-y-3 py-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-surface flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">{item.name}</div>
                  <div className="text-xs text-muted">Qty: {item.quantity}</div>
                </div>
                <div className="text-sm text-foreground">{currency}{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="flex items-center gap-2 py-2 border-t border-border">
              <span className="text-xs text-muted">Tracking:</span>
              {order.trackingUrl ? (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary-hover"
                >
                  {order.trackingNumber}
                </a>
              ) : (
                <span className="text-xs text-foreground">{order.trackingNumber}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            {onReorder && (
              <button
                onClick={() => onReorder(order.id)}
                className="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Reorder
              </button>
            )}
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(order.id)}
                className="px-4 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function OrderHistory({ config }: { config: OrderHistoryConfig }) {
  useTheme();

  const currency = config.currency ?? '$';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (config.orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">No orders yet</h3>
        <p className="text-sm text-muted">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {config.orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          currency={currency}
          expanded={expandedId === order.id}
          onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
          onReorder={config.onReorder}
          onViewDetails={config.onViewDetails}
        />
      ))}
    </div>
  );
}

export type { OrderHistoryConfig, Order, OrderItem } from './types';
