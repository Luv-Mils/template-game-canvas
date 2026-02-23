export interface GameState {
  onEnter?: () => void;
  onExit?: () => void;
  onUpdate?: (dt: number) => void;
  onRender?: (ctx: CanvasRenderingContext2D) => void;
}

export interface GameStateConfig {
  states: Record<string, GameState>;
  initialState: string;
}
