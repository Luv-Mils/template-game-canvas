import React, { useCallback, useState, useEffect, useRef } from 'react';
import type { GameTheme } from '../../types';
import { GameCanvas, HUD, GameMenu } from '../../components';
import { GameLoop } from '../../engine/GameLoop';
import { drawRect, drawText, drawCircle } from '../../engine/Sprite';
import { Input } from '../../engine/Input';

const W = 640;
const H = 480;
const TILE = 48;
const GRID_W = 8;
const GRID_H = 6;
const OFFSET_X = (W - GRID_W * TILE) / 2;
const OFFSET_Y = 60;

type CropType = 'wheat' | 'carrot' | 'tomato' | 'corn';
interface CropInfo { name: string; color: string; growTime: number; value: number; icon: string }
interface Plot { crop: CropType | null; growth: number; watered: boolean; ready: boolean }

const CROPS: Record<CropType, CropInfo> = {
  wheat:  { name: 'Wheat',  color: '#F59E0B', growTime: 8,  value: 15, icon: '🌾' },
  carrot: { name: 'Carrot', color: '#F97316', growTime: 12, value: 25, icon: '🥕' },
  tomato: { name: 'Tomato', color: '#EF4444', growTime: 16, value: 40, icon: '🍅' },
  corn:   { name: 'Corn',   color: '#84CC16', growTime: 20, value: 60, icon: '🌽' },
};

export default function FarmingSimGame({ theme }: { theme: GameTheme }) {
  const [state, setState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [gold, setGold] = useState(50);
  const [day, setDay] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState<CropType>('wheat');
  const [tool, setTool] = useState<'plant' | 'water' | 'harvest'>('plant');
  const [plots, setPlots] = useState<Plot[]>([]);

  const startGame = useCallback(() => {
    setState('playing');
    setGold(50);
    setDay(1);
    setPlots(Array.from({ length: GRID_W * GRID_H }, () => ({
      crop: null, growth: 0, watered: false, ready: false,
    })));
  }, []);

  const onInit = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const c = theme.colors;
    let gameGold = 50;
    let gameDay = 1;
    let gamePlots: Plot[] = Array.from({ length: GRID_W * GRID_H }, () => ({
      crop: null, growth: 0, watered: false, ready: false,
    }));
    let gameTool: 'plant' | 'water' | 'harvest' = 'plant';
    let gameCrop: CropType = 'wheat';
    let dayTimer = 0;
    const DAY_LENGTH = 5; // seconds per day

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top) * (H / rect.height);

      const gx = Math.floor((mx - OFFSET_X) / TILE);
      const gy = Math.floor((my - OFFSET_Y) / TILE);
      if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return;

      const idx = gy * GRID_W + gx;
      const plot = gamePlots[idx];

      if (gameTool === 'plant' && !plot.crop) {
        const cost = CROPS[gameCrop].value;
        const seedCost = Math.ceil(cost * 0.3);
        if (gameGold >= seedCost) {
          gameGold -= seedCost;
          setGold(gameGold);
          plot.crop = gameCrop;
          plot.growth = 0;
          plot.watered = false;
          plot.ready = false;
        }
      } else if (gameTool === 'water' && plot.crop && !plot.ready) {
        plot.watered = true;
      } else if (gameTool === 'harvest' && plot.ready) {
        gameGold += CROPS[plot.crop!].value;
        setGold(gameGold);
        plot.crop = null;
        plot.growth = 0;
        plot.watered = false;
        plot.ready = false;
      }
      setPlots([...gamePlots]);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '1') { gameTool = 'plant'; setTool('plant'); }
      if (e.key === '2') { gameTool = 'water'; setTool('water'); }
      if (e.key === '3') { gameTool = 'harvest'; setTool('harvest'); }
      if (e.key === 'q') { gameCrop = 'wheat'; setSelectedCrop('wheat'); }
      if (e.key === 'w') { gameCrop = 'carrot'; setSelectedCrop('carrot'); }
      if (e.key === 'e') { gameCrop = 'tomato'; setSelectedCrop('tomato'); }
      if (e.key === 'r') { gameCrop = 'corn'; setSelectedCrop('corn'); }
    });

    function update(dt: number) {
      dayTimer += dt;
      if (dayTimer >= DAY_LENGTH) {
        dayTimer -= DAY_LENGTH;
        gameDay++;
        setDay(gameDay);
        // Grow crops
        for (const plot of gamePlots) {
          if (plot.crop && plot.watered && !plot.ready) {
            plot.growth++;
            plot.watered = false;
            if (plot.growth >= CROPS[plot.crop].growTime) {
              plot.ready = true;
            }
          }
        }
        setPlots([...gamePlots]);
      }
    }

    function render() {
      ctx.fillStyle = c.background;
      ctx.fillRect(0, 0, W, H);

      // Title
      drawText(ctx, `Day ${gameDay}`, W / 2, 30, c.foreground, 18, 'center');

      // Grid
      for (let gy = 0; gy < GRID_H; gy++) {
        for (let gx = 0; gx < GRID_W; gx++) {
          const px = OFFSET_X + gx * TILE;
          const py = OFFSET_Y + gy * TILE;
          const idx = gy * GRID_W + gx;
          const plot = gamePlots[idx];

          // Soil
          drawRect(ctx, px + 1, py + 1, TILE - 2, TILE - 2, plot.watered ? '#3B2D1F' : c.surfaceAlt);

          if (plot.crop) {
            const info = CROPS[plot.crop];
            const growPct = plot.growth / info.growTime;
            if (plot.ready) {
              // Full grown
              drawCircle(ctx, px + TILE / 2, py + TILE / 2, 16, info.color);
              drawText(ctx, info.icon, px + TILE / 2 - 8, py + TILE / 2 + 6, c.foreground, 16);
            } else {
              // Growing
              const h = 4 + growPct * 20;
              drawRect(ctx, px + TILE / 2 - 2, py + TILE - 4 - h, 4, h, info.color);
            }
          }

          // Watered indicator
          if (plot.watered) {
            drawCircle(ctx, px + TILE - 8, py + 8, 3, '#3B82F6');
          }
        }
      }

      // Tool panel
      const toolY = OFFSET_Y + GRID_H * TILE + 20;
      const tools: ['plant', 'water', 'harvest'] = ['plant', 'water', 'harvest'];
      tools.forEach((t, i) => {
        const tx = OFFSET_X + i * 120;
        const isActive = t === gameTool;
        drawRect(ctx, tx, toolY, 110, 30, isActive ? c.primary : c.surface);
        drawText(ctx, `[${i + 1}] ${t}`, tx + 10, toolY + 20, isActive ? c.foreground : c.muted, 12);
      });

      // Crop selector (when planting)
      if (gameTool === 'plant') {
        const cropY = toolY + 40;
        const cropTypes: CropType[] = ['wheat', 'carrot', 'tomato', 'corn'];
        const keys = ['Q', 'W', 'E', 'R'];
        cropTypes.forEach((ct, i) => {
          const cx = OFFSET_X + i * 130;
          const isActive = ct === gameCrop;
          const info = CROPS[ct];
          drawRect(ctx, cx, cropY, 120, 28, isActive ? c.surfaceAlt : c.surface);
          drawText(ctx, `[${keys[i]}] ${info.icon} $${Math.ceil(info.value * 0.3)}`, cx + 8, cropY + 19, isActive ? c.foreground : c.muted, 11);
        });
      }
    }

    const loop = new GameLoop(update, render);
    loop.start();
    return () => loop.stop();
  }, [theme, state]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {state === 'menu' && (
        <GameMenu title="Pixel Farm" subtitle="Plant, water, and harvest crops to earn gold!" icon="🌾"
          buttons={[{ label: 'Start Farming', onClick: startGame, primary: true }]} />
      )}
      {state === 'playing' && (
        <>
          <GameCanvas width={W} height={H} onInit={onInit} />
          <HUD items={[
            { label: 'Gold', value: gold, icon: '💰' },
            { label: 'Day', value: day, icon: '☀️' },
          ]} position="top-right" />
        </>
      )}
    </div>
  );
}
