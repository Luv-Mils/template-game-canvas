import React, { useCallback, useRef, useState } from 'react';
import type { GameTheme } from '../../types';
import { GameCanvas, HUD, GameMenu } from '../../components';
import { GameLoop } from '../../engine/GameLoop';
import { ParticleSystem } from '../../engine/Particles';
import { Input } from '../../engine/Input';
import { drawRect, drawCircle, drawText } from '../../engine/Sprite';

const W = 480;
const H = 640;
const PLAYER_W = 32;
const PLAYER_H = 36;

export default function SpaceShooterGame({ theme }: { theme: GameTheme }) {
  const [state, setState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return Number(localStorage.getItem('shooter_high') ?? '0'); } catch { return 0; }
  });

  const startGame = useCallback(() => { setState('playing'); setScore(0); }, []);

  const onInit = useCallback((ctx: CanvasRenderingContext2D) => {
    const c = theme.colors;
    const input = new Input();
    const particles = new ParticleSystem();

    let playerX = W / 2 - PLAYER_W / 2;
    let playerY = H - 80;
    let playerScore = 0;
    let playerHp = 3;
    let gameOver = false;
    let fireTimer = 0;
    let waveTimer = 0;
    let waveNum = 0;
    let powerLevel = 1;

    interface Bullet { x: number; y: number; vy: number; friendly: boolean; damage: number }
    interface Enemy { x: number; y: number; w: number; h: number; hp: number; maxHp: number; type: string; vx: number; vy: number; fireTimer: number }
    interface PowerUp { x: number; y: number; type: 'health' | 'power' }

    let bullets: Bullet[] = [];
    let enemies: Enemy[] = [];
    let powerUps: PowerUp[] = [];
    let stars: { x: number; y: number; speed: number; brightness: number }[] = [];

    // Init stars
    for (let i = 0; i < 80; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, speed: 30 + Math.random() * 80, brightness: 0.2 + Math.random() * 0.8 });
    }

    function spawnWave() {
      waveNum++;
      const count = 3 + Math.min(waveNum, 8);
      for (let i = 0; i < count; i++) {
        const type = waveNum > 3 && Math.random() < 0.3 ? 'tough' : 'basic';
        enemies.push({
          x: 30 + (i / count) * (W - 60),
          y: -40 - i * 30,
          w: type === 'tough' ? 36 : 28,
          h: type === 'tough' ? 36 : 28,
          hp: type === 'tough' ? 3 + waveNum : 1,
          maxHp: type === 'tough' ? 3 + waveNum : 1,
          type,
          vx: (Math.random() - 0.5) * 60,
          vy: 40 + Math.random() * 30 + waveNum * 5,
          fireTimer: 2 + Math.random() * 3,
        });
      }
    }

    function update(dt: number) {
      if (gameOver) { input.clearFrame(); return; }

      // Player movement
      const speed = 280;
      if (input.isDown('ArrowLeft') || input.isDown('a')) playerX -= speed * dt;
      if (input.isDown('ArrowRight') || input.isDown('d')) playerX += speed * dt;
      if (input.isDown('ArrowUp') || input.isDown('w')) playerY -= speed * dt;
      if (input.isDown('ArrowDown') || input.isDown('s')) playerY += speed * dt;
      playerX = Math.max(0, Math.min(W - PLAYER_W, playerX));
      playerY = Math.max(0, Math.min(H - PLAYER_H, playerY));

      // Auto-fire
      fireTimer -= dt;
      if (fireTimer <= 0) {
        fireTimer = powerLevel >= 3 ? 0.1 : powerLevel >= 2 ? 0.15 : 0.2;
        bullets.push({ x: playerX + PLAYER_W / 2, y: playerY, vy: -500, friendly: true, damage: 1 });
        if (powerLevel >= 2) {
          bullets.push({ x: playerX + 4, y: playerY + 10, vy: -480, friendly: true, damage: 1 });
          bullets.push({ x: playerX + PLAYER_W - 4, y: playerY + 10, vy: -480, friendly: true, damage: 1 });
        }
      }

      // Wave spawning
      if (enemies.length === 0) {
        waveTimer -= dt;
        if (waveTimer <= 0) {
          spawnWave();
          waveTimer = 3;
        }
      }

      // Update bullets
      for (const b of bullets) b.y += b.vy * dt;
      bullets = bullets.filter(b => b.y > -10 && b.y < H + 10);

      // Update enemies
      for (const e of enemies) {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.x < 0 || e.x + e.w > W) e.vx *= -1;

        // Enemy fire
        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && e.y > 0 && e.y < H * 0.6) {
          e.fireTimer = 2 + Math.random() * 2;
          bullets.push({ x: e.x + e.w / 2, y: e.y + e.h, vy: 200, friendly: false, damage: 1 });
        }
      }
      enemies = enemies.filter(e => e.y < H + 50 && e.hp > 0);

      // Bullet-enemy collision
      for (const b of bullets) {
        if (!b.friendly) continue;
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
            e.hp -= b.damage;
            b.y = -100; // remove
            particles.emit(b.x, b.y, 4, c.accent, 40, 0.2);
            if (e.hp <= 0) {
              playerScore += e.type === 'tough' ? 200 : 100;
              setScore(playerScore);
              particles.emit(e.x + e.w / 2, e.y + e.h / 2, 12, c.danger, 80, 0.4);
              // Drop power-up
              if (Math.random() < 0.2) {
                powerUps.push({ x: e.x + e.w / 2, y: e.y, type: Math.random() < 0.5 ? 'health' : 'power' });
              }
            }
          }
        }
      }

      // Bullet-player collision
      for (const b of bullets) {
        if (b.friendly) continue;
        if (b.x > playerX && b.x < playerX + PLAYER_W && b.y > playerY && b.y < playerY + PLAYER_H) {
          playerHp--;
          b.y = H + 100;
          particles.emit(playerX + PLAYER_W / 2, playerY + PLAYER_H / 2, 8, c.danger, 60, 0.3);
          if (playerHp <= 0) {
            gameOver = true;
            setState('gameover');
            const hs = Math.max(playerScore, Number(localStorage.getItem('shooter_high') ?? '0'));
            localStorage.setItem('shooter_high', String(hs));
            setHighScore(hs);
          }
        }
      }

      // Power-up pickup
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        pu.y += 80 * dt;
        if (pu.x > playerX - 10 && pu.x < playerX + PLAYER_W + 10 && pu.y > playerY - 10 && pu.y < playerY + PLAYER_H + 10) {
          if (pu.type === 'health') playerHp = Math.min(5, playerHp + 1);
          else powerLevel = Math.min(3, powerLevel + 1);
          particles.emit(pu.x, pu.y, 8, pu.type === 'health' ? c.success : c.accent, 50, 0.3);
          powerUps.splice(i, 1);
        } else if (pu.y > H + 20) {
          powerUps.splice(i, 1);
        }
      }

      // Stars
      for (const star of stars) {
        star.y += star.speed * dt;
        if (star.y > H) { star.y = 0; star.x = Math.random() * W; }
      }

      particles.update(dt);
      input.clearFrame();
    }

    function render() {
      ctx.fillStyle = c.background;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const star of stars) {
        ctx.globalAlpha = star.brightness;
        ctx.fillStyle = c.foreground;
        ctx.fillRect(star.x, star.y, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      // Power-ups
      for (const pu of powerUps) {
        drawCircle(ctx, pu.x, pu.y, 8, pu.type === 'health' ? c.success : c.accent);
        drawText(ctx, pu.type === 'health' ? '+' : '↑', pu.x - 4, pu.y + 4, c.foreground, 12);
      }

      // Enemies
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        drawRect(ctx, e.x, e.y, e.w, e.h, e.type === 'tough' ? c.secondary : c.danger);
        // HP indicator for tough enemies
        if (e.type === 'tough') {
          const hpPct = e.hp / e.maxHp;
          drawRect(ctx, e.x, e.y - 5, e.w * hpPct, 3, c.success);
        }
      }

      // Player bullets
      for (const b of bullets) {
        drawRect(ctx, b.x - 2, b.y, 4, 8, b.friendly ? c.primary : c.danger);
      }

      // Player
      // Ship body
      drawRect(ctx, playerX + 4, playerY + 8, PLAYER_W - 8, PLAYER_H - 8, c.primary);
      // Ship nose
      ctx.fillStyle = c.primaryLight;
      ctx.beginPath();
      ctx.moveTo(playerX + PLAYER_W / 2, playerY);
      ctx.lineTo(playerX + PLAYER_W - 4, playerY + 12);
      ctx.lineTo(playerX + 4, playerY + 12);
      ctx.fill();
      // Wings
      drawRect(ctx, playerX, playerY + 20, 6, 12, c.primary);
      drawRect(ctx, playerX + PLAYER_W - 6, playerY + 20, 6, 12, c.primary);
      // Engine glow
      if (!gameOver) {
        particles.emit(playerX + PLAYER_W / 2, playerY + PLAYER_H, 1, c.accent, 30, 0.15);
      }

      particles.draw(ctx);

      // HP display
      for (let i = 0; i < playerHp; i++) {
        drawCircle(ctx, W - 20 - i * 20, H - 20, 6, c.success);
      }
    }

    const loop = new GameLoop(update, render);
    loop.start();
    return () => { loop.stop(); input.destroy(); };
  }, [theme, state]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {state === 'menu' && (
        <GameMenu title="Star Blaster" subtitle="Arrow keys to move. Auto-fire enabled!" icon="🚀"
          buttons={[{ label: 'Launch!', onClick: startGame, primary: true }]}
          stats={highScore > 0 ? [{ label: 'Best', value: highScore }] : undefined} />
      )}
      {state === 'playing' && (
        <>
          <GameCanvas width={W} height={H} onInit={onInit} />
          <HUD items={[
            { label: 'Score', value: score, icon: '⭐' },
            { label: 'Power', value: `Lv.${powerLevel}`, icon: '⚡' },
          ]} />
        </>
      )}
      {state === 'gameover' && (
        <GameMenu title="Ship Destroyed" icon="💥" buttons={[{ label: 'Relaunch', onClick: startGame, primary: true }]}
          stats={[{ label: 'Score', value: score }, { label: 'Best', value: highScore }]} />
      )}
    </div>
  );
}
