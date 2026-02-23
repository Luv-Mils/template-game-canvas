export interface InvoiceParty {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  logo?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
}

export interface Invoice {
  number: string;
  date: string;
  dueDate: string;
  from: InvoiceParty;
  to: Omit<InvoiceParty, 'logo' | 'phone'>;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency?: string;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface InvoiceGeneratorConfig {
  invoice: Invoice;
  editable?: boolean;
  onSave?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onPrint?: () => void;
}
