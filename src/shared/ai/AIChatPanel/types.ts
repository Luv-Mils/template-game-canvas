export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface AIChatPanelConfig {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  onRetry?: (messageId: string) => void;
  streaming?: boolean;
  streamingContent?: string;
  placeholder?: string;
  title?: string;
  showTimestamps?: boolean;
  maxHeight?: string;
  variant?: 'panel' | 'fullscreen' | 'embedded';
}
