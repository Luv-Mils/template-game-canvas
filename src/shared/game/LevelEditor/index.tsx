/**
 * LevelEditor — Game Engine Component (GME-12)
 *
 * Visual tile-based level editor with canvas rendering.
 * Palette selection, multi-layer support, paint/erase/fill tools,
 * undo/redo, save/load JSON, play-test callback.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../foundation';
import type { LevelEditorConfig, LevelData, PaletteTile } from './types';

// -- Tools --------------------------------------------------------------------

type Tool = 'paint' | 'erase' | 'fill';

// -- Flood fill ---------------------------------------------------------------

function floodFill(grid: number[][], x: number, y: number, newTile: number, w: number, h: number): number[][] {
  const result = grid.map((row) => [...row]);
  const target = result[y][x];
  if (target === newTile) return result;

  const stack: Array<[number, number]> = [[x, y]];
  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
    if (result[cy][cx] !== target) continue;
    result[cy][cx] = newTile;
    stack.push([cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]);
  }
  return result;
}

// -- Main Component -----------------------------------------------------------

export default function LevelEditor({ config }: { config: LevelEditorConfig }) {
  useTheme();

  const { tileWidth, tileHeight, gridWidth, gridHeight, palette } = config;
  const layerNames = config.layers ?? ['default'];

  // State
  const [activeLayer, setActiveLayer] = useState(layerNames[0]);
  const [activeTile, setActiveTile] = useState(palette[0]?.id ?? 0);
  const [tool, setTool] = useState<Tool>('paint');
  const [showGrid, setShowGrid] = useState(true);
  const [layers, setLayers] = useState<Record<string, number[][]>>(() => {
    if (config.existingLevel?.layers) return config.existingLevel.layers;
    const empty: Record<string, number[][]> = {};
    for (const name of layerNames) {
      empty[name] = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(0));
    }
    return empty;
  });

  // Undo/Redo
  const [undoStack, setUndoStack] = useState<Array<Record<string, number[][]>>>([]);
  const [redoStack, setRedoStack] = useState<Array<Record<string, number[][]>>>([]);

  const pushUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-50), JSON.parse(JSON.stringify(layers))]);
    setRedoStack([]);
  }, [layers]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, JSON.parse(JSON.stringify(layers))]);
    setUndoStack((u) => u.slice(0, -1));
    setLayers(prev);
  }, [undoStack, layers]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, JSON.parse(JSON.stringify(layers))]);
    setRedoStack((r) => r.slice(0, -1));
    setLayers(next);
  }, [redoStack, layers]);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPainting = useRef(false);
  const canvasW = gridWidth * tileWidth;
  const canvasH = gridHeight * tileHeight;

  // Palette lookup
  const tileMap = useMemo(() => {
    const map = new Map<number, PaletteTile>();
    for (const t of palette) map.set(t.id, t);
    return map;
  }, [palette]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasW, canvasH);

    // Draw all layers (non-active at reduced opacity)
    for (const name of layerNames) {
      const grid = layers[name];
      if (!grid) continue;
      ctx.globalAlpha = name === activeLayer ? 1 : 0.3;
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const tileId = grid[y][x];
          if (tileId === 0) continue;
          const tile = tileMap.get(tileId);
          if (!tile) continue;
          ctx.fillStyle = tile.color;
          ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
          if (tile.icon) {
            ctx.globalAlpha = name === activeLayer ? 1 : 0.3;
            ctx.font = `${Math.min(tileWidth, tileHeight) * 0.6}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(tile.icon, x * tileWidth + tileWidth / 2, y * tileHeight + tileHeight / 2);
          }
        }
      }
    }
    ctx.globalAlpha = 1;

    // Grid lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(128,128,128,0.2)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileWidth, 0);
        ctx.lineTo(x * tileWidth, canvasH);
        ctx.stroke();
      }
      for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileHeight);
        ctx.lineTo(canvasW, y * tileHeight);
        ctx.stroke();
      }
    }
  }, [layers, activeLayer, showGrid, tileMap, layerNames, gridWidth, gridHeight, tileWidth, tileHeight, canvasW, canvasH]);

  useEffect(() => { draw(); }, [draw]);

  // Mouse → tile coordinates
  const getTileCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const scaleX = canvasW / rect.width;
      const scaleY = canvasH / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX / tileWidth);
      const y = Math.floor((e.clientY - rect.top) * scaleY / tileHeight);
      if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return null;
      return { x, y };
    },
    [canvasW, canvasH, tileWidth, tileHeight, gridWidth, gridHeight],
  );

  const applyTool = useCallback(
    (x: number, y: number) => {
      setLayers((prev) => {
        const grid = prev[activeLayer];
        if (!grid) return prev;

        if (tool === 'paint') {
          if (grid[y][x] === activeTile) return prev;
          const newGrid = grid.map((row) => [...row]);
          newGrid[y][x] = activeTile;
          return { ...prev, [activeLayer]: newGrid };
        }
        if (tool === 'erase') {
          if (grid[y][x] === 0) return prev;
          const newGrid = grid.map((row) => [...row]);
          newGrid[y][x] = 0;
          return { ...prev, [activeLayer]: newGrid };
        }
        if (tool === 'fill') {
          return { ...prev, [activeLayer]: floodFill(grid, x, y, activeTile, gridWidth, gridHeight) };
        }
        return prev;
      });
    },
    [activeLayer, activeTile, tool, gridWidth, gridHeight],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getTileCoords(e);
      if (!coords) return;
      pushUndo();
      isPainting.current = true;
      applyTool(coords.x, coords.y);
    },
    [getTileCoords, pushUndo, applyTool],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isPainting.current || tool === 'fill') return;
      const coords = getTileCoords(e);
      if (coords) applyTool(coords.x, coords.y);
    },
    [getTileCoords, applyTool, tool],
  );

  const handleMouseUp = useCallback(() => {
    isPainting.current = false;
  }, []);

  // Context menu = erase
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const coords = getTileCoords(e);
      if (!coords) return;
      pushUndo();
      setLayers((prev) => {
        const grid = prev[activeLayer];
        if (!grid || grid[coords.y][coords.x] === 0) return prev;
        const newGrid = grid.map((row) => [...row]);
        newGrid[coords.y][coords.x] = 0;
        return { ...prev, [activeLayer]: newGrid };
      });
    },
    [getTileCoords, pushUndo, activeLayer],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Save/Load
  const handleSave = useCallback(() => {
    config.onSave({ width: gridWidth, height: gridHeight, layers });
  }, [config, gridWidth, gridHeight, layers]);

  const handleLoad = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data: LevelData = JSON.parse(reader.result as string);
          if (data.layers) {
            pushUndo();
            setLayers(data.layers);
          }
        } catch { /* invalid JSON */ }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [pushUndo],
  );

  const handleClear = useCallback(() => {
    pushUndo();
    const empty: Record<string, number[][]> = {};
    for (const name of layerNames) {
      empty[name] = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(0));
    }
    setLayers(empty);
  }, [pushUndo, layerNames, gridHeight, gridWidth]);

  // Palette categories
  const categories = useMemo(() => {
    const cats = new Map<string, PaletteTile[]>();
    for (const tile of palette) {
      const cat = tile.category ?? 'General';
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat)!.push(tile);
    }
    return cats;
  }, [palette]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-wrap">
        <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
          Save
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-xs font-medium bg-surface border border-border rounded-lg text-foreground hover:bg-surface-alt transition-colors">
          Load
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoad} />
        {config.onPlayTest && (
          <button
            onClick={() => config.onPlayTest!({ width: gridWidth, height: gridHeight, layers })}
            className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
          >
            Play Test
          </button>
        )}
        <div className="w-px h-6 bg-border mx-1" />
        <button onClick={undo} disabled={undoStack.length === 0} className="px-2 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-30 transition-colors">
          Undo
        </button>
        <button onClick={redo} disabled={redoStack.length === 0} className="px-2 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-30 transition-colors">
          Redo
        </button>
        <button onClick={handleClear} className="px-2 py-1.5 text-xs text-muted hover:text-red-500 transition-colors">
          Clear
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        {(['paint', 'erase', 'fill'] as Tool[]).map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              tool === t ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted hover:border-primary/40'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="w-px h-6 bg-border mx-1" />
        <label className="flex items-center gap-1 text-xs text-muted">
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="accent-primary" />
          Grid
        </label>
      </div>

      <div className="flex">
        {/* Palette */}
        <div className="w-48 border-r border-border p-3 overflow-y-auto max-h-[600px] flex-shrink-0">
          {/* Layer selector */}
          {layerNames.length > 1 && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Layer</div>
              <div className="flex flex-wrap gap-1">
                {layerNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setActiveLayer(name)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      activeLayer === name ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted hover:border-primary/40'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tile palette */}
          {Array.from(categories.entries()).map(([cat, tiles]) => (
            <div key={cat} className="mb-3">
              <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">{cat}</div>
              <div className="grid grid-cols-4 gap-1">
                {tiles.map((tile) => (
                  <button
                    key={tile.id}
                    onClick={() => { setActiveTile(tile.id); setTool('paint'); }}
                    className={`w-9 h-9 rounded border-2 flex items-center justify-center text-sm transition-colors ${
                      activeTile === tile.id ? 'border-primary ring-1 ring-primary/50' : 'border-transparent hover:border-border'
                    }`}
                    style={{ backgroundColor: tile.color }}
                    title={tile.name}
                  >
                    {tile.icon ?? ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4">
          <canvas
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
            className="border border-border rounded cursor-crosshair"
            style={{ maxWidth: '100%', height: 'auto', imageRendering: 'pixelated' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>
    </div>
  );
}

export type { LevelEditorConfig, LevelData, PaletteTile } from './types';
