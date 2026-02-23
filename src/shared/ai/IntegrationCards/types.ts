export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
  connected: boolean;
  status?: 'active' | 'error' | 'pending';
  lastSync?: string;
}

export interface IntegrationCardsConfig {
  integrations: Integration[];
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure?: (id: string) => void;
  showFilter?: boolean;
  categories?: string[];
}
