/**
 * AIChatPanel -- AI & Integration Component (AII-01)
 *
 * Chat interface with streaming responses, message history,
 * code block detection, and basic markdown rendering.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { AIChatPanelConfig, ChatMessage } from './types';

// -- Markdown parser (simple regex-based, no library) -------------------------

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="px-1 py-0.5 bg-muted/20 rounded text-sm font-mono">
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Link
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch[2]} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text (up to next special char)
    const nextSpecial = remaining.search(/[\*`\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

// -- Code block component -----------------------------------------------------

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative my-2 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b border-border">
        <span className="text-xs text-muted">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-muted hover:text-foreground transition-colors pointer-events-auto"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm font-mono bg-muted/10">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// -- Message content renderer -------------------------------------------------

function MessageContent({ content }: { content: string }) {
  // Split into code blocks and text
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(<TextBlock key={key++} text={text} />);
    }
    // Code block
    parts.push(<CodeBlock key={key++} code={match[2].trim()} language={match[1] || undefined} />);
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < content.length) {
    parts.push(<TextBlock key={key++} text={content.slice(lastIndex)} />);
  }

  return <>{parts}</>;
}

function TextBlock({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, i) => {
        // List items
        if (line.match(/^[-*]\s/)) {
          return (
            <div key={i} className="flex gap-1.5 ml-2">
              <span className="text-muted">-</span>
              <span>{parseInlineMarkdown(line.slice(2))}</span>
            </div>
          );
        }
        // Numbered list
        const numMatch = line.match(/^(\d+)\.\s/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-1.5 ml-2">
              <span className="text-muted">{numMatch[1]}.</span>
              <span>{parseInlineMarkdown(line.slice(numMatch[0].length))}</span>
            </div>
          );
        }
        // Empty line
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        // Regular text
        return <p key={i}>{parseInlineMarkdown(line)}</p>;
      })}
    </>
  );
}

// -- Message bubble -----------------------------------------------------------

function MessageBubble({
  message,
  showTimestamp,
  onRetry,
}: {
  message: ChatMessage;
  showTimestamp?: boolean;
  onRetry?: (id: string) => void;
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="text-xs text-muted italic px-3 py-1">{message.content}</div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-primary/10 text-foreground rounded-br-md'
              : 'bg-surface text-foreground rounded-bl-md'
          }`}
        >
          <MessageContent content={message.content} />
        </div>

        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : ''}`}>
          {showTimestamp && message.timestamp && (
            <span className="text-[10px] text-muted">{message.timestamp}</span>
          )}
          {message.status === 'sending' && (
            <span className="text-[10px] text-muted">Sending...</span>
          )}
          {message.status === 'error' && onRetry && (
            <button
              onClick={() => onRetry(message.id)}
              className="text-[10px] text-red-500 hover:text-red-400 transition-colors pointer-events-auto"
            >
              Failed - Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// -- Streaming cursor ---------------------------------------------------------

function StreamingBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[80%]">
        <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-surface text-foreground text-sm leading-relaxed">
          <MessageContent content={content} />
          <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
        </div>
      </div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function AIChatPanel({ config }: { config: AIChatPanelConfig }) {
  useTheme();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [config.messages, config.streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || config.streaming) return;
    config.onSend(trimmed);
    setInput('');
  }, [input, config]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const variant = config.variant ?? 'panel';
  const isFullscreen = variant === 'fullscreen';

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col bg-background'
    : 'flex flex-col bg-background border border-border rounded-xl overflow-hidden';

  return (
    <div
      className={containerClasses}
      style={!isFullscreen && config.maxHeight ? { maxHeight: config.maxHeight } : undefined}
    >
      {/* Header */}
      {config.title && (
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {config.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            showTimestamp={config.showTimestamps}
            onRetry={config.onRetry}
          />
        ))}

        {config.streaming && config.streamingContent && (
          <StreamingBubble content={config.streamingContent} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder ?? 'Type a message...'}
            disabled={config.streaming}
            rows={1}
            className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || config.streaming}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-40 transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export type { AIChatPanelConfig, ChatMessage } from './types';
