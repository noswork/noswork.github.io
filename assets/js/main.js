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
                'nav_trickcal': '嘟嘟臉',
                'nav_tools': '其他工具',
                'hero_welcome': '歡迎來到',
                'hero_subtitle': '實用工具集合站',
                'hero_description': '這裡匯集了各種實用的網頁工具，從遊戲輔助到文字處理，從 AI 優化到簡繁轉換。',
                'tool_trickcal_title': '嘟嘟臉惡作劇',
                'tool_trickcal_desc': '角色記錄、掃蕩計算、食物喜好查詢',
                'tool_tga_title': '東京喰種地圖',
                'tool_tga_desc': '互動式東京喰種據點地圖，探索遊戲世界',
                'tool_maze_title': '迷宮遊戲',
                'tool_maze_desc': '多種難度的迷宮挑戰，測試你的解謎能力',
                'tool_optimizer_title': 'Prompt 優化器',
                'tool_optimizer_desc': '優化你的 AI 提示詞，獲得更好的結果',
                'tool_s2t_title': '簡繁轉換工具',
                'tool_s2t_desc': '智能簡繁體轉換，支援多種檔案格式',
                'learn_more': '了解更多 →',
                'explore_map': '探索地圖 →',
                'start_game': '開始遊戲 →',
                'optimize_now': '立即優化 →',
                'start_convert': '開始轉換 →',
                'scroll_explore': '向下滾動探索更多',
                'featured_tool': '主打工具',
                'trickcal_title': '嘟嘟臉惡作劇',
                'trickcal_subtitle': '專為《嘟嘟臉惡作劇》玩家打造的全方位輔助工具',
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
                'footer_community': '社群連結',
                'tga_subtitle': '互動式據點地圖',
                'tga_description': '探索東京喰種遊戲世界的互動式地圖，查看各個據點位置和詳細資訊。',
                'tga_feat1': '互動式地圖瀏覽',
                'tga_feat2': '據點詳細資訊',
                'tga_feat3': '多語言支援',
                'tga_feat4': '響應式設計'
            },
            'zh-CN': {
                'site_name': 'NOS SITE',
                'nav_home': '首页',
                'nav_trickcal': '嘟嘟脸',
                'nav_tools': '其他工具',
                'hero_welcome': '欢迎来到',
                'hero_subtitle': '实用工具集合站',
                'hero_description': '这里汇集了各种实用的网页工具，从游戏辅助到文字处理，从 AI 优化到简繁转换。',
                'tool_trickcal_title': '嘟嘟脸恶作剧',
                'tool_trickcal_desc': '角色记录、扫荡计算、食物喜好查询',
                'tool_tga_title': '东京喰种地图',
                'tool_tga_desc': '互动式东京喰种据点地图，探索游戏世界',
                'tool_maze_title': '迷宫游戏',
                'tool_maze_desc': '多种难度的迷宫挑战，测试你的解谜能力',
                'tool_optimizer_title': 'Prompt 优化器',
                'tool_optimizer_desc': '优化你的 AI 提示词，获得更好的结果',
                'tool_s2t_title': '简繁转换工具',
                'tool_s2t_desc': '智能简繁体转换，支持多种文件格式',
                'learn_more': '了解更多 →',
                'explore_map': '探索地图 →',
                'start_game': '开始游戏 →',
                'optimize_now': '立即优化 →',
                'start_convert': '开始转换 →',
                'scroll_explore': '向下滚动探索更多',
                'featured_tool': '主打工具',
                'trickcal_title': '嘟嘟脸恶作剧',
                'trickcal_subtitle': '专为《嘟嘟脸恶作剧》玩家打造的全方位辅助工具',
                'feature_notebook': '金蜡笔记录本',
                'feature_character_mgmt': '角色管理',
                'feature_character_track': '追踪收藏',
                'feature_palette_stats': '着色板统计',
                'feature_auto_calc': '自动计算',
                'feature_tier_bonus': '层级加成',
                'feature_realtime_display': '实时显示',
                'main_features': '主要功能',
                'feature1_title': '金蜡笔记录本',
                'feature1_desc': '记录你拥有的角色，自动统计着色板格子数量，计算层级加成效果',
                'feature2_title': '扫荡计算工具',
                'feature2_desc': '计算所需素材数量，规划每日扫荡路线，提升游戏效率',
                'feature3_title': '食物喜好查询',
                'feature3_desc': '查看每个角色喜欢和讨厌的食物，依据喜好程度分级',
                'feature4_title': '多语言支持',
                'feature4_desc': '提供繁体中文、日文、韩文界面，适合不同地区玩家使用',
                'feature5_title': '主题切换',
                'feature5_desc': '支持亮色与暗色主题，响应式设计适应各种屏幕尺寸',
                'use_now': '立即使用',
                'view_changelog': '查看更新日志',
                'more_tools': '更多工具',
                'explore_tools': '探索其他实用工具',
                'maze_subtitle': '迷宫挑战游戏',
                'maze_description': '挑战各种难度的迷宫，包含经典模式、0失误模式和竞速模式三种游戏模式。',
                'maze_feat1': '多种迷宫尺寸选择',
                'maze_feat2': '排行榜系统',
                'maze_feat3': '支持帐号系统',
                'maze_feat4': '亮暗主题切换',
                'optimizer_subtitle': 'AI 提示词优化工具',
                'optimizer_description': '使用最佳实践优化你的 AI 提示词，获得更精准的结果。',
                'optimizer_feat1': '多语言界面支持',
                'optimizer_feat2': '可调整优化参数',
                'optimizer_feat3': '历史记录功能',
                'optimizer_feat4': '结构化输出视图',
                's2t_subtitle': '智能简繁转换工具',
                's2t_description': '支持多种文件格式的简繁体转换，包含自定义词库和批次处理功能。',
                's2t_feat1': '支持 TXT, SRT, DOCX, PDF 等格式',
                's2t_feat2': '自定义词库管理',
                's2t_feat3': '历史记录追踪',
                's2t_feat4': '批次文件处理',
                'footer_tagline': '实用工具集合站',
                'footer_main_tools': '主要工具',
                'footer_about': '关于',
                'footer_about_us': '关于我们',
                'footer_community': '社群链接',
                'tga_subtitle': '互动式据点地图',
                'tga_description': '探索东京喰种游戏世界的互动式地图，查看各个据点位置和详细资讯。',
                'tga_feat1': '互动式地图浏览',
                'tga_feat2': '据点详细资讯',
                'tga_feat3': '多语言支持',
                'tga_feat4': '响应式设计'
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
                'tool_tga_title': 'Tokyo Ghoul Map',
                'tool_tga_desc': 'Interactive Tokyo Ghoul stronghold map to explore the game world',
                'tool_maze_title': 'Maze Game',
                'tool_maze_desc': 'Various difficulty maze challenges to test your puzzle-solving skills',
                'tool_optimizer_title': 'Prompt Optimizer',
                'tool_optimizer_desc': 'Optimize your AI prompts for better results',
                'tool_s2t_title': 'S2T Converter',
                'tool_s2t_desc': 'Smart Traditional/Simplified Chinese conversion supporting multiple file formats',
                'learn_more': 'Learn More →',
                'explore_map': 'Explore Map →',
                'start_game': 'Start Game →',
                'optimize_now': 'Optimize Now →',
                'start_convert': 'Start Converting →',
                'scroll_explore': 'Scroll down to explore more',
                'featured_tool': 'Featured Tool',
                'trickcal_title': 'TrickCal Calculator',
                'trickcal_subtitle': 'Comprehensive assistance tool designed for TrickCal players',
                'feature_notebook': 'Golden Crayon Notebook',
                'feature_character_mgmt': 'Character Management',
                'feature_character_track': 'Track Collection',
                'feature_palette_stats': 'Palette Statistics',
                'feature_auto_calc': 'Auto Calculate',
                'feature_tier_bonus': 'Tier Bonus',
                'feature_realtime_display': 'Real-time Display',
                'main_features': 'Main Features',
                'feature1_title': 'Golden Crayon Notebook',
                'feature1_desc': 'Record your characters, automatically count palette cells, calculate tier bonuses',
                'feature2_title': 'Sweep Calculator',
                'feature2_desc': 'Calculate required materials, plan daily sweep routes, improve game efficiency',
                'feature3_title': 'Food Preference Query',
                'feature3_desc': 'View each character\'s liked and disliked foods, graded by preference level',
                'feature4_title': 'Multi-language Support',
                'feature4_desc': 'Available in Traditional Chinese, Japanese, and Korean for players worldwide',
                'feature5_title': 'Theme Switching',
                'feature5_desc': 'Light and dark themes, responsive design for all screen sizes',
                'use_now': 'Use Now',
                'view_changelog': 'View Changelog',
                'more_tools': 'More Tools',
                'explore_tools': 'Explore Other Tools',
                'maze_subtitle': 'Maze Challenge Game',
                'maze_description': 'Challenge various difficulty mazes with three game modes: Classic, Zero Mistake, and Speed Run.',
                'maze_feat1': 'Multiple maze size options',
                'maze_feat2': 'Leaderboard system',
                'maze_feat3': 'Account system support',
                'maze_feat4': 'Light/dark theme toggle',
                'optimizer_subtitle': 'AI Prompt Optimizer',
                'optimizer_description': 'Optimize your AI prompts using best practices for more accurate results.',
                'optimizer_feat1': 'Multi-language interface',
                'optimizer_feat2': 'Adjustable optimization parameters',
                'optimizer_feat3': 'History tracking',
                'optimizer_feat4': 'Structured output view',
                's2t_subtitle': 'Smart S2T Converter',
                's2t_description': 'Convert between Traditional and Simplified Chinese with custom dictionaries and batch processing.',
                's2t_feat1': 'Support TXT, SRT, DOCX, PDF formats',
                's2t_feat2': 'Custom dictionary management',
                's2t_feat3': 'History tracking',
                's2t_feat4': 'Batch file processing',
                'footer_tagline': 'Practical Tools Collection',
                'footer_main_tools': 'Main Tools',
                'footer_about': 'About',
                'footer_about_us': 'About Us',
                'footer_community': 'Community',
                'tga_subtitle': 'Interactive Stronghold Map',
                'tga_description': 'Explore the interactive map of Tokyo Ghoul game world, view stronghold locations and details.',
                'tga_feat1': 'Interactive map browsing',
                'tga_feat2': 'Detailed stronghold info',
                'tga_feat3': 'Multi-language support',
                'tga_feat4': 'Responsive design'
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
                'tool_tga_title': '東京喰種マップ',
                'tool_tga_desc': 'インタラクティブな東京喰種拠点マップでゲーム世界を探索',
                'tool_maze_title': '迷路ゲーム',
                'tool_maze_desc': '様々な難易度の迷路チャレンジで、パズル解決能力をテスト',
                'tool_optimizer_title': 'Prompt 最適化ツール',
                'tool_optimizer_desc': 'AIプロンプトを最適化して、より良い結果を得る',
                'tool_s2t_title': '繁簡変換ツール',
                'tool_s2t_desc': '複数のファイル形式に対応したスマート繁体字・簡体字変換',
                'learn_more': '詳細を見る →',
                'explore_map': 'マップを探索 →',
                'start_game': 'ゲーム開始 →',
                'optimize_now': '今すぐ最適化 →',
                'start_convert': '変換開始 →',
                'scroll_explore': 'スクロールして詳細を見る',
                'featured_tool': '注目ツール',
                'trickcal_title': 'トリックカル計算機',
                'trickcal_subtitle': 'トリックカルプレイヤーのための総合支援ツール',
                'feature_notebook': 'ゴールデンクレヨンノート',
                'feature_character_mgmt': 'キャラクター管理',
                'feature_character_track': 'コレクション追跡',
                'feature_palette_stats': 'パレット統計',
                'feature_auto_calc': '自動計算',
                'feature_tier_bonus': 'ティアボーナス',
                'feature_realtime_display': 'リアルタイム表示',
                'main_features': '主な機能',
                'feature1_title': 'ゴールデンクレヨンノート',
                'feature1_desc': '所有キャラクターを記録し、パレットセル数を自動集計、ティアボーナスを計算',
                'feature2_title': '掃討計算ツール',
                'feature2_desc': '必要な素材数を計算し、毎日の掃討ルートを計画、ゲーム効率を向上',
                'feature3_title': '食べ物の好み検索',
                'feature3_desc': '各キャラクターの好きな食べ物と嫌いな食べ物を表示、好みレベルで分類',
                'feature4_title': '多言語サポート',
                'feature4_desc': '繁体字中国語、日本語、韓国語のインターフェースを提供',
                'feature5_title': 'テーマ切り替え',
                'feature5_desc': 'ライトテーマとダークテーマをサポート、レスポンシブデザイン',
                'use_now': '今すぐ使用',
                'view_changelog': '更新履歴を見る',
                'more_tools': 'その他のツール',
                'explore_tools': '他の便利なツールを探索',
                'maze_subtitle': '迷路チャレンジゲーム',
                'maze_description': 'クラシック、ゼロミステイク、スピードランの3つのゲームモードで様々な難易度の迷路に挑戦。',
                'maze_feat1': '複数の迷路サイズオプション',
                'maze_feat2': 'リーダーボードシステム',
                'maze_feat3': 'アカウントシステムサポート',
                'maze_feat4': 'ライト/ダークテーマ切り替え',
                'optimizer_subtitle': 'AIプロンプト最適化ツール',
                'optimizer_description': 'ベストプラクティスを使用してAIプロンプトを最適化し、より正確な結果を得る。',
                'optimizer_feat1': '多言語インターフェース',
                'optimizer_feat2': '調整可能な最適化パラメータ',
                'optimizer_feat3': '履歴追跡機能',
                'optimizer_feat4': '構造化出力ビュー',
                's2t_subtitle': 'スマート繁簡変換ツール',
                's2t_description': 'カスタム辞書とバッチ処理機能を備えた複数のファイル形式の繁体字・簡体字変換。',
                's2t_feat1': 'TXT、SRT、DOCX、PDF形式をサポート',
                's2t_feat2': 'カスタム辞書管理',
                's2t_feat3': '履歴追跡',
                's2t_feat4': 'バッチファイル処理',
                'footer_tagline': '実用ツール集',
                'footer_main_tools': '主要ツール',
                'footer_about': 'について',
                'footer_about_us': '私たちについて',
                'footer_community': 'コミュニティ',
                'tga_subtitle': 'インタラクティブ拠点マップ',
                'tga_description': '東京喰種ゲーム世界のインタラクティブマップを探索し、拠点の位置と詳細を確認。',
                'tga_feat1': 'インタラクティブマップ閲覧',
                'tga_feat2': '詳細な拠点情報',
                'tga_feat3': '多言語サポート',
                'tga_feat4': 'レスポンシブデザイン'
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

