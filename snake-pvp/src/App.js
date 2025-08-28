import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    //Check URL for room ID
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('room');
    if (urlRoomId) {
      setRoomId(urlRoomId);
      setIsHost(false);
    }
  }, []);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 15);
    setRoomId(newRoomId);
    setIsHost(true);
    setGameStarted(true);
    
    //Update URL
    window.history.pushState({}, '', `?room=${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      setIsHost(false);
      setGameStarted(true);
      window.history.pushState({}, '', `?room=${roomId}`);
    }
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Room URL copied to clipboard!');
  };

  if (!gameStarted) {
    return (
      <div className="app">
        <div className="lobby">
          <h1>Multiplayer Snake Game</h1>
          
          <div className="room-options">
            <button onClick={createRoom} className="create-room-btn">
              Create New Room
            </button>
            
            <div className="join-room">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button onClick={joinRoom} disabled={!roomId.trim()}>
                Join Room
              </button>
            </div>
          </div>

          {roomId && (
            <div className="room-info">
              <p>Room ID: {roomId}</p>
              <button onClick={shareRoom}>Share Room URL</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Game roomId={roomId} isHost={isHost} />
    </div>
  );
}

export default App;
