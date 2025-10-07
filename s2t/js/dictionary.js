// 詞庫管理
import { Storage } from './storage.js';

export class DictionaryManager {
    constructor() {
        this.dictionaries = Storage.getDictionaries();
        this.currentDictionary = null;
    }

    // 獲取所有詞庫
    getAll() {
        return this.dictionaries;
    }

    // 獲取啟用的詞庫
    getEnabled() {
        return this.dictionaries.filter(dict => dict.enabled);
    }

    // 新增詞庫
    create(name, description = '') {
        const dictionary = {
            id: Date.now().toString(),
            name,
            description,
            entries: [],
            enabled: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.dictionaries.push(dictionary);
        this.save();
        return dictionary;
    }

    // 更新詞庫
    update(id, updates) {
        const index = this.dictionaries.findIndex(dict => dict.id === id);
        if (index !== -1) {
            this.dictionaries[index] = {
                ...this.dictionaries[index],
                ...updates,
                updatedAt: Date.now()
            };
            this.save();
            return this.dictionaries[index];
        }
        return null;
    }

    // 刪除詞庫
    delete(id) {
        const index = this.dictionaries.findIndex(dict => dict.id === id);
        if (index !== -1) {
            this.dictionaries.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    // 切換詞庫啟用狀態
    toggle(id) {
        const dict = this.dictionaries.find(d => d.id === id);
        if (dict) {
            dict.enabled = !dict.enabled;
            dict.updatedAt = Date.now();
            this.save();
            return dict.enabled;
        }
        return false;
    }

    // 新增詞條
    addEntry(dictionaryId, from, to) {
        const dict = this.dictionaries.find(d => d.id === dictionaryId);
        if (dict) {
            dict.entries.push({ from, to });
            dict.updatedAt = Date.now();
            this.save();
            return true;
        }
        return false;
    }

    // 刪除詞條
    deleteEntry(dictionaryId, index) {
        const dict = this.dictionaries.find(d => d.id === dictionaryId);
        if (dict && dict.entries[index]) {
            dict.entries.splice(index, 1);
            dict.updatedAt = Date.now();
            this.save();
            return true;
        }
        return false;
    }

    // 更新詞條
    updateEntry(dictionaryId, index, from, to) {
        const dict = this.dictionaries.find(d => d.id === dictionaryId);
        if (dict && dict.entries[index]) {
            dict.entries[index] = { from, to };
            dict.updatedAt = Date.now();
            this.save();
            return true;
        }
        return false;
    }

    // 匯出詞庫
    export(id) {
        const dict = this.dictionaries.find(d => d.id === id);
        if (dict) {
            const data = JSON.stringify(dict, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${dict.name}_dictionary.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        }
        return false;
    }

    // 匯入詞庫
    async import(file) {
        try {
            const text = await file.text();
            const dict = JSON.parse(text);
            
            // 驗證格式
            if (!dict.name || !Array.isArray(dict.entries)) {
                throw new Error('無效的詞庫格式');
            }

            // 生成新 ID
            dict.id = Date.now().toString();
            dict.createdAt = Date.now();
            dict.updatedAt = Date.now();

            this.dictionaries.push(dict);
            this.save();
            return dict;
        } catch (error) {
            throw new Error('匯入失敗：' + error.message);
        }
    }

    // 儲存到本地
    save() {
        Storage.saveDictionaries(this.dictionaries);
    }

    // 獲取詞庫
    get(id) {
        return this.dictionaries.find(dict => dict.id === id);
    }
}

