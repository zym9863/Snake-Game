import { Loader2, Medal } from 'lucide-react';

import type { ScoreRecord } from '../types/api';

interface LeaderboardProps {
  scores: ScoreRecord[];
  loading: boolean;
}

export function Leaderboard({ scores, loading }: LeaderboardProps) {
  return (
    <section className="leaderboard" aria-label="Leaderboard">
      <div className="panel-heading">
        <Medal size={18} />
        <h2>Leaderboard</h2>
      </div>
      {loading ? (
        <div className="loading-row">
          <Loader2 size={18} className="spin" />
          <span>Loading scores</span>
        </div>
      ) : (
        <ol>
          {scores.map((score) => (
            <li key={score.id}>
              <span className="rank-name">{score.playerName}</span>
              <span className="rank-mode">{score.difficulty}</span>
              <strong>{score.score}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
