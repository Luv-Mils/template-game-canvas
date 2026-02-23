export interface TileMapData {
  width: number;
  height: number;
  tileSize: number;
  layers: number[][][]; // layer → row → col
}

export function drawTileMap(
  ctx: CanvasRenderingContext2D,
  map: TileMapData,
  palette: Record<number, string>,
  camX: number,
  camY: number,
  canvasW: number,
  canvasH: number,
) {
  const { tileSize, layers } = map;
  const startCol = Math.max(0, Math.floor(camX / tileSize));
  const endCol = Math.min(map.width, Math.ceil((camX + canvasW) / tileSize));
  const startRow = Math.max(0, Math.floor(camY / tileSize));
  const endRow = Math.min(map.height, Math.ceil((camY + canvasH) / tileSize));

  for (const layer of layers) {
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = layer[r]?.[c] ?? 0;
        if (tile === 0) continue;
        const color = palette[tile];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }
  }
}

export function getTileAt(map: TileMapData, x: number, y: number, layer = 0): number {
  const col = Math.floor(x / map.tileSize);
  const row = Math.floor(y / map.tileSize);
  return map.layers[layer]?.[row]?.[col] ?? 0;
}
