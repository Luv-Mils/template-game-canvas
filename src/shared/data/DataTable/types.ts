import type React from 'react';

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  editable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
}

export interface DataTableAction<T = Record<string, unknown>> {
  label: string;
  icon?: string;
  onClick: (selected: T[]) => void;
  variant?: 'default' | 'danger';
}

export interface DataTableEmptyState {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export interface DataTableConfig<T = Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T, key: string, value: unknown) => void;
  onSelectionChange?: (selected: T[]) => void;
  actions?: DataTableAction<T>[];
  emptyState?: DataTableEmptyState;
  stickyHeader?: boolean;
  striped?: boolean;
  compact?: boolean;
}
