export class InputManager {
    constructor({ canvas, onMove, onTogglePause, isInteractable }) {
        this.canvas = canvas;
        this.onMove = onMove;
        this.onTogglePause = onTogglePause;
        this.isInteractable = isInteractable;
    }

    init() {
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupDpadControls();
        this.setupButtons();
        this.setupMobileOptimizations();
    }

    setupMobileOptimizations() {
        // 防止雙擊縮放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // 防止長按選擇文字
        document.addEventListener('selectstart', (event) => {
            if (event.target.closest('.dpad-container')) {
                event.preventDefault();
            }
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
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
        });
    }

    setupTouchControls() {
        if (!this.canvas) return;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            if (!touch) return;
            
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (event) => {
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
        }, { passive: false });

        // 防止觸摸時的默認行為
        this.canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });
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

            // 添加觸摸事件
            button.addEventListener('touchstart', (event) => {
                event.preventDefault();
                if (!this.isInteractable()) return;
                this.onMove(dx, dy);
            });

            // 防止右鍵菜單
            button.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });

            // 添加觸摸反饋
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });

            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            });

            button.addEventListener('touchcancel', () => {
                button.style.transform = 'scale(1)';
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

