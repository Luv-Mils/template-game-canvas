export interface SearchSuggestion {
  text: string;
  type?: 'recent' | 'suggested' | 'ai';
}

export interface AISearchBarConfig {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: string) => void;
  recentSearches?: string[];
  hotkey?: string;
  variant?: 'default' | 'minimal' | 'expanded';
  isLoading?: boolean;
}
