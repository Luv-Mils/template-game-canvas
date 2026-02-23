export interface ActionBinding {
  keys?: string[];
  mouse?: ('left' | 'right' | 'middle')[];
  touch?: boolean;
}

export interface InputConfig {
  actions: Record<string, ActionBinding>;
  bufferDuration?: number;
}
