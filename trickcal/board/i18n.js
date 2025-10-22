// 國際化 (i18n) 語言管理模組
class I18n {
    constructor() {
        this.currentLang = this.loadLanguage();
        this.translations = {};
        this.supportedLanguages = {
            'zh-TW': '繁體中文',
            'zh-CN': '简体中文',
            'en': 'English',
            'ja': '日本語'
        };
    }

    // 載入已保存的語言設置
    loadLanguage() {
        const saved = localStorage.getItem('trickcal_board_language');
        return saved || 'zh-TW'; // 默認繁體中文
    }

    // 保存語言設置
    saveLanguage(lang) {
        localStorage.setItem('trickcal_board_language', lang);
        this.currentLang = lang;
    }

    // 異步載入語言檔案
    async loadTranslations(lang) {
        try {
            const response = await fetch(`assets/lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            this.translations = await response.json();
            console.log(`語言檔案載入成功: ${lang}`);
            return true;
        } catch (error) {
            console.error('載入語言檔案失敗:', error);
            // 如果載入失敗，嘗試載入繁體中文
            if (lang !== 'zh-TW') {
                return this.loadTranslations('zh-TW');
            }
            return false;
        }
    }

    // 獲取翻譯文字（支援嵌套路徑，如 "nav.title"）
    t(key, replacements = {}) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`翻譯鍵值不存在: ${key}`);
                return key; // 如果找不到，返回 key 本身
            }
        }
        
        // 處理替換變數，如 {count}
        if (typeof value === 'string' && Object.keys(replacements).length > 0) {
            Object.keys(replacements).forEach(replaceKey => {
                value = value.replace(new RegExp(`\\{${replaceKey}\\}`, 'g'), replacements[replaceKey]);
            });
        }
        
        return value;
    }

    // 切換語言
    async switchLanguage(lang) {
        if (!this.supportedLanguages[lang]) {
            console.error('不支援的語言:', lang);
            return false;
        }
        
        this.saveLanguage(lang);
        await this.loadTranslations(lang);
        
        // 觸發自定義事件，通知頁面更新
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        
        return true;
    }

    // 初始化語言系統
    async init() {
        await this.loadTranslations(this.currentLang);
        this.renderLanguageSelector();
        this.setupLanguageChangeListener();
    }

    // 渲染語言選擇器
    renderLanguageSelector() {
        const containers = document.querySelectorAll('.language-selector-container');
        
        containers.forEach(container => {
            container.innerHTML = `
                <div class="language-selector">
                    <button class="btn-icon language-btn" id="languageBtn" title="${this.t('nav.language')}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke-width="2"/>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2"/>
                        </svg>
                    </button>
                    <div class="language-dropdown" id="languageDropdown">
                        ${Object.entries(this.supportedLanguages).map(([code, name]) => `
                            <button class="language-option ${code === this.currentLang ? 'active' : ''}" 
                                    data-lang="${code}">
                                ${name}
                                ${code === this.currentLang ? '<span class="check-icon">✓</span>' : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        // 設置語言選擇器事件
        this.setupLanguageSelectorEvents();
    }

    // 設置語言選擇器的事件監聽
    setupLanguageSelectorEvents() {
        const languageBtns = document.querySelectorAll('#languageBtn');
        const dropdowns = document.querySelectorAll('#languageDropdown');
        
        languageBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = btn.nextElementSibling;
                dropdown.classList.toggle('active');
                
                // 關閉其他下拉選單
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                    }
                });
            });
        });

        // 語言選項點擊
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                const lang = e.currentTarget.dataset.lang;
                await this.switchLanguage(lang);
                
                // 關閉下拉選單
                dropdowns.forEach(d => d.classList.remove('active'));
            });
        });

        // 點擊外部關閉下拉選單
        document.addEventListener('click', () => {
            dropdowns.forEach(d => d.classList.remove('active'));
        });
    }

    // 監聽語言變更事件
    setupLanguageChangeListener() {
        window.addEventListener('languageChanged', () => {
            this.updatePageTranslations();
        });
    }

    // 更新頁面上所有帶有 data-i18n 屬性的元素
    updatePageTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.value = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // 更新帶有 data-i18n-title 屬性的元素（用於 title 屬性）
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // 重新渲染語言選擇器以更新當前選中狀態
        this.renderLanguageSelector();
    }

    // 獲取當前語言代碼
    getCurrentLanguage() {
        return this.currentLang;
    }

    // 獲取當前語言名稱
    getCurrentLanguageName() {
        return this.supportedLanguages[this.currentLang] || this.currentLang;
    }
}

// 創建全局實例
const i18n = new I18n();

// 導出以供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}

