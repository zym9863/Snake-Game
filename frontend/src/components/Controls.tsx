import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw } from 'lucide-react';

import type { Direction, GameStatus } from '../game/snakeEngine';

interface ControlsProps {
  status: GameStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTurn: (direction: Direction) => void;
}

export function Controls({ status, onStart, onPause, onReset, onTurn }: ControlsProps) {
  const isRunning = status === 'running';

  return (
    <section className="controls" aria-label="Game controls">
      <div className="primary-controls">
        <button className="command primary" type="button" onClick={onStart} disabled={isRunning}>
          <Play size={18} />
          <span>{status === 'gameOver' ? 'Retry' : 'Start'}</span>
        </button>
        <button className="command" type="button" onClick={onPause} disabled={!isRunning}>
          <Pause size={18} />
          <span>Pause</span>
        </button>
        <button className="command" type="button" onClick={onReset}>
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
      </div>

      <div className="d-pad" aria-label="Direction pad">
        <span />
        <button type="button" aria-label="Move up" onClick={() => onTurn('up')}>
          <ArrowUp size={22} />
        </button>
        <span />
        <button type="button" aria-label="Move left" onClick={() => onTurn('left')}>
          <ArrowLeft size={22} />
        </button>
        <button type="button" aria-label="Move down" onClick={() => onTurn('down')}>
          <ArrowDown size={22} />
        </button>
        <button type="button" aria-label="Move right" onClick={() => onTurn('right')}>
          <ArrowRight size={22} />
        </button>
      </div>
    </section>
  );
}
