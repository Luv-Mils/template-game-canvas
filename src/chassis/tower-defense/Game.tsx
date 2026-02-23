import React, { useCallback, useRef, useState } from 'react';
import type { GameTheme } from '../../types';
import { GameCanvas, HUD, GameMenu } from '../../components';
import { GameLoop } from '../../engine/GameLoop';
import { drawRect, drawCircle, drawText } from '../../engine/Sprite';
import { ParticleSystem } from '../../engine/Particles';

const W = 800;
const H = 480;
const TILE = 40;
const COLS = W / TILE;
const ROWS = H / TILE;

// Path waypoints (grid coords)
const PATH: [number, number][] = [
  [0, 3], [3, 3], [3, 1], [7, 1], [7, 5], [4, 5], [4, 8], [9, 8],
  [9, 3], [13, 3], [13, 7], [17, 7], [17, 2], [19, 2], [19, 11],
];

interface Tower { x: number; y: number; range: number; damage: number; cooldown: number; timer: number; type: 'basic' | 'sniper' | 'splash' }
interface Enemy { x: number; y: number; hp: number; maxHp: number; speed: number; pathIdx: number; progress: number }

const TOWER_TYPES = {
  basic:  { cost: 50,  range: 100, damage: 15, cooldown: 1.0, color: (c: GameTheme['colors']) => c.primary },
  sniper: { cost: 100, range: 180, damage: 40, cooldown: 2.0, color: (c: GameTheme['colors']) => c.accent },
  splash: { cost: 75,  range: 80,  damage: 25, cooldown: 1.5, color: (c: GameTheme['colors']) => c.secondary },
};

export default function TowerDefenseGame({ theme }: { theme: GameTheme }) {
  const [state, setState] = useState<'menu' | 'playing' | 'gameover' | 'win'>('menu');
  const [gold, setGold] = useState(200);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(0);
  const [selectedTower, setSelectedTower] = useState<keyof typeof TOWER_TYPES>('basic');
  const gameRef = useRef<{ loop: GameLoop } | null>(null);

  const startGame = useCallback(() => { setState('playing'); setGold(200); setLives(20); setWave(0); }, []);

  const onInit = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const c = theme.colors;
    const particles = new ParticleSystem();
    let towers: Tower[] = [];
    let enemies: Enemy[] = [];
    let playerGold = 200;
    let playerLives = 20;
    let currentWave = 0;
    let spawnTimer = 0;
    let enemiesSpawned = 0;
    let waveActive = false;
    let gameState: 'playing' | 'gameover' | 'win' = 'playing';
    let currentTowerType: keyof typeof TOWER_TYPES = 'basic';

    const pathCells = new Set<string>();
    for (const [px, py] of PATH) pathCells.add(`${px},${py}`);

    function startWave() {
      currentWave++;
      setWave(currentWave);
      enemiesSpawned = 0;
      waveActive = true;
      spawnTimer = 0;
    }

    function worldPos(e: MouseEvent): [number, number] {
      const rect = canvas.getBoundingClientRect();
      return [
        Math.floor((e.clientX - rect.left) * (W / rect.width) / TILE),
        Math.floor((e.clientY - rect.top) * (H / rect.height) / TILE),
      ];
    }

    canvas.addEventListener('click', (e) => {
      if (gameState !== 'playing') return;
      const [gx, gy] = worldPos(e);
      if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return;
      if (pathCells.has(`${gx},${gy}`)) return;
      if (towers.some(t => t.x === gx && t.y === gy)) return;

      const tType = TOWER_TYPES[currentTowerType];
      if (playerGold < tType.cost) return;

      playerGold -= tType.cost;
      setGold(playerGold);
      towers.push({
        x: gx, y: gy,
        range: tType.range,
        damage: tType.damage,
        cooldown: tType.cooldown,
        timer: 0,
        type: currentTowerType,
      });
    });

    // Key listeners for tower selection + wave start
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') { currentTowerType = 'basic'; setSelectedTower('basic'); }
      if (e.key === '2') { currentTowerType = 'sniper'; setSelectedTower('sniper'); }
      if (e.key === '3') { currentTowerType = 'splash'; setSelectedTower('splash'); }
      if (e.key === ' ' && !waveActive && gameState === 'playing') startWave();
    });

    function spawnEnemy() {
      const hp = 50 + currentWave * 20;
      const speed = 50 + currentWave * 5;
      enemies.push({
        x: PATH[0][0] * TILE + TILE / 2,
        y: PATH[0][1] * TILE + TILE / 2,
        hp, maxHp: hp, speed, pathIdx: 0, progress: 0,
      });
    }

    function update(dt: number) {
      if (gameState !== 'playing') return;

      // Spawn enemies
      const enemiesToSpawn = 5 + currentWave * 2;
      if (waveActive && enemiesSpawned < enemiesToSpawn) {
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawnEnemy();
          enemiesSpawned++;
          spawnTimer = 0.8 - Math.min(0.5, currentWave * 0.05);
        }
      }

      // Move enemies
      for (const e of enemies) {
        if (e.pathIdx >= PATH.length - 1) continue;
        const target = PATH[e.pathIdx + 1];
        const tx = target[0] * TILE + TILE / 2;
        const ty = target[1] * TILE + TILE / 2;
        const dx = tx - e.x;
        const dy = ty - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) {
          e.pathIdx++;
          if (e.pathIdx >= PATH.length - 1) {
            playerLives--;
            setLives(playerLives);
            e.hp = 0;
            if (playerLives <= 0) { gameState = 'gameover'; setState('gameover'); }
          }
        } else {
          e.x += (dx / dist) * e.speed * dt;
          e.y += (dy / dist) * e.speed * dt;
        }
      }

      // Tower shooting
      for (const t of towers) {
        t.timer -= dt;
        if (t.timer > 0) continue;
        let target: Enemy | null = null;
        let bestDist = t.range;
        const tx = t.x * TILE + TILE / 2;
        const ty = t.y * TILE + TILE / 2;
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          const d = Math.sqrt((e.x - tx) ** 2 + (e.y - ty) ** 2);
          if (d < bestDist) { bestDist = d; target = e; }
        }
        if (target) {
          t.timer = t.cooldown;
          target.hp -= t.damage;
          particles.emit(target.x, target.y, 4, TOWER_TYPES[t.type].color(c), 40, 0.3);
          if (target.hp <= 0) {
            particles.emit(target.x, target.y, 10, c.accent, 60, 0.4);
            playerGold += 10 + currentWave * 2;
            setGold(playerGold);
          }
        }
      }

      // Remove dead enemies
      enemies = enemies.filter(e => e.hp > 0);

      // Check wave complete
      if (waveActive && enemiesSpawned >= enemiesToSpawn && enemies.length === 0) {
        waveActive = false;
        if (currentWave >= 10) { gameState = 'win'; setState('win'); }
      }

      particles.update(dt);
    }

    function render() {
      ctx.fillStyle = c.background;
      ctx.fillRect(0, 0, W, H);

      // Grid
      for (let r = 0; r < ROWS; r++) {
        for (let cl = 0; cl < COLS; cl++) {
          const onPath = pathCells.has(`${cl},${r}`);
          ctx.fillStyle = onPath ? c.surfaceAlt : c.surface;
          ctx.fillRect(cl * TILE + 1, r * TILE + 1, TILE - 2, TILE - 2);
        }
      }

      // Path direction indicators
      ctx.strokeStyle = c.muted;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i < PATH.length; i++) {
        const px = PATH[i][0] * TILE + TILE / 2;
        const py = PATH[i][1] * TILE + TILE / 2;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Towers
      for (const t of towers) {
        const tx = t.x * TILE + TILE / 2;
        const ty = t.y * TILE + TILE / 2;
        drawCircle(ctx, tx, ty, 14, TOWER_TYPES[t.type].color(c));
        drawCircle(ctx, tx, ty, 6, c.foreground);
      }

      // Enemies
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        drawCircle(ctx, e.x, e.y, 10, c.danger);
        // HP bar
        const barW = 20;
        const hpPct = e.hp / e.maxHp;
        drawRect(ctx, e.x - barW / 2, e.y - 16, barW, 4, c.border);
        drawRect(ctx, e.x - barW / 2, e.y - 16, barW * hpPct, 4, hpPct > 0.5 ? c.success : c.danger);
      }

      particles.draw(ctx);

      // UI - wave info
      if (!waveActive && gameState === 'playing') {
        drawText(ctx, 'Press SPACE to start wave', W / 2, H - 20, c.muted, 14, 'center');
      }

      // Tower selection UI
      const types: (keyof typeof TOWER_TYPES)[] = ['basic', 'sniper', 'splash'];
      types.forEach((type, i) => {
        const bx = W - 160;
        const by = 10 + i * 45;
        const isSelected = type === currentTowerType;
        drawRect(ctx, bx, by, 150, 38, isSelected ? c.surfaceAlt : c.surface);
        drawCircle(ctx, bx + 20, by + 19, 8, TOWER_TYPES[type].color(c));
        drawText(ctx, `[${i + 1}] ${type} $${TOWER_TYPES[type].cost}`, bx + 35, by + 24, isSelected ? c.foreground : c.muted, 12);
      });
    }

    const loop = new GameLoop(update, render);
    loop.start();
    gameRef.current = { loop };
    return () => loop.stop();
  }, [theme, state]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {state === 'menu' && (
        <GameMenu
          title="Tower Guard"
          subtitle="Place towers to defend against waves of enemies"
          icon="🏰"
          buttons={[{ label: 'Start Game', onClick: startGame, primary: true }]}
        />
      )}
      {state === 'playing' && (
        <>
          <GameCanvas width={W} height={H} onInit={onInit} />
          <HUD items={[
            { label: 'Gold', value: gold, icon: '💰' },
            { label: 'Lives', value: lives, icon: '❤️' },
            { label: 'Wave', value: wave, icon: '🌊' },
          ]} />
        </>
      )}
      {state === 'gameover' && (
        <GameMenu title="Base Destroyed" icon="💥" buttons={[{ label: 'Try Again', onClick: startGame, primary: true }]}
          stats={[{ label: 'Waves Survived', value: wave }]} />
      )}
      {state === 'win' && (
        <GameMenu title="Victory!" icon="🏆" buttons={[{ label: 'Play Again', onClick: startGame, primary: true }]}
          stats={[{ label: 'Gold Earned', value: gold }]} />
      )}
    </div>
  );
}
