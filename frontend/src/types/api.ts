export type Difficulty = 'easy' | 'normal' | 'hard';

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  defaultDifficulty: Difficulty;
  difficultySpeeds: Record<Difficulty, number>;
  maxPlayerNameLength: number;
  leaderboardLimit: number;
}

export interface ScoreRecord {
  id: number;
  playerName: string;
  score: number;
  difficulty: Difficulty;
  createdAt: string;
}

export interface ScoreCreate {
  playerName: string;
  score: number;
  difficulty: Difficulty;
}
