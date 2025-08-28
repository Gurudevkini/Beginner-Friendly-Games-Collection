import React, { useEffect } from 'react';
import { Joystick } from 'react-joystick-component';
import { useMultiplayer } from '../hooks/MultiPlayer';
import GameBoard from './Board';
import GameControls from './Controls';

const Game = ({ roomId, isHost }) => {
  const { gameState, playerId, sendInput, startGame, isConnected } = useMultiplayer(roomId);

  useEffect(() => {
    const handleKeyPress = (e) => {
        const key = e.key.toLowerCase();
        let newDirection = null;
        
        switch (key) {
            case 'arrowup':
            case 'w':
            newDirection = { x: 0, y: -1 };
            break;
            case 'arrowdown':
            case 's':
            newDirection = { x: 0, y: 1 };
            break;
            case 'arrowleft':
            case 'a':
            newDirection = { x: -1, y: 0 };
            break;
            case 'arrowright':
            case 'd':
            newDirection = { x: 1, y: 0 };
            break;
            default:
            return;
        }

        sendInput(newDirection);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sendInput]);

  const handleJoystickMove = (stick) => {
    let newDirection = null;
    switch (stick.direction) {
        case 'FORWARD':
            newDirection = { x: 0, y: -1 };
            break;
        case 'BACKWARD':
            newDirection = { x: 0, y: 1 };
            break;
        case 'LEFT':
            newDirection = { x: -1, y: 0 };
            break;
        case 'RIGHT':
            newDirection = { x: 1, y: 0 };
            break;
        default:
            return; 
    }
    sendInput(newDirection);
  };
  
  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Multiplayer Snake</h1>
        <div className="connection-status">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        <div className="room-info">
          Room: {roomId} | You are Player {playerId}
        </div>
      </div>

      <div className="game-content">
        <GameControls
          gameState={gameState}
          onStartGame={startGame}
          isHost={isHost}
        />
        
        <GameBoard
          gameState={gameState}
          playerNumber={playerId}
        />

        <div className="game-stats">
          <div className="score">
            Player 1: {gameState.player1Score} | Player 2: {gameState.player2Score}
          </div>
          {gameState.gameMode === 'time' && (
            <div className="time">Time Left: {gameState.timeLeft}s</div>
          )}
        </div>
      </div>

      <div className="controls-help">
        <h3>Controls:</h3>
        <p>Use WASD or Arrow Keys</p>
      </div>
      
      <div className="joystick-container">
        <Joystick
            size={100}
            baseColor="#555"
            stickColor="#bbb"
            move={handleJoystickMove}
            stop={handleJoystickMove} 
        />
      </div>
    </div>
  );
};

export default Game;