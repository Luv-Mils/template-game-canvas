export interface TileLayer {
  name: string;
  data: number[][];
  visible?: boolean;
  opacity?: number;
  collision?: boolean;
}

export interface Tileset {
  firstId: number;
  image: HTMLImageElement | string;
  columns: number;
  tileCount: number;
}

export interface TileMapConfig {
  tileWidth: number;
  tileHeight: number;
  layers: TileLayer[];
  tilesets: Tileset[];
}

export interface LoadedTileset {
  firstId: number;
  image: HTMLImageElement;
  columns: number;
  tileCount: number;
}
