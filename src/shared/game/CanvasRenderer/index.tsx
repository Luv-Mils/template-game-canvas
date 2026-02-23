/**
 * CanvasRenderer -- Game Engine Component (GME-01)
 *
 * 2D canvas setup with resolution scaling, pixel ratio handling,
 * and optional multi-layer support for parallax / UI separation.
 */

import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../foundation';
import type { CanvasRendererConfig } from './types';

export default function CanvasRenderer({ config }: { config: CanvasRendererConfig }) {
  useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);
  const layerCount = Math.max(1, config.layers ?? 1);

  useEffect(() => {
    const ratio = config.pixelRatio ?? window.devicePixelRatio ?? 1;
    const contexts: CanvasRenderingContext2D[] = [];
    const canvases: HTMLCanvasElement[] = [];

    for (let i = 0; i < layerCount; i++) {
      const canvas = canvasRefs.current[i];
      if (!canvas) continue;

      canvas.width = config.width * ratio;
      canvas.height = config.height * ratio;
      canvas.style.width = `${config.width}px`;
      canvas.style.height = `${config.height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.scale(ratio, ratio);

      if (config.backgroundColor && i === 0) {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, config.width, config.height);
      }

      contexts.push(ctx);
      canvases.push(canvas);
    }

    if (contexts.length > 0) {
      config.onReady?.(contexts[0], canvases[0]);
      if (layerCount > 1) {
        config.onReadyMulti?.(contexts, canvases);
      }
    }
  }, [config.width, config.height, config.pixelRatio, layerCount]);

  return (
    <div
      ref={containerRef}
      className={config.className ?? ''}
      style={{ position: 'relative', width: config.width, height: config.height }}
    >
      {Array.from({ length: layerCount }, (_, i) => (
        <canvas
          key={i}
          ref={(el) => {
            if (el) canvasRefs.current[i] = el;
          }}
          className="block"
          style={
            layerCount > 1
              ? { position: 'absolute', top: 0, left: 0 }
              : undefined
          }
        />
      ))}
    </div>
  );
}

export type { CanvasRendererConfig } from './types';
