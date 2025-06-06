let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let gameMode = '';
let difficulty = 'medium';
let player1Name = 'Player 1';
let player2Name = 'Player 2';

// Online game variables
let socket = null;
let currentRoom = null;
let playerSymbol = null;
let isOnlineGame = false;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggleBtn');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showModeSelection(mode) {
    gameMode = mode;
    if (mode === 'pvc') {
        showScreen('difficultyScreen');
    } else if (mode === 'pvp-online') {
        showScreen('onlineRoomScreen');
        initializeSocket();
    } else {
        showScreen('playerNamesScreen');
    }
}

function setDifficulty(level) {
    difficulty = level;
    
    document.querySelectorAll('.difficulty-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-difficulty') === level) {
            btn.classList.add('active');
        }
    });
}

function startPvPGame() {
    const p1Input = document.getElementById('player1').value.trim();
    const p2Input = document.getElementById('player2').value.trim();
    
    player1Name = p1Input || 'Player 1';
    player2Name = p2Input || 'Player 2';
    
    document.getElementById('gameMode').textContent = `${player1Name} vs ${player2Name}`;
    startGame();
}

function startGame() {
    resetGame();
    if (gameMode === 'pvc') {
        const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        document.getElementById('gameMode').textContent = `Player vs Computer (${difficultyText})`;
        player1Name = 'You';
        player2Name = 'Computer';
        document.getElementById('gameStatus').textContent = `${player1Name}'s Turn`;
    } else {
        document.getElementById('gameStatus').textContent = `${player1Name}'s Turn`;
    }
    showScreen('gameScreen');
}

function makeMove(cellIndex) {
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }

    // Check if it's online game and if it's player's turn
    if (isOnlineGame) {
        if (currentPlayer !== playerSymbol) {
            return; // Not player's turn
        }
        // Send move to server
        socket.emit('makeMove', {
            roomCode: currentRoom,
            cellIndex: cellIndex
        });
        return;
    }

    gameBoard[cellIndex] = currentPlayer;
    updateDisplay();

    const winnerInfo = checkWinner();
    if (winnerInfo.hasWinner) {
        highlightWinningLine(winnerInfo.winningLine);
        const winnerName = currentPlayer === 'X' ? player1Name : player2Name;
        document.getElementById('gameStatus').textContent = `🎉 ${winnerName} Wins!`;
        document.getElementById('gameStatus').classList.add('winner');
        gameActive = false;
        return;
    }

    if (gameBoard.every(cell => cell !== '')) {
        document.getElementById('gameStatus').textContent = '🤝 It\'s a Draw!';
        gameActive = false;
        return;
    }    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
        document.getElementById('gameStatus').textContent = '🤖 Computer is thinking...';
        setTimeout(computerMove, 800);
    } else if (gameActive) {
        const currentPlayerName = currentPlayer === 'X' ? player1Name : player2Name;
        document.getElementById('gameStatus').textContent = `${currentPlayerName}'s Turn`;
    }
}

function highlightWinningLine(winningLine) {
    winningLine.forEach((index, i) => {
        setTimeout(() => {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('winning');
            }
        }, i * 150);
    });
}

function computerMove() {
    if (!gameActive) return;    let move;
    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = Math.random() < 0.7 ? getBestMove() : getRandomMove();
    } else {
        move = getBestMove();
    }

    if (move !== -1) {
        makeMove(move);
    }
}

function getRandomMove() {
    const availableMoves = gameBoard
        .map((cell, index) => cell === '' ? index : null)
        .filter(val => val !== null);
    
    return availableMoves.length > 0 
        ? availableMoves[Math.floor(Math.random() * availableMoves.length)] 
        : -1;
}

function getBestMove() {
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            if (checkWinner().winner === 'O') {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'X';
            if (checkWinner().winner === 'X') {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    if (gameBoard[4] === '') return 4;

    const corners = [0, 2, 6, 8].filter(index => gameBoard[index] === '');
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    const sides = [1, 3, 5, 7].filter(index => gameBoard[index] === '');
    if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];
    
    return getRandomMove();
}

function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return { hasWinner: true, winningLine: condition, winner: gameBoard[a] };
        }
    }
    return { hasWinner: false, winningLine: [], winner: null };
}

function updateDisplay() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const value = gameBoard[index];
        cell.textContent = value;
        cell.className = 'cell';
        if (value === 'X') {
            cell.classList.add('x');
        } else if (value === 'O') {
            cell.classList.add('o');
        }
    });
}

function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    
    updateDisplay();
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('winning');
    });
    
    if (isOnlineGame) {
        // For online games, wait for server to handle reset
        return;
    }
    
    const initialPlayerName = (gameMode === 'pvc') ? 'You' : player1Name;
    document.getElementById('gameStatus').textContent = `${initialPlayerName}'s Turn`;
    document.getElementById('gameStatus').classList.remove('winner');
}

// Online Game Functions
function initializeSocket() {
    if (!socket) {
        socket = io();
        setupSocketListeners();
    }
}

function setupSocketListeners() {
    socket.on('roomCreated', (data) => {
        currentRoom = data.roomCode;
        playerSymbol = data.playerSymbol;
        isOnlineGame = true;
        
        document.getElementById('currentRoomCode').textContent = data.roomCode;
        updatePlayersList(data.players);
        showScreen('waitingRoomScreen');
        
        showNotification(`Room ${data.roomCode} created! Share this code with your friend.`);
    });

    socket.on('roomJoined', (data) => {
        currentRoom = data.roomCode;
        playerSymbol = data.playerSymbol;
        isOnlineGame = true;
        
        document.getElementById('currentRoomCode').textContent = data.roomCode;
        updatePlayersList(data.players);
        showScreen('waitingRoomScreen');
        
        showNotification('Successfully joined the room!');
    });

    socket.on('playerJoined', (data) => {
        updatePlayersList(data.players);
        showNotification(data.message);
    });

    socket.on('playerLeft', (data) => {
        updatePlayersList(data.players);
        showNotification(data.message);
        
        // If we're in game and other player left, go back to waiting room
        if (document.getElementById('gameScreen').classList.contains('active')) {
            showScreen('waitingRoomScreen');
        }
    });

    socket.on('playerReady', (data) => {
        updatePlayersList(data.players);
    });

    socket.on('gameStarted', (data) => {
        const players = data.players;
        player1Name = players.find(p => p.symbol === 'X').name;
        player2Name = players.find(p => p.symbol === 'O').name;
        
        document.getElementById('gameMode').textContent = `${player1Name} (X) vs ${player2Name} (O)`;
        
        resetGame();
        gameActive = true;
        currentPlayer = 'X';
        
        const currentPlayerName = currentPlayer === playerSymbol ? 'Your' : 
                                 (currentPlayer === 'X' ? player1Name + "'s" : player2Name + "'s");
        document.getElementById('gameStatus').textContent = `${currentPlayerName} Turn`;
        
        showScreen('gameScreen');
        showNotification('Game started!');
    });    socket.on('moveMade', (data) => {
        gameBoard = data.gameState.board;
        currentPlayer = data.gameState.currentPlayer;
        
        updateDisplay();
        
        if (gameActive) {
            const currentPlayerName = currentPlayer === playerSymbol ? 'Your' : 
                                     (currentPlayer === 'X' ? player1Name + "'s" : player2Name + "'s");
            document.getElementById('gameStatus').textContent = `${currentPlayerName} Turn`;
        }
    });

    socket.on('gameEnded', (data) => {
        gameBoard = data.gameState.board;
        gameActive = false;
        
        updateDisplay();
        
        if (data.winner === 'DRAW') {
            document.getElementById('gameStatus').textContent = '🤝 It\'s a Draw!';
        } else {
            const winnerName = data.winner.name;
            document.getElementById('gameStatus').textContent = `🎉 ${winnerName} Wins!`;
            document.getElementById('gameStatus').classList.add('winner');
            
            // Highlight winning line (simplified)
            highlightWinningCells(data.gameState.board);
        }
    });

    socket.on('gameReset', (data) => {
        gameBoard = data.gameState.board;
        currentPlayer = data.gameState.currentPlayer;
        gameActive = data.gameState.gameActive;
        
        updateDisplay();
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('winning');
        });
        
        const currentPlayerName = currentPlayer === playerSymbol ? 'Your' : 
                                 (currentPlayer === 'X' ? player1Name + "'s" : player2Name + "'s");
        document.getElementById('gameStatus').textContent = `${currentPlayerName} Turn`;
        document.getElementById('gameStatus').classList.remove('winner');
        
        showNotification('Game reset!');
    });

    socket.on('error', (data) => {
        showNotification(data.message, 'error');
    });

    socket.on('disconnect', () => {
        showNotification('Disconnected from server', 'error');
        document.getElementById('connectionStatus').textContent = 'Disconnected';
        document.getElementById('connectionStatus').className = 'connection-status disconnected';
    });

    socket.on('connect', () => {
        document.getElementById('connectionStatus').textContent = 'Connected';
        document.getElementById('connectionStatus').className = 'connection-status connected';
    });
}

function createRoom() {
    const playerName = document.getElementById('hostPlayerName').value.trim();
    if (!playerName) {
        showNotification('Please enter your name', 'error');
        return;
    }
    
    socket.emit('createRoom', playerName);
}

function joinRoom() {
    const playerName = document.getElementById('guestPlayerName').value.trim();
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
    
    if (!playerName || !roomCode) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    socket.emit('joinRoom', { roomCode, playerName });
}

function playerReady() {
    if (currentRoom) {
        socket.emit('playerReady', currentRoom);
        document.getElementById('btnReady').disabled = true;
        document.getElementById('btnReady').textContent = 'Waiting for other player...';
    }
}

function leaveRoom() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    
    currentRoom = null;
    playerSymbol = null;
    isOnlineGame = false;
    
    // Reset UI
    document.getElementById('hostPlayerName').value = '';
    document.getElementById('guestPlayerName').value = '';
    document.getElementById('roomCode').value = '';
    document.getElementById('btnReady').disabled = false;
    document.getElementById('btnReady').textContent = 'Ready to Play';
    
    showScreen('homeScreen');
}

function updatePlayersList(players) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        
        const statusClass = player.isReady ? 'ready' : 'waiting';
        const statusText = player.isReady ? 'Ready' : 'Waiting';
        
        playerDiv.innerHTML = `
            <div class="player-info">
                <span class="player-name">${player.name}</span>
                <span class="player-symbol">${player.symbol}</span>
            </div>
            <span class="player-status ${statusClass}">${statusText}</span>
        `;
        
        playersList.appendChild(playerDiv);
    });
}

function copyRoomCode() {
    const roomCode = document.getElementById('currentRoomCode').textContent;
    navigator.clipboard.writeText(roomCode).then(() => {
        showNotification('Room code copied to clipboard!');
    }).catch(() => {
        showNotification('Failed to copy room code', 'error');
    });
}

function highlightWinningCells(board) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            condition.forEach((index, i) => {
                setTimeout(() => {
                    const cell = document.querySelector(`.cell[data-index="${index}"]`);
                    if (cell) {
                        cell.classList.add('winning');
                    }
                }, i * 150);
            });
            break;
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-md);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    document.body.removeAttribute('data-theme'); 
    document.getElementById('themeToggleBtn').textContent = '🌙';

    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);    document.getElementById('btnPvp').addEventListener('click', () => showModeSelection('pvp'));
    document.getElementById('btnPvpOnline').addEventListener('click', () => showModeSelection('pvp-online'));
    document.getElementById('btnPvc').addEventListener('click', () => showModeSelection('pvc'));    document.getElementById('btnStartPvpGame').addEventListener('click', startPvPGame);
    document.getElementById('btnBackFromPlayerNames').addEventListener('click', () => showScreen('homeScreen'));

    // Online room event listeners
    document.getElementById('btnCreateRoom').addEventListener('click', createRoom);
    document.getElementById('btnJoinRoom').addEventListener('click', joinRoom);
    document.getElementById('btnBackFromOnlineRoom').addEventListener('click', () => showScreen('homeScreen'));
    
    // Waiting room event listeners
    document.getElementById('btnReady').addEventListener('click', playerReady);
    document.getElementById('btnLeaveRoom').addEventListener('click', leaveRoom);
    document.getElementById('btnCopyRoomCode').addEventListener('click', copyRoomCode);

    document.querySelectorAll('.difficulty-button').forEach(button => {
        button.addEventListener('click', function() {
            setDifficulty(this.getAttribute('data-difficulty'));
        });
    });    document.getElementById('btnStartGameFromDifficulty').addEventListener('click', startGame);
    document.getElementById('btnBackFromDifficulty').addEventListener('click', () => showScreen('homeScreen'));
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', function() {
            makeMove(parseInt(this.getAttribute('data-index')));
        });
    });    document.getElementById('btnResetGame').addEventListener('click', () => {
        if (isOnlineGame && currentRoom) {
            socket.emit('resetGame', currentRoom);
        } else {
            resetGame();
        }
    });
    document.getElementById('btnMainMenuFromGame').addEventListener('click', () => {
        if (isOnlineGame) {
            leaveRoom();
        } else {
            showScreen('homeScreen');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key >= '1' && e.key <= '9') {
            if (document.getElementById('gameScreen').classList.contains('active')) {
                const cellIndex = parseInt(e.key) - 1;
                if (gameBoard[cellIndex] === '' && gameActive) {
                     makeMove(cellIndex);
                }
            }
        }
    });
    
    document.querySelectorAll('.button, .difficulty-button, .theme-toggle').forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.click();
            }
        });
    });
      const playerInputs = [document.getElementById('player1'), document.getElementById('player2')];
    playerInputs.forEach(input => {
        if (input) {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    if (document.getElementById('playerNamesScreen').classList.contains('active')) {
                        startPvPGame();
                    }
                }
            });
        }
    });

    // Room code input formatting
    const roomCodeInput = document.getElementById('roomCode');
    if (roomCodeInput) {
        roomCodeInput.addEventListener('input', function(e) {
            this.value = this.value.toUpperCase();
        });
        
        roomCodeInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                joinRoom();
            }
        });
    }

    // Enter key support for online forms
    ['hostPlayerName', 'guestPlayerName'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    if (id === 'hostPlayerName') {
                        createRoom();
                    } else if (document.getElementById('roomCode').value.trim()) {
                        joinRoom();
                    }
                }
            });
        }    });

    setDifficulty(difficulty);
});