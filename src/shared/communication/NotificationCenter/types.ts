export interface Notification {
  id: string;
  title: string;
  description?: string;
  time: string;
  read: boolean;
  icon?: string;
  href?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface NotificationCenterConfig {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClear?: (id: string) => void;
  maxVisible?: number;
}
