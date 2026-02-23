export interface GameLoopConfig {
  targetFPS?: number;
  fixedTimestep?: number;
  onUpdate: (dt: number) => void;
  onRender: (interpolation: number) => void;
  onFPSUpdate?: (fps: number) => void;
}
