/**
 * ExportEngine -- Data Component (DAT-08)
 *
 * Export data as CSV, JSON (built-in), or XLSX/PDF (via extensible generator prop).
 * Uses render-prop pattern so templates control the button styling.
 */

import React, { useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { ExportEngineConfig, ExportRenderProps } from './types';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCSV(
  data: Record<string, unknown>[],
  columns: ExportEngineConfig['columns'],
): Blob {
  const header = columns.map((c) => escapeCSV(c.label)).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const raw = row[col.key];
        const formatted = col.format ? col.format(raw) : String(raw ?? '');
        return escapeCSV(formatted);
      })
      .join(','),
  );
  return new Blob([header + '\n' + rows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
}

function generateJSON(
  data: Record<string, unknown>[],
  columns: ExportEngineConfig['columns'],
): Blob {
  const mapped = data.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col) => {
      obj[col.label] = col.format ? col.format(row[col.key]) : row[col.key];
    });
    return obj;
  });
  return new Blob([JSON.stringify(mapped, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DefaultUI({
  triggerExport,
  formats,
}: ExportRenderProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors flex items-center gap-2"
      >
        Export
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-20 min-w-[120px]">
          {formats.map((f) => (
            <button
              key={f}
              onClick={() => {
                triggerExport(f);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface-alt transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExportEngine({
  config,
  children,
}: {
  config: ExportEngineConfig;
  children?: (props: ExportRenderProps) => React.ReactNode;
}) {
  useTheme();

  const handleExport = useCallback(
    (format: string) => {
      const fileName = config.fileName || 'export';
      let blob: Blob | null = null;

      // Try custom generator first
      if (config.generator) {
        blob = config.generator(config.data, config.columns, format);
      }

      // Built-in generators
      if (!blob) {
        switch (format) {
          case 'csv':
            blob = generateCSV(config.data, config.columns);
            break;
          case 'json':
            blob = generateJSON(config.data, config.columns);
            break;
          case 'pdf': {
            // Print-based PDF: build HTML table, open in new window, trigger print
            const headers = config.columns.map((c) => `<th style="padding:8px;border:1px solid #ddd;text-align:left">${c.label}</th>`).join('');
            const rows = config.data.map((row) =>
              '<tr>' + config.columns.map((col) => {
                const val = col.format ? col.format(row[col.key]) : String(row[col.key] ?? '');
                return `<td style="padding:8px;border:1px solid #ddd">${val}</td>`;
              }).join('') + '</tr>',
            ).join('');
            const html = `<html><head><title>${fileName}</title></head><body><table style="border-collapse:collapse;width:100%;font-family:sans-serif"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
            const w = window.open('', '_blank');
            if (w) {
              w.document.write(html);
              w.document.close();
              w.print();
            }
            config.onExport?.(format);
            return;
          }
          case 'xlsx':
            // Fallback: export as CSV with .xlsx extension
            blob = generateCSV(config.data, config.columns);
            break;
        }
      }

      if (blob) {
        const ext = format === 'xlsx' ? 'xlsx' : format;
        triggerDownload(blob, `${fileName}.${ext}`);
      }
      config.onExport?.(format);
    },
    [config],
  );

  const renderProps: ExportRenderProps = {
    triggerExport: handleExport,
    formats: config.formats,
  };

  if (children) {
    return <>{children(renderProps)}</>;
  }

  return <DefaultUI {...renderProps} />;
}

export type { ExportEngineConfig, ExportColumn, ExportRenderProps } from './types';
