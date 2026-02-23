export interface EmailAttachment {
  name: string;
  size: number;
  type: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface EmailData {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  attachments: EmailAttachment[];
}

export interface EmailComposerConfig {
  to?: string[];
  cc?: string[];
  subject?: string;
  body?: string;
  attachments?: EmailAttachment[];
  onSend: (email: EmailData) => void;
  onSaveDraft?: (email: EmailData) => void;
  templates?: EmailTemplate[];
  variant?: 'full' | 'compact';
}
