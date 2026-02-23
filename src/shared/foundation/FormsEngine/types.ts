export type FieldType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea' | 'select';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormField {
  /** Unique field name (used as form data key) */
  name: string;
  /** Display label */
  label: string;
  /** Input type */
  type: FieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Options for select fields */
  options?: SelectOption[];
  /** Number of rows for textarea (default: 4) */
  rows?: number;
  /** Validation pattern (regex string) */
  pattern?: string;
  /** Custom validation error message */
  errorMessage?: string;
  /** Column span: 1 (default) or 2 (full width in 2-col grid) */
  colSpan?: 1 | 2;
}

export interface FormConfig {
  /** Form fields */
  fields: FormField[];
  /** Submit button label */
  submitLabel: string;
  /** Called with form data on valid submission */
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  /** Number of columns (1 or 2, default: 1) */
  columns?: 1 | 2;
}

export interface InputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export interface TextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export interface SelectProps {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
