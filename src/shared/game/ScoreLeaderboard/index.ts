/**
 * ScoreLeaderboard — Game Engine Component (GME-11)
 *
 * Score tracking, high score leaderboard (localStorage), stat tracking,
 * and achievement system with configurable conditions.
 */

import type { ScoreLeaderboardConfig, GameStats, HighScoreEntry, AchievementDef } from './types';

export class ScoreLeaderboard {
  private currentScore = 0;
  private highScores: HighScoreEntry[] = [];
  private achievements: Map<string, boolean> = new Map();
  private stats: GameStats = { score: 0 };
  private config: ScoreLeaderboardConfig;

  constructor(config: ScoreLeaderboardConfig) {
    this.config = config;
    if (config.achievementDefs) {
      for (const def of config.achievementDefs) {
        this.achievements.set(def.id, false);
      }
    }
    this.load();
  }

  // -- Score management -------------------------------------------------------

  addScore(points: number): void {
    this.currentScore += points;
    this.stats.score = this.currentScore;
  }

  setScore(value: number): void {
    this.currentScore = value;
    this.stats.score = value;
  }

  getScore(): number {
    return this.currentScore;
  }

  resetScore(): void {
    this.currentScore = 0;
    this.stats.score = 0;
  }

  // -- High scores ------------------------------------------------------------

  submitScore(name: string): boolean {
    const max = this.config.maxEntries ?? 10;
    const entry: HighScoreEntry = {
      name,
      score: this.currentScore,
      date: new Date().toISOString(),
    };

    this.highScores.push(entry);
    this.highScores.sort((a, b) => b.score - a.score);

    const isNew = this.highScores.indexOf(entry) < max;
    this.highScores = this.highScores.slice(0, max);

    this.save();
    return isNew;
  }

  getHighScores(): HighScoreEntry[] {
    return [...this.highScores];
  }

  isHighScore(score: number): boolean {
    const max = this.config.maxEntries ?? 10;
    if (this.highScores.length < max) return true;
    return score > this.highScores[this.highScores.length - 1].score;
  }

  // -- Stats tracking ---------------------------------------------------------

  setStat(key: string, value: unknown): void {
    (this.stats as Record<string, unknown>)[key] = value;
  }

  getStat<T>(key: string): T | undefined {
    return (this.stats as Record<string, unknown>)[key] as T | undefined;
  }

  incrementStat(key: string, amount = 1): void {
    const current = (this.stats as Record<string, unknown>)[key];
    (this.stats as Record<string, unknown>)[key] = (typeof current === 'number' ? current : 0) + amount;
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  // -- Achievements -----------------------------------------------------------

  checkAchievements(): string[] {
    if (!this.config.achievementDefs) return [];
    const newlyUnlocked: string[] = [];

    for (const def of this.config.achievementDefs) {
      if (this.achievements.get(def.id)) continue; // already unlocked
      try {
        if (def.condition(this.stats)) {
          this.achievements.set(def.id, true);
          newlyUnlocked.push(def.id);
        }
      } catch {
        // condition evaluation failed, skip
      }
    }

    if (newlyUnlocked.length > 0) this.save();
    return newlyUnlocked;
  }

  getAchievements(): Array<{ id: string; name: string; description: string; icon?: string; unlocked: boolean }> {
    if (!this.config.achievementDefs) return [];
    return this.config.achievementDefs.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked: this.achievements.get(def.id) ?? false,
    }));
  }

  isAchievementUnlocked(id: string): boolean {
    return this.achievements.get(id) ?? false;
  }

  // -- Persistence ------------------------------------------------------------

  save(): void {
    if (!this.config.persistKey) return;
    try {
      const data = {
        highScores: this.highScores,
        achievements: Object.fromEntries(this.achievements),
        stats: this.stats,
      };
      localStorage.setItem(this.config.persistKey, JSON.stringify(data));
    } catch {
      // localStorage not available or full
    }
  }

  load(): void {
    if (!this.config.persistKey) return;
    try {
      const raw = localStorage.getItem(this.config.persistKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.highScores)) {
        this.highScores = data.highScores;
      }
      if (data.achievements && typeof data.achievements === 'object') {
        for (const [id, unlocked] of Object.entries(data.achievements)) {
          if (typeof unlocked === 'boolean') {
            this.achievements.set(id, unlocked);
          }
        }
      }
      if (data.stats && typeof data.stats === 'object') {
        this.stats = { score: 0, ...data.stats };
      }
    } catch {
      // corrupted data, start fresh
    }
  }

  clear(): void {
    this.highScores = [];
    this.achievements.clear();
    this.stats = { score: 0 };
    this.currentScore = 0;
    if (this.config.persistKey) {
      try {
        localStorage.removeItem(this.config.persistKey);
      } catch { /* ignore */ }
    }
    // Re-initialize achievement map
    if (this.config.achievementDefs) {
      for (const def of this.config.achievementDefs) {
        this.achievements.set(def.id, false);
      }
    }
  }
}

export type { ScoreLeaderboardConfig, GameStats, HighScoreEntry, AchievementDef } from './types';
