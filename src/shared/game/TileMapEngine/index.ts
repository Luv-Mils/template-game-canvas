/**
 * TileMapEngine -- Game Engine Component (GME-06)
 *
 * Tile-based map rendering with tile layers, collision tiles,
 * scrolling camera, and camera culling for performance.
 */

import type { TileMapConfig, LoadedTileset } from './types';

export class TileMapEngine {
  private camera = { x: 0, y: 0 };
  private tilesets: LoadedTileset[] = [];
  private loadPromise: Promise<void> | null = null;

  constructor(private config: TileMapConfig) {
    this.loadPromise = this.loadTilesets();
  }

  private async loadTilesets(): Promise<void> {
    this.tilesets = await Promise.all(
      this.config.tilesets.map(async (ts) => {
        const image = await this.resolveImage(ts.image);
        return {
          firstId: ts.firstId,
          image,
          columns: ts.columns,
          tileCount: ts.tileCount,
        };
      }),
    );
  }

  async waitForLoad(): Promise<void> {
    if (this.loadPromise) await this.loadPromise;
  }

  render(ctx: CanvasRenderingContext2D, viewWidth: number, viewHeight: number): void {
    const { tileWidth, tileHeight, layers } = this.config;

    // Calculate visible tile range based on camera
    const startCol = Math.max(0, Math.floor(this.camera.x / tileWidth));
    const startRow = Math.max(0, Math.floor(this.camera.y / tileHeight));
    const endCol = Math.ceil((this.camera.x + viewWidth) / tileWidth);
    const endRow = Math.ceil((this.camera.y + viewHeight) / tileHeight);

    for (const layer of layers) {
      if (layer.visible === false) continue;

      const maxRow = Math.min(endRow, layer.data.length);
      const maxCol = layer.data[0] ? Math.min(endCol, layer.data[0].length) : 0;

      if (layer.opacity != null && layer.opacity < 1) {
        ctx.globalAlpha = layer.opacity;
      }

      for (let row = startRow; row < maxRow; row++) {
        for (let col = startCol; col < maxCol; col++) {
          const tileId = layer.data[row]?.[col];
          if (!tileId || tileId === 0) continue;

          const tileset = this.findTileset(tileId);
          if (!tileset) continue;

          const localId = tileId - tileset.firstId;
          const sx = (localId % tileset.columns) * tileWidth;
          const sy = Math.floor(localId / tileset.columns) * tileHeight;

          const dx = col * tileWidth - this.camera.x;
          const dy = row * tileHeight - this.camera.y;

          ctx.drawImage(
            tileset.image,
            sx, sy, tileWidth, tileHeight,
            dx, dy, tileWidth, tileHeight,
          );
        }
      }

      if (layer.opacity != null && layer.opacity < 1) {
        ctx.globalAlpha = 1;
      }
    }
  }

  setCamera(x: number, y: number): void {
    this.camera.x = x;
    this.camera.y = y;
  }

  getCamera(): { x: number; y: number } {
    return { ...this.camera };
  }

  getTileAt(layerName: string, worldX: number, worldY: number): number {
    const layer = this.config.layers.find((l) => l.name === layerName);
    if (!layer) return 0;

    const col = Math.floor(worldX / this.config.tileWidth);
    const row = Math.floor(worldY / this.config.tileHeight);

    return layer.data[row]?.[col] ?? 0;
  }

  setTileAt(layerName: string, worldX: number, worldY: number, tileId: number): void {
    const layer = this.config.layers.find((l) => l.name === layerName);
    if (!layer) return;

    const col = Math.floor(worldX / this.config.tileWidth);
    const row = Math.floor(worldY / this.config.tileHeight);

    if (layer.data[row]) {
      layer.data[row][col] = tileId;
    }
  }

  isSolid(worldX: number, worldY: number): boolean {
    const col = Math.floor(worldX / this.config.tileWidth);
    const row = Math.floor(worldY / this.config.tileHeight);

    for (const layer of this.config.layers) {
      if (!layer.collision) continue;
      const tileId = layer.data[row]?.[col];
      if (tileId && tileId !== 0) return true;
    }
    return false;
  }

  getMapSize(): { width: number; height: number } {
    const rows = this.config.layers[0]?.data.length ?? 0;
    const cols = this.config.layers[0]?.data[0]?.length ?? 0;
    return {
      width: cols * this.config.tileWidth,
      height: rows * this.config.tileHeight,
    };
  }

  private findTileset(tileId: number): LoadedTileset | undefined {
    // Find the tileset that contains this tile ID
    // Tilesets are searched in reverse order (last matching wins)
    for (let i = this.tilesets.length - 1; i >= 0; i--) {
      const ts = this.tilesets[i];
      if (tileId >= ts.firstId && tileId < ts.firstId + ts.tileCount) {
        return ts;
      }
    }
    return undefined;
  }

  private resolveImage(src: HTMLImageElement | string): Promise<HTMLImageElement> {
    if (src instanceof HTMLImageElement) {
      if (src.complete) return Promise.resolve(src);
      return new Promise((resolve, reject) => {
        src.onload = () => resolve(src);
        src.onerror = reject;
      });
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}

export type { TileMapConfig, TileLayer, Tileset, LoadedTileset } from './types';
