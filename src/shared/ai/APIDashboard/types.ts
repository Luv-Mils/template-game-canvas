export interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed?: string;
  permissions: string[];
}

export interface APIUsage {
  current: number;
  limit: number;
  period: string;
  history: Array<{ date: string; count: number }>;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Array<{ name: string; type: string; required: boolean }>;
}

export interface APIDashboardConfig {
  apiKeys: APIKey[];
  usage: APIUsage;
  endpoints?: APIEndpoint[];
  onCreateKey: (name: string, permissions: string[]) => void;
  onRevokeKey: (id: string) => void;
  onCopyKey?: (key: string) => void;
}
