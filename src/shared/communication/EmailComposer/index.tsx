/**
 * EmailComposer -- Communication Component (CMM-02)
 *
 * Email client layout with To/CC chip inputs, subject, body textarea,
 * template selector, Send/Save Draft. No WYSIWYG — plain textarea.
 */

import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../foundation';
import type { EmailComposerConfig, EmailData } from './types';

// -- Chip Input ---------------------------------------------------------------

function ChipInput({
  label,
  chips,
  onChange,
}: {
  label: string;
  chips: string[];
  onChange: (chips: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = () => {
    const val = input.trim();
    if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && !chips.includes(val)) {
      onChange([...chips, val]);
      setInput('');
    }
  };

  const removeChip = (i: number) => {
    onChange(chips.filter((_, idx) => idx !== i));
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 px-3 py-1.5 bg-surface border border-border rounded-lg min-h-[36px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-xs text-muted mr-1">{label}</span>
      {chips.map((chip, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
          {chip}
          <button onClick={() => removeChip(i)} className="hover:text-primary-hover">✕</button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="email"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addChip();
          }
          if (e.key === 'Backspace' && !input && chips.length > 0) {
            removeChip(chips.length - 1);
          }
        }}
        onBlur={addChip}
        placeholder={chips.length === 0 ? 'Type email and press Enter' : ''}
        className="flex-1 min-w-[120px] text-sm bg-transparent text-foreground focus:outline-none"
      />
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function EmailComposer({ config }: { config: EmailComposerConfig }) {
  useTheme();

  const [to, setTo] = useState<string[]>(config.to ?? []);
  const [cc, setCc] = useState<string[]>(config.cc ?? []);
  const [showCc, setShowCc] = useState((config.cc ?? []).length > 0);
  const [subject, setSubject] = useState(config.subject ?? '');
  const [body, setBody] = useState(config.body ?? '');
  const [sending, setSending] = useState(false);

  const getEmailData = useCallback((): EmailData => ({
    to,
    cc,
    subject,
    body,
    attachments: config.attachments ?? [],
  }), [to, cc, subject, body, config.attachments]);

  const handleSend = useCallback(async () => {
    if (to.length === 0) return;
    setSending(true);
    try {
      config.onSend(getEmailData());
    } finally {
      setSending(false);
    }
  }, [to, config, getEmailData]);

  const handleTemplate = useCallback((templateId: string) => {
    const template = config.templates?.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [config.templates]);

  const isCompact = config.variant === 'compact';

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <span className="text-sm font-semibold text-foreground">New Message</span>
        <div className="flex items-center gap-2">
          {config.templates && config.templates.length > 0 && (
            <select
              onChange={(e) => handleTemplate(e.target.value)}
              className="px-2 py-1 text-xs bg-background border border-border rounded text-foreground"
              defaultValue=""
            >
              <option value="" disabled>Template...</option>
              {config.templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* To */}
        <ChipInput label="To" chips={to} onChange={setTo} />

        {/* CC toggle + field */}
        {!showCc ? (
          <button
            onClick={() => setShowCc(true)}
            className="text-xs text-primary hover:text-primary-hover"
          >
            + CC
          </button>
        ) : (
          <ChipInput label="CC" chips={cc} onChange={setCc} />
        )}

        {/* Subject */}
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        {/* Body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows={isCompact ? 6 : 12}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />

        {/* Attachments */}
        {config.attachments && config.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {config.attachments.map((att, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded text-xs text-muted">
                📎 {att.name}
                <span className="text-[10px]">({(att.size / 1024).toFixed(0)}KB)</span>
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={to.length === 0 || sending}
            className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
          {config.onSaveDraft && (
            <button
              onClick={() => config.onSaveDraft?.(getEmailData())}
              className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Save Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export type { EmailComposerConfig, EmailData, EmailTemplate, EmailAttachment } from './types';
