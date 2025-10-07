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

        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            touchStartX = event.touches[0]?.clientX ?? 0;
            touchStartY = event.touches[0]?.clientY ?? 0;
        });

        this.canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (!this.isInteractable()) return;
            const touch = event.changedTouches[0];
            if (!touch) return;

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const minSwipeDistance = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    this.onMove(deltaX > 0 ? 1 : -1, 0);
                }
            } else if (Math.abs(deltaY) > minSwipeDistance) {
                this.onMove(0, deltaY > 0 ? 1 : -1);
            }
        });
    }

    setupDpadControls() {
        const bindButton = (id, dx, dy) => {
            const button = document.getElementById(id);
            button?.addEventListener('click', () => {
                if (!this.isInteractable()) return;
                this.onMove(dx, dy);
            });
        };

        bindButton('dpadUp', 0, -1);
        bindButton('dpadDown', 0, 1);
        bindButton('dpadLeft', -1, 0);
        bindButton('dpadRight', 1, 0);

        document.querySelectorAll('.dpad-btn').forEach((btn) => {
            btn.addEventListener('touchstart', (event) => {
                event.preventDefault();
            });
            btn.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            });
        });
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

