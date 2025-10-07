// 主應用程序
import { CONFIG } from './config.js';
import { Converter } from './converter.js';
import { FileHandler } from './fileHandler.js';
import { DictionaryManager } from './dictionary.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.converter = new Converter();
        this.fileHandler = new FileHandler();
        this.dictionaryManager = new DictionaryManager();
        this.ui = new UI();
        
        this.files = [];
        this.currentMode = 'cn2tw';
        this.currentFileIndex = -1;
        this.currentDictionaryId = null;
        this.tempEntries = [];

        this.init();
    }

    // 初始化應用
    init() {
        this.initElements();
        this.bindEvents();
        this.loadSettings();
        this.updateConverter();
        
        // PDF.js 配置
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    // 初始化 DOM 元素
    initElements() {
        this.elements = {
            // 上傳相關
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            conversionMode: document.getElementById('conversionMode'),
            
            // 檔案列表
            filesList: document.getElementById('filesList'),
            convertAllBtn: document.getElementById('convertAllBtn'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            
            // 預覽
            previewTitle: document.getElementById('previewTitle'),
            previewContent: document.getElementById('previewContent'),
            downloadPreviewBtn: document.getElementById('downloadPreviewBtn'),
            enableSplit: document.getElementById('enableSplit'),
            splitOptions: document.getElementById('splitOptions'),
            splitCount: document.getElementById('splitCount'),
            chapterPattern: document.getElementById('chapterPattern'),
            
            // 主題切換
            themeToggle: document.getElementById('themeToggle'),
            
            // 詞庫相關
            newDictionaryBtn: document.getElementById('newDictionaryBtn'),
            dictionaryList: document.getElementById('dictionaryList'),
            
            // 模態框
            newDictionaryModal: document.getElementById('newDictionaryModal'),
            editDictionaryModal: document.getElementById('editDictionaryModal'),
            
            // 設定
            autoPreview: document.getElementById('autoPreview'),
            maxHistory: document.getElementById('maxHistory'),
            
            // 歷史記錄
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn')
        };
    }

    // 綁定事件
    bindEvents() {
        // 側邊欄摺疊
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarNav = document.getElementById('sidebarNav');
        if (sidebarToggle && sidebarNav) {
            sidebarToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebarNav.classList.toggle('collapsed');
                // 保存狀態到 localStorage
                Storage.saveSidebarState(sidebarNav.classList.contains('collapsed'));
            });
        }

        // 載入側邊欄狀態
        if (Storage.getSidebarState() && sidebarNav) {
            sidebarNav.classList.add('collapsed');
        }

        // 導航切換
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.ui.switchView(view);
                
                // 如果切換到詞庫視圖，渲染詞庫列表
                if (view === 'dictionary') {
                    this.renderDictionaries();
                }
                // 如果切換到歷史視圖，渲染歷史記錄
                else if (view === 'history') {
                    this.renderHistory();
                }
            });
        });

        // 上傳相關
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // 拖放上傳
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // 轉換模式切換
        this.elements.conversionMode.addEventListener('change', (e) => {
            this.currentMode = e.target.value;
        });

        // 檔案列表操作
        this.elements.convertAllBtn.addEventListener('click', () => {
            this.convertAll();
        });

        this.elements.clearAllBtn.addEventListener('click', () => {
            if (confirm('確定要清空所有檔案嗎？')) {
                this.clearAll();
            }
        });

        // 預覽操作
        this.elements.downloadPreviewBtn.addEventListener('click', () => {
            this.downloadCurrent();
        });

        this.elements.enableSplit.addEventListener('change', (e) => {
            this.elements.splitOptions.style.display = e.target.checked ? 'block' : 'none';
        });

        // 主題切換
        this.elements.themeToggle.addEventListener('click', () => {
            this.ui.toggleTheme();
        });

        // 詞庫操作
        this.elements.newDictionaryBtn.addEventListener('click', () => {
            this.ui.toggleModal('newDictionaryModal', true);
        });

        // 新增詞庫模態框
        document.getElementById('saveDictionaryBtn').addEventListener('click', () => {
            this.createDictionary();
        });

        document.getElementById('cancelDictionaryBtn').addEventListener('click', () => {
            this.ui.toggleModal('newDictionaryModal', false);
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.ui.toggleModal('newDictionaryModal', false);
        });

        // 編輯詞庫模態框
        document.getElementById('addEntryBtn').addEventListener('click', () => {
            this.addEntry();
        });

        document.getElementById('saveEntriesBtn').addEventListener('click', () => {
            this.saveEntries();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.ui.toggleModal('editDictionaryModal', false);
        });

        document.getElementById('closeEditModalBtn').addEventListener('click', () => {
            this.ui.toggleModal('editDictionaryModal', false);
        });

        document.getElementById('exportDictionaryBtn').addEventListener('click', () => {
            if (this.currentDictionaryId) {
                this.dictionaryManager.export(this.currentDictionaryId);
                this.ui.showToast('匯出成功', 'success');
            }
        });

        document.getElementById('importDictionaryBtn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => this.importDictionary(e.target.files[0]);
            input.click();
        });

        // 設定
        this.elements.autoPreview.addEventListener('change', () => {
            this.saveSettings();
        });

        this.elements.maxHistory.addEventListener('change', () => {
            this.saveSettings();
        });

        // 歷史記錄
        this.elements.clearHistoryBtn.addEventListener('click', () => {
            if (confirm('確定要清空所有歷史記錄嗎？')) {
                Storage.clearHistory();
                this.renderHistory();
                this.ui.showToast('已清空歷史記錄', 'success');
            }
        });

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter: 轉換全部
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.convertAll();
            }
            // Ctrl + Shift + D: 清空檔案
            else if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.clearAll();
            }
            // Ctrl + B: 開啟詞庫
            else if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.ui.switchView('dictionary');
                this.renderDictionaries();
            }
            // Esc: 關閉模態框
            else if (e.key === 'Escape') {
                this.ui.toggleModal('newDictionaryModal', false);
                this.ui.toggleModal('editDictionaryModal', false);
            }
        });
    }

    // 處理檔案上傳
    async handleFiles(fileList) {
        const files = Array.from(fileList);
        
        for (const file of files) {
            try {
                // 驗證檔案
                this.fileHandler.validateFile(file);

                // 讀取檔案內容
                this.ui.showProgress('讀取檔案中...');
                const content = await this.fileHandler.readFile(file);

                // 新增到列表
                this.files.push({
                    name: file.name,
                    size: this.fileHandler.formatFileSize(file.size),
                    icon: this.fileHandler.getFileIcon(file.name),
                    originalContent: content,
                    convertedContent: null,
                    converted: false,
                    status: '待轉換'
                });

            } catch (error) {
                this.ui.showToast(error.message, 'error');
            }
        }

        this.ui.hideProgress();
        this.renderFileList();

        // 自動預覽第一個檔案
        const settings = Storage.getSettings();
        if (settings.autoPreview && this.files.length > 0) {
            this.previewFile(this.files.length - 1);
        }

        this.ui.showToast(`已新增 ${files.length} 個檔案`, 'success');
    }

    // 預覽檔案
    async previewFile(index) {
        if (index < 0 || index >= this.files.length) return;

        const file = this.files[index];
        this.currentFileIndex = index;

        this.ui.showProgress('轉換預覽中...');

        try {
            // 轉換內容
            const converted = this.converter.convert(file.originalContent, this.currentMode);
            
            // 限制預覽長度
            const preview = converted.substring(0, 10000) + (converted.length > 10000 ? '\n\n...(內容過長，僅顯示前10000字)' : '');
            
            this.ui.showPreview(file.name, preview);
            
            // 儲存轉換結果
            file.convertedContent = converted;

        } catch (error) {
            this.ui.showToast('預覽失敗：' + error.message, 'error');
        }

        this.ui.hideProgress();
    }

    // 下載當前檔案
    downloadCurrent() {
        if (this.currentFileIndex < 0) return;

        const file = this.files[this.currentFileIndex];
        
        // 檢查是否啟用分割
        if (this.elements.enableSplit.checked) {
            this.downloadWithSplit(file);
        } else {
            const converted = file.convertedContent || this.converter.convert(file.originalContent, this.currentMode);
            const filename = this.getConvertedFilename(file.name);
            this.fileHandler.downloadText(converted, filename);
            
            // 記錄歷史
            this.addHistory(file.name, this.currentMode);
            this.ui.showToast('下載完成', 'success');
        }
    }

    // 分割下載
    async downloadWithSplit(file) {
        this.ui.showProgress('分割處理中...');

        try {
            const converted = file.convertedContent || this.converter.convert(file.originalContent, this.currentMode);
            
            const splitOptions = {
                useChapterPattern: true,
                chapterPattern: this.elements.chapterPattern.value,
                splitCount: parseInt(this.elements.splitCount.value)
            };

            const chunks = this.converter.smartSplit(converted, splitOptions);
            
            // 生成檔案
            const files = chunks.map((chunk, index) => ({
                name: this.getChunkFilename(file.name, index + 1, chunks.length),
                content: chunk
            }));

            // 打包下載
            await this.fileHandler.downloadAsZip(files, this.getConvertedFilename(file.name, '.zip'));
            
            this.ui.showToast(`已分割為 ${chunks.length} 個檔案並下載`, 'success');
            this.addHistory(file.name, this.currentMode);

        } catch (error) {
            this.ui.showToast('分割下載失敗：' + error.message, 'error');
        }

        this.ui.hideProgress();
    }

    // 轉換全部檔案
    async convertAll() {
        if (this.files.length === 0) {
            this.ui.showToast('沒有檔案可轉換', 'warning');
            return;
        }

        this.ui.showProgress('批次轉換中...');

        try {
            const convertedFiles = [];

            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                
                this.ui.updateProgress((i / this.files.length) * 100);

                const converted = this.converter.convert(file.originalContent, this.currentMode);
                file.convertedContent = converted;
                file.converted = true;
                file.status = '已轉換';

                convertedFiles.push({
                    name: this.getConvertedFilename(file.name),
                    content: converted
                });

                // 記錄歷史
                this.addHistory(file.name, this.currentMode);
            }

            this.ui.updateProgress(100);

            // 打包下載
            await this.fileHandler.downloadAsZip(convertedFiles, 'converted_files.zip');

            this.renderFileList();
            this.ui.showToast('全部轉換完成', 'success');

        } catch (error) {
            this.ui.showToast('轉換失敗：' + error.message, 'error');
        }

        this.ui.hideProgress();
    }

    // 下載單個檔案
    downloadFile(index) {
        if (index < 0 || index >= this.files.length) return;

        const file = this.files[index];
        const converted = file.convertedContent || this.converter.convert(file.originalContent, this.currentMode);
        
        const filename = this.getConvertedFilename(file.name);
        this.fileHandler.downloadText(converted, filename);
        
        file.converted = true;
        file.status = '已下載';
        this.renderFileList();
        
        this.addHistory(file.name, this.currentMode);
        this.ui.showToast('下載完成', 'success');
    }

    // 刪除檔案
    deleteFile(index) {
        if (index < 0 || index >= this.files.length) return;

        this.files.splice(index, 1);
        
        if (this.currentFileIndex === index) {
            this.currentFileIndex = -1;
            this.ui.hidePreview();
        } else if (this.currentFileIndex > index) {
            this.currentFileIndex--;
        }

        this.renderFileList();
        this.ui.showToast('已刪除檔案', 'success');
    }

    // 清空所有檔案
    clearAll() {
        this.files = [];
        this.currentFileIndex = -1;
        this.renderFileList();
        this.ui.hidePreview();
        this.ui.showToast('已清空所有檔案', 'success');
    }

    // 渲染檔案列表
    renderFileList() {
        this.ui.renderFileList(
            this.files,
            (index) => this.previewFile(index),
            (index) => this.deleteFile(index),
            (index) => this.downloadFile(index)
        );
    }

    // 創建詞庫
    createDictionary() {
        const name = document.getElementById('dictionaryName').value.trim();
        const description = document.getElementById('dictionaryDescription').value.trim();

        if (!name) {
            this.ui.showToast('請輸入詞庫名稱', 'warning');
            return;
        }

        this.dictionaryManager.create(name, description);
        this.ui.toggleModal('newDictionaryModal', false);
        this.renderDictionaries();
        this.updateConverter();
        this.ui.showToast('詞庫創建成功', 'success');

        // 清空輸入
        document.getElementById('dictionaryName').value = '';
        document.getElementById('dictionaryDescription').value = '';
    }

    // 編輯詞庫
    editDictionary(id) {
        const dict = this.dictionaryManager.get(id);
        if (!dict) return;

        this.currentDictionaryId = id;
        this.tempEntries = [...dict.entries];

        document.getElementById('editDictionaryTitle').textContent = `編輯詞庫：${dict.name}`;
        this.renderEntries();
        this.ui.toggleModal('editDictionaryModal', true);
    }

    // 新增詞條
    addEntry() {
        this.tempEntries.push({ from: '', to: '' });
        this.renderEntries();
    }

    // 渲染詞條
    renderEntries() {
        this.ui.renderEntries(this.tempEntries, (index, type, value) => {
            if (type === 'delete') {
                this.tempEntries.splice(index, 1);
                this.renderEntries();
            } else {
                this.tempEntries[index][type] = value;
            }
        });
    }

    // 儲存詞條
    saveEntries() {
        if (!this.currentDictionaryId) return;

        // 過濾空詞條
        const validEntries = this.tempEntries.filter(entry => entry.from && entry.to);

        this.dictionaryManager.update(this.currentDictionaryId, {
            entries: validEntries
        });

        this.ui.toggleModal('editDictionaryModal', false);
        this.renderDictionaries();
        this.updateConverter();
        this.ui.showToast('詞庫已儲存', 'success');
    }

    // 切換詞庫狀態
    toggleDictionary(id) {
        const enabled = this.dictionaryManager.toggle(id);
        this.renderDictionaries();
        this.updateConverter();
        this.ui.showToast(enabled ? '已啟用詞庫' : '已停用詞庫', 'success');
    }

    // 刪除詞庫
    deleteDictionary(id) {
        this.dictionaryManager.delete(id);
        this.renderDictionaries();
        this.updateConverter();
        this.ui.showToast('詞庫已刪除', 'success');
    }

    // 匯出詞庫
    exportDictionary(id) {
        this.dictionaryManager.export(id);
        this.ui.showToast('匯出成功', 'success');
    }

    // 匯入詞庫
    async importDictionary(file) {
        try {
            await this.dictionaryManager.import(file);
            this.renderDictionaries();
            this.updateConverter();
            this.ui.showToast('匯入成功', 'success');
        } catch (error) {
            this.ui.showToast(error.message, 'error');
        }
    }

    // 渲染詞庫列表
    renderDictionaries() {
        const dictionaries = this.dictionaryManager.getAll();
        this.ui.renderDictionaries(
            dictionaries,
            (id) => this.editDictionary(id),
            (id) => this.toggleDictionary(id),
            (id) => this.deleteDictionary(id),
            (id) => this.exportDictionary(id)
        );
    }

    // 更新轉換器詞庫
    updateConverter() {
        const enabledDictionaries = this.dictionaryManager.getEnabled();
        this.converter.setCustomDictionaries(enabledDictionaries);
    }

    // 渲染歷史記錄
    renderHistory() {
        const history = Storage.getHistory();
        this.ui.renderHistory(history, (timestamp) => {
            const item = history.find(h => h.timestamp === timestamp);
            if (item) {
                this.ui.showToast(`檔案：${item.filename}\n模式：${item.mode}`, 'info', 5000);
            }
        });
    }

    // 新增歷史記錄
    addHistory(filename, mode) {
        Storage.addHistory({
            filename,
            mode: CONFIG.conversionModes[mode].name
        });
    }

    // 載入設定
    loadSettings() {
        const settings = Storage.getSettings();
        this.elements.autoPreview.checked = settings.autoPreview;
        this.elements.maxHistory.value = settings.maxHistory;
    }

    // 儲存設定
    saveSettings() {
        const settings = {
            autoPreview: this.elements.autoPreview.checked,
            maxHistory: parseInt(this.elements.maxHistory.value)
        };
        Storage.saveSettings(settings);
        this.ui.showToast('設定已儲存', 'success');
    }

    // 獲取轉換後的檔案名
    getConvertedFilename(originalName, extension = null) {
        const ext = extension || ('.' + originalName.split('.').pop());
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const modeName = CONFIG.conversionModes[this.currentMode].name.replace(/\s+/g, '_');
        return `${nameWithoutExt}_${modeName}${ext}`;
    }

    // 獲取分割檔案名
    getChunkFilename(originalName, index, total) {
        const ext = '.' + originalName.split('.').pop();
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const modeName = CONFIG.conversionModes[this.currentMode].name.replace(/\s+/g, '_');
        return `${nameWithoutExt}_${modeName}_${index}of${total}${ext}`;
    }
}

// 啟動應用
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

