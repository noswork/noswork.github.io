// UI 控制器
import { Storage } from './storage.js';

export class UI {
    constructor() {
        this.currentView = 'converter';
        this.initTheme();
    }

    // 初始化主題
    initTheme() {
        const theme = Storage.getTheme();
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        
        // 更新主題圖標
        this.updateThemeIcon();
    }

    // 更新主題圖標
    updateThemeIcon() {
        const isDark = document.body.classList.contains('dark-mode');
        // 更新所有主題切換按鈕的圖標
        document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
    }

    // 切換主題
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        Storage.setTheme(isDark ? 'dark' : 'light');
        this.updateThemeIcon();
    }

    // 切換視圖
    switchView(viewName) {
        this.currentView = viewName;
        
        // 更新導航項目
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 更新視圖容器
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });
        
        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.classList.add('active');
        }
    }

    // 顯示/隱藏模態框
    toggleModal(modalId, show = true) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (show) {
                modal.classList.add('active');
            } else {
                modal.classList.remove('active');
            }
        }
    }

    // 顯示 Toast 通知
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // 自動移除
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, duration);
    }

    // 獲取 Toast 圖標
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // 顯示進度
    showProgress(text = '處理中...') {
        const overlay = document.getElementById('progressOverlay');
        const progressText = document.getElementById('progressText');
        
        if (overlay) {
            overlay.style.display = 'flex';
        }
        if (progressText) {
            progressText.textContent = text;
        }
        
        this.updateProgress(0);
    }

    // 更新進度
    updateProgress(percent) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${Math.round(percent)}%`;
        }
    }

    // 隱藏進度
    hideProgress() {
        const overlay = document.getElementById('progressOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // 渲染檔案列表
    renderFileList(files, onPreview, onDelete, onDownload) {
        const filesList = document.getElementById('filesList');
        const filesListContainer = document.getElementById('filesListContainer');
        const uploadArea = document.getElementById('uploadArea');
        const convertAllBtn = document.getElementById('convertAllBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');

        if (!filesList) return;

        if (files.length === 0) {
            if (filesListContainer) filesListContainer.style.display = 'none';
            if (uploadArea) uploadArea.style.display = 'flex';
            if (convertAllBtn) convertAllBtn.style.display = 'none';
            if (clearAllBtn) clearAllBtn.style.display = 'none';
            return;
        }

        if (filesListContainer) filesListContainer.style.display = 'block';
        if (uploadArea) uploadArea.style.display = 'none';
        if (convertAllBtn) convertAllBtn.style.display = 'inline-flex';
        if (clearAllBtn) clearAllBtn.style.display = 'inline-flex';

        filesList.innerHTML = files.map((file, index) => `
            <div class="file-item" data-index="${index}">
                <div class="file-info">
                    <i class="fas ${file.icon} file-icon"></i>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <div class="file-meta">
                            ${file.size} • ${file.status || '待轉換'}
                        </div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-sm btn-primary preview-btn" data-index="${index}" title="預覽">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-index="${index}" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // 綁定事件
        filesList.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                
                // 更新選中狀態
                filesList.querySelectorAll('.file-item').forEach(item => {
                    item.classList.remove('selected');
                });
                btn.closest('.file-item').classList.add('selected');
                
                onPreview(index);
            });
        });

        filesList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                onDelete(index);
            });
        });
    }

    // 顯示預覽
    showPreview(filename, content) {
        const previewTitle = document.getElementById('previewTitle');
        const previewContent = document.getElementById('previewContent');
        const downloadBtn = document.getElementById('downloadPreviewBtn');

        if (previewTitle) {
            previewTitle.textContent = `預覽：${filename}`;
        }
        if (previewContent) {
            previewContent.innerHTML = `<div style="white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(content)}</div>`;
        }
        if (downloadBtn) {
            downloadBtn.disabled = false;
        }
    }

    // 隱藏預覽
    hidePreview() {
        const previewTitle = document.getElementById('previewTitle');
        const previewContent = document.getElementById('previewContent');
        const downloadBtn = document.getElementById('downloadPreviewBtn');

        if (previewTitle) {
            previewTitle.textContent = '預覽';
        }
        if (previewContent) {
            previewContent.innerHTML = `
                <div class="preview-empty">
                    <i class="fas fa-eye-slash"></i>
                    <p>上傳檔案後將顯示預覽</p>
                </div>
            `;
        }
        if (downloadBtn) {
            downloadBtn.disabled = true;
        }
    }

    // 轉義 HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 渲染詞庫列表
    renderDictionaries(dictionaries, onEdit, onToggle, onDelete, onExport) {
        const list = document.getElementById('dictionaryList');
        if (!list) return;

        if (dictionaries.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">尚無詞庫</p>';
            return;
        }

        list.innerHTML = dictionaries.map(dict => `
            <div class="dictionary-item">
                <div class="dictionary-item-header">
                    <h4>${dict.name}</h4>
                    <div class="item-actions">
                        <button class="icon-btn btn-sm toggle-btn" data-id="${dict.id}" title="${dict.enabled ? '停用' : '啟用'}">
                            <i class="fas ${dict.enabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                        </button>
                        <button class="icon-btn btn-sm edit-btn" data-id="${dict.id}" title="編輯">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn btn-sm export-btn" data-id="${dict.id}" title="匯出">
                            <i class="fas fa-file-export"></i>
                        </button>
                        <button class="icon-btn btn-sm delete-btn" data-id="${dict.id}" title="刪除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p>${dict.description || '無描述'}</p>
                <p style="font-size: 0.75rem; color: var(--text-secondary);">
                    ${dict.entries.length} 個詞條 • ${dict.enabled ? '已啟用' : '已停用'}
                </p>
            </div>
        `).join('');

        // 綁定事件
        list.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => onEdit(btn.dataset.id));
        });

        list.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => onToggle(btn.dataset.id));
        });

        list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('確定要刪除此詞庫嗎？')) {
                    onDelete(btn.dataset.id);
                }
            });
        });

        list.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => onExport(btn.dataset.id));
        });
    }

    // 渲染詞條列表
    renderEntries(entries, onChange) {
        const list = document.getElementById('entriesList');
        if (!list) return;

        list.innerHTML = entries.map((entry, index) => `
            <div class="entry-item">
                <input type="text" value="${entry.from}" placeholder="原始詞" data-index="${index}" data-type="from">
                <span>→</span>
                <input type="text" value="${entry.to}" placeholder="轉換後" data-index="${index}" data-type="to">
                <button class="btn btn-sm btn-danger delete-entry-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // 綁定事件
        list.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                const index = parseInt(input.dataset.index);
                const type = input.dataset.type;
                onChange(index, type, input.value);
            });
        });

        list.querySelectorAll('.delete-entry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                onChange(index, 'delete');
            });
        });
    }

    // 渲染歷史記錄
    renderHistory(history, onRestore) {
        const list = document.getElementById('historyList');
        if (!list) return;

        if (history.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">尚無歷史記錄</p>';
            return;
        }

        list.innerHTML = history.map(item => {
            const date = new Date(item.timestamp);
            return `
                <div class="history-item">
                    <div class="history-item-header">
                        <h4>${item.filename}</h4>
                        <button class="icon-btn btn-sm restore-btn" data-timestamp="${item.timestamp}">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                    <p>${item.mode} • ${date.toLocaleString('zh-TW')}</p>
                </div>
            `;
        }).join('');

        // 綁定事件
        list.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const timestamp = parseInt(btn.dataset.timestamp);
                onRestore(timestamp);
            });
        });
    }
}

