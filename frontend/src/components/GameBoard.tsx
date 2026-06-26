import { pointsEqual, type BoardSize, type SnakeGameState } from '../game/snakeEngine';

interface GameBoardProps {
  board: BoardSize;
  state: SnakeGameState;
}

export function GameBoard({ board, state }: GameBoardProps) {
  const cells = [];
  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      const point = { x, y };
      const snakeIndex = state.snake.findIndex((part) => pointsEqual(part, point));
      const classNames = ['board-cell'];
      if (snakeIndex === 0) classNames.push('snake-head');
      if (snakeIndex > 0) classNames.push('snake-body');
      if (pointsEqual(state.food, point)) classNames.push('food-cell');

      cells.push(<div key={`${x}-${y}`} className={classNames.join(' ')} />);
    }
  }

  return (
    <section
      className="game-board"
      style={{
        gridTemplateColumns: `repeat(${board.width}, 1fr)`,
        gridTemplateRows: `repeat(${board.height}, 1fr)`,
      }}
      aria-label="Snake game board"
    >
      {cells}
      {state.status === 'ready' && <div className="board-overlay">PRESS START</div>}
      {state.status === 'paused' && <div className="board-overlay">PAUSED</div>}
      {state.status === 'gameOver' && <div className="board-overlay danger">GAME OVER</div>}
    </section>
  );
}
