import { Activity, Gauge, Trophy } from 'lucide-react';

import type { SnakeGameState } from '../game/snakeEngine';

interface HudProps {
  state: SnakeGameState;
  speed: number;
}

export function Hud({ state, speed }: HudProps) {
  return (
    <section className="hud" aria-label="Game status">
      <div className="hud-card">
        <Trophy size={18} />
        <span>Score</span>
        <strong>{state.score}</strong>
      </div>
      <div className="hud-card">
        <Gauge size={18} />
        <span>Mode</span>
        <strong>{state.difficulty.toUpperCase()}</strong>
      </div>
      <div className="hud-card">
        <Activity size={18} />
        <span>Tick</span>
        <strong>{speed}ms</strong>
      </div>
    </section>
  );
}
