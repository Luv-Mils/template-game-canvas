/**
 * InvoiceGenerator -- Commerce Component (COM-04)
 *
 * Create/view/print professional invoices with line items, tax, totals.
 * Editable mode for editing fields and line items.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { InvoiceGeneratorConfig, Invoice, InvoiceItem } from './types';

// -- Status Badge -------------------------------------------------------------

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-surface text-muted',
  sent: 'bg-primary/10 text-primary',
  paid: 'bg-green-500/10 text-green-500',
  overdue: 'bg-red-500/10 text-red-500',
};

// -- Main Component -----------------------------------------------------------

export default function InvoiceGenerator({ config }: { config: InvoiceGeneratorConfig }) {
  useTheme();

  const currency = config.invoice.currency ?? '$';
  const [invoice, setInvoice] = useState<Invoice>(config.invoice);

  const recalculate = useCallback((items: InvoiceItem[]): Pick<Invoice, 'subtotal' | 'tax' | 'total'> => {
    const subtotal = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
    const tax = items.reduce((s, item) => s + item.quantity * item.unitPrice * (item.tax ?? 0), 0);
    return { subtotal, tax, total: subtotal + tax };
  }, []);

  const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: string | number) => {
    setInvoice((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items, ...recalculate(items) };
    });
  }, [recalculate]);

  const addItem = useCallback(() => {
    setInvoice((prev) => {
      const items = [...prev.items, { description: '', quantity: 1, unitPrice: 0 }];
      return { ...prev, items, ...recalculate(items) };
    });
  }, [recalculate]);

  const removeItem = useCallback((index: number) => {
    setInvoice((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items, ...recalculate(items) };
    });
  }, [recalculate]);

  const handlePrint = useCallback(() => {
    config.onPrint?.();
    window.print();
  }, [config]);

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden print:border-0 print:shadow-none">
      {/* Actions bar (hidden in print) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border print:hidden">
        <div className="flex items-center gap-3">
          {invoice.status && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[invoice.status] ?? ''}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {config.onSave && (
            <button
              onClick={() => config.onSave?.(invoice)}
              className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
            >
              Save
            </button>
          )}
          {config.onSend && (
            <button
              onClick={() => config.onSend?.(invoice)}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Send
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Header: From/To + Invoice info */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
          <div>
            {invoice.from.logo && (
              <img src={invoice.from.logo} alt="" className="h-10 mb-3 object-contain" />
            )}
            <div className="text-sm font-semibold text-foreground">{invoice.from.name}</div>
            {invoice.from.address && <div className="text-xs text-muted whitespace-pre-line">{invoice.from.address}</div>}
            {invoice.from.email && <div className="text-xs text-muted">{invoice.from.email}</div>}
            {invoice.from.phone && <div className="text-xs text-muted">{invoice.from.phone}</div>}
          </div>

          <div className="text-right">
            <div className="text-2xl font-heading font-bold text-foreground mb-2">INVOICE</div>
            <div className="text-sm text-muted">#{invoice.number}</div>
            <div className="text-sm text-muted mt-1">Date: {invoice.date}</div>
            <div className="text-sm text-muted">Due: {invoice.dueDate}</div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Bill To</div>
          <div className="text-sm font-semibold text-foreground">{invoice.to.name}</div>
          {invoice.to.address && <div className="text-xs text-muted whitespace-pre-line">{invoice.to.address}</div>}
          {invoice.to.email && <div className="text-xs text-muted">{invoice.to.email}</div>}
        </div>

        {/* Line Items */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left text-xs font-semibold text-muted uppercase py-2 pr-4">Description</th>
              <th className="text-right text-xs font-semibold text-muted uppercase py-2 w-20">Qty</th>
              <th className="text-right text-xs font-semibold text-muted uppercase py-2 w-28">Unit Price</th>
              <th className="text-right text-xs font-semibold text-muted uppercase py-2 w-28">Amount</th>
              {config.editable && <th className="w-8 print:hidden" />}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-3 pr-4">
                  {config.editable ? (
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(i, 'description', e.target.value)}
                      className="w-full text-sm bg-transparent text-foreground focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm text-foreground">{item.description}</span>
                  )}
                </td>
                <td className="text-right py-3">
                  {config.editable ? (
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                      className="w-16 text-sm text-right bg-transparent text-foreground focus:outline-none"
                      min={1}
                    />
                  ) : (
                    <span className="text-sm text-foreground">{item.quantity}</span>
                  )}
                </td>
                <td className="text-right py-3">
                  {config.editable ? (
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                      className="w-24 text-sm text-right bg-transparent text-foreground focus:outline-none"
                      step={0.01}
                    />
                  ) : (
                    <span className="text-sm text-foreground">{currency}{item.unitPrice.toFixed(2)}</span>
                  )}
                </td>
                <td className="text-right py-3 text-sm font-medium text-foreground">
                  {currency}{(item.quantity * item.unitPrice).toFixed(2)}
                </td>
                {config.editable && (
                  <td className="text-center py-3 print:hidden">
                    <button onClick={() => removeItem(i)} className="text-muted hover:text-red-500 text-xs">✕</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add item (editable mode) */}
        {config.editable && (
          <button
            onClick={addItem}
            className="text-sm text-primary hover:text-primary-hover transition-colors mb-6 print:hidden"
          >
            + Add Line Item
          </button>
        )}

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-foreground">{currency}{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Tax</span>
                <span className="text-foreground">{currency}{invoice.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{currency}{invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs font-semibold text-muted uppercase mb-1">Notes</div>
            <p className="text-sm text-muted whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export type { InvoiceGeneratorConfig, Invoice, InvoiceItem, InvoiceParty } from './types';
