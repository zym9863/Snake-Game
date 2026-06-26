import type { ApiResponse, GameConfig, ScoreCreate, ScoreRecord } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(payload.msg || 'Request failed');
  }
  return payload.data;
}

export function fetchGameConfig(): Promise<GameConfig> {
  return request<GameConfig>('/api/game/config');
}

export function fetchScores(limit = 10): Promise<ScoreRecord[]> {
  return request<ScoreRecord[]>(`/api/scores?limit=${limit}`);
}

export function submitScore(score: ScoreCreate): Promise<ScoreRecord> {
  return request<ScoreRecord>('/api/scores', {
    method: 'POST',
    body: JSON.stringify(score),
  });
}
