export interface ContactFormConfig {
  fields: Array<'name' | 'email' | 'phone' | 'company' | 'subject' | 'message'>;
  requiredFields?: string[];
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  successMessage?: string;
  submitLabel?: string;
  headline?: string;
  description?: string;
  honeypot?: boolean;
}
