// 多語言翻譯
const translations = {
    'zh-TW': {
        // Site
        site_name: 'NOS SITE',
        
        // Navigation
        nav_home: '首頁',
        nav_trickcal: '詭計少女',
        nav_tools: '其他工具',
        
        // Hero Section
        hero_welcome: '歡迎來到',
        hero_subtitle: '實用工具集合站',
        hero_description: '這裡匯集了各種實用的網頁工具，從遊戲輔助到文字處理，從 AI 優化到簡繁轉換。',
        scroll_explore: '向下滾動探索更多',
        
        // Tools
        tool_trickcal_title: '詭計少女計算器',
        tool_trickcal_desc: '角色記錄、掃蕩計算、食物喜好查詢',
        tool_maze_title: '迷宮遊戲',
        tool_maze_desc: '多種難度的迷宮挑戰，測試你的解謎能力',
        tool_optimizer_title: 'Prompt 優化器',
        tool_optimizer_desc: '優化你的 AI 提示詞，獲得更好的結果',
        tool_s2t_title: '簡繁轉換工具',
        tool_s2t_desc: '智能簡繁體轉換，支援多種檔案格式',
        
        // Actions
        learn_more: '了解更多 →',
        start_game: '開始遊戲 →',
        optimize_now: '立即優化 →',
        start_convert: '開始轉換 →',
        use_now: '立即使用',
        view_changelog: '查看更新日誌',
        
        // TrickCal Section
        featured_tool: '主打工具',
        trickcal_title: '詭計少女計算器',
        trickcal_subtitle: '專為《詭計少女》玩家打造的全方位輔助工具',
        main_features: '主要功能',
        
        // Features
        feature_notebook: '金蠟筆記錄本',
        feature_character_mgmt: '角色管理',
        feature_character_track: '追蹤收藏',
        feature_palette_stats: '著色板統計',
        feature_auto_calc: '自動計算',
        feature_tier_bonus: '層級加成',
        feature_realtime_display: '即時顯示',
        
        feature1_title: '金蠟筆記錄本',
        feature1_desc: '記錄你擁有的角色，自動統計著色板格子數量，計算層級加成效果',
        feature2_title: '掃蕩計算工具',
        feature2_desc: '計算所需素材數量，規劃每日掃蕩路線，提升遊戲效率',
        feature3_title: '食物喜好查詢',
        feature3_desc: '查看每個角色喜歡和討厭的食物，依據喜好程度分級',
        feature4_title: '多語言支援',
        feature4_desc: '提供繁體中文、日文、韓文介面，適合不同地區玩家使用',
        feature5_title: '主題切換',
        feature5_desc: '支援亮色與暗色主題，響應式設計適應各種螢幕尺寸',
        
        // Other Tools Section
        more_tools: '更多工具',
        explore_tools: '探索其他實用工具',
        
        maze_subtitle: '迷宮挑戰遊戲',
        maze_description: '挑戰各種難度的迷宮，包含經典模式、0失誤模式和競速模式三種遊戲模式。',
        maze_feat1: '多種迷宮尺寸選擇',
        maze_feat2: '排行榜系統',
        maze_feat3: '支援帳號系統',
        maze_feat4: '亮暗主題切換',
        
        optimizer_subtitle: 'AI 提示詞優化工具',
        optimizer_description: '使用最佳實踐優化你的 AI 提示詞，獲得更精準的結果。',
        optimizer_feat1: '多語言介面支援',
        optimizer_feat2: '可調整優化參數',
        optimizer_feat3: '歷史記錄功能',
        optimizer_feat4: '結構化輸出視圖',
        
        s2t_subtitle: '智能簡繁轉換工具',
        s2t_description: '支援多種檔案格式的簡繁體轉換，包含自定義詞庫和批次處理功能。',
        s2t_feat1: '支援 TXT, SRT, DOCX, PDF 等格式',
        s2t_feat2: '自定義詞庫管理',
        s2t_feat3: '歷史記錄追蹤',
        s2t_feat4: '批次檔案處理',
        
        // Footer
        footer_tagline: '實用工具集合站',
        footer_main_tools: '主要工具',
        footer_about: '關於',
        footer_about_us: '關於我們',
        footer_community: '社群連結'
    },
    
    'zh-CN': {
        // Site
        site_name: 'NOS SITE',
        
        // Navigation
        nav_home: '首页',
        nav_trickcal: '诡计少女',
        nav_tools: '其他工具',
        
        // Hero Section
        hero_welcome: '欢迎来到',
        hero_subtitle: '实用工具集合站',
        hero_description: '这里汇集了各种实用的网页工具，从游戏辅助到文字处理，从 AI 优化到简繁转换。',
        scroll_explore: '向下滚动探索更多',
        
        // Tools
        tool_trickcal_title: '诡计少女计算器',
        tool_trickcal_desc: '角色记录、扫荡计算、食物喜好查询',
        tool_maze_title: '迷宫游戏',
        tool_maze_desc: '多种难度的迷宫挑战，测试你的解谜能力',
        tool_optimizer_title: 'Prompt 优化器',
        tool_optimizer_desc: '优化你的 AI 提示词，获得更好的结果',
        tool_s2t_title: '简繁转换工具',
        tool_s2t_desc: '智能简繁体转换，支持多种文件格式',
        
        // Actions
        learn_more: '了解更多 →',
        start_game: '开始游戏 →',
        optimize_now: '立即优化 →',
        start_convert: '开始转换 →',
        use_now: '立即使用',
        view_changelog: '查看更新日志',
        
        // TrickCal Section
        featured_tool: '主打工具',
        trickcal_title: '诡计少女计算器',
        trickcal_subtitle: '专为《诡计少女》玩家打造的全方位辅助工具',
        main_features: '主要功能',
        
        // Features
        feature_notebook: '金蜡笔记录本',
        feature_character_mgmt: '角色管理',
        feature_character_track: '追踪收藏',
        feature_palette_stats: '着色板统计',
        feature_auto_calc: '自动计算',
        feature_tier_bonus: '层级加成',
        feature_realtime_display: '即时显示',
        
        feature1_title: '金蜡笔记录本',
        feature1_desc: '记录你拥有的角色，自动统计着色板格子数量，计算层级加成效果',
        feature2_title: '扫荡计算工具',
        feature2_desc: '计算所需素材数量，规划每日扫荡路线，提升游戏效率',
        feature3_title: '食物喜好查询',
        feature3_desc: '查看每个角色喜欢和讨厌的食物，依据喜好程度分级',
        feature4_title: '多语言支持',
        feature4_desc: '提供繁体中文、日文、韩文界面，适合不同地区玩家使用',
        feature5_title: '主题切换',
        feature5_desc: '支持亮色与暗色主题，响应式设计适应各种屏幕尺寸',
        
        // Other Tools Section
        more_tools: '更多工具',
        explore_tools: '探索其他实用工具',
        
        maze_subtitle: '迷宫挑战游戏',
        maze_description: '挑战各种难度的迷宫，包含经典模式、0失误模式和竞速模式三种游戏模式。',
        maze_feat1: '多种迷宫尺寸选择',
        maze_feat2: '排行榜系统',
        maze_feat3: '支持账号系统',
        maze_feat4: '亮暗主题切换',
        
        optimizer_subtitle: 'AI 提示词优化工具',
        optimizer_description: '使用最佳实践优化你的 AI 提示词，获得更精准的结果。',
        optimizer_feat1: '多语言界面支持',
        optimizer_feat2: '可调整优化参数',
        optimizer_feat3: '历史记录功能',
        optimizer_feat4: '结构化输出视图',
        
        s2t_subtitle: '智能简繁转换工具',
        s2t_description: '支持多种文件格式的简繁体转换，包含自定义词库和批次处理功能。',
        s2t_feat1: '支持 TXT, SRT, DOCX, PDF 等格式',
        s2t_feat2: '自定义词库管理',
        s2t_feat3: '历史记录追踪',
        s2t_feat4: '批次文件处理',
        
        // Footer
        footer_tagline: '实用工具集合站',
        footer_main_tools: '主要工具',
        footer_about: '关于',
        footer_about_us: '关于我们',
        footer_community: '社群链接'
    },
    
    'en': {
        // Site
        site_name: 'NOS SITE',
        
        // Navigation
        nav_home: 'Home',
        nav_trickcal: 'TrickCal',
        nav_tools: 'More Tools',
        
        // Hero Section
        hero_welcome: 'Welcome to',
        hero_subtitle: 'Useful Tools Collection',
        hero_description: 'A collection of practical web tools, from game utilities to text processing, from AI optimization to text conversion.',
        scroll_explore: 'Scroll down to explore more',
        
        // Tools
        tool_trickcal_title: 'TrickCal Calculator',
        tool_trickcal_desc: 'Character tracking, raid calculation, food preference query',
        tool_maze_title: 'Maze Game',
        tool_maze_desc: 'Multiple difficulty maze challenges to test your puzzle-solving skills',
        tool_optimizer_title: 'Prompt Optimizer',
        tool_optimizer_desc: 'Optimize your AI prompts for better results',
        tool_s2t_title: 'Text Converter',
        tool_s2t_desc: 'Smart Simplified/Traditional Chinese conversion with multiple file format support',
        
        // Actions
        learn_more: 'Learn More →',
        start_game: 'Start Game →',
        optimize_now: 'Optimize Now →',
        start_convert: 'Start Converting →',
        use_now: 'Use Now',
        view_changelog: 'View Changelog',
        
        // TrickCal Section
        featured_tool: 'Featured Tool',
        trickcal_title: 'TrickCal Calculator',
        trickcal_subtitle: 'Comprehensive utility tool for Reverse:1999 players',
        main_features: 'Main Features',
        
        // Features
        feature_notebook: 'Psychube Notebook',
        feature_character_mgmt: 'Character Management',
        feature_character_track: 'Track Collection',
        feature_palette_stats: 'Palette Statistics',
        feature_auto_calc: 'Auto Calculate',
        feature_tier_bonus: 'Tier Bonus',
        feature_realtime_display: 'Realtime Display',
        
        feature1_title: 'Psychube Notebook',
        feature1_desc: 'Track your character collection, automatically calculate palette slots and tier bonuses',
        feature2_title: 'Raid Calculator',
        feature2_desc: 'Calculate material requirements, plan daily raid routes, improve game efficiency',
        feature3_title: 'Food Preference Query',
        feature3_desc: 'View each character\'s liked and disliked foods, graded by preference level',
        feature4_title: 'Multi-language Support',
        feature4_desc: 'Available in Traditional Chinese, Japanese, and Korean interfaces',
        feature5_title: 'Theme Toggle',
        feature5_desc: 'Supports light and dark themes, responsive design for all screen sizes',
        
        // Other Tools Section
        more_tools: 'More Tools',
        explore_tools: 'Explore Other Useful Tools',
        
        maze_subtitle: 'Maze Challenge Game',
        maze_description: 'Challenge mazes of various difficulties, featuring Classic, Zero Mistake, and Race modes.',
        maze_feat1: 'Multiple maze sizes',
        maze_feat2: 'Leaderboard system',
        maze_feat3: 'Account system support',
        maze_feat4: 'Light/dark theme toggle',
        
        optimizer_subtitle: 'AI Prompt Optimizer',
        optimizer_description: 'Optimize your AI prompts using best practices for more accurate results.',
        optimizer_feat1: 'Multi-language interface',
        optimizer_feat2: 'Adjustable optimization parameters',
        optimizer_feat3: 'History tracking',
        optimizer_feat4: 'Structured output view',
        
        s2t_subtitle: 'Smart Text Converter',
        s2t_description: 'Convert between Simplified and Traditional Chinese with custom dictionary and batch processing.',
        s2t_feat1: 'Supports TXT, SRT, DOCX, PDF formats',
        s2t_feat2: 'Custom dictionary management',
        s2t_feat3: 'History tracking',
        s2t_feat4: 'Batch file processing',
        
        // Footer
        footer_tagline: 'Useful Tools Collection',
        footer_main_tools: 'Main Tools',
        footer_about: 'About',
        footer_about_us: 'About Us',
        footer_community: 'Community'
    },
    
    'ja': {
        // Site
        site_name: 'NOS SITE',
        
        // Navigation
        nav_home: 'ホーム',
        nav_trickcal: 'トリックカル',
        nav_tools: 'その他ツール',
        
        // Hero Section
        hero_welcome: 'ようこそ',
        hero_subtitle: '便利なツール集',
        hero_description: 'ゲーム補助からテキスト処理、AI最適化から簡繁変換まで、様々な実用的なウェブツールを集めました。',
        scroll_explore: 'スクロールして詳細を見る',
        
        // Tools
        tool_trickcal_title: 'トリックカル計算機',
        tool_trickcal_desc: 'キャラクター記録、掃討計算、食べ物好み検索',
        tool_maze_title: '迷路ゲーム',
        tool_maze_desc: '様々な難易度の迷路チャレンジで、パズル解決能力をテスト',
        tool_optimizer_title: 'Prompt 最適化ツール',
        tool_optimizer_desc: 'AIプロンプトを最適化してより良い結果を得る',
        tool_s2t_title: 'テキスト変換ツール',
        tool_s2t_desc: 'スマートな簡繁体変換、複数のファイル形式をサポート',
        
        // Actions
        learn_more: '詳細を見る →',
        start_game: 'ゲーム開始 →',
        optimize_now: '今すぐ最適化 →',
        start_convert: '変換開始 →',
        use_now: '今すぐ使用',
        view_changelog: '更新履歴を見る',
        
        // TrickCal Section
        featured_tool: '主要ツール',
        trickcal_title: 'トリックカル計算機',
        trickcal_subtitle: '『リバース：1999』プレイヤーのための総合補助ツール',
        main_features: '主な機能',
        
        // Features
        feature_notebook: 'サイキューブノート',
        feature_character_mgmt: 'キャラクター管理',
        feature_character_track: 'コレクション追跡',
        feature_palette_stats: 'パレット統計',
        feature_auto_calc: '自動計算',
        feature_tier_bonus: 'ティアボーナス',
        feature_realtime_display: 'リアルタイム表示',
        
        feature1_title: 'サイキューブノート',
        feature1_desc: '所有キャラクターを記録し、パレットスロット数とティアボーナスを自動計算',
        feature2_title: '掃討計算ツール',
        feature2_desc: '必要素材数を計算し、毎日の掃討ルートを計画してゲーム効率を向上',
        feature3_title: '食べ物好み検索',
        feature3_desc: '各キャラクターの好きな食べ物と嫌いな食べ物を表示、好みのレベルで分類',
        feature4_title: '多言語対応',
        feature4_desc: '繁体字中国語、日本語、韓国語のインターフェースを提供',
        feature5_title: 'テーマ切替',
        feature5_desc: 'ライトテーマとダークテーマをサポート、レスポンシブデザインで全ての画面サイズに対応',
        
        // Other Tools Section
        more_tools: 'その他のツール',
        explore_tools: 'その他の便利なツールを探索',
        
        maze_subtitle: '迷路チャレンジゲーム',
        maze_description: '様々な難易度の迷路に挑戦、クラシックモード、0ミスモード、レースモードの3つのゲームモードを含む。',
        maze_feat1: '複数の迷路サイズ',
        maze_feat2: 'ランキングシステム',
        maze_feat3: 'アカウントシステム対応',
        maze_feat4: 'ライト/ダークテーマ切替',
        
        optimizer_subtitle: 'AIプロンプト最適化ツール',
        optimizer_description: 'ベストプラクティスを使用してAIプロンプトを最適化し、より正確な結果を得る。',
        optimizer_feat1: '多言語インターフェース対応',
        optimizer_feat2: '調整可能な最適化パラメータ',
        optimizer_feat3: '履歴記録機能',
        optimizer_feat4: '構造化出力ビュー',
        
        s2t_subtitle: 'スマートテキスト変換ツール',
        s2t_description: '簡体字と繁体字の変換をサポート、カスタム辞書とバッチ処理機能を含む。',
        s2t_feat1: 'TXT、SRT、DOCX、PDF形式をサポート',
        s2t_feat2: 'カスタム辞書管理',
        s2t_feat3: '履歴追跡',
        s2t_feat4: 'バッチファイル処理',
        
        // Footer
        footer_tagline: '便利なツール集',
        footer_main_tools: '主要ツール',
        footer_about: 'について',
        footer_about_us: '私たちについて',
        footer_community: 'コミュニティ'
    }
};

export { translations };

