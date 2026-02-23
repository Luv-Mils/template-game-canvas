/**
 * APIDashboard -- AI & Integration Component (AII-04)
 *
 * API key management, usage stats with sparkline chart,
 * endpoint documentation with method badges.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { APIDashboardConfig, APIEndpoint } from './types';

// -- Method badge colors ------------------------------------------------------

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-green-500/10 text-green-500',
  POST: 'bg-blue-500/10 text-blue-500',
  PUT: 'bg-yellow-500/10 text-yellow-500',
  DELETE: 'bg-red-500/10 text-red-500',
};

// -- Inline sparkline SVG (usage history) -------------------------------------

function UsageSparkline({ data, color }: { data: Array<{ count: number }>; color: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 200;
  const h = 40;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.count / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// -- Create key modal ---------------------------------------------------------

function CreateKeyModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (name: string, permissions: string[]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [perms, setPerms] = useState<string[]>([]);

  const allPerms = ['read', 'write', 'delete', 'admin'];

  const togglePerm = (p: string) => {
    setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-xl shadow-2xl z-50 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Create API Key</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My API Key"
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {allPerms.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePerm(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    perms.includes(p)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted hover:border-primary/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors">Cancel</button>
          <button
            onClick={() => { onSubmit(name.trim(), perms); onClose(); }}
            disabled={!name.trim() || perms.length === 0}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
}

// -- Endpoint accordion -------------------------------------------------------

function EndpointItem({ endpoint }: { endpoint: APIEndpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface/50 transition-colors text-left"
      >
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${METHOD_STYLES[endpoint.method] ?? ''}`}>
          {endpoint.method}
        </span>
        <span className="text-sm font-mono text-foreground">{endpoint.path}</span>
        <span className="text-xs text-muted ml-auto hidden sm:inline">{endpoint.description}</span>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <p className="text-sm text-muted mb-3">{endpoint.description}</p>
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 text-xs text-muted font-medium">Parameter</th>
                  <th className="text-left py-1 text-xs text-muted font-medium">Type</th>
                  <th className="text-left py-1 text-xs text-muted font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.parameters.map((param) => (
                  <tr key={param.name} className="border-b border-border/50">
                    <td className="py-1.5 font-mono text-foreground">{param.name}</td>
                    <td className="py-1.5 text-muted">{param.type}</td>
                    <td className="py-1.5">
                      {param.required ? (
                        <span className="text-primary text-xs">Required</span>
                      ) : (
                        <span className="text-muted text-xs">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function APIDashboard({ config }: { config: APIDashboardConfig }) {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<'keys' | 'usage' | 'docs'>('keys');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCopyKey = useCallback(
    (key: string) => {
      navigator.clipboard.writeText(key);
      config.onCopyKey?.(key);
    },
    [config],
  );

  const usagePct = Math.min(100, (config.usage.current / config.usage.limit) * 100);

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-border">
        {(['keys', 'usage', ...(config.endpoints ? ['docs'] : [])] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab ? 'bg-primary/10 text-primary' : 'text-muted hover:text-foreground'
            }`}
          >
            {tab === 'keys' ? 'API Keys' : tab === 'usage' ? 'Usage' : 'Endpoints'}
          </button>
        ))}
      </div>

      {/* Keys tab */}
      {activeTab === 'keys' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Create Key
            </button>
          </div>

          <div className="space-y-3">
            {config.apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{apiKey.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs font-mono text-muted">{apiKey.key}</code>
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="text-xs text-primary hover:text-primary-hover transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {apiKey.permissions.map((perm) => (
                      <span key={perm} className="px-1.5 py-0.5 text-[10px] bg-surface rounded text-muted">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-muted">
                    Created {new Date(apiKey.created).toLocaleDateString()}
                  </div>
                  {apiKey.lastUsed && (
                    <div className="text-xs text-muted">
                      Last used {new Date(apiKey.lastUsed).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => config.onRevokeKey(apiKey.id)}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage tab */}
      {activeTab === 'usage' && (
        <div className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">API Usage</h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">{config.usage.current.toLocaleString()} / {config.usage.limit.toLocaleString()}</span>
                <span className="text-muted">per {config.usage.period}</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  style={{ width: `${usagePct}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-yellow-500' : 'bg-primary'
                  }`}
                />
              </div>
            </div>
          </div>

          {config.usage.history.length > 1 && (
            <div className="mt-6">
              <div className="text-xs text-muted mb-2">Usage History</div>
              <UsageSparkline
                data={config.usage.history}
                color={theme?.theme.colors.primary ?? '#6366f1'}
              />
            </div>
          )}
        </div>
      )}

      {/* Docs tab */}
      {activeTab === 'docs' && config.endpoints && (
        <div className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">API Endpoints</h3>
          <div className="space-y-2">
            {config.endpoints.map((endpoint, i) => (
              <EndpointItem key={i} endpoint={endpoint} />
            ))}
          </div>
        </div>
      )}

      {/* Create key modal */}
      {showCreateModal && (
        <CreateKeyModal
          onSubmit={config.onCreateKey}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export type { APIDashboardConfig, APIKey, APIUsage, APIEndpoint } from './types';
