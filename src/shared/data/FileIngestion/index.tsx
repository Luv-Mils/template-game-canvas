/**
 * FileIngestion -- Data Component (DAT-05)
 *
 * Drop zone + file picker → parse CSV/TSV/JSON → preview + column mapping → onDataReady.
 * Extensible via `parser` prop for custom formats (XLSX, etc.).
 */

import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { FileIngestionConfig, ParsedData } from './types';

// -- Parsers ------------------------------------------------------------------

function parseCSV(text: string, separator: string): { headers: string[]; rows: unknown[][] } {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current.length > 0 || lines.length > 0) {
        lines.push(current);
        current = '';
      }
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += ch;
    }
  }
  if (current.length > 0) lines.push(current);

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          q = !q;
        }
      } else if (ch === separator && !q) {
        cells.push(cell);
        cell = '';
      } else {
        cell += ch;
      }
    }
    cells.push(cell);
    return cells;
  };

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseLine(line));
  return { headers, rows };
}

function parseJSON(text: string): { headers: string[]; rows: unknown[][] } {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(arr[0]);
  const rows = arr.map((item) => headers.map((h) => item[h] ?? ''));
  return { headers, rows };
}

async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// -- Column Mapper ------------------------------------------------------------

function ColumnMapper({
  headers,
  onConfirm,
  onCancel,
}: {
  headers: string[];
  onConfirm: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [mapping, setMapping] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    headers.forEach((h) => { m[h] = h; });
    return m;
  });

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">Column Mapping</h4>
      <div className="space-y-2 max-h-60 overflow-auto">
        {headers.map((h) => (
          <div key={h} className="flex items-center gap-3">
            <span className="text-sm text-muted w-32 truncate">{h}</span>
            <span className="text-muted">→</span>
            <input
              type="text"
              value={mapping[h] || ''}
              onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors">
          Cancel
        </button>
        <button
          onClick={() => onConfirm(mapping)}
          className="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

// -- Preview Table ------------------------------------------------------------

function PreviewTable({ data }: { data: ParsedData }) {
  const previewRows = data.rows.slice(0, 10);

  return (
    <div className="border border-border rounded-lg overflow-auto max-h-64">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-surface">
          <tr>
            {data.headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wider border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, ri) => (
            <tr key={ri} className="border-t border-border hover:bg-surface/50">
              {(row as unknown[]).map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-foreground whitespace-nowrap">
                  {String(cell ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.rows.length > 10 && (
        <div className="px-3 py-2 text-xs text-muted border-t border-border bg-surface">
          Showing 10 of {data.rowCount} rows
        </div>
      )}
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function FileIngestion({ config }: { config: FileIngestionConfig }) {
  useTheme();

  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<ParsedData | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSize = (config.maxSizeMB ?? 10) * 1024 * 1024;

  const acceptStr = config.acceptedTypes
    .map((t) => {
      switch (t) {
        case 'csv': return '.csv';
        case 'tsv': return '.tsv';
        case 'json': return '.json';
        case 'xlsx': return '.xlsx';
        default: return '';
      }
    })
    .filter(Boolean)
    .join(',');

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setPreview(null);
    setShowMapping(false);

    // Validate size
    if (file.size > maxSize) {
      const msg = `File too large. Max size: ${config.maxSizeMB ?? 10}MB`;
      setError(msg);
      config.onError?.(msg);
      return;
    }

    // Detect type
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const allowed = config.acceptedTypes.map((t) => t.toLowerCase());
    if (!allowed.includes(ext)) {
      const msg = `Unsupported file type: .${ext}. Accepted: ${config.acceptedTypes.join(', ')}`;
      setError(msg);
      config.onError?.(msg);
      return;
    }

    setParsing(true);
    try {
      let parsed: ParsedData;

      // Custom parser
      if (config.parser) {
        parsed = await config.parser(file);
      } else {
        const text = await readFile(file);

        let result: { headers: string[]; rows: unknown[][] };
        switch (ext) {
          case 'csv':
            result = parseCSV(text, ',');
            break;
          case 'tsv':
            result = parseCSV(text, '\t');
            break;
          case 'json':
            result = parseJSON(text);
            break;
          default: {
            const msg = `No built-in parser for .${ext}. Provide a custom parser prop.`;
            setError(msg);
            config.onError?.(msg);
            setParsing(false);
            return;
          }
        }

        parsed = {
          headers: result.headers,
          rows: result.rows,
          rowCount: result.rows.length,
          fileName: file.name,
          fileType: ext,
        };
      }

      if (config.showPreview || config.columnMapping) {
        setPreview(parsed);
        if (config.columnMapping) {
          setShowMapping(true);
        }
      } else {
        config.onDataReady(parsed);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file';
      setError(msg);
      config.onError?.(msg);
    } finally {
      setParsing(false);
    }
  }, [config, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile]);

  const handleMappingConfirm = useCallback((mapping: Record<string, string>) => {
    if (!preview) return;
    const newHeaders = preview.headers.map((h) => mapping[h] || h);
    const mapped: ParsedData = { ...preview, headers: newHeaders };
    setShowMapping(false);
    config.onDataReady(mapped);
  }, [preview, config]);

  const handleConfirmPreview = useCallback(() => {
    if (preview) config.onDataReady(preview);
  }, [preview, config]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-surface/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptStr}
          onChange={handleChange}
          className="hidden"
        />

        {parsing ? (
          <div className="text-sm text-muted">Parsing file...</div>
        ) : (
          <>
            <div className="text-3xl mb-3 text-muted">📂</div>
            <p className="text-sm font-medium text-foreground mb-1">
              Drop a file here or click to browse
            </p>
            <p className="text-xs text-muted">
              Accepted: {config.acceptedTypes.map((t) => `.${t}`).join(', ')}
              {config.maxSizeMB && ` · Max ${config.maxSizeMB}MB`}
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Column Mapping */}
      {showMapping && preview && (
        <ColumnMapper
          headers={preview.headers}
          onConfirm={handleMappingConfirm}
          onCancel={() => setShowMapping(false)}
        />
      )}

      {/* Preview */}
      {preview && !showMapping && config.showPreview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              Preview: {preview.fileName} ({preview.rowCount} rows)
            </span>
            <button
              onClick={handleConfirmPreview}
              className="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Import Data
            </button>
          </div>
          <PreviewTable data={preview} />
        </div>
      )}
    </div>
  );
}

export type { FileIngestionConfig, ParsedData } from './types';
