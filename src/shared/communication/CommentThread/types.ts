export interface CommentAuthor {
  name: string;
  avatar?: string;
}

export interface CommentReply {
  id: string;
  text: string;
  author: CommentAuthor;
  timestamp: string;
}

export interface Comment {
  id: string;
  text: string;
  author: CommentAuthor;
  timestamp: string;
  replies?: CommentReply[];
  editable?: boolean;
  deletable?: boolean;
}

export interface CommentThreadConfig {
  comments: Comment[];
  onAddComment: (text: string, parentId?: string) => void;
  onEdit?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  currentUser?: CommentAuthor;
  placeholder?: string;
}
