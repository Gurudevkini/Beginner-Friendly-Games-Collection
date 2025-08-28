import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const useMultiplayer = (roomId) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('player-assigned', (data) => {
      setPlayerId(data.playerId);
      setGameState(data.gameState);
    });

    newSocket.on('game-tick', (state) => {
      setGameState(state);
    });

    return () => newSocket.close();
  }, [roomId]);

  const sendInput = (direction) => {
    if (socket && isConnected) {
      socket.emit('player-input', {
        roomId,
        playerId,
        direction,
        timestamp: Date.now()
      });
    }
  };

  const startGame = () => {
    if (socket && isConnected) {
      socket.emit('start-game', { roomId });
    }
  };

  return { gameState, playerId, sendInput, startGame, isConnected };
};
