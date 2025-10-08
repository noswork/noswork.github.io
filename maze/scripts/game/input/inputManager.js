export class InputManager {
    constructor({ canvas, onMove, onTogglePause, isInteractable }) {
        this.canvas = canvas;
        this.onMove = onMove;
        this.onTogglePause = onTogglePause;
        this.isInteractable = isInteractable;
        
        // 儲存事件處理器引用，以便之後清理
        this.eventHandlers = {
            keyboard: null,
            touchStart: null,
            touchEnd: null,
            touchMove: null,
            touchEndPreventZoom: null,
            selectStart: null
        };
    }

    init() {
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupDpadControls();
        this.setupButtons();
        this.setupMobileOptimizations();
    }
    
    // 清理事件監聽器，避免記憶體洩漏
    destroy() {
        if (this.eventHandlers.keyboard) {
            document.removeEventListener('keydown', this.eventHandlers.keyboard);
        }
        if (this.canvas) {
            if (this.eventHandlers.touchStart) {
                this.canvas.removeEventListener('touchstart', this.eventHandlers.touchStart);
            }
            if (this.eventHandlers.touchEnd) {
                this.canvas.removeEventListener('touchend', this.eventHandlers.touchEnd);
            }
            if (this.eventHandlers.touchMove) {
                this.canvas.removeEventListener('touchmove', this.eventHandlers.touchMove);
            }
        }
        if (this.eventHandlers.touchEndPreventZoom) {
            document.removeEventListener('touchend', this.eventHandlers.touchEndPreventZoom);
        }
        if (this.eventHandlers.selectStart) {
            document.removeEventListener('selectstart', this.eventHandlers.selectStart);
        }
    }

    setupMobileOptimizations() {
        // 防止雙擊縮放
        let lastTouchEnd = 0;
        this.eventHandlers.touchEndPreventZoom = (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        };
        document.addEventListener('touchend', this.eventHandlers.touchEndPreventZoom, false);

        // 防止長按選擇文字
        this.eventHandlers.selectStart = (event) => {
            if (event.target && event.target.closest && event.target.closest('.dpad-container')) {
                event.preventDefault();
            }
        };
        document.addEventListener('selectstart', this.eventHandlers.selectStart);
    }

    setupKeyboardControls() {
        this.eventHandlers.keyboard = (event) => {
            if (!this.isInteractable()) return;

            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    event.preventDefault();
                    this.onMove(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    event.preventDefault();
                    this.onMove(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    event.preventDefault();
                    this.onMove(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    event.preventDefault();
                    this.onMove(1, 0);
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.onTogglePause();
                    break;
                default:
                    break;
            }
        };
        document.addEventListener('keydown', this.eventHandlers.keyboard);
    }

    setupTouchControls() {
        if (!this.canvas) return;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        this.eventHandlers.touchStart = (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            if (!touch) return;
            
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        };
        this.canvas.addEventListener('touchstart', this.eventHandlers.touchStart, { passive: false });

        this.eventHandlers.touchEnd = (event) => {
            event.preventDefault();
            if (!this.isInteractable()) return;
            
            const touch = event.changedTouches[0];
            if (!touch) return;

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;
            const minSwipeDistance = 30;
            const maxSwipeTime = 500; // 最大滑動時間

            // 檢查是否為有效的滑動手勢
            if (deltaTime > maxSwipeTime) return;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    this.onMove(deltaX > 0 ? 1 : -1, 0);
                }
            } else if (Math.abs(deltaY) > minSwipeDistance) {
                this.onMove(0, deltaY > 0 ? 1 : -1);
            }
        };
        this.canvas.addEventListener('touchend', this.eventHandlers.touchEnd, { passive: false });

        // 防止觸摸時的默認行為
        this.eventHandlers.touchMove = (event) => {
            event.preventDefault();
        };
        this.canvas.addEventListener('touchmove', this.eventHandlers.touchMove, { passive: false });
    }

    setupDpadControls() {
        const bindButton = (id, dx, dy) => {
            const button = document.getElementById(id);
            if (!button) return;

            // 添加點擊事件
            button.addEventListener('click', (event) => {
                event.preventDefault();
                if (!this.isInteractable()) return;
                this.onMove(dx, dy);
            });

            // 添加觸摸事件（合併觸摸反饋和移動邏輯）
            button.addEventListener('touchstart', (event) => {
                event.preventDefault();
                event.stopPropagation(); // 防止事件冒泡
                if (!this.isInteractable()) return;
                
                // 添加視覺反饋 - 使用 class 而不是直接修改 style
                button.classList.add('dpad-pressed');
                this.onMove(dx, dy);
            }, { passive: false });

            button.addEventListener('touchend', (event) => {
                event.preventDefault();
                event.stopPropagation();
                button.classList.remove('dpad-pressed');
            }, { passive: false });

            button.addEventListener('touchcancel', (event) => {
                event.preventDefault();
                button.classList.remove('dpad-pressed');
            }, { passive: false });

            // 防止右鍵菜單
            button.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });
        };

        bindButton('dpadUp', 0, -1);
        bindButton('dpadDown', 0, 1);
        bindButton('dpadLeft', -1, 0);
        bindButton('dpadRight', 1, 0);
    }

    setupButtons() {
        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.onTogglePause();
        });
    }
}

