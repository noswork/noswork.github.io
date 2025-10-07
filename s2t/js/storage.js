// 本地儲存管理
import { CONFIG } from './config.js';

export class Storage {
    // 獲取主題
    static getTheme() {
        return localStorage.getItem(CONFIG.storageKeys.theme) || 'dark';
    }

    // 設定主題
    static setTheme(theme) {
        localStorage.setItem(CONFIG.storageKeys.theme, theme);
    }

    // 獲取側邊欄狀態
    static getSidebarState() {
        return localStorage.getItem('noss2t_sidebar_collapsed') === 'true';
    }

    // 儲存側邊欄狀態
    static saveSidebarState(isCollapsed) {
        localStorage.setItem('noss2t_sidebar_collapsed', isCollapsed.toString());
    }

    // 獲取詞庫
    static getDictionaries() {
        const data = localStorage.getItem(CONFIG.storageKeys.dictionaries);
        return data ? JSON.parse(data) : [];
    }

    // 儲存詞庫
    static saveDictionaries(dictionaries) {
        localStorage.setItem(CONFIG.storageKeys.dictionaries, JSON.stringify(dictionaries));
    }

    // 獲取歷史記錄
    static getHistory() {
        const data = localStorage.getItem(CONFIG.storageKeys.history);
        return data ? JSON.parse(data) : [];
    }

    // 新增歷史記錄
    static addHistory(item) {
        const history = this.getHistory();
        history.unshift({
            ...item,
            timestamp: Date.now()
        });
        
        // 限制歷史記錄數量
        const maxHistory = this.getSettings().maxHistory || CONFIG.maxHistory;
        if (history.length > maxHistory) {
            history.splice(maxHistory);
        }
        
        localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify(history));
    }

    // 清空歷史記錄
    static clearHistory() {
        localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify([]));
    }

    // 刪除歷史記錄項目
    static deleteHistoryItem(timestamp) {
        const history = this.getHistory();
        const filtered = history.filter(item => item.timestamp !== timestamp);
        localStorage.setItem(CONFIG.storageKeys.history, JSON.stringify(filtered));
    }

    // 獲取設定
    static getSettings() {
        const data = localStorage.getItem(CONFIG.storageKeys.settings);
        return data ? JSON.parse(data) : {
            autoPreview: true,
            maxHistory: CONFIG.maxHistory
        };
    }

    // 儲存設定
    static saveSettings(settings) {
        localStorage.setItem(CONFIG.storageKeys.settings, JSON.stringify(settings));
    }
}

