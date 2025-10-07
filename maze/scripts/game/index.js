import { SettingsManager } from '../settings/settingsManager.js';
import { AuthService } from '../auth/authService.js';
import { InputManager } from './input/inputManager.js';
import { MazeRenderer } from './render/renderer.js';
import { GameState } from './state/gameState.js';
import { generateMaze } from './utils/mazeGenerator.js';
import { GameUIManager } from './ui/uiManager.js';
import { RaceTimer, ClassicTimer } from './timers/index.js';
import { RaceSessionService } from './auth/raceSessionService.js';

const MAZE_SIZES = {
    teensy: 10,
    mini: 15,
    medium: 25,
    mighty: 35,
    mega: 50
};

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    // 顯示小數點後2位
    const secsStr = secs.toFixed(2).padStart(5, '0');
    return `${minutes}:${secsStr}`;
};

class MazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.params = new URLSearchParams(window.location.search);
        this.supabaseClient = window.supabaseClient || null;
        this.authService = window.authService || (this.supabaseClient ? new AuthService(this.supabaseClient) : null);

        this.mode = this.params.get('mode');
        this.size = this.params.get('size');
        this.timeLimit = this.params.get('time') ? parseInt(this.params.get('time'), 10) * 60 : null;
        this.mazeTarget = this.params.get('count') ? parseInt(this.params.get('count'), 10) : null;

        this.settingsManager = window.mazeSettings || new SettingsManager();

        this.language = this.settingsManager.getLanguage();
        this.theme = this.settingsManager.getTheme();

        const gridSize = MAZE_SIZES[this.size] || MAZE_SIZES.mini;
        this.state = new GameState({ gridSize });
        this.state.gridSize = gridSize;
        this.state.mode = this.mode;
        this.state.race.timeLimit = this.timeLimit;
        this.state.race.mazeTarget = this.mazeTarget;

        this.uiManager = new GameUIManager({
            getLanguage: () => this.settingsManager.getLanguage(),
            getMode: () => this.mode,
            onPlayAgain: () => this.playAgain()
        });

        this.raceSessionService = new RaceSessionService({
            supabaseClient: this.supabaseClient,
            authService: this.authService,
            settingsManager: this.settingsManager,
            showStatus: (message, type) => this.uiManager.showStatus(message, type)
        });

        this.renderer = new MazeRenderer({
            canvas: this.canvas,
            state: this.state,
            getTheme: () => this.settingsManager.getTheme()
        });

        this.inputManager = new InputManager({
            canvas: this.canvas,
            onMove: (dx, dy) => this.handleMove(dx, dy),
            onTogglePause: () => this.togglePause(),
            isInteractable: () => !this.state.gameWon && !this.state.gameOver && !this.state.paused
        });

        this.raceTimer = new RaceTimer({
            onTick: (seconds) => {
                this.state.race.elapsed = seconds;
                this.uiManager.updateTimerDisplay(formatTime(seconds));
            },
            onComplete: () => {}
        });

        this.classicTimer = new ClassicTimer({
            onTick: (seconds) => {
                this.state.race.timeRemaining = seconds;
                this.uiManager.updateTimerDisplay(formatTime(Math.max(0, seconds)));
            },
            onComplete: () => this.endGame()
        });

        this.setupAuthListeners();
        this.init();
    }

    setupAuthListeners() {
        if (!this.authService) {
            return;
        }

        this.authService.init?.().then(async () => {
            await this.handleAuthStateChange();
        });

        this.authService.onAuthStateChange(async () => {
            await this.handleAuthStateChange();
        });
    }

    async handleAuthStateChange() {
        if (this.mode === 'race' && this.mazeTarget) {
            await this.raceSessionService.refreshSessionToken();
            await this.raceSessionService.ensureSession({
                mode: this.mode,
                size: this.size,
                target: this.mazeTarget
            });
        } else if (this.mode === 'dark') {
            await this.raceSessionService.refreshSessionToken();
            await this.raceSessionService.ensureSession({
                mode: this.mode,
                size: this.size,
                target: 1
            });
        }
    }

    init() {
        this.applySettings();
        this.setupCanvas();
        this.generateMaze();
        this.inputManager.init();
        this.uiManager.init();
        this.uiManager.translateUI();
        this.state.path.push({ x: this.state.player.x, y: this.state.player.y });
        this.uiManager.updateStepCount(this.state.stepCount);
        this.renderer.render();
        this.startModeSpecificLogic();
        requestAnimationFrame(() => this.animate());
    }

    applySettings() {
        document.documentElement.className = `theme-${this.theme}`;
        document.documentElement.lang = this.language === 'zh' ? 'zh-TW' : 'en';
    }

    setupCanvas() {
        const isMobile = window.innerWidth <= 768;
        const maxWidth = Math.min(window.innerWidth - 20, 900); // 減少左右邊距，從40改為20
        
        // 手機端：計算可用高度
        // Header 大約 80px (優化後)
        // 方向鍵區域約 200px (高度 + 底部距離)
        // game-status 區域約 35px
        // 額外上下邊距 15px
        const verticalReserve = isMobile ? 330 : 200;
        const maxHeight = Math.min(window.innerHeight - verticalReserve, isMobile ? 700 : 820);
        const maxSize = Math.min(maxWidth, maxHeight);

        const cellSize = Math.floor(maxSize / this.state.gridSize);
        const canvasSize = cellSize * this.state.gridSize;

        this.state.cellSize = cellSize;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;

        // 處理手機端視窗高度變化
        if (isMobile) {
            this.handleMobileViewportChange();
        }

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.renderer.render();
        });
    }

    handleMobileViewportChange() {
        // 設置視窗高度為100vh，避免瀏覽器工具欄影響
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 100);
        });
    }

    generateMaze() {
        const { maze, start, end } = generateMaze({ gridSize: this.state.gridSize });
        this.state.maze = maze;
        this.state.start = start;
        this.state.end = end;

        this.state.player = { ...start };
        this.state.anim.player = { ...start };
        this.state.anim.start = { ...start };
        this.state.anim.progress = 1;
        this.state.path = [{ x: start.x, y: start.y }];
        this.state.stepCount = 0;
        this.uiManager.updateStepCount(this.state.stepCount);
    }

    handleMove(dx, dy) {
        const { player, gridSize, maze, path } = this.state;
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
            return;
        }

        const cell = maze[player.y]?.[player.x];
        if (!cell) return;

        const canMove = (dx === 1 && !cell.right) || (dx === -1 && !cell.left) || (dy === 1 && !cell.bottom) || (dy === -1 && !cell.top);
        if (!canMove) {
            if (this.mode === 'faultless') {
                this.resetToStart('game.hitWall');
            }
            return;
        }

        const existingIndex = path.findIndex((pos) => pos.x === newX && pos.y === newY);
        if (existingIndex !== -1 && existingIndex < path.length - 1) {
            if (this.mode === 'faultless') {
                this.resetToStart('game.noBacktrack');
                return;
            }
            this.state.path = path.slice(0, existingIndex + 1);
            this.animateMove(newX, newY);
            this.incrementSteps();
            return;
        }

        this.state.path.push({ x: newX, y: newY });
        this.animateMove(newX, newY);
        this.incrementSteps();

        if (newX === this.state.end.x && newY === this.state.end.y) {
            this.handleWin();
        }
    }

    animateMove(newX, newY) {
        this.state.anim.start = this.state.anim.progress < 1 ? { ...this.state.anim.player } : { ...this.state.player };
        this.state.player = { x: newX, y: newY };
        this.state.anim.progress = 0;
    }

    incrementSteps() {
        this.state.stepCount += 1;
        this.uiManager.updateStepCount(this.state.stepCount);
    }

    resetToStart(messageKey) {
        const { start } = this.state;
        this.state.player = { ...start };
        this.state.anim.player = { ...start };
        this.state.anim.start = { ...start };
        this.state.anim.progress = 1;
        this.state.path = [{ x: start.x, y: start.y }];
        this.state.stepCount = 0;
        this.uiManager.updateStepCount(this.state.stepCount);
        this.renderer.render();
        this.uiManager.showStatus(messageKey, 'error');
    }

    handleWin() {
        if (this.mode === 'race') {
            this.state.race.mazesCompleted += 1;
            this.state.race.totalSteps += this.state.stepCount;

            if (this.mazeTarget) {
                this.uiManager.updateMazeCount(`${this.state.race.mazesCompleted}/${this.mazeTarget}`);
                if (this.state.race.mazesCompleted >= this.mazeTarget) {
                    this.completeRace();
                } else {
                    this.generateMaze();
                    this.renderer.render();
                }
            } else {
                this.uiManager.updateMazeCount(this.state.race.mazesCompleted);
                this.generateMaze();
                this.renderer.render();
            }
        } else if (this.mode === 'dark') {
            // Dark mode: single maze race
            this.completeDarkMaze();
        } else {
            this.state.gameWon = true;
            this.uiManager.showWinModal({
                totalTime: '',
                totalSteps: this.state.stepCount,
                mode: this.mode
            });
        }
    }

    async completeRace() {
        this.state.gameWon = true;
        this.raceTimer.clear();
        const clientTime = this.state.race.elapsed;
        const totalSteps = this.state.race.totalSteps + this.state.stepCount;

        // 提交結果並獲取伺服器計算的時間
        const serverResult = await this.raceSessionService.submitResult({
            totalSeconds: clientTime,
            totalSteps
        });

        // 使用伺服器返回的時間，如果沒有則使用客戶端時間
        const finalTime = serverResult?.total_seconds ?? clientTime;
        const finalSteps = serverResult?.total_steps ?? totalSteps;

        const totalTimeStr = formatTime(finalTime);
        this.uiManager.showWinModal({
            totalTime: totalTimeStr,
            totalSteps: finalSteps,
            mode: 'race'
        });
    }

    async completeDarkMaze() {
        this.state.gameWon = true;
        this.raceTimer.clear();
        const clientTime = this.state.race.elapsed;
        const totalSteps = this.state.stepCount;

        // 提交結果並獲取伺服器計算的時間
        const serverResult = await this.raceSessionService.submitResult({
            totalSeconds: clientTime,
            totalSteps
        });

        // 使用伺服器返回的時間，如果沒有則使用客戶端時間
        const finalTime = serverResult?.total_seconds ?? clientTime;
        const finalSteps = serverResult?.total_steps ?? totalSteps;

        const totalTimeStr = formatTime(finalTime);
        this.uiManager.showWinModal({
            totalTime: totalTimeStr,
            totalSteps: finalSteps,
            mode: 'dark'
        });
    }

    animate() {
        if (this.state.anim.progress < 1) {
            this.state.anim.progress = Math.min(1, this.state.anim.progress + 0.2);
            const easeProgress = 1 - Math.pow(1 - this.state.anim.progress, 3);
            this.state.anim.player.x = this.state.anim.start.x + (this.state.player.x - this.state.anim.start.x) * easeProgress;
            this.state.anim.player.y = this.state.anim.start.y + (this.state.player.y - this.state.anim.start.y) * easeProgress;
            this.renderer.render();
        }

        requestAnimationFrame(() => this.animate());
    }

    togglePause() {
        if (this.mode === 'race' || this.mode === 'dark' || this.state.gameWon || this.state.gameOver) {
            return;
        }

        this.state.paused = !this.state.paused;
        this.uiManager.togglePause(this.state.paused);
    }

    playAgain() {
        // 隱藏所有結算模態框
        const winModal = document.getElementById('winModal');
        const gameOverModal = document.getElementById('gameOverModal');
        winModal?.classList.remove('show');
        gameOverModal?.classList.remove('show');

        this.state.gameWon = false;
        this.state.gameOver = false;
        this.state.paused = false;
        this.state.race.mazesCompleted = 0;
        this.state.race.totalSteps = 0;
        this.state.race.elapsed = 0;
        this.state.race.session = null;

        this.generateMaze();
        this.renderer.render();

        if (this.mode === 'race') {
            if (this.mazeTarget) {
                this.uiManager.updateMazeCount(`0/${this.mazeTarget}`);
                this.startRaceTimer();
                this.raceSessionService.ensureSession({
                    mode: this.mode,
                    size: this.size,
                    target: this.mazeTarget
                });
            } else if (this.timeLimit) {
                this.uiManager.updateMazeCount('0');
                this.startClassicTimer();
            }
        } else if (this.mode === 'dark') {
            this.startRaceTimer();
            this.raceSessionService.ensureSession({
                mode: this.mode,
                size: this.size,
                target: 1
            });
        }
    }

    startModeSpecificLogic() {
        if (this.mode === 'race') {
            this.uiManager.showTimerSection();
            if (this.mazeTarget) {
                this.uiManager.updateMazeCount(`0/${this.mazeTarget}`);
                this.startRaceTimer();
                this.raceSessionService.ensureSession({
                    mode: this.mode,
                    size: this.size,
                    target: this.mazeTarget
                });
            } else if (this.timeLimit) {
                this.uiManager.updateMazeCount('0');
                this.startClassicTimer();
            }
        } else if (this.mode === 'dark') {
            // Dark mode: single maze with timer
            this.uiManager.showTimerSection();
            this.startRaceTimer();
            this.raceSessionService.ensureSession({
                mode: this.mode,
                size: this.size,
                target: 1
            });
        }
    }

    startRaceTimer() {
        this.raceTimer.start();
    }

    startClassicTimer() {
        const timeRemaining = this.timeLimit ?? 0;
        this.state.race.timeRemaining = timeRemaining;
        this.classicTimer.start(timeRemaining);
    }

    endGame() {
        this.state.gameOver = true;
        this.classicTimer.clear();
        this.uiManager.showGameOverModal(this.state.race.mazesCompleted);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MazeGame();
});

