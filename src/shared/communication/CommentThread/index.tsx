/**
 * CommentThread -- Communication Component (CMM-05)
 *
 * Threaded comments with replies (1 level), edit/delete, timestamps, user avatars.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { CommentThreadConfig, Comment, CommentReply } from './types';

// -- Relative time ------------------------------------------------------------

function relativeTime(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

// -- Avatar -------------------------------------------------------------------

function Avatar({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return <img src={avatar} alt={name} className="w-8 h-8 rounded-full flex-shrink-0" />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// -- Comment Input ------------------------------------------------------------

function CommentInput({
  placeholder,
  onSubmit,
  autoFocus,
  onCancel,
}: {
  placeholder: string;
  onSubmit: (text: string) => void;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
        autoFocus={autoFocus}
        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex flex-col gap-1">
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg disabled:opacity-40 hover:bg-primary-hover transition-colors"
        >
          Post
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// -- Reply Item ---------------------------------------------------------------

function ReplyItem({ reply }: { reply: CommentReply }) {
  return (
    <div className="flex gap-2 ml-10 mt-2">
      <Avatar name={reply.author.name} avatar={reply.author.avatar} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{reply.author.name}</span>
          <span className="text-[10px] text-muted">{relativeTime(reply.timestamp)}</span>
        </div>
        <p className="text-sm text-foreground mt-0.5">{reply.text}</p>
      </div>
    </div>
  );
}

// -- Comment Item -------------------------------------------------------------

function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  onReply: (parentId: string, text: string) => void;
  onEdit?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== comment.text) {
      onEdit?.(comment.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-3">
        <Avatar name={comment.author.name} avatar={comment.author.avatar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{comment.author.name}</span>
            <span className="text-xs text-muted">{relativeTime(comment.timestamp)}</span>
          </div>

          {editing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                  Save
                </button>
                <button onClick={() => { setEditing(false); setEditText(comment.text); }} className="px-3 py-1 text-xs text-muted hover:text-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground mt-0.5">{comment.text}</p>
          )}

          {/* Actions */}
          {!editing && (
            <div className="flex items-center gap-3 mt-1.5">
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                Reply
              </button>
              {comment.editable && onEdit && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Edit
                </button>
              )}
              {comment.deletable && onDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-muted hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} />
      ))}

      {/* Reply input */}
      {showReply && (
        <div className="ml-10 mt-2">
          <CommentInput
            placeholder={`Reply to ${comment.author.name}...`}
            onSubmit={(text) => { onReply(comment.id, text); setShowReply(false); }}
            autoFocus
            onCancel={() => setShowReply(false)}
          />
        </div>
      )}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function CommentThread({ config }: { config: CommentThreadConfig }) {
  useTheme();

  return (
    <div className="space-y-6">
      {/* Add comment */}
      <div className="flex gap-3">
        {config.currentUser && (
          <Avatar name={config.currentUser.name} avatar={config.currentUser.avatar} />
        )}
        <div className="flex-1">
          <CommentInput
            placeholder={config.placeholder ?? 'Add a comment...'}
            onSubmit={(text) => config.onAddComment(text)}
          />
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {config.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(parentId, text) => config.onAddComment(text, parentId)}
            onEdit={config.onEdit}
            onDelete={config.onDelete}
          />
        ))}
      </div>

      {config.comments.length === 0 && (
        <div className="text-center py-8 text-sm text-muted">No comments yet</div>
      )}
    </div>
  );
}

export type { CommentThreadConfig, Comment, CommentReply, CommentAuthor } from './types';
