/**
 * 開發者工具面板
 */
export class DevPanel {
    constructor({ 
        autoSolver,
        onSpeedChange,
        onRecordChange,
        onAutoCompleteChange,
        getLanguage 
    }) {
        this.autoSolver = autoSolver;
        this.onSpeedChange = onSpeedChange;
        this.onRecordChange = onRecordChange;
        this.onAutoCompleteChange = onAutoCompleteChange;
        this.getLanguage = getLanguage;
        
        this.panel = null;
        this.isVisible = false;
    }

    /**
     * 創建開發者面板DOM
     */
    create() {
        if (this.panel) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'devPanel';
        panel.className = 'dev-panel';
        panel.innerHTML = `
            <div class="dev-panel-header">
                <h3>🛠️ 開發者工具</h3>
                <button class="dev-panel-close" id="devPanelClose">✕</button>
            </div>
            <div class="dev-panel-content">
                <div class="dev-control-group">
                    <button class="dev-btn dev-btn-primary" id="devAutoSolveBtn">
                        <span class="dev-btn-text">自動解迷宮</span>
                    </button>
                    <button class="dev-btn dev-btn-secondary" id="devStopBtn" style="display: none;">
                        <span class="dev-btn-text">停止</span>
                    </button>
                </div>
                
                <div class="dev-control-group">
                    <label class="dev-label">
                        移動速度 (ms)
                        <input type="range" id="devSpeedSlider" min="50" max="1000" value="150" step="50" class="dev-slider">
                        <span id="devSpeedValue" class="dev-value">150</span>
                    </label>
                </div>
                
                <div class="dev-control-group">
                    <label class="dev-checkbox-label">
                        <input type="checkbox" id="devAutoCompleteCheck" class="dev-checkbox">
                        <span>自動完成所有迷宮</span>
                    </label>
                </div>
                
                <div class="dev-control-group">
                    <label class="dev-checkbox-label">
                        <input type="checkbox" id="devRecordCheck" class="dev-checkbox" checked>
                        <span>記錄到伺服器</span>
                    </label>
                </div>
                
                <div class="dev-status" id="devStatus"></div>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;
        this.attachEventListeners();
    }

    /**
     * 附加事件監聽器
     */
    attachEventListeners() {
        const autoSolveBtn = document.getElementById('devAutoSolveBtn');
        const stopBtn = document.getElementById('devStopBtn');
        const closeBtn = document.getElementById('devPanelClose');
        const speedSlider = document.getElementById('devSpeedSlider');
        const speedValue = document.getElementById('devSpeedValue');
        const autoCompleteCheck = document.getElementById('devAutoCompleteCheck');
        const recordCheck = document.getElementById('devRecordCheck');

        autoSolveBtn?.addEventListener('click', () => {
            this.startAutoSolve();
        });

        stopBtn?.addEventListener('click', () => {
            this.stopAutoSolve();
        });

        closeBtn?.addEventListener('click', () => {
            this.hide();
        });

        speedSlider?.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            speedValue.textContent = speed;
            this.onSpeedChange?.(speed);
        });

        autoCompleteCheck?.addEventListener('change', (e) => {
            this.onAutoCompleteChange?.(e.target.checked);
        });

        recordCheck?.addEventListener('change', (e) => {
            this.onRecordChange?.(e.target.checked);
        });
    }

    /**
     * 開始自動解迷宮
     */
    startAutoSolve() {
        const autoSolveBtn = document.getElementById('devAutoSolveBtn');
        const stopBtn = document.getElementById('devStopBtn');
        
        if (autoSolveBtn) autoSolveBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        
        this.showStatus('正在自動解迷宮...', 'info');
        this.autoSolver?.start();
    }

    /**
     * 停止自動解迷宮
     */
    stopAutoSolve() {
        const autoSolveBtn = document.getElementById('devAutoSolveBtn');
        const stopBtn = document.getElementById('devStopBtn');
        
        if (autoSolveBtn) autoSolveBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
        
        this.autoSolver?.stop();
        this.showStatus('已停止', 'warning');
    }

    /**
     * 重置按鈕狀態
     */
    resetButtons() {
        const autoSolveBtn = document.getElementById('devAutoSolveBtn');
        const stopBtn = document.getElementById('devStopBtn');
        
        if (autoSolveBtn) autoSolveBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
    }

    /**
     * 顯示狀態訊息
     */
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('devStatus');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `dev-status dev-status-${type}`;
        
        if (type !== 'error') {
            setTimeout(() => {
                statusEl.textContent = '';
                statusEl.className = 'dev-status';
            }, 3000);
        }
    }

    /**
     * 顯示面板
     */
    show() {
        if (!this.panel) {
            this.create();
        }
        this.panel.classList.add('dev-panel-visible');
        this.isVisible = true;
    }

    /**
     * 隱藏面板
     */
    hide() {
        if (this.panel) {
            this.panel.classList.remove('dev-panel-visible');
        }
        this.isVisible = false;
    }

    /**
     * 切換顯示/隱藏
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 銷毀面板
     */
    destroy() {
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
        this.isVisible = false;
    }
}

