import type { Difficulty } from '../types/api';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameStatus = 'ready' | 'running' | 'paused' | 'gameOver';

export interface Point {
  x: number;
  y: number;
}

export interface BoardSize {
  width: number;
  height: number;
}

export interface SnakeGameState {
  snake: Point[];
  food: Point;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  status: GameStatus;
  difficulty: Difficulty;
}

export const SCORE_PER_FOOD = 10;

export function createInitialState(board: BoardSize, difficulty: Difficulty): SnakeGameState {
  const center = {
    x: Math.floor(board.width / 2),
    y: Math.floor(board.height / 2),
  };
  const snake = [
    center,
    { x: center.x - 1, y: center.y },
    { x: center.x - 2, y: center.y },
  ];

  return {
    snake,
    food: { x: Math.min(center.x + 4, board.width - 1), y: center.y },
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    status: 'ready',
    difficulty,
  };
}

export function turnSnake(state: SnakeGameState, direction: Direction): SnakeGameState {
  if (isOpposite(state.direction, direction)) {
    return state;
  }
  return { ...state, nextDirection: direction };
}

export function setStatus(state: SnakeGameState, status: GameStatus): SnakeGameState {
  return { ...state, status };
}

export function advanceGame(
  state: SnakeGameState,
  board: BoardSize,
  rng: () => number = Math.random,
): SnakeGameState {
  if (state.status !== 'running') {
    return state;
  }

  const direction = state.nextDirection;
  const nextHead = movePoint(state.snake[0], direction);
  const isEating = pointsEqual(nextHead, state.food);
  const collisionBody = isEating ? state.snake : state.snake.slice(0, -1);

  if (isWallCollision(nextHead, board) || collisionBody.some((part) => pointsEqual(part, nextHead))) {
    return { ...state, direction, nextDirection: direction, status: 'gameOver' };
  }

  const snake = isEating
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)];

  return {
    ...state,
    snake,
    food: isEating ? generateFood(board, snake, rng) : state.food,
    direction,
    nextDirection: direction,
    score: isEating ? state.score + SCORE_PER_FOOD : state.score,
  };
}

export function generateFood(board: BoardSize, snake: Point[], rng: () => number = Math.random): Point {
  const freeCells: Point[] = [];
  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      const cell = { x, y };
      if (!snake.some((part) => pointsEqual(part, cell))) {
        freeCells.push(cell);
      }
    }
  }

  if (freeCells.length === 0) {
    return snake[0];
  }

  return freeCells[Math.floor(rng() * freeCells.length) % freeCells.length];
}

export function movePoint(point: Point, direction: Direction): Point {
  switch (direction) {
    case 'up':
      return { x: point.x, y: point.y - 1 };
    case 'down':
      return { x: point.x, y: point.y + 1 };
    case 'left':
      return { x: point.x - 1, y: point.y };
    case 'right':
      return { x: point.x + 1, y: point.y };
  }
}

export function isOpposite(current: Direction, next: Direction): boolean {
  return (
    (current === 'up' && next === 'down') ||
    (current === 'down' && next === 'up') ||
    (current === 'left' && next === 'right') ||
    (current === 'right' && next === 'left')
  );
}

export function pointsEqual(left: Point, right: Point): boolean {
  return left.x === right.x && left.y === right.y;
}

function isWallCollision(point: Point, board: BoardSize): boolean {
  return point.x < 0 || point.y < 0 || point.x >= board.width || point.y >= board.height;
}
