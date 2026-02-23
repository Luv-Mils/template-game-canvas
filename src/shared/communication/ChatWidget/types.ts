export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  avatar?: string;
}

export interface ChatWidgetConfig {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  placeholder?: string;
  agentName?: string;
  agentAvatar?: string;
  isTyping?: boolean;
  variant?: 'bubble' | 'embedded';
  position?: 'bottom-right' | 'bottom-left';
}
