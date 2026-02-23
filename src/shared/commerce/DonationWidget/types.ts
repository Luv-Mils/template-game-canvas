export interface DonationWidgetConfig {
  presetAmounts: number[];
  currency?: string;
  allowCustom?: boolean;
  recurring?: boolean;
  headline?: string;
  description?: string;
  onDonate?: (amount: number, recurring: boolean) => void;
  paymentElement?: React.ReactNode;
  variant?: 'card' | 'inline' | 'full-page';
}
