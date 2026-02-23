/**
 * WebhookManager -- AI & Integration Component (AII-03)
 *
 * Configure incoming/outgoing webhooks, test payloads, event log.
 * CRUD operations with add/edit modal and event log tab.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { WebhookManagerConfig, WebhookData } from './types';

// -- Status indicator ---------------------------------------------------------

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-muted'}`}
    />
  );
}

// -- Webhook form modal -------------------------------------------------------

function WebhookForm({
  initial,
  availableEvents,
  onSubmit,
  onClose,
}: {
  initial?: WebhookData;
  availableEvents: string[];
  onSubmit: (data: WebhookData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(initial?.events ?? []);
  const [secret, setSecret] = useState(initial?.secret ?? '');

  const handleToggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || !url.trim() || selectedEvents.length === 0) return;
    onSubmit({ name: name.trim(), url: url.trim(), events: selectedEvents, secret: secret || undefined });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-xl shadow-2xl z-50 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {initial ? 'Edit Webhook' : 'Add Webhook'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Webhook"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Secret (optional)</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="whsec_..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {availableEvents.map((event) => (
                <button
                  key={event}
                  onClick={() => handleToggleEvent(event)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                    selectedEvents.includes(event)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted hover:border-primary/40'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !url.trim() || selectedEvents.length === 0}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors"
          >
            {initial ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </>
  );
}

// -- Main Component -----------------------------------------------------------

export default function WebhookManager({ config }: { config: WebhookManagerConfig }) {
  useTheme();

  const [activeTab, setActiveTab] = useState<'webhooks' | 'log'>('webhooks');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const editingWebhook = editingId
    ? config.webhooks.find((w) => w.id === editingId)
    : null;

  const handleAdd = useCallback(
    (data: WebhookData) => {
      config.onAdd(data);
      setShowAddForm(false);
    },
    [config],
  );

  const handleEdit = useCallback(
    (data: WebhookData) => {
      if (editingId) {
        config.onEdit(editingId, data);
        setEditingId(null);
      }
    },
    [editingId, config],
  );

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'webhooks' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-foreground'
            }`}
          >
            Webhooks ({config.webhooks.length})
          </button>
          {config.eventLog && (
            <button
              onClick={() => setActiveTab('log')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'log' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              Event Log
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Add Webhook
        </button>
      </div>

      {/* Webhooks tab */}
      {activeTab === 'webhooks' && (
        <div className="divide-y divide-border">
          {config.webhooks.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted">
              No webhooks configured yet
            </div>
          ) : (
            config.webhooks.map((webhook) => (
              <div key={webhook.id} className="px-6 py-4 flex items-center gap-4">
                <StatusDot active={webhook.active} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{webhook.name}</div>
                  <div className="text-xs text-muted truncate">{webhook.url}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="px-1.5 py-0.5 text-[10px] bg-surface rounded text-muted"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {webhook.lastTriggered && (
                    <span className="text-xs text-muted hidden sm:inline">
                      Last: {new Date(webhook.lastTriggered).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={() => config.onTest(webhook.id)}
                    className="px-3 py-1 text-xs font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => setEditingId(webhook.id)}
                    className="px-3 py-1 text-xs text-muted hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => config.onDelete(webhook.id)}
                    className="px-3 py-1 text-xs text-muted hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Event log tab */}
      {activeTab === 'log' && config.eventLog && (
        <div className="divide-y divide-border">
          {config.eventLog.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted">
              No events logged yet
            </div>
          ) : (
            config.eventLog.map((event, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-4 text-sm">
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    event.status >= 200 && event.status < 300
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {event.status}
                </span>
                <span className="text-foreground">{event.event}</span>
                <span className="text-muted ml-auto text-xs">
                  {event.duration}ms
                </span>
                <span className="text-muted text-xs">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit forms */}
      {showAddForm && (
        <WebhookForm
          availableEvents={config.availableEvents}
          onSubmit={handleAdd}
          onClose={() => setShowAddForm(false)}
        />
      )}
      {editingWebhook && (
        <WebhookForm
          initial={{
            name: editingWebhook.name,
            url: editingWebhook.url,
            events: editingWebhook.events,
            secret: editingWebhook.secret,
          }}
          availableEvents={config.availableEvents}
          onSubmit={handleEdit}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

export type { WebhookManagerConfig, Webhook, WebhookData, WebhookEvent } from './types';
