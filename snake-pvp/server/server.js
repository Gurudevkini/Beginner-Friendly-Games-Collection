const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const gameRooms = new Map();

const initializeGameState = () => ({
  player1Snake: [{ x: 10, y: 10 }],
  player2Snake: [{ x: 5, y: 5 }],
  food: { x: 15, y: 15 },
  player1Score: 0,
  player2Score: 0,
  gameStatus: 'waiting',
  gameMode: 'score',
  targetScore: 10,
  timeLeft: 60,
  player1Direction: { x: 1, y: 0 },
  player2Direction: { x: 1, y: 0 }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    if (!gameRooms.has(roomId)) {
      gameRooms.set(roomId, {
        players: [],
        gameState: initializeGameState(),
        gameLoop: null
      });
    }
    
    const room = gameRooms.get(roomId);
    if (room.players.length < 2) {
      room.players.push({
        id: socket.id,
        playerId: room.players.length + 1
      });
      
      socket.emit('player-assigned', {
        playerId: room.players.length,
        gameState: room.gameState
      });
      
      io.to(roomId).emit('room-update', {
        playerCount: room.players.length
      });
    }
  });

  socket.on('player-input', (data) => {
    const room = gameRooms.get(data.roomId);
    if (room && room.gameState.gameStatus === 'playing') {
      const currentDirection = data.playerId === 1 ? 
        room.gameState.player1Direction : 
        room.gameState.player2Direction;
      
      if (data.direction.x === -currentDirection.x && data.direction.y === -currentDirection.y) {
        return;
      }
      
      if (data.playerId === 1) {
        room.gameState.player1Direction = data.direction;
      } else if (data.playerId === 2) {
        room.gameState.player2Direction = data.direction;
      }
    }
  });

  socket.on('start-game', (data) => {
    const room = gameRooms.get(data.roomId);
    if (room && room.players.length === 2) {
      room.gameState.gameStatus = 'playing';
      
      room.gameLoop = setInterval(() => {
        updateGameState(room.gameState);
        io.to(data.roomId).emit('game-tick', room.gameState);
        
        if (room.gameState.gameStatus === 'finished') {
          clearInterval(room.gameLoop);
        }
      }, 150);
      
      io.to(data.roomId).emit('game-started');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    gameRooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(player => player.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.gameLoop) {
          clearInterval(room.gameLoop);
          room.gameLoop = null;
        }
        
        room.gameState = initializeGameState();
        
        io.to(roomId).emit('player-disconnected');
        
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        }
      }
    });
  });
});

const updateGameState = (gameState) => {
  let player1NextSnake = moveSnake(gameState.player1Snake, gameState.player1Direction);
  let player2NextSnake = moveSnake(gameState.player2Snake, gameState.player2Direction);

  const p1GotFood = checkFoodCollision(player1NextSnake[0], gameState.food);
  const p2GotFood = checkFoodCollision(player2NextSnake[0], gameState.food);

  if (p1GotFood) {
    gameState.player1Score++;
    gameState.player1Snake = player1NextSnake;
  } else {
    player1NextSnake.pop();
    gameState.player1Snake = player1NextSnake;
  }

  if (p2GotFood) {
    gameState.player2Score++;
    gameState.player2Snake = player2NextSnake;
  } else {
    player2NextSnake.pop();
    gameState.player2Snake = player2NextSnake;
  }

  if (p1GotFood || p2GotFood) {
    generateNewFood(gameState);
  }

  if (gameState.gameMode === 'time' && gameState.timeLeft > 0) {
    gameState.timeLeft--;
    if (gameState.timeLeft <= 0) {
      gameState.gameStatus = 'finished';
    }
  } else if (gameState.gameMode === 'score') {
    if (gameState.player1Score >= gameState.targetScore || gameState.player2Score >= gameState.targetScore) {
      gameState.gameStatus = 'finished';
    }
  }
};

const moveSnake = (snake, direction) => {
  const head = snake[0];
  const newHead = {
    x: (head.x + direction.x + 20) % 20,
    y: (head.y + direction.y + 20) % 20
  };
  return [newHead, ...snake];
};

const checkFoodCollision = (head, food) => {
  return head.x === food.x && head.y === food.y;
};

const generateNewFood = (gameState) => {
  let newFood;
  let attempts = 0;
  
  do {
    newFood = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };
    attempts++;
  } while (
    attempts < 100 && (
      isPositionOnSnake(newFood, gameState.player1Snake) ||
      isPositionOnSnake(newFood, gameState.player2Snake)
    )
  );
  
  gameState.food = newFood;
};

const isPositionOnSnake = (position, snake) => {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
};

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});