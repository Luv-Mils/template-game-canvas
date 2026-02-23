/**
 * IntegrationCards -- AI & Integration Component (AII-05)
 *
 * Grid of third-party integration cards with connect/disconnect toggle,
 * status indicators, and category filtering.
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { IntegrationCardsConfig, Integration } from './types';

// -- Status styles ------------------------------------------------------------

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  active: { dot: 'bg-green-500', text: 'text-green-500' },
  error: { dot: 'bg-red-500', text: 'text-red-500' },
  pending: { dot: 'bg-yellow-500', text: 'text-yellow-500' },
};

// -- Integration card ---------------------------------------------------------

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onConfigure,
}: {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure?: (id: string) => void;
}) {
  const status = integration.status ?? (integration.connected ? 'active' : undefined);
  const statusStyle = status ? STATUS_STYLES[status] : undefined;

  return (
    <div className="border border-border rounded-xl p-4 bg-background hover:border-primary/30 transition-colors">
      {/* Icon + Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 overflow-hidden">
          {integration.icon.startsWith('<') ? (
            <div dangerouslySetInnerHTML={{ __html: integration.icon }} className="w-6 h-6" />
          ) : (
            <img src={integration.icon} alt="" className="w-6 h-6 object-contain" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">{integration.name}</h4>
            {statusStyle && (
              <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
            )}
          </div>
          <p className="text-xs text-muted mt-0.5 line-clamp-2">{integration.description}</p>
        </div>
      </div>

      {/* Status info */}
      {integration.connected && integration.lastSync && (
        <div className="text-[10px] text-muted mb-3">
          Last synced: {new Date(integration.lastSync).toLocaleDateString()}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {integration.connected ? (
          <>
            {status === 'error' ? (
              <button
                onClick={() => onConnect(integration.id)}
                className="flex-1 py-1.5 text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Reconnect
              </button>
            ) : (
              <>
                {onConfigure && (
                  <button
                    onClick={() => onConfigure(integration.id)}
                    className="flex-1 py-1.5 text-xs font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
                  >
                    Configure
                  </button>
                )}
                <button
                  onClick={() => onDisconnect(integration.id)}
                  className="px-3 py-1.5 text-xs text-muted hover:text-red-500 transition-colors"
                >
                  Disconnect
                </button>
              </>
            )}
          </>
        ) : (
          <button
            onClick={() => onConnect(integration.id)}
            className="flex-1 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function IntegrationCards({ config }: { config: IntegrationCardsConfig }) {
  useTheme();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    if (!config.showFilter || !config.categories) return [];
    return config.categories;
  }, [config.showFilter, config.categories]);

  const filtered = useMemo(() => {
    if (!activeCategory) return config.integrations;
    return config.integrations.filter((i) => i.category === activeCategory);
  }, [config.integrations, activeCategory]);

  return (
    <div>
      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              !activeCategory
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-border text-muted hover:border-primary/40'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-border text-muted hover:border-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={config.onConnect}
            onDisconnect={config.onDisconnect}
            onConfigure={config.onConfigure}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted">
          No integrations found
        </div>
      )}
    </div>
  );
}

export type { IntegrationCardsConfig, Integration } from './types';
