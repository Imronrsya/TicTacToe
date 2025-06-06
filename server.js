const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Game rooms storage
const gameRooms = new Map();

// Generate random room code
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Create a new game room
    socket.on('createRoom', (playerName) => {
        const roomCode = generateRoomCode();
        const room = {
            code: roomCode,
            players: [{
                id: socket.id,
                name: playerName,
                symbol: 'X',
                isReady: false
            }],
            gameState: {
                board: ['', '', '', '', '', '', '', '', ''],
                currentPlayer: 'X',
                gameActive: false,
                winner: null
            },
            createdAt: Date.now()
        };

        gameRooms.set(roomCode, room);
        socket.join(roomCode);
        
        socket.emit('roomCreated', {
            roomCode: roomCode,
            playerSymbol: 'X',
            players: room.players
        });

        console.log(`Room ${roomCode} created by ${playerName}`);
    });

    // Join existing game room
    socket.on('joinRoom', (data) => {
        const { roomCode, playerName } = data;
        const room = gameRooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found!' });
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('error', { message: 'Room is full!' });
            return;
        }

        // Add player to room
        room.players.push({
            id: socket.id,
            name: playerName,
            symbol: 'O',
            isReady: false
        });

        socket.join(roomCode);

        // Notify all players in room
        io.to(roomCode).emit('playerJoined', {
            players: room.players,
            message: `${playerName} joined the room!`
        });

        socket.emit('roomJoined', {
            roomCode: roomCode,
            playerSymbol: 'O',
            players: room.players
        });

        console.log(`${playerName} joined room ${roomCode}`);
    });

    // Player ready to start game
    socket.on('playerReady', (roomCode) => {
        const room = gameRooms.get(roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.isReady = true;
        }

        // Check if both players are ready
        if (room.players.length === 2 && room.players.every(p => p.isReady)) {
            room.gameState.gameActive = true;
            room.gameState.currentPlayer = 'X';
            
            io.to(roomCode).emit('gameStarted', {
                gameState: room.gameState,
                players: room.players
            });

            console.log(`Game started in room ${roomCode}`);
        } else {
            io.to(roomCode).emit('playerReady', {
                players: room.players
            });
        }
    });

    // Handle game moves
    socket.on('makeMove', (data) => {
        const { roomCode, cellIndex } = data;
        const room = gameRooms.get(roomCode);
        
        if (!room || !room.gameState.gameActive) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player || player.symbol !== room.gameState.currentPlayer) return;

        // Check if cell is empty
        if (room.gameState.board[cellIndex] !== '') return;

        // Make the move
        room.gameState.board[cellIndex] = player.symbol;
        
        // Check for winner
        const winner = checkWinner(room.gameState.board);
        if (winner) {
            room.gameState.winner = winner;
            room.gameState.gameActive = false;
            
            io.to(roomCode).emit('gameEnded', {
                gameState: room.gameState,
                winner: winner === 'DRAW' ? 'DRAW' : room.players.find(p => p.symbol === winner)
            });
        } else {
            // Switch turns
            room.gameState.currentPlayer = room.gameState.currentPlayer === 'X' ? 'O' : 'X';
            
            io.to(roomCode).emit('moveMade', {
                gameState: room.gameState,
                cellIndex: cellIndex,
                symbol: player.symbol
            });
        }
    });

    // Reset game
    socket.on('resetGame', (roomCode) => {
        const room = gameRooms.get(roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        room.gameState = {
            board: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 'X',
            gameActive: true,
            winner: null
        };

        io.to(roomCode).emit('gameReset', {
            gameState: room.gameState
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Find and remove player from any room
        for (let [roomCode, room] of gameRooms.entries()) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const player = room.players[playerIndex];
                room.players.splice(playerIndex, 1);
                
                if (room.players.length === 0) {
                    // Delete empty room
                    gameRooms.delete(roomCode);
                    console.log(`Room ${roomCode} deleted - no players left`);
                } else {
                    // Notify remaining players
                    io.to(roomCode).emit('playerLeft', {
                        players: room.players,
                        message: `${player.name} left the room`
                    });
                }
                break;
            }
        }
    });
});

// Check winner function
function checkWinner(board) {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    // Check for draw
    if (board.every(cell => cell !== '')) {
        return 'DRAW';
    }

    return null;
}

// Clean up old rooms (older than 2 hours)
setInterval(() => {
    const now = Date.now();
    for (let [roomCode, room] of gameRooms.entries()) {
        if (now - room.createdAt > 2 * 60 * 60 * 1000) { // 2 hours
            gameRooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted - expired`);
        }
    }
}, 30 * 60 * 1000); // Check every 30 minutes

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
