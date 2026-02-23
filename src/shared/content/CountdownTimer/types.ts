export interface CountdownConfig {
  targetDate: string;
  headline?: string;
  expiredMessage?: string;
  showDays?: boolean;
  showSeconds?: boolean;
  variant?: 'cards' | 'inline' | 'minimal';
}
