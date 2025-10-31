# 🌟 NOS SITE

歡迎來到 **NOS SITE** - 一個集合多種實用工具的現代化網站。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](CHANGELOG.md)

## 🎯 項目簡介

NOS SITE 是一個開源的工具集合網站，提供多種實用功能，包括：

- 🎮 **迷宮遊戲** - 挑戰你的反應和策略
- 📅 **詭計少女計算器** - 專門為遊戲玩家設計的計算工具
- ✨ **Prompt 優化器** - AI 提示詞優化工具
- 🔄 **簡繁轉換工具** - 中文簡繁體轉換

## ✨ 特色功能

### 🎨 現代化設計
- **明亮/昏暗模式**：舒適的雙主題切換
- **響應式布局**：完美適配所有裝置
- **自定義 SVG 圖標**：零依賴，快速載入
- **流暢動畫**：精心設計的互動效果

### 🌍 國際化支援
- 🇹🇼 繁體中文
- 🇨🇳 簡體中文
- 🇺🇸 English
- 🇯🇵 日本語

### 🚀 性能優化
- 零外部依賴（無 jQuery、Bootstrap、Font Awesome）
- 純原生 JavaScript 和 CSS
- 輕量級設計（< 100KB）
- Lighthouse 分數 > 90

## 📁 項目結構

```
noswork.github.io/
├── index.html                 # 主頁
├── favicon.svg                # 網站圖標（SVG）
├── site.webmanifest          # PWA 配置
├── browserconfig.xml         # Windows 配置
│
├── assets/                    # 資源目錄
│   ├── css/
│   │   └── main.css          # 主樣式表（~800 行）
│   ├── js/
│   │   ├── main.js           # 主 JavaScript（~300 行）
│   │   └── i18n.js           # 多語言翻譯（~250 行）
│   └── icons/                # 圖標文件
│
├── maze/                      # 迷宮遊戲
├── Prompt-Optimizer/         # Prompt 優化器
└── s2t/                      # 簡繁轉換工具
```

## 🚀 快速開始

### 本地開發

#### 方法 1: Python（推薦）

```bash
# 克隆專案
git clone https://github.com/noswork/noswork.github.io.git
cd noswork.github.io

# 啟動本地伺服器
python3 -m http.server 8000

# 訪問
open http://localhost:8000
```

#### 方法 2: Node.js

```bash
# 使用 http-server
npx http-server -p 8000

# 或使用 live-server
npx live-server --port=8000
```

#### 方法 3: VS Code

1. 安裝 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 擴展
2. 右鍵點擊 `index.html`
3. 選擇 "Open with Live Server"

### 部署到 GitHub Pages

```bash
# 提交變更
git add .
git commit -m "Update site"
git push origin main

# GitHub Pages 會自動部署（1-5 分鐘）
```

## 🎨 自定義配置

### 修改顏色主題

編輯 `assets/css/main.css` 中的 CSS 變數：

```css
:root {
    /* 主色 */
    --color-primary: #6366f1;      /* Indigo */
    --color-secondary: #8b5cf6;    /* Purple */
    --color-accent: #ec4899;       /* Pink */
    
    /* 可以改成任何你喜歡的顏色 */
}
```

### 添加新語言

1. 編輯 `assets/js/i18n.js`
2. 添加新的語言對象：

```javascript
const translations = {
    // ... 現有語言
    'ko': {  // 韓文
        site_name: 'NOS SITE',
        nav_home: '홈',
        // ... 更多翻譯
    }
};
```

3. 更新 `index.html` 中的語言選單

### 修改 Favicon

1. 編輯 `favicon.svg` 或創建新的 SVG
2. 運行生成腳本：

```bash
npm install sharp
node generate-icons.js
```

詳細說明請查看 [FAVICON_SETUP.md](FAVICON_SETUP.md)

## 📚 文檔

- [QUICKSTART.md](QUICKSTART.md) - 快速開始指南
- [TESTING.md](TESTING.md) - 完整測試指南
- [CHANGELOG.md](CHANGELOG.md) - 版本更新記錄
- [FAVICON_SETUP.md](FAVICON_SETUP.md) - Favicon 設置指南
- [assets/README.md](assets/README.md) - Assets 詳細文檔

## 🧪 測試

### 瀏覽器兼容性測試

```bash
# 測試不同瀏覽器
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+
```

### 響應式測試

1. 按 `F12` 開啟開發者工具
2. 點擊 Device Toolbar（📱圖標）
3. 選擇不同裝置：
   - iPhone 12/13/14
   - iPad
   - Desktop

詳細測試指南請查看 [TESTING.md](TESTING.md)

## 🤝 貢獻

歡迎貢獻！請遵循以下步驟：

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 貢獻指南

- 遵循現有的代碼風格
- 添加適當的註釋
- 更新相關文檔
- 確保通過所有測試
- 無 Linter 錯誤

## 📊 技術棧

### 前端
- **HTML5** - 語義化標記
- **CSS3** - 現代化樣式（變數、Grid、Flexbox）
- **JavaScript (ES6+)** - 原生 JavaScript，無框架

### 工具
- **Git** - 版本控制
- **GitHub Pages** - 靜態網站託管
- **Sharp** - 圖片處理（可選）

### 設計
- **自定義 SVG 圖標** - 零外部依賴
- **CSS 變數** - 主題系統
- **Intersection Observer** - 滾動動畫

## 🎯 性能指標

預期的 Lighthouse 分數：

- ⚡ **Performance**: >90
- ♿ **Accessibility**: >95
- ✅ **Best Practices**: >95
- 🔍 **SEO**: >95

## 🐛 已知問題

目前沒有已知的重大問題。

如果發現 bug，請：
1. 檢查 [Issues](https://github.com/noswork/noswork.github.io/issues)
2. 如果不存在，創建新 Issue
3. 提供詳細的複現步驟

## 📝 待辦事項

- [ ] 添加搜尋功能
- [ ] 添加工具評分系統
- [ ] 添加用戶偏好記錄
- [ ] 添加更多語言支援
- [ ] PWA 離線功能
- [ ] 性能進一步優化

## 📜 版本歷史

查看 [CHANGELOG.md](CHANGELOG.md) 了解詳細的版本更新記錄。

### 最新版本 - v2.0.0 (2025-10-31)

**重大更新**：
- ✨ 全新的現代化設計
- 🎨 明亮/昏暗模式切換
- 🌍 多語言支援（4 種語言）
- 🎯 自定義 SVG 圖標系統
- 📱 完全響應式設計
- 🎬 流暢的動畫效果

## 📄 授權

本專案採用 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 👤 作者

**NOS**

- GitHub: [@noswork](https://github.com/noswork)
- Website: [nossite.com](https://nossite.com)

## 🙏 致謝

感謝所有使用和支持 NOS SITE 的用戶！

特別感謝：
- 所有開源社群的貢獻者
- 提供反饋和建議的用戶
- 測試和報告問題的朋友們

## 📞 聯繫方式

- 🐛 Bug 報告：[GitHub Issues](https://github.com/noswork/noswork.github.io/issues)
- 💬 功能建議：[GitHub Discussions](https://github.com/noswork/noswork.github.io/discussions)
- 📧 Email：（如果你想公開的話）

## 🌐 相關連結

- [主站](https://nossite.com)
- [詭計少女計算器](https://trickcal.nossite.com)
- [迷宮遊戲](https://nossite.com/maze)
- [Prompt 優化器](https://nossite.com/Prompt-Optimizer)
- [簡繁轉換](https://nossite.com/s2t)

---

<div align="center">
  
**如果這個專案對你有幫助，請給一個 ⭐️！**

Made with ❤️ by NOS

</div>
