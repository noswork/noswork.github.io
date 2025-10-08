import { getTranslation, setDocumentLanguage } from '../utils/translation.js';

export class SettingsManager {
    constructor({ defaultLang = 'zh', defaultTheme = 'light' } = {}) {
        this.storage = window.localStorage;
        this.currentLang = this.storage.getItem('maze-lang') || defaultLang;
        this.currentTheme = this.storage.getItem('maze-theme') || defaultTheme;
        this.cachedSystemMediaQuery = typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-color-scheme: dark)')
            : null;
        this.systemThemeListener = null;
        this.onLangChangeCallbacks = [];
        this.onThemeChangeCallbacks = [];
    }

    init() {
        this.applyLanguage(this.currentLang, { syncUI: true });
        this.applyTheme(this.currentTheme, { syncUI: false });
        this.setupEventListeners();
        this.setupSystemThemeListener();
        this.updateActiveStates();
    }

    onLanguageChange(callback) {
        this.onLangChangeCallbacks.push(callback);
    }

    onThemeChange(callback) {
        this.onThemeChangeCallbacks.push(callback);
    }

    setupSystemThemeListener() {
        if (!this.cachedSystemMediaQuery) {
            return;
        }

        const handler = () => {
            if (this.currentTheme === 'system') {
                this.applyTheme('system', { syncUI: false });
            }
        };

        if (typeof this.cachedSystemMediaQuery.addEventListener === 'function') {
            this.cachedSystemMediaQuery.addEventListener('change', handler);
        } else if (typeof this.cachedSystemMediaQuery.addListener === 'function') {
            this.cachedSystemMediaQuery.addListener(handler);
        }

        this.systemThemeListener = handler;
    }

    setupEventListeners() {
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            document.getElementById('settingsModal')?.classList.add('show');
        });

        const leaderboardBtn = document.getElementById('leaderboardBtn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                window.location.href = 'leaderboard.html';
            });
        }

        document.getElementById('closeSettings')?.addEventListener('click', () => {
            document.getElementById('settingsModal')?.classList.remove('show');
        });

        document.getElementById('settingsModal')?.addEventListener('click', (event) => {
            if (event.target.id === 'settingsModal') {
                document.getElementById('settingsModal')?.classList.remove('show');
            }
        });

        document.getElementById('langZh')?.addEventListener('click', () => this.changeLanguage('zh'));
        document.getElementById('langEn')?.addEventListener('click', () => this.changeLanguage('en'));

        document.querySelectorAll('.theme-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (theme) {
                    this.changeTheme(theme);
                }
            });
        });
    }

    changeLanguage(lang) {
        if (!lang || lang === this.currentLang) return;
        this.currentLang = lang;
        this.storage.setItem('maze-lang', lang);
        this.applyLanguage(lang);
        this.updateActiveStates();
        this.onLangChangeCallbacks.forEach((cb) => cb(lang));
    }

    applyLanguage(lang, { syncUI = true } = {}) {
        setDocumentLanguage(lang);

        if (syncUI) {
            document.querySelectorAll('[data-i18n]').forEach((element) => {
                const key = element.dataset.i18n;
                if (!key) return;
                element.textContent = getTranslation(lang, key);
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
                const key = element.dataset.i18nPlaceholder;
                if (!key) return;
                element.placeholder = getTranslation(lang, key);
            });
        }
    }

    changeTheme(theme) {
        if (!theme || theme === this.currentTheme) return;
        this.currentTheme = theme;
        this.storage.setItem('maze-theme', theme);
        this.applyTheme(theme);
        this.updateActiveStates();
        this.onThemeChangeCallbacks.forEach((cb) => cb(theme));
    }

    applyTheme(theme, { syncUI = true } = {}) {
        let resolvedTheme = theme;
        if (theme === 'system') {
            const mediaQuery = this.cachedSystemMediaQuery
                || (typeof window.matchMedia === 'function'
                    ? window.matchMedia('(prefers-color-scheme: dark)')
                    : null);
            resolvedTheme = mediaQuery?.matches ? 'dark' : 'light';
        }

        document.documentElement.className = `theme-${resolvedTheme}`;

        if (syncUI && document.body.classList.contains('leaderboard-page')) {
            document.body.className = 'leaderboard-page';
        }
    }

    updateActiveStates() {
        document.querySelectorAll('[data-lang]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });

        document.querySelectorAll('.theme-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
    }

    getTheme() {
        return this.currentTheme;
    }

    getLanguage() {
        return this.currentLang;
    }
}

