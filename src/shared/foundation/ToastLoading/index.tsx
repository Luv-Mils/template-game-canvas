/**
 * ToastLoading — Foundation Component (FND-08)
 *
 * Toast notification system + loading primitives for ALL templates:
 * - ToastProvider: context provider that manages toast stack
 * - useToast(): hook to show/dismiss toasts from any component
 * - ToastContainer: renders toasts in bottom-right corner
 * - Spinner: animated loading spinner
 * - Skeleton / SkeletonText / SkeletonCard: loading placeholders
 *
 * Usage:
 *   // Wrap app:
 *   <ToastProvider><App /></ToastProvider>
 *
 *   // In any component:
 *   const { addToast } = useToast();
 *   addToast('success', 'Changes saved!');
 *   addToast('error', 'Something went wrong', 6000);
 */

import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { Toast, ToastType, ToastContextValue } from './types';

// ── Icons ────────────────────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastType, { color: string; path: string }> = {
  success: {
    color: 'text-green-400',
    path: 'M4.5 12.75l6 6 9-13.5',
  },
  error: {
    color: 'text-red-400',
    path: 'M6 18L18 6M6 6l12 12',
  },
  warning: {
    color: 'text-amber-400',
    path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  info: {
    color: 'text-blue-400',
    path: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  },
};

// ── Toast Item ───────────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icon = TOAST_ICONS[toast.type];

  useEffect(() => {
    if (toast.duration === 0) return; // persistent
    const timer = setTimeout(onRemove, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  return (
    <div className="flex items-start gap-3 bg-surface border border-border rounded-xl px-4 py-3 shadow-lg max-w-sm animate-[slideIn_0.2s_ease-out]">
      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${icon.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
      </svg>
      <p className="text-sm text-foreground flex-1">{toast.message}</p>
      <button onClick={onRemove} className="text-muted hover:text-foreground p-0.5" aria-label="Dismiss">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast() must be used within a <ToastProvider>');
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${++nextId}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ── Re-exports ───────────────────────────────────────────────────────────────

export { Spinner } from './Spinner';
export { Skeleton, SkeletonText, SkeletonCard } from './Skeleton';
export type { Toast, ToastType, ToastContextValue } from './types';
