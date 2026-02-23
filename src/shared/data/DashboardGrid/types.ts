export interface KPIWidget {
  value: string | number;
  label: string;
  change?: { value: number; direction: 'up' | 'down' };
  icon?: string;
  sparkline?: number[];
}

export interface ActivityWidgetItem {
  text: string;
  time: string;
  icon?: string;
  user?: string;
}

export interface ActivityWidget {
  items: ActivityWidgetItem[];
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'activity' | 'custom';
  title: string;
  span?: { cols: number; rows: number };
  config: unknown;
}

export interface DashboardGridConfig {
  widgets: DashboardWidget[];
  columns?: number;
  gap?: string;
  editable?: boolean;
  onLayoutChange?: (layout: Array<{ id: string; x: number; y: number; w: number; h: number }>) => void;
}
