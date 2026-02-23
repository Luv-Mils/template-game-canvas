import React, { useCallback, useRef, useState } from 'react';
import type { GameTheme } from '../../types';
import { GameCanvas, HUD, GameMenu } from '../../components';
import { GameLoop } from '../../engine/GameLoop';
import { Input } from '../../engine/Input';
import { Body, applyGravity, moveAndCollide, aabb } from '../../engine/Physics';
import { ParticleSystem } from '../../engine/Particles';
import { Camera } from '../../engine/Camera';
import { drawRect, drawCircle, drawText } from '../../engine/Sprite';

const TILE = 32;
const GRAVITY = 900;
const JUMP_VEL = -380;
const MOVE_SPEED = 180;
const W = 800;
const H = 480;

interface Level { tiles: number[][]; spawn: [number, number]; coins: [number, number][]; enemies: [number, number, number][]; exit: [number, number] }

const LEVELS: Level[] = [
  {
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    spawn: [2, 13],
    coins: [[5, 4], [7, 4], [13, 5], [18, 6], [22, 8], [10, 11], [17, 11], [4, 8]],
    enemies: [[8, 13, 1], [15, 13, -1], [20, 13, 1]],
    exit: [23, 13],
  },
  {
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    spawn: [2, 13],
    coins: [[5, 4], [9, 5], [13, 5], [15, 6], [7, 8], [11, 9], [17, 8], [20, 10], [3, 7], [19, 4]],
    enemies: [[6, 13, 1], [12, 13, -1], [18, 13, 1], [10, 13, -1]],
    exit: [23, 13],
  },
];

export default function PlatformerGame({ theme }: { theme: GameTheme }) {
  const [state, setState] = useState<'menu' | 'playing' | 'gameover' | 'win'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return Number(localStorage.getItem('platformer_high') ?? '0'); } catch { return 0; }
  });

  const gameRef = useRef<{ loop: GameLoop; input: Input } | null>(null);

  const startGame = useCallback(() => {
    setState('playing');
    setScore(0);
    setLives(3);
    setLevel(0);
  }, []);

  const onInit = useCallback((ctx: CanvasRenderingContext2D) => {
    const c = theme.colors;
    const input = new Input();
    const particles = new ParticleSystem();
    const camera = new Camera();

    let currentLevel = 0;
    let playerScore = 0;
    let playerLives = 3;
    let player: Body = { x: 0, y: 0, w: 24, h: 28, vx: 0, vy: 0, grounded: false, solid: false };
    let solids: Body[] = [];
    let coins: Body[] = [];
    let enemies: Array<Body & { dir: number }> = [];
    let exitBody: Body = { x: 0, y: 0, w: TILE, h: TILE, vx: 0, vy: 0, grounded: false, solid: false };
    let gameState: 'playing' | 'gameover' | 'win' = 'playing';
    let coyoteTime = 0;

    function loadLevel(idx: number) {
      const lvl = LEVELS[idx % LEVELS.length];
      solids = [];
      coins = [];
      enemies = [];
      particles.clear();

      for (let r = 0; r < lvl.tiles.length; r++) {
        for (let c = 0; c < lvl.tiles[r].length; c++) {
          if (lvl.tiles[r][c] === 1) {
            solids.push({ x: c * TILE, y: r * TILE, w: TILE, h: TILE, vx: 0, vy: 0, grounded: false, solid: true });
          }
        }
      }
      for (const [cx, cy] of lvl.coins) {
        coins.push({ x: cx * TILE + 8, y: cy * TILE + 8, w: 16, h: 16, vx: 0, vy: 0, grounded: false, solid: false });
      }
      for (const [ex, ey, dir] of lvl.enemies) {
        enemies.push({ x: ex * TILE + 4, y: ey * TILE + 4, w: 24, h: 24, vx: dir * 60, vy: 0, grounded: false, solid: false, dir });
      }
      player.x = lvl.spawn[0] * TILE;
      player.y = lvl.spawn[1] * TILE;
      player.vx = 0;
      player.vy = 0;
      exitBody.x = lvl.exit[0] * TILE;
      exitBody.y = lvl.exit[1] * TILE;
    }

    loadLevel(0);

    function update(dt: number) {
      if (gameState !== 'playing') return;

      // Player movement
      player.vx = 0;
      if (input.isDown('ArrowLeft') || input.isDown('a')) player.vx = -MOVE_SPEED;
      if (input.isDown('ArrowRight') || input.isDown('d')) player.vx = MOVE_SPEED;

      // Coyote time
      if (player.grounded) coyoteTime = 0.1;
      else coyoteTime -= dt;

      if ((input.wasPressed('ArrowUp') || input.wasPressed('w') || input.wasPressed(' ')) && coyoteTime > 0) {
        player.vy = JUMP_VEL;
        coyoteTime = 0;
        particles.emit(player.x + player.w / 2, player.y + player.h, 5, c.primary, 40, 0.3);
      }

      applyGravity(player, GRAVITY, dt);
      moveAndCollide(player, solids, dt);

      // Enemy movement
      for (const enemy of enemies) {
        enemy.x += enemy.vx * dt;
        // Bounce off walls
        for (const s of solids) {
          if (aabb(enemy, s)) {
            enemy.vx *= -1;
            enemy.dir *= -1;
            enemy.x += enemy.vx * dt * 2;
            break;
          }
        }
      }

      // Coin collection
      for (let i = coins.length - 1; i >= 0; i--) {
        if (aabb(player, coins[i])) {
          particles.emit(coins[i].x + 8, coins[i].y + 8, 8, c.accent, 60, 0.4);
          coins.splice(i, 1);
          playerScore += 100;
          setScore(playerScore);
        }
      }

      // Enemy collision
      for (const enemy of enemies) {
        if (aabb(player, enemy)) {
          if (player.vy > 0 && player.y + player.h - 8 < enemy.y) {
            // Stomp
            particles.emit(enemy.x + enemy.w / 2, enemy.y, 10, c.danger, 80, 0.5);
            enemies.splice(enemies.indexOf(enemy), 1);
            player.vy = JUMP_VEL * 0.6;
            playerScore += 200;
            setScore(playerScore);
          } else {
            // Hit
            playerLives--;
            setLives(playerLives);
            particles.emit(player.x + player.w / 2, player.y + player.h / 2, 12, c.danger, 100, 0.5);
            if (playerLives <= 0) {
              gameState = 'gameover';
              setState('gameover');
              const hs = Math.max(playerScore, Number(localStorage.getItem('platformer_high') ?? '0'));
              localStorage.setItem('platformer_high', String(hs));
              setHighScore(hs);
            } else {
              const lvl = LEVELS[currentLevel % LEVELS.length];
              player.x = lvl.spawn[0] * TILE;
              player.y = lvl.spawn[1] * TILE;
              player.vx = 0;
              player.vy = 0;
            }
          }
          break;
        }
      }

      // Exit
      if (aabb(player, exitBody) && coins.length === 0) {
        currentLevel++;
        setLevel(currentLevel);
        if (currentLevel >= LEVELS.length) {
          gameState = 'win';
          setState('win');
          const hs = Math.max(playerScore, Number(localStorage.getItem('platformer_high') ?? '0'));
          localStorage.setItem('platformer_high', String(hs));
          setHighScore(hs);
        } else {
          loadLevel(currentLevel);
        }
      }

      // Fall death
      if (player.y > 600) {
        playerLives--;
        setLives(playerLives);
        if (playerLives <= 0) {
          gameState = 'gameover';
          setState('gameover');
        } else {
          const lvl = LEVELS[currentLevel % LEVELS.length];
          player.x = lvl.spawn[0] * TILE;
          player.y = lvl.spawn[1] * TILE;
          player.vx = 0; player.vy = 0;
        }
      }

      particles.update(dt);
      input.clearFrame();
    }

    function render() {
      ctx.fillStyle = c.background;
      ctx.fillRect(0, 0, W, H);

      camera.follow(player.x, player.y, W, H,
        LEVELS[currentLevel % LEVELS.length].tiles[0].length * TILE,
        LEVELS[currentLevel % LEVELS.length].tiles.length * TILE);

      ctx.save();
      camera.apply(ctx);

      // Tiles
      for (const s of solids) {
        drawRect(ctx, s.x, s.y, s.w, s.h, c.surface);
        drawRect(ctx, s.x + 1, s.y + 1, s.w - 2, s.h - 2, c.surfaceAlt);
      }

      // Exit
      if (coins.length === 0) {
        drawRect(ctx, exitBody.x + 4, exitBody.y + 4, TILE - 8, TILE - 8, c.success);
      } else {
        drawRect(ctx, exitBody.x + 4, exitBody.y + 4, TILE - 8, TILE - 8, c.muted);
      }

      // Coins
      for (const coin of coins) {
        drawCircle(ctx, coin.x + 8, coin.y + 8, 7, c.accent);
        drawCircle(ctx, coin.x + 8, coin.y + 8, 4, c.background);
      }

      // Enemies
      for (const enemy of enemies) {
        drawRect(ctx, enemy.x, enemy.y, enemy.w, enemy.h, c.danger);
        // Eyes
        const eyeX = enemy.dir > 0 ? enemy.x + 16 : enemy.x + 4;
        drawRect(ctx, eyeX, enemy.y + 6, 4, 4, c.foreground);
      }

      // Player
      drawRect(ctx, player.x, player.y, player.w, player.h, c.primary);
      // Eyes
      const eyeDir = player.vx >= 0 ? player.x + 16 : player.x + 4;
      drawRect(ctx, eyeDir, player.y + 6, 4, 6, c.foreground);

      particles.draw(ctx);
      ctx.restore();
    }

    const loop = new GameLoop(update, render);
    loop.start();
    gameRef.current = { loop, input };

    return () => { loop.stop(); input.destroy(); };
  }, [theme, state]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {state === 'menu' && (
        <GameMenu
          title="Pixel Jumper"
          subtitle="Collect all coins and reach the exit!"
          icon="🏃"
          buttons={[
            { label: 'Start Game', onClick: startGame, primary: true },
          ]}
          stats={highScore > 0 ? [{ label: 'High Score', value: highScore }] : undefined}
        />
      )}
      {state === 'playing' && (
        <>
          <GameCanvas width={W} height={H} onInit={onInit} />
          <HUD items={[
            { label: 'Score', value: score, icon: '⭐' },
            { label: 'Lives', value: lives, icon: '❤️' },
            { label: 'Level', value: level + 1, icon: '📍' },
          ]} />
        </>
      )}
      {state === 'gameover' && (
        <GameMenu
          title="Game Over"
          icon="💀"
          buttons={[{ label: 'Try Again', onClick: startGame, primary: true }]}
          stats={[
            { label: 'Score', value: score },
            { label: 'High Score', value: highScore },
          ]}
        />
      )}
      {state === 'win' && (
        <GameMenu
          title="You Win!"
          icon="🏆"
          buttons={[{ label: 'Play Again', onClick: startGame, primary: true }]}
          stats={[
            { label: 'Final Score', value: score },
            { label: 'High Score', value: highScore },
          ]}
        />
      )}
    </div>
  );
}
