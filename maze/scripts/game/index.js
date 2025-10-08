import { SettingsManager } from '../settings/settingsManager.js';
import { AuthService } from '../auth/authService.js';
import { InputManager } from './input/inputManager.js';
import { MazeRenderer } from './render/renderer.js';
import { GameState } from './state/gameState.js';
import { generateMaze } from './utils/mazeGenerator.js';
import { GameUIManager } from './ui/uiManager.js';
import { RaceTimer, ClassicTimer } from './timers/index.js';
import { RaceSessionService } from './auth/raceSessionService.js';
import { AutoSolver } from '../../dev-tools/scripts/autoSolver.js';
import { DevPanel } from '../../dev-tools/scripts/devPanel.js';

const MAZE_SIZES = {
    teensy: 10,
    mini: 15,
    medium: 25,
    mighty: 35,
    mega: 50
};

// 動畫相關常量
const ANIMATION_CONSTANTS = {
    SPEED: 0.2,           // 動畫速度
    EASE_POWER: 3         // 緩動函數的指數
};

// Canvas 尺寸相關常量
const CANVAS_CONSTANTS = {
    MAX_WIDTH: 900,
    PADDING: 20,
    MOBILE_VERTICAL_RESERVE: 330,
    DESKTOP_VERTICAL_RESERVE: 200,
    MOBILE_MAX_HEIGHT: 700,
    DESKTOP_MAX_HEIGHT: 820,
    MOBILE_BREAKPOINT: 768
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
        
        if (!this.canvas) {
            throw new Error('Canvas元素未找到');
        }
        
        this.params = new URLSearchParams(window.location.search);
        this.supabaseClient = window.supabaseClient || null;
        this.authService = window.authService || (this.supabaseClient ? new AuthService(this.supabaseClient) : null);

        this.mode = this.params.get('mode') || 'just-maze';
        this.size = this.params.get('size') || 'mini';
        this.timeLimit = this.params.get('time') ? parseInt(this.params.get('time'), 10) * 60 : null;
        this.mazeTarget = this.params.get('count') ? parseInt(this.params.get('count'), 10) : null;
        
        console.log('[Game] 游戏参数:', {
            mode: this.mode,
            size: this.size,
            timeLimit: this.timeLimit,
            mazeTarget: this.mazeTarget
        });

        this.settingsManager = window.mazeSettings || new SettingsManager();
        this.animationFrameId = null;

        this.language = this.settingsManager.getLanguage();
        this.theme = this.settingsManager.getTheme();

        const gridSize = MAZE_SIZES[this.size] || MAZE_SIZES.mini;
        
        console.log('[Game] 网格大小:', { 
            size: this.size, 
            gridSize,
            availableSizes: Object.keys(MAZE_SIZES)
        });
        
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

        // 開發者工具
        this.isDeveloper = false;
        this.autoSolver = null;
        this.devPanel = null;
        this.devToggleBtn = null;

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
        const user = this.authService?.getUser();
        
        // 檢查開發者身份
        const wasDeveloper = this.isDeveloper;
        this.isDeveloper = user?.user_metadata?.is_developer || false;
        
        // 如果開發者狀態改變，更新UI
        if (wasDeveloper !== this.isDeveloper) {
            if (this.isDeveloper) {
                this.initDeveloperTools();
            } else {
                this.destroyDeveloperTools();
            }
        }

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

    async init() {
        try {
            console.log('[Game] 开始初始化游戏组件...');
            
            this.applySettings();
            console.log('[Game] 设置已应用');
            
            this.setupCanvas();
            console.log('[Game] Canvas已设置:', {
                width: this.canvas.width,
                height: this.canvas.height,
                cellSize: this.state.cellSize,
                gridSize: this.state.gridSize
            });
            
            this.generateMaze();
            console.log('[Game] 迷宫已生成');
            
            this.inputManager.init();
            console.log('[Game] 输入管理器已初始化');
            
            this.uiManager.init();
            console.log('[Game] UI管理器已初始化');
            
            this.uiManager.translateUI();
            console.log('[Game] UI翻译已应用');
            
            this.state.path.push({ x: this.state.player.x, y: this.state.player.y });
            this.uiManager.updateStepCount(this.state.stepCount);
            
            // 确保canvas有有效的上下文再渲染
            if (this.renderer && this.renderer.ctx) {
                this.renderer.render();
                console.log('[Game] 首次渲染完成');
            } else {
                throw new Error('Canvas渲染器初始化失败');
            }
            
            await this.startModeSpecificLogic();
            console.log('[Game] 游戏模式逻辑已启动');
            
            // 動畫現在只在需要時啟動，不再持續運行
        } catch (error) {
            console.error('[Game] 初始化过程中出错:', error);
            throw error;
        }
    }

    applySettings() {
        document.documentElement.className = `theme-${this.theme}`;
        document.documentElement.lang = this.language === 'zh' ? 'zh-TW' : 'en';
    }

    setupCanvas() {
        const isMobile = window.innerWidth <= CANVAS_CONSTANTS.MOBILE_BREAKPOINT;
        const maxWidth = Math.min(window.innerWidth - CANVAS_CONSTANTS.PADDING, CANVAS_CONSTANTS.MAX_WIDTH);
        
        // 計算可用高度 (考慮 Header、方向鍵等固定元素)
        const verticalReserve = isMobile 
            ? CANVAS_CONSTANTS.MOBILE_VERTICAL_RESERVE 
            : CANVAS_CONSTANTS.DESKTOP_VERTICAL_RESERVE;
        const maxHeight = Math.min(
            window.innerHeight - verticalReserve, 
            isMobile ? CANVAS_CONSTANTS.MOBILE_MAX_HEIGHT : CANVAS_CONSTANTS.DESKTOP_MAX_HEIGHT
        );
        const maxSize = Math.min(maxWidth, maxHeight);

        const cellSize = Math.floor(maxSize / this.state.gridSize);
        const canvasSize = cellSize * this.state.gridSize;

        // 确保canvas至少有最小尺寸
        const finalCanvasSize = Math.max(canvasSize, 200);
        const finalCellSize = Math.max(cellSize, Math.floor(200 / this.state.gridSize));

        this.state.cellSize = finalCellSize;
        this.canvas.width = finalCanvasSize;
        this.canvas.height = finalCanvasSize;
        
        console.log('[Canvas] 尺寸计算:', {
            isMobile,
            maxWidth,
            maxHeight,
            maxSize,
            cellSize: finalCellSize,
            canvasSize: finalCanvasSize,
            gridSize: this.state.gridSize
        });

        // 處理手機端視窗高度變化
        if (isMobile) {
            this.handleMobileViewportChange();
        }

        // 清理舊的事件監聽器，避免記憶體洩漏
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        this.resizeHandler = () => {
            this.setupCanvas();
            this.renderer.render();
        };
        window.addEventListener('resize', this.resizeHandler);
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
        // 驗證輸入參數
        if (!Number.isInteger(dx) || !Number.isInteger(dy)) {
            console.error('[Game] Invalid move parameters:', { dx, dy });
            return;
        }
        
        const { player, gridSize, maze, path } = this.state;
        
        // 邊界檢查：確保 player 位置有效
        if (!player || player.x < 0 || player.x >= gridSize || player.y < 0 || player.y >= gridSize) {
            console.error('[Game] Invalid player position:', player);
            return;
        }
        
        const newX = player.x + dx;
        const newY = player.y + dy;

        // 檢查新位置是否在迷宮範圍內
        if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
            return;
        }

        const cell = maze[player.y]?.[player.x];
        if (!cell) {
            console.error('[Game] Cell not found at position:', { x: player.x, y: player.y });
            return;
        }

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

        // 安全檢查：確保終點存在
        if (this.state.end && newX === this.state.end.x && newY === this.state.end.y) {
            this.handleWin();
        }
    }

    animateMove(newX, newY) {
        this.state.anim.start = this.state.anim.progress < 1 ? { ...this.state.anim.player } : { ...this.state.player };
        this.state.player = { x: newX, y: newY };
        this.state.anim.progress = 0;
        
        // 如果動畫未在執行，重新啟動動畫循環
        if (!this.animationFrameId) {
            this.animate();
        }
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

        console.log('[Race] Client time:', clientTime, 'steps:', totalSteps);

        // 檢查是否應該記錄到伺服器（開發者模式下可能不記錄）
        const shouldRecord = !this.autoSolver || this.autoSolver.getShouldRecordToServer();
        let serverResult = null;
        
        if (shouldRecord) {
            // 提交結果並獲取伺服器計算的時間
            serverResult = await this.raceSessionService.submitResult({
                totalSeconds: clientTime,
                totalSteps
            });

            console.log('[Race] Server result:', serverResult);
            console.log('[Race] Server total_seconds:', serverResult?.total_seconds);
        } else {
            console.log('[Race] 開發者模式：不記錄到伺服器');
        }

        // 使用伺服器返回的時間，如果沒有則使用客戶端時間
        const finalTime = serverResult?.total_seconds ?? clientTime;
        const finalSteps = serverResult?.total_steps ?? totalSteps;

        console.log('[Race] Final time shown:', finalTime, 'formatted:', formatTime(finalTime));

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

        console.log('[Dark] Client time:', clientTime, 'steps:', totalSteps);

        // 檢查是否應該記錄到伺服器（開發者模式下可能不記錄）
        const shouldRecord = !this.autoSolver || this.autoSolver.getShouldRecordToServer();
        let serverResult = null;
        
        if (shouldRecord) {
            // 提交結果並獲取伺服器計算的時間
            serverResult = await this.raceSessionService.submitResult({
                totalSeconds: clientTime,
                totalSteps
            });

            console.log('[Dark] Server result:', serverResult);
            console.log('[Dark] Server total_seconds:', serverResult?.total_seconds);
        } else {
            console.log('[Dark] 開發者模式：不記錄到伺服器');
        }

        // 使用伺服器返回的時間，如果沒有則使用客戶端時間
        const finalTime = serverResult?.total_seconds ?? clientTime;
        const finalSteps = serverResult?.total_steps ?? totalSteps;

        console.log('[Dark] Final time shown:', finalTime, 'formatted:', formatTime(finalTime));

        const totalTimeStr = formatTime(finalTime);
        this.uiManager.showWinModal({
            totalTime: totalTimeStr,
            totalSteps: finalSteps,
            mode: 'dark'
        });
    }

    animate() {
        if (this.state.anim.progress < 1) {
            this.state.anim.progress = Math.min(1, this.state.anim.progress + ANIMATION_CONSTANTS.SPEED);
            const easeProgress = 1 - Math.pow(1 - this.state.anim.progress, ANIMATION_CONSTANTS.EASE_POWER);
            this.state.anim.player.x = this.state.anim.start.x + (this.state.player.x - this.state.anim.start.x) * easeProgress;
            this.state.anim.player.y = this.state.anim.start.y + (this.state.player.y - this.state.anim.start.y) * easeProgress;
            this.renderer.render();
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        } else {
            // 動畫完成後不再持續執行，節省性能
            this.animationFrameId = null;
        }
    }

    togglePause() {
        if (this.mode === 'race' || this.mode === 'dark' || this.state.gameWon || this.state.gameOver) {
            return;
        }

        this.state.paused = !this.state.paused;
        this.uiManager.togglePause(this.state.paused);
    }

    async playAgain() {
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
                // 先創建 session，再啟動計時器，確保時間同步
                await this.raceSessionService.ensureSession({
                    mode: this.mode,
                    size: this.size,
                    target: this.mazeTarget
                });
                this.startRaceTimer();
            } else if (this.timeLimit) {
                this.uiManager.updateMazeCount('0');
                this.startClassicTimer();
            }
        } else if (this.mode === 'dark') {
            // 先創建 session，再啟動計時器，確保時間同步
            await this.raceSessionService.ensureSession({
                mode: this.mode,
                size: this.size,
                target: 1
            });
            this.startRaceTimer();
        }
    }

    async startModeSpecificLogic() {
        if (this.mode === 'race') {
            this.uiManager.showTimerSection();
            if (this.mazeTarget) {
                this.uiManager.updateMazeCount(`0/${this.mazeTarget}`);
                // 先創建 session，再啟動計時器，確保時間同步
                await this.raceSessionService.ensureSession({
                    mode: this.mode,
                    size: this.size,
                    target: this.mazeTarget
                });
                this.startRaceTimer();
            } else if (this.timeLimit) {
                this.uiManager.updateMazeCount('0');
                this.startClassicTimer();
            }
        } else if (this.mode === 'dark') {
            // Dark mode: single maze with timer
            this.uiManager.showTimerSection();
            // 先創建 session，再啟動計時器，確保時間同步
            await this.raceSessionService.ensureSession({
                mode: this.mode,
                size: this.size,
                target: 1
            });
            this.startRaceTimer();
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

    // ============= 開發者工具方法 =============
    
    initDeveloperTools() {
        console.log('[Game] 初始化開發者工具');
        
        // 創建自動解迷宮工具
        this.autoSolver = new AutoSolver({
            onMove: (dx, dy) => this.handleMove(dx, dy),
            getState: () => this.state,
            onMazeComplete: (reason) => this.handleAutoMazeComplete(reason),
            shouldRecordToServer: true
        });

        // 創建開發者面板
        this.devPanel = new DevPanel({
            autoSolver: this.autoSolver,
            onSpeedChange: (speed) => this.autoSolver?.setSpeed(speed),
            onRecordChange: (shouldRecord) => this.autoSolver?.setRecordToServer(shouldRecord),
            onAutoCompleteChange: (autoComplete) => this.autoSolver?.setAutoCompleteMode(autoComplete),
            getLanguage: () => this.settingsManager.getLanguage()
        });

        // 創建開發者工具切換按鈕
        this.createDevToggleButton();
    }

    createDevToggleButton() {
        if (this.devToggleBtn) {
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'dev-toggle-btn';
        btn.innerHTML = '🛠️';
        btn.title = '開發者工具';
        btn.addEventListener('click', () => {
            this.devPanel?.toggle();
        });

        document.body.appendChild(btn);
        this.devToggleBtn = btn;
    }

    handleAutoMazeComplete(reason) {
        console.log('[Game] 自動迷宮完成:', reason);
        
        // 檢查是否需要繼續自動完成下一個迷宮
        const autoCompleteMode = this.autoSolver?.autoCompleteMode;
        
        if (autoCompleteMode && (this.mode === 'race' || this.mode === 'dark')) {
            // 等待一小段時間後自動開始下一個迷宮
            setTimeout(() => {
                // 檢查遊戲是否仍在進行中
                if (!this.state.gameWon && !this.state.gameOver) {
                    // 檢查是否還有迷宮要完成
                    if (this.mode === 'race' && this.mazeTarget) {
                        if (this.state.race.mazesCompleted < this.mazeTarget) {
                            console.log('[Game] 自動開始下一個迷宮');
                            this.autoSolver?.start();
                        }
                    } else if (this.mode === 'dark') {
                        // Dark模式只有一個迷宮，完成後不需要繼續
                        this.devPanel?.resetButtons();
                    } else {
                        // Race模式無限迷宮，繼續下一個
                        this.autoSolver?.start();
                    }
                } else {
                    this.devPanel?.resetButtons();
                }
            }, 500);
        } else {
            this.devPanel?.resetButtons();
        }
    }

    destroyDeveloperTools() {
        console.log('[Game] 銷毀開發者工具');
        
        if (this.autoSolver) {
            this.autoSolver.destroy();
            this.autoSolver = null;
        }

        if (this.devPanel) {
            this.devPanel.destroy();
            this.devPanel = null;
        }

        if (this.devToggleBtn) {
            this.devToggleBtn.remove();
            this.devToggleBtn = null;
        }
    }
}

// 等待所有依赖加载完成后再初始化游戏
const waitForDependencies = () => {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 最多等待5秒
        
        const checkDependencies = () => {
            attempts++;
            
            // 检查必要的全局变量是否已加载
            const translationsReady = typeof window.MAZE_TRANSLATIONS !== 'undefined';
            const getMazeTranslationReady = typeof window.getMazeTranslation === 'function';
            
            console.log('[Game Init] 依赖检查 (尝试 ' + attempts + '):', { 
                translationsReady, 
                getMazeTranslationReady,
                translationsExists: !!window.MAZE_TRANSLATIONS
            });
            
            if (translationsReady && getMazeTranslationReady) {
                console.log('[Game Init] ✅ 所有依赖已就绪');
                resolve();
            } else if (attempts >= maxAttempts) {
                console.warn('[Game Init] ⚠️ 等待超时，强制继续初始化');
                resolve();
            } else {
                // 继续等待
                setTimeout(checkDependencies, 50);
            }
        };
        
        checkDependencies();
    });
};

// 初始化游戏的主函数
const initGame = async () => {
    try {
        console.log('[Game Init] 开始初始化游戏...');
        
        // 等待依赖加载
        await waitForDependencies();
        console.log('[Game Init] 依赖加载完成');
        
        // 初始化游戏
        const game = new MazeGame();
        console.log('[Game Init] 游戏初始化完成');
        
        // 将游戏实例暴露到window以便调试
        window.mazeGame = game;
        
    } catch (error) {
        console.error('[Game Init] 初始化失败:', error);
        
        // 显示错误信息给用户
        const canvas = document.getElementById('gameCanvas');
        const gameStatus = document.getElementById('gameStatus');
        
        if (gameStatus) {
            gameStatus.textContent = '遊戲加載失敗，請刷新頁面重試 / Game failed to load, please refresh';
            gameStatus.className = 'game-status error';
            gameStatus.style.display = 'block';
        }
        
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx && canvas.width > 0 && canvas.height > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#000000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('遊戲加載失敗', canvas.width / 2, canvas.height / 2 - 10);
                ctx.fillText('請刷新頁面重試', canvas.width / 2, canvas.height / 2 + 10);
            }
        }
    }
};

// 使用DOMContentLoaded确保DOM已加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM已经加载完成，直接初始化
    initGame();
}

