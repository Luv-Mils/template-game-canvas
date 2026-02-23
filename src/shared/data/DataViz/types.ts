export interface DataVizDataset {
  label: string;
  values: number[];
  color?: string;
}

export interface DataVizData {
  labels: string[];
  datasets: DataVizDataset[];
}

export interface DataVizConfig {
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'sparkline';
  data: DataVizData;
  width?: string;
  height?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  title?: string;
}
