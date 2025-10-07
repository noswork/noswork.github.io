// 轉換引擎
import { LRUCache } from './cache.js';
import { CONFIG } from './config.js';

export class Converter {
    constructor() {
        this.cache = new LRUCache(CONFIG.cacheSize);
        this.converters = {};
        this.customDictionaries = [];
        this.initConverters();
    }

    // 初始化轉換器
    initConverters() {
        if (typeof OpenCC !== 'undefined') {
            this.converters = {
                'cn2tw': OpenCC.Converter({ from: 'cn', to: 'tw' }),
                'cn2t': OpenCC.Converter({ from: 'cn', to: 't' }),
                'cn2hk': OpenCC.Converter({ from: 'cn', to: 'hk' }),
                't2cn': OpenCC.Converter({ from: 'tw', to: 'cn' })
            };
        }
    }

    // 設定自定義詞庫
    setCustomDictionaries(dictionaries) {
        this.customDictionaries = dictionaries;
        this.cache.clear(); // 清空快取
    }

    // 轉換文本
    convert(text, mode = 'cn2tw') {
        if (!text) return '';

        // 檢查快取
        const cacheKey = `${mode}:${text.substring(0, 100)}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        let result = text;

        // 使用 OpenCC 轉換
        if (this.converters[mode]) {
            result = this.converters[mode](text);
        }

        // 應用自定義詞庫
        result = this.applyCustomDictionaries(result);

        // 儲存到快取
        this.cache.set(cacheKey, result);

        return result;
    }

    // 應用自定義詞庫
    applyCustomDictionaries(text) {
        let result = text;
        
        for (const dictionary of this.customDictionaries) {
            if (dictionary.enabled && dictionary.entries) {
                for (const entry of dictionary.entries) {
                    if (entry.from && entry.to) {
                        const regex = new RegExp(this.escapeRegExp(entry.from), 'g');
                        result = result.replace(regex, entry.to);
                    }
                }
            }
        }
        
        return result;
    }

    // 轉義正則表達式特殊字符
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 批次轉換
    async convertBatch(items, mode, onProgress) {
        const results = [];
        const total = items.length;

        for (let i = 0; i < total; i++) {
            const item = items[i];
            const converted = this.convert(item, mode);
            results.push(converted);

            if (onProgress) {
                onProgress((i + 1) / total * 100);
            }

            // 允許 UI 更新
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        return results;
    }

    // 章節分割
    splitByChapters(text, pattern = CONFIG.defaultChapterPattern) {
        try {
            const regex = new RegExp(pattern, 'gm');
            const chapters = [];
            const matches = [...text.matchAll(regex)];

            if (matches.length === 0) {
                return [text]; // 沒有匹配到章節，返回整個文本
            }

            // 第一個章節之前的內容
            if (matches[0].index > 0) {
                chapters.push(text.substring(0, matches[0].index));
            }

            // 分割各章節
            for (let i = 0; i < matches.length; i++) {
                const start = matches[i].index;
                const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
                chapters.push(text.substring(start, end));
            }

            return chapters.filter(chapter => chapter.trim().length > 0);
        } catch (error) {
            console.error('章節分割錯誤:', error);
            return [text];
        }
    }

    // 均等分割
    splitEvenly(text, count = CONFIG.defaultSplitCount) {
        const length = text.length;
        const chunkSize = Math.ceil(length / count);
        const chunks = [];

        for (let i = 0; i < length; i += chunkSize) {
            chunks.push(text.substring(i, i + chunkSize));
        }

        return chunks;
    }

    // 智能分割（優先章節，其次均等）
    smartSplit(text, options = {}) {
        const { useChapterPattern = true, chapterPattern, splitCount } = options;

        if (useChapterPattern && chapterPattern) {
            const chapters = this.splitByChapters(text, chapterPattern);
            if (chapters.length > 1) {
                return chapters;
            }
        }

        if (splitCount) {
            return this.splitEvenly(text, splitCount);
        }

        return [text];
    }
}

