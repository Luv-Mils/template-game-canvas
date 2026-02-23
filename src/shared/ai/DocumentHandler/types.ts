export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'text';
  size: number;
  url?: string;
  thumbnail?: string;
  uploadedAt?: string;
  metadata?: Record<string, string>;
}

export interface DocumentHandlerConfig {
  documents?: DocumentItem[];
  acceptedTypes?: string[];
  maxSizeMB?: number;
  onUpload: (file: File) => void | Promise<void>;
  onDelete?: (id: string) => void;
  onProcess?: (id: string) => void;
  showPreview?: boolean;
  variant?: 'grid' | 'list' | 'dropzone';
  multiple?: boolean;
}
