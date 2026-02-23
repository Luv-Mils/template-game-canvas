export interface CanvasRendererConfig {
  width: number;
  height: number;
  pixelRatio?: number;
  backgroundColor?: string;
  layers?: number;
  onReady?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
  onReadyMulti?: (contexts: CanvasRenderingContext2D[], canvases: HTMLCanvasElement[]) => void;
  className?: string;
}
