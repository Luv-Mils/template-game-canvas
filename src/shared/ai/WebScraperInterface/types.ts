export interface ScrapeSelector {
  name: string;
  selector: string;
  attribute?: string;
  multiple?: boolean;
}

export interface ScrapeRequest {
  url: string;
  selectors: ScrapeSelector[];
}

export interface ScrapeResult {
  url: string;
  timestamp: string;
  data: Record<string, string | string[]>;
  error?: string;
}

export interface SavedRule {
  id: string;
  name: string;
  url: string;
  selectors: ScrapeSelector[];
  schedule?: string;
}

export interface WebScraperConfig {
  onScrape: (config: ScrapeRequest) => Promise<ScrapeResult>;
  results?: ScrapeResult[];
  savedRules?: SavedRule[];
  onSaveRule?: (rule: { name: string; url: string; selectors: ScrapeSelector[]; schedule?: string }) => void;
  onDeleteRule?: (id: string) => void;
}
