export interface PaletteTile {
  id: number;
  name: string;
  color: string;
  icon?: string;
  category?: string;
  properties?: Record<string, unknown>;
}

export interface LevelData {
  width: number;
  height: number;
  layers: Record<string, number[][]>;
  metadata?: Record<string, unknown>;
}

export interface LevelEditorConfig {
  tileWidth: number;
  tileHeight: number;
  gridWidth: number;
  gridHeight: number;
  palette: PaletteTile[];
  layers?: string[];
  onSave: (level: LevelData) => void;
  onPlayTest?: (level: LevelData) => void;
  existingLevel?: LevelData;
}
