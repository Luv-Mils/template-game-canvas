import React, { useCallback, useRef, useState } from 'react';
import type { GameTheme } from '../../types';
import { GameCanvas, HUD, GameMenu } from '../../components';
import { GameLoop } from '../../engine/GameLoop';
import { ParticleSystem } from '../../engine/Particles';
import { drawRect, drawCircle, drawText } from '../../engine/Sprite';

const W = 800;
const H = 400;
const GROUND_Y = 320;
const PLAYER_W = 30;
const PLAYER_H = 40;
const LANE_COUNT = 3;
const LANE_H = 60;

export default function RunnerGame({ theme }: { theme: GameTheme }) {
  const [state, setState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return Number(localStorage.getItem('runner_high') ?? '0'); } catch { return 0; }
  });

  const startGame = useCallback(() => { setState('playing'); setScore(0); }, []);

  const onInit = useCallback((ctx: CanvasRenderingContext2D) => {
    const c = theme.colors;
    const particles = new ParticleSystem();

    let playerY = GROUND_Y - PLAYER_H;
    let playerVY = 0;
    let jumping = false;
    let ducking = false;
    let gameSpeed = 300;
    let dist = 0;
    let gameOver = false;

    interface Obstacle { x: number; y: number; w: number; h: number; type: 'low' | 'high' }
    let obstacles: Obstacle[] = [];
    let spawnTimer = 0;

    interface Coin { x: number; y: number; collected: boolean }
    let coins: Coin[] = [];
    let playerScore = 0;

    function spawnObstacle() {
      const type = Math.random() < 0.3 ? 'high' : 'low';
      if (type === 'low') {
        obstacles.push({ x: W + 20, y: GROUND_Y - 30, w: 25, h: 30, type: 'low' });
      } else {
        obstacles.push({ x: W + 20, y: GROUND_Y - PLAYER_H - 20, w: 40, h: 15, type: 'high' });
      }
      // Sometimes add coins
      if (Math.random() < 0.5) {
        const coinY = GROUND_Y - 60 - Math.random() * 40;
        for (let i = 0; i < 3; i++) {
          coins.push({ x: W + 60 + i * 30, y: coinY, collected: false });
        }
      }
    }

    window.addEventListener('keydown', (e) => {
      if (gameOver) return;
      if ((e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') && !jumping) {
        playerVY = -450;
        jumping = true;
        particles.emit(W / 6 + PLAYER_W / 2, playerY + PLAYER_H, 5, c.primary, 30, 0.2);
      }
      if (e.key === 'ArrowDown' || e.key === 's') { ducking = true; }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowDown' || e.key === 's') ducking = false;
    });

    function update(dt: number) {
      if (gameOver) return;

      dist += gameSpeed * dt;
      playerScore = Math.floor(dist / 10);
      setScore(playerScore);

      gameSpeed = 300 + dist * 0.005;

      // Player physics
      playerVY += 1200 * dt;
      playerY += playerVY * dt;
      if (playerY >= GROUND_Y - PLAYER_H) {
        playerY = GROUND_Y - PLAYER_H;
        playerVY = 0;
        jumping = false;
      }

      // Spawn
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnObstacle();
        spawnTimer = 1.0 + Math.random() * 1.5 - Math.min(0.5, dist * 0.0001);
      }

      // Move obstacles
      for (const obs of obstacles) obs.x -= gameSpeed * dt;
      obstacles = obstacles.filter(o => o.x + o.w > -20);

      // Move coins
      for (const coin of coins) coin.x -= gameSpeed * dt;
      coins = coins.filter(co => co.x > -20 && !co.collected);

      // Collision
      const pW = PLAYER_W;
      const pH = ducking ? PLAYER_H * 0.5 : PLAYER_H;
      const pX = W / 6;
      const pY = ducking ? playerY + PLAYER_H * 0.5 : playerY;

      for (const obs of obstacles) {
        if (pX < obs.x + obs.w && pX + pW > obs.x && pY < obs.y + obs.h && pY + pH > obs.y) {
          gameOver = true;
          setState('gameover');
          particles.emit(pX + pW / 2, pY + pH / 2, 20, c.danger, 100, 0.5);
          const hs = Math.max(playerScore, Number(localStorage.getItem('runner_high') ?? '0'));
          localStorage.setItem('runner_high', String(hs));
          setHighScore(hs);
          break;
        }
      }

      // Coin pickup
      for (const coin of coins) {
        if (!coin.collected && pX < coin.x + 10 && pX + pW > coin.x - 10 && pY < coin.y + 10 && pY + pH > coin.y - 10) {
          coin.collected = true;
          playerScore += 50;
          particles.emit(coin.x, coin.y, 5, c.accent, 40, 0.3);
        }
      }

      particles.update(dt);
    }

    function render() {
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, c.background);
      grad.addColorStop(1, c.surface);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Ground
      drawRect(ctx, 0, GROUND_Y, W, H - GROUND_Y, c.surfaceAlt);
      drawRect(ctx, 0, GROUND_Y, W, 2, c.border);

      // Ground lines (scrolling)
      const lineOffset = (dist * 2) % 40;
      ctx.strokeStyle = c.border;
      ctx.lineWidth = 1;
      for (let x = -lineOffset; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y + 10);
        ctx.lineTo(x + 20, GROUND_Y + 10);
        ctx.stroke();
      }

      // Obstacles
      for (const obs of obstacles) {
        drawRect(ctx, obs.x, obs.y, obs.w, obs.h, obs.type === 'low' ? c.danger : c.secondary);
      }

      // Coins
      for (const coin of coins) {
        if (!coin.collected) drawCircle(ctx, coin.x, coin.y, 8, c.accent);
      }

      // Player
      const pX = W / 6;
      const pH = ducking ? PLAYER_H * 0.5 : PLAYER_H;
      const pY = ducking ? playerY + PLAYER_H * 0.5 : playerY;
      drawRect(ctx, pX, pY, PLAYER_W, pH, c.primary);

      // Trail
      if (!gameOver) {
        particles.emit(pX, pY + pH, 1, c.primaryLight, 20, 0.2);
      }

      particles.draw(ctx);

      // Speed indicator
      drawText(ctx, `${Math.floor(gameSpeed)}px/s`, W - 10, H - 10, c.muted, 10, 'right');
    }

    const loop = new GameLoop(update, render);
    loop.start();
    return () => loop.stop();
  }, [theme, state]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {state === 'menu' && (
        <GameMenu title="Neon Dash" subtitle="Jump over obstacles, duck under barriers, collect coins!" icon="🏃‍♂️"
          buttons={[{ label: 'Run!', onClick: startGame, primary: true }]}
          stats={highScore > 0 ? [{ label: 'Best', value: highScore }] : undefined} />
      )}
      {state === 'playing' && (
        <>
          <GameCanvas width={W} height={H} onInit={onInit} />
          <HUD items={[{ label: 'Score', value: score, icon: '⭐' }]} />
        </>
      )}
      {state === 'gameover' && (
        <GameMenu title="Game Over" icon="💥" buttons={[{ label: 'Try Again', onClick: startGame, primary: true }]}
          stats={[{ label: 'Score', value: score }, { label: 'Best', value: highScore }]} />
      )}
    </div>
  );
}
