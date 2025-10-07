// 配置文件
export const CONFIG = {
    // 檔案設定
    maxFileSize: 50 * 1024 * 1024, // 50MB
    supportedFormats: ['.txt', '.srt', '.csv', '.doc', '.docx', '.pdf', '.md'],
    
    // 轉換模式
    conversionModes: {
        'cn2tw': { name: '簡體 → 台灣正體', converter: 'Converter.TW2SP' },
        'cn2t': { name: '簡體 → 繁體', converter: 'Converter.CN2T' },
        'cn2hk': { name: '簡體 → 香港繁體', converter: 'Converter.HK2S' },
        't2cn': { name: '繁體 → 簡體', converter: 'Converter.T2CN' }
    },
    
    // 快取設定
    cacheSize: 100,
    
    // 歷史記錄
    maxHistory: 50,
    
    // 分割設定
    defaultSplitCount: 10,
    defaultChapterPattern: '^第.*章',
    
    // Storage 鍵名
    storageKeys: {
        theme: 'noss2t_theme',
        dictionaries: 'noss2t_dictionaries',
        history: 'noss2t_history',
        settings: 'noss2t_settings'
    }
};

