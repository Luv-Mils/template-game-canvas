import React, { useCallback, useState, useEffect } from 'react';
import type { GameTheme } from '../../types';
import { GameCanvas, HUD, GameMenu } from '../../components';
import { drawRect, drawText } from '../../engine/Sprite';

const W = 640;
const H = 640;
const TILE = 32;
const MAP_SIZE = 20;

interface Entity { x: number; y: number; hp: number; maxHp: number; atk: number; icon: string; name: string }

function generateDungeon(): { map: number[][]; rooms: { x: number; y: number; w: number; h: number }[] } {
  const map: number[][] = Array.from({ length: MAP_SIZE }, () => Array(MAP_SIZE).fill(1));
  const rooms: { x: number; y: number; w: number; h: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const w = 3 + Math.floor(Math.random() * 4);
    const h = 3 + Math.floor(Math.random() * 4);
    const x = 1 + Math.floor(Math.random() * (MAP_SIZE - w - 2));
    const y = 1 + Math.floor(Math.random() * (MAP_SIZE - h - 2));
    let overlap = false;
    for (const r of rooms) {
      if (x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y) {
        overlap = true; break;
      }
    }
    if (overlap) continue;
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) map[y + dy][x + dx] = 0;
    rooms.push({ x, y, w, h });
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1];
    const b = rooms[i];
    const ax = Math.floor(a.x + a.w / 2);
    const ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);
    let cx = ax;
    while (cx !== bx) { map[ay][cx] = 0; cx += cx < bx ? 1 : -1; }
    let cy = ay;
    while (cy !== by) { map[cy][bx] = 0; cy += cy < by ? 1 : -1; }
  }

  return { map, rooms };
}

export default function RoguelikeGame({ theme }: { theme: GameTheme }) {
  const [state, setState] = useState<'menu' | 'playing' | 'gameover' | 'win'>('menu');
  const [floor, setFloor] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const [, forceRender] = useState(0);
  const [player, setPlayer] = useState<Entity>({ x: 0, y: 0, hp: 30, maxHp: 30, atk: 5, icon: '@', name: 'Hero' });
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [dungeon, setDungeon] = useState<{ map: number[][]; rooms: { x: number; y: number; w: number; h: number }[] } | null>(null);
  const [items, setItems] = useState<{ x: number; y: number; type: 'potion' | 'stairs' }[]>([]);
  const [score, setScore] = useState(0);

  const startGame = useCallback(() => {
    setState('playing');
    setFloor(1);
    setScore(0);
    setLog(['You descend into the dungeon...']);
    generateFloor(1, { x: 0, y: 0, hp: 30, maxHp: 30, atk: 5, icon: '@', name: 'Hero' });
  }, []);

  function generateFloor(fl: number, p: Entity) {
    const d = generateDungeon();
    setDungeon(d);
    const spawn = d.rooms[0];
    const newPlayer = { ...p, x: spawn.x + 1, y: spawn.y + 1 };
    setPlayer(newPlayer);

    // Place enemies
    const newEnemies: Entity[] = [];
    const ENEMY_TYPES = [
      { icon: 'G', name: 'Goblin', hp: 8 + fl * 3, atk: 2 + fl },
      { icon: 'S', name: 'Skeleton', hp: 12 + fl * 4, atk: 3 + fl },
      { icon: 'D', name: 'Demon', hp: 20 + fl * 5, atk: 5 + fl },
    ];
    for (let i = 1; i < d.rooms.length; i++) {
      const room = d.rooms[i];
      const count = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < count; j++) {
        const type = ENEMY_TYPES[Math.min(Math.floor(Math.random() * (1 + fl * 0.3)), ENEMY_TYPES.length - 1)];
        newEnemies.push({
          ...type, maxHp: type.hp,
          x: room.x + 1 + Math.floor(Math.random() * (room.w - 2)),
          y: room.y + 1 + Math.floor(Math.random() * (room.h - 2)),
        });
      }
    }
    setEnemies(newEnemies);

    // Place items
    const newItems: { x: number; y: number; type: 'potion' | 'stairs' }[] = [];
    const lastRoom = d.rooms[d.rooms.length - 1];
    newItems.push({ x: lastRoom.x + Math.floor(lastRoom.w / 2), y: lastRoom.y + Math.floor(lastRoom.h / 2), type: 'stairs' });
    for (let i = 1; i < d.rooms.length - 1; i++) {
      if (Math.random() < 0.5) {
        const r = d.rooms[i];
        newItems.push({ x: r.x + 1, y: r.y + 1, type: 'potion' });
      }
    }
    setItems(newItems);
  }

  useEffect(() => {
    if (state !== 'playing' || !dungeon) return;

    function handleKey(e: KeyboardEvent) {
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
      if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
      if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
      if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
      if (dx === 0 && dy === 0) return;

      setPlayer(prev => {
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        if (!dungeon || dungeon.map[ny]?.[nx] === 1) return prev;

        // Attack enemy?
        setEnemies(prevEnemies => {
          const enemy = prevEnemies.find(e => e.x === nx && e.y === ny);
          if (enemy) {
            enemy.hp -= prev.atk;
            setLog(l => [`You hit ${enemy.name} for ${prev.atk} damage!`, ...l].slice(0, 8));
            if (enemy.hp <= 0) {
              setScore(s => s + 50);
              setLog(l => [`${enemy.name} defeated!`, ...l].slice(0, 8));
              return prevEnemies.filter(e => e !== enemy);
            }
            return [...prevEnemies];
          }
          return prevEnemies;
        });

        const enemyBlocking = enemies.find(e => e.x === nx && e.y === ny);
        if (enemyBlocking) return prev;

        // Check items
        setItems(prevItems => {
          const item = prevItems.find(it => it.x === nx && it.y === ny);
          if (item) {
            if (item.type === 'potion') {
              setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + 10) }));
              setLog(l => ['Found a health potion! +10 HP', ...l].slice(0, 8));
              return prevItems.filter(it => it !== item);
            }
            if (item.type === 'stairs') {
              setFloor(f => {
                const next = f + 1;
                if (next > 5) { setState('win'); return f; }
                setLog(l => [`Descending to floor ${next}...`, ...l].slice(0, 8));
                generateFloor(next, { ...prev, x: nx, y: ny });
                return next;
              });
            }
          }
          return prevItems;
        });

        return { ...prev, x: nx, y: ny };
      });

      // Enemy turns
      setTimeout(() => {
        setEnemies(prevEnemies => {
          setPlayer(prevPlayer => {
            let newHp = prevPlayer.hp;
            for (const e of prevEnemies) {
              if (e.hp <= 0) continue;
              const dist = Math.abs(e.x - prevPlayer.x) + Math.abs(e.y - prevPlayer.y);
              if (dist <= 1) {
                newHp -= e.atk;
                setLog(l => [`${e.name} hits you for ${e.atk}!`, ...l].slice(0, 8));
              } else if (dist < 6) {
                // Move toward player
                const mdx = Math.sign(prevPlayer.x - e.x);
                const mdy = Math.sign(prevPlayer.y - e.y);
                if (dungeon!.map[e.y + mdy]?.[e.x + mdx] === 0) { e.x += mdx; e.y += mdy; }
                else if (dungeon!.map[e.y]?.[e.x + mdx] === 0) e.x += mdx;
                else if (dungeon!.map[e.y + mdy]?.[e.x] === 0) e.y += mdy;
              }
            }
            if (newHp <= 0) { setState('gameover'); }
            return { ...prevPlayer, hp: newHp };
          });
          return [...prevEnemies];
        });
        forceRender(n => n + 1);
      }, 50);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, dungeon, enemies]);

  const onInit = useCallback((ctx: CanvasRenderingContext2D) => {
    const c = theme.colors;
    function draw() {
      ctx.fillStyle = c.background;
      ctx.fillRect(0, 0, W, H);
      if (!dungeon) return;

      for (let r = 0; r < MAP_SIZE; r++) {
        for (let cl = 0; cl < MAP_SIZE; cl++) {
          ctx.fillStyle = dungeon.map[r][cl] === 1 ? c.surface : c.surfaceAlt;
          ctx.fillRect(cl * TILE, r * TILE, TILE - 1, TILE - 1);
        }
      }

      // Items
      for (const it of items) {
        const color = it.type === 'potion' ? c.success : c.accent;
        const icon = it.type === 'potion' ? '+' : '>';
        drawText(ctx, icon, it.x * TILE + 10, it.y * TILE + 22, color, 20);
      }

      // Enemies
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        drawRect(ctx, e.x * TILE + 4, e.y * TILE + 4, TILE - 8, TILE - 8, c.danger);
        drawText(ctx, e.icon, e.x * TILE + 10, e.y * TILE + 22, c.foreground, 16);
      }

      // Player
      drawRect(ctx, player.x * TILE + 2, player.y * TILE + 2, TILE - 4, TILE - 4, c.primary);
      drawText(ctx, '@', player.x * TILE + 10, player.y * TILE + 22, c.foreground, 18);

      // Log
      ctx.fillStyle = c.background + 'CC';
      ctx.fillRect(0, H - 100, W, 100);
      for (let i = 0; i < Math.min(log.length, 3); i++) {
        drawText(ctx, log[i], 10, H - 80 + i * 20, i === 0 ? c.foreground : c.muted, 12);
      }

      requestAnimationFrame(draw);
    }
    draw();
  }, [theme, dungeon, player, enemies, items, log]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {state === 'menu' && (
        <GameMenu title="Dungeon Descent" subtitle="Arrow keys or WASD to move. Reach the stairs!" icon="⚔️"
          buttons={[{ label: 'Enter Dungeon', onClick: startGame, primary: true }]} />
      )}
      {state === 'playing' && (
        <>
          <GameCanvas width={W} height={H} onInit={onInit} />
          <HUD items={[
            { label: 'HP', value: `${player.hp}/${player.maxHp}`, icon: '❤️' },
            { label: 'Floor', value: floor, icon: '🏚️' },
            { label: 'Score', value: score, icon: '⭐' },
          ]} />
        </>
      )}
      {state === 'gameover' && (
        <GameMenu title="You Died" icon="💀" buttons={[{ label: 'Try Again', onClick: startGame, primary: true }]}
          stats={[{ label: 'Floor', value: floor }, { label: 'Score', value: score }]} />
      )}
      {state === 'win' && (
        <GameMenu title="Dungeon Cleared!" icon="🏆" buttons={[{ label: 'Play Again', onClick: startGame, primary: true }]}
          stats={[{ label: 'Score', value: score }]} />
      )}
    </div>
  );
}
