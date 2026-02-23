export interface KanbanTag {
  label: string;
  color?: string;
}

export interface KanbanAssignee {
  name: string;
  avatar?: string;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  tags?: KanbanTag[];
  assignee?: KanbanAssignee;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  wipLimit?: number;
}

export interface KanbanBoardConfig {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string, position: number) => void;
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
}
