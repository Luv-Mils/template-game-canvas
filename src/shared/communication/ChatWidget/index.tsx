/**
 * ChatWidget -- Communication Component (CMM-03)
 *
 * Live chat bubble or embedded panel. Message thread, typing indicator, timestamps.
 * UI shell — template wires real-time messaging.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { ChatWidgetConfig, ChatMessage } from './types';

// -- Typing Indicator ---------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-muted"
          style={{
            animation: 'pulse 1.4s infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

// -- Message Bubble -----------------------------------------------------------

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="text-center py-2">
        <span className="text-xs text-muted italic">{message.text}</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {message.avatar && (
        <img src={message.avatar} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
      )}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3 py-2 rounded-2xl text-sm ${
            isUser
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-surface border border-border text-foreground rounded-bl-md'
          }`}
        >
          {message.text}
        </div>
        <div className={`text-[10px] text-muted mt-0.5 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// -- Chat Panel ---------------------------------------------------------------

function ChatPanel({
  config,
  onClose,
}: {
  config: ChatWidgetConfig;
  onClose?: () => void;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [config.messages, config.isTyping]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    config.onSend(text);
    setInput('');
  }, [input, config]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-background border border-border rounded-xl shadow-lg overflow-hidden w-[360px] h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
        <div className="flex items-center gap-2">
          {config.agentAvatar && (
            <img src={config.agentAvatar} alt="" className="w-8 h-8 rounded-full" />
          )}
          <div>
            <div className="text-sm font-semibold">{config.agentName ?? 'Support'}</div>
            <div className="text-[10px] opacity-80">Online</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg">
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {config.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {config.isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={config.placeholder ?? 'Type a message...'}
            className="flex-1 px-3 py-2 bg-surface border border-border rounded-full text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function ChatWidget({ config }: { config: ChatWidgetConfig }) {
  useTheme();

  const [open, setOpen] = useState(false);

  if (config.variant === 'embedded') {
    return <ChatPanel config={config} />;
  }

  // Bubble variant
  const position = config.position ?? 'bottom-right';
  const positionClasses = position === 'bottom-left' ? 'left-4 bottom-4' : 'right-4 bottom-4';
  const panelPosition = position === 'bottom-left' ? 'left-4 bottom-20' : 'right-4 bottom-20';

  const unreadCount = config.messages.filter((m) => m.sender !== 'user').length;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className={`fixed z-50 ${panelPosition}`}>
          <ChatPanel config={config} onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed z-50 ${positionClasses} w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center`}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            {unreadCount > 0 && !open && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}

export type { ChatWidgetConfig, ChatMessage } from './types';
