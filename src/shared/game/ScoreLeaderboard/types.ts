export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon?: string;
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  score: number;
  level?: number;
  time?: number;
  [key: string]: unknown;
}

export interface HighScoreEntry {
  name: string;
  score: number;
  date: string;
}

export interface ScoreLeaderboardConfig {
  persistKey?: string;
  maxEntries?: number;
  achievementDefs?: AchievementDef[];
}
