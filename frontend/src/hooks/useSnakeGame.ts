import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  advanceGame,
  createInitialState,
  setStatus,
  turnSnake,
  type BoardSize,
  type Direction,
  type SnakeGameState,
} from '../game/snakeEngine';
import type { Difficulty } from '../types/api';

interface UseSnakeGameOptions {
  board: BoardSize;
  difficulty: Difficulty;
  tickMs: number;
}

export function useSnakeGame({ board, difficulty, tickMs }: UseSnakeGameOptions) {
  const initialState = useMemo(() => createInitialState(board, difficulty), [board, difficulty]);
  const [state, setState] = useState<SnakeGameState>(initialState);

  useEffect(() => {
    setState(createInitialState(board, difficulty));
  }, [board, difficulty]);

  useEffect(() => {
    if (state.status !== 'running') {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setState((current) => advanceGame(current, board));
    }, tickMs);
    return () => window.clearInterval(timer);
  }, [board, state.status, tickMs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = keyToDirection(event.key);
      if (direction) {
        event.preventDefault();
        setState((current) => turnSnake(current, direction));
        return;
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const start = useCallback(() => {
    setState((current) => {
      if (current.status === 'gameOver') {
        return { ...createInitialState(board, difficulty), status: 'running' };
      }
      return setStatus(current, 'running');
    });
  }, [board, difficulty]);

  const pause = useCallback(() => {
    setState((current) => (current.status === 'running' ? setStatus(current, 'paused') : current));
  }, []);

  const togglePause = useCallback(() => {
    setState((current) => {
      if (current.status === 'running') {
        return setStatus(current, 'paused');
      }
      if (current.status === 'paused' || current.status === 'ready') {
        return setStatus(current, 'running');
      }
      return current;
    });
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState(board, difficulty));
  }, [board, difficulty]);

  const turn = useCallback((direction: Direction) => {
    setState((current) => turnSnake(current, direction));
  }, []);

  return {
    state,
    start,
    pause,
    togglePause,
    reset,
    turn,
  };
}

function keyToDirection(key: string): Direction | null {
  const normalized = key.toLowerCase();
  if (normalized === 'arrowup' || normalized === 'w') return 'up';
  if (normalized === 'arrowdown' || normalized === 's') return 'down';
  if (normalized === 'arrowleft' || normalized === 'a') return 'left';
  if (normalized === 'arrowright' || normalized === 'd') return 'right';
  return null;
}
