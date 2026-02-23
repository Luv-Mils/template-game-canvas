export interface DialogueCharacter {
  name: string;
  portrait?: string;
  color?: string;
}

export interface DialogueEffect {
  variable: string;
  operation: 'set' | 'add' | 'subtract';
  value: unknown;
}

export interface DialogueChoice {
  text: string;
  nextNodeId: string;
  condition?: (variables: Record<string, unknown>) => boolean;
  effects?: DialogueEffect[];
}

export interface DialogueNode {
  id: string;
  character?: string;
  text: string;
  choices?: DialogueChoice[];
  nextNodeId?: string;
  effects?: DialogueEffect[];
  onEnter?: () => void;
}

export interface DialogueConfig {
  characters?: Record<string, DialogueCharacter>;
  textSpeed?: number;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}
