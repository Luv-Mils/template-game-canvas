export interface SpreadsheetViewConfig {
  data: (string | number | null)[][];
  headers?: string[];
  formulas?: boolean;
  formulaBar?: boolean;
  freezeRows?: number;
  freezeCols?: number;
  editable?: boolean;
  onCellChange?: (row: number, col: number, value: string | number) => void;
  columnWidths?: number[];
}
