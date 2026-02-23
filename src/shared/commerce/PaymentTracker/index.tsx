/**
 * PaymentTracker — Commerce Component (COM-07)
 *
 * Revenue analytics dashboard: KPI cards, monthly trend chart,
 * transaction table with status badges and action buttons.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { PaymentTrackerConfig, PaymentTransaction } from './types';

// -- Status styles ------------------------------------------------------------

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  paid: { bg: 'bg-green-500/10', text: 'text-green-500' },
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
  overdue: { bg: 'bg-red-500/10', text: 'text-red-500' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400' },
  refunded: { bg: 'bg-muted/10', text: 'text-muted' },
};

// -- Format helpers -----------------------------------------------------------

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// -- Sparkline SVG ------------------------------------------------------------

function TrendSparkline({ data, color }: { data: Array<{ month: string; revenue: number }>; color: string }) {
  if (data.length < 2) return null;
  const w = 300;
  const h = 60;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.revenue / max) * (h - 4);
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="block w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={fillPoints} fill={color} fillOpacity={0.1} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

// -- KPI Card -----------------------------------------------------------------

function KPICard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-surface'}`}>
      <div className="text-xs font-medium text-muted mb-1">{label}</div>
      <div className={`text-xl font-bold ${accent ? 'text-red-500' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function PaymentTracker({ config }: { config: PaymentTrackerConfig }) {
  const theme = useTheme();
  const currency = config.currency ?? 'USD';

  const [sortField, setSortField] = useState<'date' | 'amount' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let txns = [...config.transactions];
    if (statusFilter) {
      txns = txns.filter((t) => t.status === statusFilter);
    }
    txns.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return txns;
  }, [config.transactions, statusFilter, sortField, sortDir]);

  // Compute summary from transactions if not provided
  const summary = config.summary ?? (() => {
    const paid = config.transactions.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
    const pending = config.transactions.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
    const overdue = config.transactions.filter((t) => t.status === 'overdue').reduce((s, t) => s + t.amount, 0);
    return { totalRevenue: paid, totalPending: pending, totalOverdue: overdue, monthlyTrend: [] };
  })();

  const thisMonth = config.transactions
    .filter((t) => {
      const d = new Date(t.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.status === 'paid';
    })
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={formatCurrency(summary.totalRevenue, currency)} />
        <KPICard label="Pending" value={formatCurrency(summary.totalPending, currency)} />
        <KPICard label="Overdue" value={formatCurrency(summary.totalOverdue, currency)} accent={summary.totalOverdue > 0} />
        <KPICard label="This Month" value={formatCurrency(thisMonth, currency)} />
      </div>

      {/* Revenue Chart */}
      {summary.monthlyTrend.length > 1 && (
        <div className="border border-border rounded-xl p-4 bg-background">
          <div className="text-sm font-semibold text-foreground mb-3">Revenue Trend</div>
          <TrendSparkline data={summary.monthlyTrend} color={theme?.theme.colors.primary ?? '#6366f1'} />
          <div className="flex justify-between mt-2 text-[10px] text-muted">
            <span>{summary.monthlyTrend[0].month}</span>
            <span>{summary.monthlyTrend[summary.monthlyTrend.length - 1].month}</span>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-background">
        {/* Filters */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-wrap">
          <span className="text-sm font-semibold text-foreground">Transactions</span>
          <div className="flex gap-1 ml-auto">
            {['all', 'paid', 'pending', 'overdue', 'failed', 'refunded'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === 'all' ? null : s)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                  (s === 'all' && !statusFilter) || statusFilter === s
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border text-muted hover:border-primary/40'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted cursor-pointer hover:text-foreground" onClick={() => toggleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted">Description</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted">Client</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted cursor-pointer hover:text-foreground" onClick={() => toggleSort('amount')}>
                  Amount {sortField === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted cursor-pointer hover:text-foreground" onClick={() => toggleSort('status')}>
                  Status {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => {
                const style = STATUS_STYLES[txn.status] ?? STATUS_STYLES.pending;
                return (
                  <tr key={txn.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {txn.description ?? '—'}
                      {txn.method && <span className="ml-2 text-xs text-muted">({txn.method})</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground">{txn.client?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(txn.amount, currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {txn.invoiceId && config.onViewInvoice && (
                          <button
                            onClick={() => config.onViewInvoice!(txn.invoiceId!)}
                            className="text-xs text-primary hover:text-primary-hover transition-colors"
                          >
                            Invoice
                          </button>
                        )}
                        {txn.status === 'overdue' && config.onSendReminder && (
                          <button
                            onClick={() => config.onSendReminder!(txn.id)}
                            className="text-xs text-red-500 hover:text-red-400 transition-colors"
                          >
                            Remind
                          </button>
                        )}
                        {txn.status === 'pending' && config.onMarkPaid && (
                          <button
                            onClick={() => config.onMarkPaid!(txn.id)}
                            className="text-xs text-green-500 hover:text-green-400 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted">No transactions found</div>
        )}
      </div>
    </div>
  );
}

export type { PaymentTrackerConfig, PaymentTransaction, PaymentSummary } from './types';
