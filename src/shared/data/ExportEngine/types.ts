export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

export interface ExportEngineConfig {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  formats: Array<'csv' | 'xlsx' | 'json' | 'pdf'>;
  fileName?: string;
  onExport?: (format: string) => void;
  generator?: (data: Record<string, unknown>[], columns: ExportColumn[], format: string) => Blob | null;
}

export interface ExportRenderProps {
  triggerExport: (format: string) => void;
  formats: string[];
}
