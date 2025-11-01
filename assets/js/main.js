// ===== Theme Management =====
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.setupToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        localStorage.setItem('theme', theme);
    }

    toggle() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupToggle() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    }
}

// ===== Language Management =====
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'zh-TW';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.applyLanguage(this.currentLang);
        this.setupDropdown();
    }

    async loadTranslations() {
        // Embedded translations to avoid external file dependency
        this.translations = {
            'zh-TW': {
                'site_name': 'NOS SITE',
                'nav_home': '首頁',
                'nav_trickcal': '詭計少女',
                'nav_tools': '其他工具',
                'hero_welcome': '歡迎來到',
                'hero_subtitle': '實用工具集合站',
                'hero_description': '這裡匯集了各種實用的網頁工具，從遊戲輔助到文字處理，從 AI 優化到簡繁轉換。',
                'tool_trickcal_title': '詭計少女計算器',
                'tool_trickcal_desc': '角色記錄、掃蕩計算、食物喜好查詢',
                'tool_maze_title': '迷宮遊戲',
                'tool_maze_desc': '多種難度的迷宮挑戰，測試你的解謎能力',
                'tool_optimizer_title': 'Prompt 優化器',
                'tool_optimizer_desc': '優化你的 AI 提示詞，獲得更好的結果',
                'tool_s2t_title': '簡繁轉換工具',
                'tool_s2t_desc': '智能簡繁體轉換，支援多種檔案格式',
                'learn_more': '了解更多 →',
                'start_game': '開始遊戲 →',
                'optimize_now': '立即優化 →',
                'start_convert': '開始轉換 →',
                'scroll_explore': '向下滾動探索更多',
                'featured_tool': '主打工具',
                'trickcal_title': '詭計少女計算器',
                'trickcal_subtitle': '專為《詭計少女》玩家打造的全方位輔助工具',
                'feature_notebook': '金蠟筆記錄本',
                'feature_character_mgmt': '角色管理',
                'feature_character_track': '追蹤收藏',
                'feature_palette_stats': '著色板統計',
                'feature_auto_calc': '自動計算',
                'feature_tier_bonus': '層級加成',
                'feature_realtime_display': '即時顯示',
                'main_features': '主要功能',
                'feature1_title': '金蠟筆記錄本',
                'feature1_desc': '記錄你擁有的角色，自動統計著色板格子數量，計算層級加成效果',
                'feature2_title': '掃蕩計算工具',
                'feature2_desc': '計算所需素材數量，規劃每日掃蕩路線，提升遊戲效率',
                'feature3_title': '食物喜好查詢',
                'feature3_desc': '查看每個角色喜歡和討厭的食物，依據喜好程度分級',
                'feature4_title': '多語言支援',
                'feature4_desc': '提供繁體中文、日文、韓文介面，適合不同地區玩家使用',
                'feature5_title': '主題切換',
                'feature5_desc': '支援亮色與暗色主題，響應式設計適應各種螢幕尺寸',
                'use_now': '立即使用',
                'view_changelog': '查看更新日誌',
                'more_tools': '更多工具',
                'explore_tools': '探索其他實用工具',
                'maze_subtitle': '迷宮挑戰遊戲',
                'maze_description': '挑戰各種難度的迷宮，包含經典模式、0失誤模式和競速模式三種遊戲模式。',
                'maze_feat1': '多種迷宮尺寸選擇',
                'maze_feat2': '排行榜系統',
                'maze_feat3': '支援帳號系統',
                'maze_feat4': '亮暗主題切換',
                'optimizer_subtitle': 'AI 提示詞優化工具',
                'optimizer_description': '使用最佳實踐優化你的 AI 提示詞，獲得更精準的結果。',
                'optimizer_feat1': '多語言介面支援',
                'optimizer_feat2': '可調整優化參數',
                'optimizer_feat3': '歷史記錄功能',
                'optimizer_feat4': '結構化輸出視圖',
                's2t_subtitle': '智能簡繁轉換工具',
                's2t_description': '支援多種檔案格式的簡繁體轉換，包含自定義詞庫和批次處理功能。',
                's2t_feat1': '支援 TXT, SRT, DOCX, PDF 等格式',
                's2t_feat2': '自定義詞庫管理',
                's2t_feat3': '歷史記錄追蹤',
                's2t_feat4': '批次檔案處理',
                'footer_tagline': '實用工具集合站',
                'footer_main_tools': '主要工具',
                'footer_about': '關於',
                'footer_about_us': '關於我們',
                'footer_community': '社群連結'
            },
            'zh-CN': {
                'site_name': 'NOS SITE',
                'nav_home': '首页',
                'nav_trickcal': '诡计少女',
                'nav_tools': '其他工具',
                'hero_welcome': '欢迎来到',
                'hero_subtitle': '实用工具集合站',
                'hero_description': '这里汇集了各种实用的网页工具，从游戏辅助到文字处理，从 AI 优化到简繁转换。',
                'tool_trickcal_title': '诡计少女计算器',
                'tool_trickcal_desc': '角色记录、扫荡计算、食物喜好查询',
                'tool_maze_title': '迷宫游戏',
                'tool_maze_desc': '多种难度的迷宫挑战，测试你的解谜能力',
                'tool_optimizer_title': 'Prompt 优化器',
                'tool_optimizer_desc': '优化你的 AI 提示词，获得更好的结果',
                'tool_s2t_title': '简繁转换工具',
                'tool_s2t_desc': '智能简繁体转换，支持多种文件格式',
                'learn_more': '了解更多 →',
                'start_game': '开始游戏 →',
                'optimize_now': '立即优化 →',
                'start_convert': '开始转换 →',
                'scroll_explore': '向下滚动探索更多'
            },
            'en': {
                'site_name': 'NOS SITE',
                'nav_home': 'Home',
                'nav_trickcal': 'TrickCal',
                'nav_tools': 'Tools',
                'hero_welcome': 'Welcome to',
                'hero_subtitle': 'Practical Tools Collection',
                'hero_description': 'A collection of useful web tools, from game assistance to text processing, from AI optimization to Traditional/Simplified Chinese conversion.',
                'tool_trickcal_title': 'TrickCal Calculator',
                'tool_trickcal_desc': 'Character tracking, sweep calculation, food preference query',
                'tool_maze_title': 'Maze Game',
                'tool_maze_desc': 'Various difficulty maze challenges to test your puzzle-solving skills',
                'tool_optimizer_title': 'Prompt Optimizer',
                'tool_optimizer_desc': 'Optimize your AI prompts for better results',
                'tool_s2t_title': 'S2T Converter',
                'tool_s2t_desc': 'Smart Traditional/Simplified Chinese conversion supporting multiple file formats',
                'learn_more': 'Learn More →',
                'start_game': 'Start Game →',
                'optimize_now': 'Optimize Now →',
                'start_convert': 'Start Converting →',
                'scroll_explore': 'Scroll down to explore more'
            },
            'ja': {
                'site_name': 'NOS SITE',
                'nav_home': 'ホーム',
                'nav_trickcal': 'トリックカル',
                'nav_tools': 'ツール',
                'hero_welcome': 'ようこそ',
                'hero_subtitle': '実用ツール集',
                'hero_description': 'ゲームアシストからテキスト処理、AI最適化から繁体字・簡体字変換まで、様々な便利なWebツールを集めました。',
                'tool_trickcal_title': 'トリックカル計算機',
                'tool_trickcal_desc': 'キャラクター記録、掃討計算、食べ物の好み検索',
                'tool_maze_title': '迷路ゲーム',
                'tool_maze_desc': '様々な難易度の迷路チャレンジで、パズル解決能力をテスト',
                'tool_optimizer_title': 'Prompt 最適化ツール',
                'tool_optimizer_desc': 'AIプロンプトを最適化して、より良い結果を得る',
                'tool_s2t_title': '繁簡変換ツール',
                'tool_s2t_desc': '複数のファイル形式に対応したスマート繁体字・簡体字変換',
                'learn_more': '詳細を見る →',
                'start_game': 'ゲーム開始 →',
                'optimize_now': '今すぐ最適化 →',
                'start_convert': '変換開始 →',
                'scroll_explore': 'スクロールして詳細を見る'
            }
        };
    }

    applyLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translations[lang]?.[key];
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update current language display
        const langNames = {
            'zh-TW': '繁中',
            'zh-CN': '简中',
            'en': 'EN',
            'ja': '日本'
        };
        const currentLangSpan = document.querySelector('.current-lang');
        if (currentLangSpan) {
            currentLangSpan.textContent = langNames[lang] || '繁中';
        }

        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }

    setupDropdown() {
        const dropdown = document.getElementById('langDropdown');
        const btn = document.getElementById('langBtn');
        const items = document.querySelectorAll('.dropdown-item[data-lang]');

        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown?.classList.toggle('active');
            });
        }

        items.forEach(item => {
            item.addEventListener('click', () => {
                const lang = item.getAttribute('data-lang');
                if (lang) {
                    this.applyLanguage(lang);
                    dropdown?.classList.remove('active');
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown?.classList.remove('active');
        });
    }
}

// ===== Navigation Management =====
class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupActiveLink();
    }

    setupScrollEffect() {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    setupMobileMenu() {
        this.navToggle?.addEventListener('click', () => {
            this.navToggle.classList.toggle('active');
            this.navMenu?.classList.toggle('active');
        });

        // Close menu when clicking a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navToggle?.classList.remove('active');
                this.navMenu?.classList.remove('active');
            });
        });
    }

    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href?.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const offset = 64; // navbar height
                        const targetPosition = target.offsetTop - offset;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    setupActiveLink() {
        const sections = document.querySelectorAll('.section');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id') || '';
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
}

// ===== Tool Cards Animation =====
class ToolCardsManager {
    constructor() {
        this.cards = document.querySelectorAll('.tool-card, .tool-detail-card');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.6s ease-out';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.cards.forEach(card => {
            observer.observe(card);
        });
    }
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    new ThemeManager();
    new LanguageManager();
    new NavigationManager();
    new ToolCardsManager();

    // Add loading animation complete
    document.body.classList.add('loaded');
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Refresh any time-sensitive data when page becomes visible
        console.log('Page is now visible');
    }
});

// Export for potential external use
export { ThemeManager, LanguageManager, NavigationManager, ToolCardsManager };

