/**
 * SpreadsheetView -- Data Component (DAT-06)
 *
 * Editable grid with cell navigation (Tab/Enter/arrows), basic formula support
 * (SUM, AVERAGE, COUNT, MIN, MAX + arithmetic with cell refs), formula bar,
 * freeze rows/cols via position: sticky.
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useTheme } from '../../foundation';
import type { SpreadsheetViewConfig } from './types';

// -- Helpers ------------------------------------------------------------------

function colLabel(index: number): string {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

function cellRefToIndex(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const colStr = match[1];
  const rowNum = parseInt(match[2], 10) - 1;
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { row: rowNum, col: col - 1 };
}

function getCellValue(
  data: (string | number | null)[][],
  formulas: Map<string, string>,
  row: number,
  col: number,
  visited: Set<string>,
): number {
  const key = `${row},${col}`;
  if (visited.has(key)) return 0; // circular ref protection
  visited.add(key);

  const raw = data[row]?.[col];
  if (raw == null) return 0;
  const str = String(raw);

  if (str.startsWith('=')) {
    return evaluateFormula(str, data, formulas, visited);
  }

  const num = Number(raw);
  return isNaN(num) ? 0 : num;
}

function parseRange(
  rangeStr: string,
  data: (string | number | null)[][],
  formulas: Map<string, string>,
  visited: Set<string>,
): number[] {
  const parts = rangeStr.split(':');
  if (parts.length === 2) {
    const start = cellRefToIndex(parts[0]);
    const end = cellRefToIndex(parts[1]);
    if (!start || !end) return [];
    const values: number[] = [];
    for (let r = start.row; r <= end.row; r++) {
      for (let c = start.col; c <= end.col; c++) {
        values.push(getCellValue(data, formulas, r, c, new Set(visited)));
      }
    }
    return values;
  }
  const cell = cellRefToIndex(rangeStr);
  if (cell) return [getCellValue(data, formulas, cell.row, cell.col, new Set(visited))];
  const num = Number(rangeStr);
  return isNaN(num) ? [] : [num];
}

function evaluateFormula(
  formula: string,
  data: (string | number | null)[][],
  formulas: Map<string, string>,
  visited: Set<string>,
): number {
  const expr = formula.slice(1).trim();

  // Function calls: SUM(...), AVERAGE(...), COUNT(...), MIN(...), MAX(...)
  const fnMatch = expr.match(/^(SUM|AVERAGE|COUNT|MIN|MAX)\((.+)\)$/i);
  if (fnMatch) {
    const fn = fnMatch[1].toUpperCase();
    const args = fnMatch[2].split(',').map((s) => s.trim());
    const values = args.flatMap((a) => parseRange(a, data, formulas, visited));

    switch (fn) {
      case 'SUM': return values.reduce((a, b) => a + b, 0);
      case 'AVERAGE': return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'COUNT': return values.length;
      case 'MIN': return values.length ? Math.min(...values) : 0;
      case 'MAX': return values.length ? Math.max(...values) : 0;
    }
  }

  // Simple arithmetic: replace cell refs with values, then evaluate safely
  const arithmeticExpr = expr.replace(/[A-Z]+\d+/g, (ref) => {
    const cell = cellRefToIndex(ref);
    if (!cell) return '0';
    return String(getCellValue(data, formulas, cell.row, cell.col, new Set(visited)));
  });

  // Safe evaluation — only allow numbers, operators, parens, spaces
  if (/^[\d\s+\-*/().]+$/.test(arithmeticExpr)) {
    try {
      return Function(`"use strict"; return (${arithmeticExpr})`)() as number;
    } catch {
      return 0;
    }
  }

  return 0;
}

// -- Main Component -----------------------------------------------------------

export default function SpreadsheetView({ config }: { config: SpreadsheetViewConfig }) {
  useTheme();

  const [data, setData] = useState<(string | number | null)[][]>(() =>
    config.data.map((row) => [...row]),
  );
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const numCols = useMemo(() => {
    const maxDataCols = data.reduce((max, row) => Math.max(max, row.length), 0);
    return Math.max(maxDataCols, config.headers?.length ?? 0, 1);
  }, [data, config.headers]);

  const formulas = useMemo(() => {
    const map = new Map<string, string>();
    if (!config.formulas) return map;
    data.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (cell != null && String(cell).startsWith('=')) {
          map.set(`${ri},${ci}`, String(cell));
        }
      });
    });
    return map;
  }, [data, config.formulas]);

  const computedValues = useMemo(() => {
    if (!config.formulas) return null;
    const computed: (string | number)[][] = data.map((row, ri) =>
      row.map((cell, ci) => {
        if (cell != null && String(cell).startsWith('=')) {
          return evaluateFormula(String(cell), data, formulas, new Set());
        }
        return cell ?? '';
      }),
    );
    return computed;
  }, [data, formulas, config.formulas]);

  // Sync formula bar with active cell
  useEffect(() => {
    if (activeCell) {
      const raw = data[activeCell.row]?.[activeCell.col];
      setFormulaBarValue(raw != null ? String(raw) : '');
    } else {
      setFormulaBarValue('');
    }
  }, [activeCell, data]);

  const commitEdit = useCallback((row: number, col: number, value: string) => {
    setData((prev) => {
      const next = prev.map((r) => [...r]);
      while (next.length <= row) next.push([]);
      while (next[row].length <= col) next[row].push(null);

      const parsed = value.startsWith('=') ? value : isNaN(Number(value)) || value === '' ? value : Number(value);
      next[row][col] = parsed as string | number | null;
      return next;
    });
    config.onCellChange?.(row, col, value === '' ? '' : isNaN(Number(value)) ? value : Number(value));
    setEditingCell(null);
  }, [config]);

  const startEdit = useCallback((row: number, col: number) => {
    if (!config.editable) return;
    const raw = data[row]?.[col];
    const val = raw != null ? String(raw) : '';
    setEditingCell({ row, col });
    setEditValue(val);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [config.editable, data]);

  const moveActive = useCallback((dr: number, dc: number) => {
    setActiveCell((prev) => {
      if (!prev) return { row: 0, col: 0 };
      const newRow = Math.max(0, Math.min(data.length - 1, prev.row + dr));
      const newCol = Math.max(0, Math.min(numCols - 1, prev.col + dc));
      return { row: newRow, col: newCol };
    });
  }, [data.length, numCols]);

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, row: number, col: number) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit(row, col, editValue);
        moveActive(1, 0);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit(row, col, editValue);
        moveActive(0, e.shiftKey ? -1 : 1);
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      }
      return;
    }

    // Navigation when not editing
    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); moveActive(-1, 0); break;
      case 'ArrowDown': e.preventDefault(); moveActive(1, 0); break;
      case 'ArrowLeft': e.preventDefault(); moveActive(0, -1); break;
      case 'ArrowRight': e.preventDefault(); moveActive(0, 1); break;
      case 'Tab': e.preventDefault(); moveActive(0, e.shiftKey ? -1 : 1); break;
      case 'Enter': e.preventDefault(); startEdit(row, col); break;
      case 'Delete':
      case 'Backspace':
        if (config.editable) {
          e.preventDefault();
          commitEdit(row, col, '');
        }
        break;
      default:
        // Start editing on printable character
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && config.editable) {
          setEditingCell({ row, col });
          setEditValue(e.key);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
    }
  }, [editingCell, editValue, commitEdit, moveActive, startEdit, config.editable]);

  const handleFormulaBarKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!activeCell) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit(activeCell.row, activeCell.col, formulaBarValue);
    } else if (e.key === 'Escape') {
      const raw = data[activeCell.row]?.[activeCell.col];
      setFormulaBarValue(raw != null ? String(raw) : '');
      tableRef.current?.focus();
    }
  }, [activeCell, formulaBarValue, commitEdit, data]);

  const handleFormulaBarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulaBarValue(e.target.value);
  }, []);

  const freezeRows = config.freezeRows ?? 0;
  const freezeCols = config.freezeCols ?? 0;

  const getDisplayValue = (row: number, col: number): string => {
    if (computedValues && computedValues[row]?.[col] !== undefined) {
      const raw = data[row]?.[col];
      if (raw != null && String(raw).startsWith('=')) {
        const val = computedValues[row][col];
        return typeof val === 'number' ? (Number.isInteger(val) ? String(val) : val.toFixed(2)) : String(val);
      }
    }
    const raw = data[row]?.[col];
    return raw != null ? String(raw) : '';
  };

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Formula Bar */}
      {config.formulaBar && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface">
          <span className="text-xs font-mono text-muted w-12 text-center">
            {activeCell ? `${colLabel(activeCell.col)}${activeCell.row + 1}` : ''}
          </span>
          <span className="text-border">|</span>
          <input
            ref={formulaInputRef}
            type="text"
            value={formulaBarValue}
            onChange={handleFormulaBarChange}
            onKeyDown={handleFormulaBarKeyDown}
            disabled={!config.editable || !activeCell}
            className="flex-1 text-sm font-mono bg-transparent text-foreground focus:outline-none"
            placeholder={config.editable ? 'Enter value or formula (=SUM(A1:A10))' : ''}
          />
        </div>
      )}

      {/* Grid */}
      <div ref={tableRef} className="overflow-auto max-h-[600px]" tabIndex={0}>
        <table className="border-collapse">
          {/* Header Row */}
          <thead>
            <tr>
              {/* Row number header */}
              <th
                className="px-2 py-1.5 text-xs text-muted bg-surface border-r border-b border-border w-10 text-center"
                style={{
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 20,
                }}
              >
                #
              </th>
              {Array.from({ length: numCols }).map((_, ci) => (
                <th
                  key={ci}
                  className="px-3 py-1.5 text-xs font-semibold text-muted uppercase tracking-wider bg-surface border-r border-b border-border text-center whitespace-nowrap"
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: ci < freezeCols ? 15 : 10,
                    ...(ci < freezeCols ? { left: 40 + ci * (config.columnWidths?.[ci] ?? 120) } : {}),
                    width: config.columnWidths?.[ci] ?? 120,
                    minWidth: config.columnWidths?.[ci] ?? 120,
                  }}
                >
                  {config.headers?.[ci] ?? colLabel(ci)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri}>
                {/* Row number */}
                <td
                  className="px-2 py-1 text-xs text-muted bg-surface border-r border-b border-border text-center"
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: ri < freezeRows ? 12 : 5,
                    ...(ri < freezeRows ? { top: 32 + ri * 32 } : {}),
                  }}
                >
                  {ri + 1}
                </td>
                {Array.from({ length: numCols }).map((_, ci) => {
                  const isActive = activeCell?.row === ri && activeCell?.col === ci;
                  const isEditing = editingCell?.row === ri && editingCell?.col === ci;
                  const isFrozenRow = ri < freezeRows;
                  const isFrozenCol = ci < freezeCols;

                  return (
                    <td
                      key={ci}
                      className={`px-1 py-0 border-r border-b border-border text-sm ${
                        isActive ? 'ring-2 ring-primary ring-inset' : ''
                      } ${isFrozenRow || isFrozenCol ? 'bg-surface' : 'bg-background'}`}
                      style={{
                        width: config.columnWidths?.[ci] ?? 120,
                        minWidth: config.columnWidths?.[ci] ?? 120,
                        ...(isFrozenRow ? { position: 'sticky', top: 32 + ri * 32, zIndex: isFrozenCol ? 12 : 8 } : {}),
                        ...(isFrozenCol && !isFrozenRow ? { position: 'sticky', left: 40 + ci * (config.columnWidths?.[ci] ?? 120), zIndex: 5 } : {}),
                      }}
                      onClick={() => {
                        setActiveCell({ row: ri, col: ci });
                        if (editingCell && (editingCell.row !== ri || editingCell.col !== ci)) {
                          commitEdit(editingCell.row, editingCell.col, editValue);
                        }
                      }}
                      onDoubleClick={() => startEdit(ri, ci)}
                      onKeyDown={(e) => handleCellKeyDown(e, ri, ci)}
                      tabIndex={isActive ? 0 : -1}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, ri, ci)}
                          onBlur={() => commitEdit(ri, ci, editValue)}
                          className="w-full h-full px-2 py-1 text-sm font-mono bg-transparent text-foreground focus:outline-none"
                        />
                      ) : (
                        <div className="px-2 py-1 truncate text-foreground">
                          {getDisplayValue(ri, ci)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { SpreadsheetViewConfig } from './types';
