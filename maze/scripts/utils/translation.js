const fallbackTranslations = window.MAZE_TRANSLATIONS || {};

export const getTranslation = (lang, key) => {
    if (typeof window.getMazeTranslation === 'function') {
        return window.getMazeTranslation(lang, key);
    }
    return fallbackTranslations?.[lang]?.[key] ?? key;
};

export const setDocumentLanguage = (lang) => {
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
};

