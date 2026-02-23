export interface ParsedData {
  headers: string[];
  rows: unknown[][];
  rowCount: number;
  fileName: string;
  fileType: string;
}

export interface FileIngestionConfig {
  acceptedTypes: Array<'csv' | 'xlsx' | 'json' | 'tsv'>;
  maxSizeMB?: number;
  onDataReady: (data: ParsedData) => void;
  onError?: (error: string) => void;
  showPreview?: boolean;
  columnMapping?: boolean;
  parser?: (file: File) => Promise<ParsedData>;
}
