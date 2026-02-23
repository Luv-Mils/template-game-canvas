export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded';
  client?: { name: string; email?: string };
  description?: string;
  invoiceId?: string;
  method?: string;
}

export interface PaymentSummary {
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  monthlyTrend: Array<{ month: string; revenue: number }>;
}

export interface PaymentTrackerConfig {
  transactions: PaymentTransaction[];
  currency?: string;
  summary?: PaymentSummary;
  onViewInvoice?: (invoiceId: string) => void;
  onSendReminder?: (transactionId: string) => void;
  onMarkPaid?: (transactionId: string) => void;
  filters?: {
    statuses?: string[];
    dateRange?: { start: string; end: string };
    clients?: string[];
  };
}
