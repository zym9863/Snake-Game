import { CircuitBoard } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { fetchGameConfig, fetchScores, submitScore } from './api/client';
import { Controls } from './components/Controls';
import { DifficultySelector } from './components/DifficultySelector';
import { GameBoard } from './components/GameBoard';
import { Hud } from './components/Hud';
import { Leaderboard } from './components/Leaderboard';
import { ScoreSubmit } from './components/ScoreSubmit';
import { Toast } from './components/Toast';
import { useSnakeGame } from './hooks/useSnakeGame';
import type { Difficulty, GameConfig, ScoreRecord } from './types/api';

const fallbackConfig: GameConfig = {
  boardWidth: 20,
  boardHeight: 20,
  defaultDifficulty: 'normal',
  difficultySpeeds: {
    easy: 180,
    normal: 130,
    hard: 90,
  },
  maxPlayerNameLength: 16,
  leaderboardLimit: 10,
};

export function App() {
  const [config, setConfig] = useState<GameConfig>(fallbackConfig);
  const [difficulty, setDifficulty] = useState<Difficulty>(fallbackConfig.defaultDifficulty);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [toast, setToast] = useState('');
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const board = useMemo(
    () => ({ width: config.boardWidth, height: config.boardHeight }),
    [config.boardHeight, config.boardWidth],
  );
  const game = useSnakeGame({
    board,
    difficulty,
    tickMs: config.difficultySpeeds[difficulty],
  });

  useEffect(() => {
    fetchGameConfig()
      .then((data) => {
        setConfig(data);
        setDifficulty(data.defaultDifficulty);
      })
      .catch((error: Error) => setToast(error.message || 'Failed to load game config'));
  }, []);

  useEffect(() => {
    refreshScores();
  }, [config.leaderboardLimit]);

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(''), 3200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  useEffect(() => {
    if (game.state.status !== 'gameOver') {
      setSubmittedScore(null);
    }
  }, [game.state.status]);

  async function refreshScores() {
    setLoadingScores(true);
    try {
      setScores(await fetchScores(config.leaderboardLimit));
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to load leaderboard');
    } finally {
      setLoadingScores(false);
    }
  }

  async function handleSubmitScore(playerName: string) {
    try {
      await submitScore({ playerName, score: game.state.score, difficulty });
      setSubmittedScore(game.state.score);
      setToast('Score saved');
      await refreshScores();
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to save score');
    }
  }

  const difficultyLocked = game.state.status === 'running' || game.state.status === 'paused';

  return (
    <main className="arcade-shell">
      <section className="marquee">
        <div>
          <span className="eyebrow">Docker ready full-stack game</span>
          <h1>Neon Snake Arcade</h1>
        </div>
        <CircuitBoard size={42} />
      </section>

      <section className="machine">
        <div className="play-panel">
          <Hud state={game.state} speed={config.difficultySpeeds[difficulty]} />
          <GameBoard board={board} state={game.state} />
        </div>

        <aside className="side-panel">
          <DifficultySelector
            value={difficulty}
            onChange={setDifficulty}
            disabled={difficultyLocked}
          />
          <Controls
            status={game.state.status}
            onStart={game.start}
            onPause={game.pause}
            onReset={game.reset}
            onTurn={game.turn}
          />
          <ScoreSubmit
            score={game.state.score}
            maxLength={config.maxPlayerNameLength}
            disabled={game.state.status !== 'gameOver' || submittedScore === game.state.score}
            onSubmit={handleSubmitScore}
          />
          <Leaderboard scores={scores} loading={loadingScores} />
        </aside>
      </section>

      {toast && <Toast message={toast} tone={toast.includes('saved') ? 'success' : 'error'} />}
    </main>
  );
}
