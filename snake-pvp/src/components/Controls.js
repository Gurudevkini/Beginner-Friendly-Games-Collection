import React from 'react';

const GameControls = ({ gameState, onStartGame, isHost }) => {
  if (gameState.gameStatus === 'playing') {
    return (
      <div className="game-controls">
        <div className="game-mode">
          Mode: {gameState.gameMode === 'score' ? 
            `First to ${gameState.targetScore}` : 
            `${gameState.timeLeft}s remaining`
          }
        </div>
      </div>
    );
  }

  return (
    <div className="game-controls">
      {isHost && gameState.gameStatus === 'waiting' && (
        <>
          <button onClick={onStartGame} className="start-button">
            Start Game
          </button>
        </>
      )}
      
      {!isHost && gameState.gameStatus === 'waiting' && (
        <div className="waiting">
          Waiting for host to start the game...
        </div>
      )}

      {gameState.gameStatus === 'finished' && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <div>
            Winner: Player {gameState.player1Score > gameState.player2Score ? '1' : '2'}
          </div>
          <div>
            Final Score - Player 1: {gameState.player1Score}, Player 2: {gameState.player2Score}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
