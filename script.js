class Minesweeper {
    constructor() {
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'easy';
        this.rows = this.difficulties[this.currentDifficulty].rows;
        this.cols = this.difficulties[this.currentDifficulty].cols;
        this.mineCount = this.difficulties[this.currentDifficulty].mines;
        
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        this.highScores = this.loadHighScores();
        this.currentTheme = this.loadTheme();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
        this.createBoard();
        this.updateHighScoreDisplay();
        this.render();
    }
    
    loadTheme() {
        const saved = localStorage.getItem('minesweeperTheme');
        return saved || 'light';
    }
    
    saveTheme(theme) {
        localStorage.setItem('minesweeperTheme', theme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        this.currentTheme = theme;
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
    }
    
    loadHighScores() {
        const saved = localStorage.getItem('minesweeperHighScores');
        if (saved) {
            return JSON.parse(saved);
        }
        return { easy: null, medium: null, hard: null };
    }
    
    saveHighScores() {
        localStorage.setItem('minesweeperHighScores', JSON.stringify(this.highScores));
    }
    
    getHighScore(difficulty) {
        return this.highScores[difficulty];
    }
    
    setHighScore(difficulty, time) {
        const currentHigh = this.getHighScore(difficulty);
        if (currentHigh === null || time < currentHigh) {
            this.highScores[difficulty] = time;
            this.saveHighScores();
            return true; // New record!
        }
        return false;
    }
    
    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('high-score');
        const currentHigh = this.getHighScore(this.currentDifficulty);
        if (currentHigh !== null) {
            highScoreElement.textContent = String(currentHigh).padStart(3, '0');
        } else {
            highScoreElement.textContent = '---';
        }
    }
    
    setupEventListeners() {
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => this.reset());
        
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.difficulty;
                this.rows = this.difficulties[this.currentDifficulty].rows;
                this.cols = this.difficulties[this.currentDifficulty].cols;
                this.mineCount = this.difficulties[this.currentDifficulty].mines;
                this.updateHighScoreDisplay();
                this.reset();
            });
        });
        
        // Update container width on window resize
        window.addEventListener('resize', () => {
            this.updateContainerWidth();
        });
    }
    
    createBoard() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
    }
    
    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first clicked cell or if already has mine
            if ((row === excludeRow && col === excludeCol) || this.board[row][col] === -1) {
                continue;
            }
            
            this.board[row][col] = -1; // -1 represents a mine
            minesPlaced++;
        }
        
        // Calculate numbers for each cell
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] !== -1) {
                    this.board[row][col] = this.countAdjacentMines(row, col);
                }
            }
        }
    }
    
    countAdjacentMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol] === -1) {
                    count++;
                }
            }
        }
        return count;
    }
    
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    revealCell(row, col) {
        if (this.gameOver || this.gameWon || this.revealed[row][col] || this.flagged[row][col]) {
            return;
        }
        
        // Place mines on first click (excluding clicked cell)
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        this.revealed[row][col] = true;
        
        // Check if mine was clicked
        if (this.board[row][col] === -1) {
            this.gameOver = true;
            this.endGame(false);
            return;
        }
        
        // If cell is empty (0), reveal adjacent cells
        if (this.board[row][col] === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const newRow = row + i;
                    const newCol = col + j;
                    if (this.isValidCell(newRow, newCol) && !this.revealed[newRow][newCol] && !this.flagged[newRow][newCol]) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
        
        this.checkWin();
        this.render();
    }
    
    toggleFlag(row, col) {
        if (this.gameOver || this.gameWon || this.revealed[row][col]) {
            return;
        }
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.updateMineCount();
        this.checkWin();
        this.render();
    }
    
    checkWin() {
        let revealedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.revealed[row][col]) {
                    revealedCount++;
                }
            }
        }
        
        const totalCells = this.rows * this.cols;
        if (revealedCount === totalCells - this.mineCount) {
            this.gameWon = true;
            this.endGame(true);
        }
    }
    
    endGame(won) {
        this.gameOver = true;
        this.stopTimer();
        
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.textContent = won ? '🤓' : '🤭';
        
        if (won) {
            // update high score
            const isNewRecord = this.setHighScore(this.currentDifficulty, this.timer);
            this.updateHighScoreDisplay();
            
            if (isNewRecord) {
                // flash high score to indicate new record
                const highScoreElement = document.getElementById('high-score');
                highScoreElement.classList.add('new-record');
                setTimeout(() => {
                    highScoreElement.classList.remove('new-record');
                }, 2000);
            }
            
            // reveal all unflagged mines
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.board[row][col] === -1 && !this.flagged[row][col]) {
                        this.flagged[row][col] = true;
                    }
                }
            }
        } else {
            // reveal all mines
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.board[row][col] === -1) {
                        this.revealed[row][col] = true;
                    }
                }
            }
        }
        
        document.getElementById('game-board').classList.add('game-over');
        this.render();
    }
    
    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = String(this.timer).padStart(3, '0');
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateMineCount() {
        let flaggedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.flagged[row][col]) {
                    flaggedCount++;
                }
            }
        }
        document.getElementById('mine-count').textContent = this.mineCount - flaggedCount;
    }
    
    getCellSize() {
        return window.innerWidth <= 600 ? 25 : 30;
    }
    
    updateContainerWidth() {
        const container = document.querySelector('.container');
        const cellSize = this.getCellSize();
        const cellGap = 2;
        const boardPadding = 4; // 2px on each side
        const containerPadding = window.innerWidth <= 600 ? 40 : 60; //  padding
        
        const boardWidth = (cellSize * this.cols) + (cellGap * (this.cols - 1)) + boardPadding;
        const totalWidth = boardWidth + containerPadding;
        const minWidth = window.innerWidth <= 600 ? 300 : 400;
        
        container.style.width = `${Math.max(minWidth, Math.min(totalWidth, window.innerWidth - 40))}px`;
    }
    
    render() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        gameBoard.innerHTML = '';
        
        this.updateContainerWidth();
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.revealed[row][col]) {
                    cell.classList.add('revealed');
                    if (this.board[row][col] === -1) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (this.board[row][col] > 0) {
                        cell.classList.add(`number-${this.board[row][col]}`);
                        cell.textContent = this.board[row][col];
                    }
                } else if (this.flagged[row][col]) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }
                
                // Left click
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.revealCell(row, col);
                });
                
                // Right click
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.toggleFlag(row, col);
                });
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    reset() {
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.stopTimer();
        
        document.getElementById('reset-btn').textContent = '🥺';
        document.getElementById('timer').textContent = '000';
        document.getElementById('game-board').classList.remove('game-over');
        
        this.createBoard();
        this.updateMineCount();
        this.render();
    }
}

//  game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});

