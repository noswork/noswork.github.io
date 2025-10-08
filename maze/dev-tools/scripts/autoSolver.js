import { findShortestPath } from './pathfinder.js';

/**
 * 開發者自動解迷宮工具
 */
export class AutoSolver {
    constructor({ 
        onMove, 
        getState, 
        onMazeComplete,
        shouldRecordToServer = true 
    }) {
        this.onMove = onMove;
        this.getState = getState;
        this.onMazeComplete = onMazeComplete;
        this.shouldRecordToServer = shouldRecordToServer;
        
        this.isRunning = false;
        this.currentPath = null;
        this.currentMoveIndex = 0;
        this.moveSpeed = 150; // 預設移動速度（毫秒）
        this.autoCompleteMode = false; // 是否自動完成所有迷宮
        this.moveTimer = null;
    }

    /**
     * 設置移動速度
     * @param {number} speed - 移動間隔時間（毫秒）
     */
    setSpeed(speed) {
        this.moveSpeed = Math.max(50, Math.min(2000, speed)); // 限制在50ms-2000ms之間
    }

    /**
     * 設置是否記錄到伺服器
     * @param {boolean} shouldRecord - 是否記錄
     */
    setRecordToServer(shouldRecord) {
        this.shouldRecordToServer = shouldRecord;
    }

    /**
     * 設置自動完成模式
     * @param {boolean} autoComplete - 是否自動完成所有迷宮
     */
    setAutoCompleteMode(autoComplete) {
        this.autoCompleteMode = autoComplete;
    }

    /**
     * 獲取是否應該記錄到伺服器
     */
    getShouldRecordToServer() {
        return this.shouldRecordToServer;
    }

    /**
     * 開始自動解迷宮
     */
    start() {
        if (this.isRunning) {
            console.log('[AutoSolver] 已經在運行中');
            return;
        }

        const state = this.getState();
        
        // 找到最短路徑
        this.currentPath = findShortestPath({
            maze: state.maze,
            start: state.player,
            end: state.end
        });

        if (!this.currentPath || this.currentPath.length === 0) {
            console.error('[AutoSolver] 無法找到路徑');
            this.onMazeComplete?.('no_path_found');
            return;
        }

        console.log('[AutoSolver] 找到路徑，長度:', this.currentPath.length);
        
        this.isRunning = true;
        this.currentMoveIndex = 0;
        this.executeNextMove();
    }

    /**
     * 停止自動解迷宮
     */
    stop() {
        this.isRunning = false;
        if (this.moveTimer) {
            clearTimeout(this.moveTimer);
            this.moveTimer = null;
        }
        this.currentPath = null;
        this.currentMoveIndex = 0;
        console.log('[AutoSolver] 已停止');
    }

    /**
     * 執行下一步移動
     */
    executeNextMove() {
        if (!this.isRunning || !this.currentPath) {
            return;
        }

        if (this.currentMoveIndex >= this.currentPath.length) {
            // 路徑完成
            console.log('[AutoSolver] 迷宮完成');
            this.isRunning = false;
            
            // 如果是自動完成模式，通知完成
            if (this.autoCompleteMode) {
                this.onMazeComplete?.('path_complete');
            }
            
            return;
        }

        const move = this.currentPath[this.currentMoveIndex];
        this.onMove(move.dx, move.dy);
        this.currentMoveIndex++;

        // 安排下一步移動
        this.moveTimer = setTimeout(() => {
            this.executeNextMove();
        }, this.moveSpeed);
    }

    /**
     * 暫停/繼續
     */
    togglePause() {
        if (!this.currentPath) {
            return;
        }

        if (this.isRunning) {
            this.isRunning = false;
            if (this.moveTimer) {
                clearTimeout(this.moveTimer);
                this.moveTimer = null;
            }
            console.log('[AutoSolver] 已暫停');
        } else {
            this.isRunning = true;
            this.executeNextMove();
            console.log('[AutoSolver] 已繼續');
        }
    }

    /**
     * 檢查是否正在運行
     */
    isActive() {
        return this.isRunning;
    }

    /**
     * 清理資源
     */
    destroy() {
        this.stop();
    }
}

