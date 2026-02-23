export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FAQConfig {
  headline?: string;
  items: FAQItem[];
  searchable?: boolean;
  groupByCategory?: boolean;
  allowMultipleOpen?: boolean;
}
