import React from 'react';
import './Board.css';

const GameBoard = ({ gameState, playerNumber }) => {
  const BOARD_SIZE = 20;
  const CELL_SIZE = 20;

  const renderCell = (x, y) => {
    const isPlayer1Snake = gameState.player1Snake.some(segment => segment.x === x && segment.y === y);
    const isPlayer2Snake = gameState.player2Snake.some(segment => segment.x === x && segment.y === y);
    const isFood = gameState.food.x === x && gameState.food.y === y;
    
    // Check if it's the head of either snake
    const isPlayer1Head = gameState.player1Snake[0]?.x === x && gameState.player1Snake[0]?.y === y;
    const isPlayer2Head = gameState.player2Snake[0]?.x === x && gameState.player2Snake[0]?.y === y;

    let className = 'cell';
    if (isPlayer1Snake) {
      className += isPlayer1Head ? ' player1-head' : ' player1-snake';
    }
    if (isPlayer2Snake) {
      className += isPlayer2Head ? ' player2-head' : ' player2-snake';
    }
    if (isFood) className += ' food';

    return (
      <div
        key={`${x}-${y}`}
        className={className}
        style={{
          left: x * CELL_SIZE,
          top: y * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE
        }}
      />
    );
  };

  const cells = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      cells.push(renderCell(x, y));
    }
  }

  return (
    <div className="board-container">
      <div 
        className="game-board"
        style={{
          width: BOARD_SIZE * CELL_SIZE,
          height: BOARD_SIZE * CELL_SIZE,
        }}
      >
        {cells}
      </div>
    </div>
  );
};

export default GameBoard;
