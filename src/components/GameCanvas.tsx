import React, { useRef, useEffect } from 'react';

interface GameCanvasProps {
  width: number;
  height: number;
  onInit: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
  className?: string;
}

export default function GameCanvas({ width, height, onInit, className }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initialized.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    initialized.current = true;
    onInit(ctx, canvas);
  }, [onInit]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className ?? 'mx-auto block'}
      style={{ maxWidth: '100%', maxHeight: '100vh' }}
    />
  );
}
