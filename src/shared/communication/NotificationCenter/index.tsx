/**
 * NotificationCenter -- Communication Component (CMM-04)
 *
 * Bell icon with badge count, dropdown feed of notifications, mark read/unread.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../foundation';
import type { NotificationCenterConfig, Notification } from './types';

// -- Relative time ------------------------------------------------------------

function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// -- Type icon ----------------------------------------------------------------

const TYPE_STYLES: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-500',
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  error: 'bg-red-500/10 text-red-500',
};

// -- Main Component -----------------------------------------------------------

export default function NotificationCenter({ config }: { config: NotificationCenterConfig }) {
  useTheme();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = config.notifications.filter((n) => !n.read).length;
  const maxVisible = config.maxVisible ?? 10;
  const visible = config.notifications.slice(0, maxVisible);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-surface transition-colors text-foreground"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && config.onMarkAllRead && (
              <button
                onClick={() => { config.onMarkAllRead?.(); }}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-auto">
            {visible.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-2xl mb-2">🔔</div>
                <p className="text-sm text-muted">You're all caught up</p>
              </div>
            ) : (
              visible.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                    TYPE_STYLES[notif.type ?? 'info']
                  }`}>
                    {notif.icon ?? '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium">{notif.title}</div>
                    {notif.description && (
                      <div className="text-xs text-muted mt-0.5 line-clamp-2">{notif.description}</div>
                    )}
                    <div className="text-[10px] text-muted mt-1">{relativeTime(notif.time)}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notif.read && config.onMarkRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); config.onMarkRead?.(notif.id); }}
                        className="w-2 h-2 rounded-full bg-primary"
                        title="Mark as read"
                      />
                    )}
                    {config.onClear && (
                      <button
                        onClick={(e) => { e.stopPropagation(); config.onClear?.(notif.id); }}
                        className="text-muted hover:text-foreground text-xs ml-1"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {config.notifications.length > maxVisible && (
            <div className="px-4 py-2 border-t border-border text-center">
              <span className="text-xs text-primary">
                +{config.notifications.length - maxVisible} more notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { NotificationCenterConfig, Notification } from './types';
