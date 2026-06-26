import { describe, expect, it } from 'vitest';

import {
  advanceGame,
  createInitialState,
  turnSnake,
  type SnakeGameState,
} from '../../frontend/src/game/snakeEngine';

const board = { width: 8, height: 8 };

describe('snake engine', () => {
  it('moves the snake in the current direction', () => {
    const state = { ...createInitialState(board, 'normal'), status: 'running' as const };

    const next = advanceGame(state, board);

    expect(next.snake[0]).toEqual({ x: 5, y: 4 });
    expect(next.snake).toHaveLength(3);
  });

  it('prevents immediate reverse turns', () => {
    const state = createInitialState(board, 'normal');

    const next = turnSnake(state, 'left');

    expect(next.nextDirection).toBe('right');
  });

  it('grows and increases score after eating food', () => {
    const state: SnakeGameState = {
      ...createInitialState(board, 'normal'),
      status: 'running',
      food: { x: 5, y: 4 },
    };

    const next = advanceGame(state, board, () => 0);

    expect(next.score).toBe(10);
    expect(next.snake).toHaveLength(4);
    expect(next.status).toBe('running');
  });

  it('ends the game after wall collision', () => {
    const state: SnakeGameState = {
      ...createInitialState(board, 'hard'),
      status: 'running',
      snake: [
        { x: 7, y: 2 },
        { x: 6, y: 2 },
      ],
      direction: 'right',
      nextDirection: 'right',
    };

    const next = advanceGame(state, board);

    expect(next.status).toBe('gameOver');
  });

  it('ends the game after self collision', () => {
    const state: SnakeGameState = {
      ...createInitialState(board, 'normal'),
      status: 'running',
      snake: [
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 3, y: 4 },
        { x: 4, y: 4 },
      ],
      direction: 'up',
      nextDirection: 'left',
    };

    const next = advanceGame(state, board);

    expect(next.status).toBe('gameOver');
  });

  it('does not advance while paused', () => {
    const state = { ...createInitialState(board, 'easy'), status: 'paused' as const };

    const next = advanceGame(state, board);

    expect(next).toBe(state);
  });
});
