/**
 * WebScraperInterface — AI & Integration Component (AII-08)
 *
 * UI for configuring and running web scraping tasks.
 * Config panel with selector builder, preview results, saved rules.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { WebScraperConfig, ScrapeSelector, ScrapeResult } from './types';

// -- Icons --------------------------------------------------------------------

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

// -- Selector row -------------------------------------------------------------

function SelectorRow({
  selector,
  onChange,
  onRemove,
}: {
  selector: ScrapeSelector;
  onChange: (updated: ScrapeSelector) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <input
        type="text"
        value={selector.name}
        onChange={(e) => onChange({ ...selector, name: e.target.value })}
        placeholder="Field name"
        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <input
        type="text"
        value={selector.selector}
        onChange={(e) => onChange({ ...selector, selector: e.target.value })}
        placeholder="CSS selector"
        className="flex-[2] px-3 py-2 bg-surface border border-border rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <select
        value={selector.attribute ?? 'text'}
        onChange={(e) => onChange({ ...selector, attribute: e.target.value })}
        className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="text">text</option>
        <option value="href">href</option>
        <option value="src">src</option>
        <option value="alt">alt</option>
        <option value="value">value</option>
      </select>
      <label className="flex items-center gap-1 px-2 py-2 text-xs text-muted whitespace-nowrap">
        <input
          type="checkbox"
          checked={selector.multiple ?? false}
          onChange={(e) => onChange({ ...selector, multiple: e.target.checked })}
          className="accent-primary"
        />
        All
      </label>
      <button onClick={onRemove} className="p-2 text-muted hover:text-red-500 transition-colors" aria-label="Remove">
        <TrashIcon />
      </button>
    </div>
  );
}

// -- Result display -----------------------------------------------------------

function ResultDisplay({ result }: { result: ScrapeResult }) {
  if (result.error) {
    return (
      <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
        <div className="text-sm font-semibold text-red-500 mb-1">Error</div>
        <div className="text-sm text-red-400">{result.error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="font-mono truncate">{result.url}</span>
        <span>•</span>
        <span>{new Date(result.timestamp).toLocaleString()}</span>
      </div>
      {Object.entries(result.data).map(([key, value]) => (
        <div key={key} className="p-3 border border-border rounded-lg bg-surface">
          <div className="text-xs font-semibold text-muted mb-1">{key}</div>
          {Array.isArray(value) ? (
            <ul className="space-y-1">
              {value.map((v, i) => (
                <li key={i} className="text-sm text-foreground">{v}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-foreground">{value}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function WebScraperInterface({ config }: { config: WebScraperConfig }) {
  useTheme();

  const [activeTab, setActiveTab] = useState<'scraper' | 'rules'>('scraper');
  const [url, setUrl] = useState('');
  const [selectors, setSelectors] = useState<ScrapeSelector[]>([
    { name: '', selector: '', attribute: 'text', multiple: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<ScrapeResult | null>(null);
  const [saveName, setSaveName] = useState('');

  const updateSelector = useCallback((index: number, updated: ScrapeSelector) => {
    setSelectors((prev) => prev.map((s, i) => (i === index ? updated : s)));
  }, []);

  const removeSelector = useCallback((index: number) => {
    setSelectors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addSelector = useCallback(() => {
    setSelectors((prev) => [...prev, { name: '', selector: '', attribute: 'text', multiple: false }]);
  }, []);

  const handleScrape = useCallback(async () => {
    const validSelectors = selectors.filter((s) => s.name.trim() && s.selector.trim());
    if (!url.trim() || validSelectors.length === 0) return;
    setIsLoading(true);
    try {
      const result = await config.onScrape({ url: url.trim(), selectors: validSelectors });
      setLatestResult(result);
    } catch {
      setLatestResult({ url: url.trim(), timestamp: new Date().toISOString(), data: {}, error: 'Scrape request failed' });
    } finally {
      setIsLoading(false);
    }
  }, [url, selectors, config]);

  const handleSaveRule = useCallback(() => {
    if (!saveName.trim() || !url.trim() || !config.onSaveRule) return;
    const validSelectors = selectors.filter((s) => s.name.trim() && s.selector.trim());
    config.onSaveRule({ name: saveName.trim(), url: url.trim(), selectors: validSelectors });
    setSaveName('');
  }, [saveName, url, selectors, config]);

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-border">
        <button
          onClick={() => setActiveTab('scraper')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'scraper' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-foreground'
          }`}
        >
          Scraper
        </button>
        {config.savedRules && config.savedRules.length > 0 && (
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'rules' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-foreground'
            }`}
          >
            Saved Rules ({config.savedRules.length})
          </button>
        )}
      </div>

      {/* Scraper tab */}
      {activeTab === 'scraper' && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Config panel */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Selectors</label>
                  <button onClick={addSelector} className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors">
                    <PlusIcon /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {selectors.map((sel, i) => (
                    <SelectorRow
                      key={i}
                      selector={sel}
                      onChange={(updated) => updateSelector(i, updated)}
                      onRemove={() => removeSelector(i)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleScrape}
                  disabled={isLoading || !url.trim()}
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors"
                >
                  {isLoading ? 'Scraping...' : 'Test Scrape'}
                </button>
                {config.onSaveRule && (
                  <>
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Rule name"
                      className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={handleSaveRule}
                      disabled={!saveName.trim() || !url.trim()}
                      className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt disabled:opacity-40 transition-colors"
                    >
                      Save Rule
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Preview panel */}
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Results</div>
              {latestResult ? (
                <ResultDisplay result={latestResult} />
              ) : config.results && config.results.length > 0 ? (
                <ResultDisplay result={config.results[config.results.length - 1]} />
              ) : (
                <div className="border border-border rounded-lg p-8 text-center text-sm text-muted">
                  Run a scrape to see results
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved rules tab */}
      {activeTab === 'rules' && config.savedRules && (
        <div className="divide-y divide-border">
          {config.savedRules.map((rule) => (
            <div key={rule.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{rule.name}</div>
                <div className="text-xs text-muted truncate">{rule.url}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted">{rule.selectors.length} selectors</span>
                  {rule.schedule && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full">
                      {rule.schedule}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setUrl(rule.url);
                    setSelectors(rule.selectors.map((s) => ({ ...s })));
                    setActiveTab('scraper');
                  }}
                  className="px-3 py-1 text-xs font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const result = await config.onScrape({ url: rule.url, selectors: rule.selectors });
                      setLatestResult(result);
                      setActiveTab('scraper');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Run
                </button>
                {config.onDeleteRule && (
                  <button
                    onClick={() => config.onDeleteRule!(rule.id)}
                    className="px-3 py-1 text-xs text-muted hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { WebScraperConfig, ScrapeSelector, ScrapeRequest, ScrapeResult, SavedRule } from './types';
