export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  lastTriggered?: string;
  lastStatus?: number;
}

export interface WebhookData {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}

export interface WebhookEvent {
  webhookId: string;
  event: string;
  timestamp: string;
  status: number;
  duration: number;
}

export interface WebhookManagerConfig {
  webhooks: Webhook[];
  availableEvents: string[];
  onAdd: (webhook: WebhookData) => void;
  onEdit: (id: string, data: WebhookData) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  eventLog?: WebhookEvent[];
}
