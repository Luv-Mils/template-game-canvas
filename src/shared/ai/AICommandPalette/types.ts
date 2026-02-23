export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  action: () => void;
}

export interface AICommandPaletteConfig {
  commands: Command[];
  recentCommands?: string[];
  onSearch?: (query: string) => Array<{ label: string; action: () => void }>;
  placeholder?: string;
}
