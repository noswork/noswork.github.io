# 🚀 快速開始指南

歡迎使用全新的 NOS SITE v2.0！本指南將幫助你快速了解和使用新功能。

## 📋 目錄

1. [本地預覽](#本地預覽)
2. [新功能介紹](#新功能介紹)
3. [如何部署](#如何部署)
4. [常見問題](#常見問題)

---

## 🖥️ 本地預覽

### 方法 1: Python（推薦）

```bash
cd /Users/nos/Documents/GitHub/noswork.github.io
python3 -m http.server 8000
```

然後在瀏覽器打開：http://localhost:8000

### 方法 2: Node.js

```bash
cd /Users/nos/Documents/GitHub/noswork.github.io
npx http-server -p 8000
```

### 方法 3: VS Code Live Server

1. 安裝 Live Server 擴展
2. 右鍵點擊 `index.html`
3. 選擇 "Open with Live Server"

---

## ✨ 新功能介紹

### 1. 🎨 主題切換

**位置**：導航欄右側的太陽/月亮圖標

**使用方式**：
- 點擊圖標即可在明亮/昏暗模式間切換
- 你的選擇會自動保存

**效果**：
- 明亮模式：清新、專業的淺色配色
- 昏暗模式：護眼、現代的深色配色

**技術細節**：
```javascript
// 主題會保存在 localStorage 中
localStorage.getItem('theme') // 'light' 或 'dark'
```

---

### 2. 🌍 多語言切換

**位置**：導航欄右側的地球圖標

**支援語言**：
- 🇹🇼 繁體中文（預設）
- 🇨🇳 簡體中文
- 🇺🇸 English
- 🇯🇵 日本語

**使用方式**：
1. 點擊地球圖標
2. 從下拉選單中選擇語言
3. 頁面內容立即更新

**技術細節**：
```javascript
// 語言會保存在 localStorage 中
localStorage.getItem('lang') // 'zh-TW', 'zh-CN', 'en', 或 'ja'
```

---

### 3. 🎯 自定義 SVG 圖標

**特點**：
- ✅ 所有圖標都是內嵌 SVG
- ✅ 無需載入外部字體庫
- ✅ 完美支援主題切換
- ✅ 可自由調整顏色和大小
- ✅ 向量圖形，清晰銳利

**圖標清單**：
- Logo（方形漸層）
- 語言（地球儀）
- 主題（太陽/月亮）
- 工具圖標（日曆、迷宮、星星、文件）
- 功能圖標（剪貼板、圖表、書籍等）

---

### 4. 📱 響應式設計

**自動適配**：
- 📺 **桌面**（>1024px）：完整功能，多欄布局
- 📱 **平板**（768px-1024px）：自適應布局
- 📱 **手機**（<768px）：漢堡選單，單欄布局

**測試方式**：
1. 按 `F12` 開啟開發者工具
2. 點擊 Device Toolbar（📱圖標）
3. 選擇不同裝置測試

---

### 5. 🎬 動畫效果

**滾動動畫**：
- 元素進入視窗時淡入
- 使用 Intersection Observer 實現
- 性能優化，不影響滾動流暢度

**互動動畫**：
- 卡片懸停上浮
- 按鈕點擊反饋
- 導航欄智能隱藏/顯示
- 平滑滾動到區塊

**導航欄行為**：
- 向下滾動：自動隱藏（提供更多閱讀空間）
- 向上滾動：重新顯示（方便導航）
- 滾動超過 50px：顯示背景和陰影

---

## 🚀 如何部署

### 步驟 1: 提交變更

```bash
cd /Users/nos/Documents/GitHub/noswork.github.io

# 查看變更
git status

# 添加所有變更
git add .

# 提交（可自訂訊息）
git commit -m "v2.0.0: 全新設計 - 主題切換、多語言、SVG 圖標"

# 推送到 GitHub
git push origin main
```

### 步驟 2: 等待部署

- GitHub Pages 會自動部署
- 通常需要 1-5 分鐘
- 可在 GitHub Repository → Actions 查看部署狀態

### 步驟 3: 驗證部署

1. 訪問 https://nossite.com
2. 測試主題切換
3. 測試語言切換
4. 測試響應式（調整瀏覽器視窗大小）
5. 測試所有連結

---

## ❓ 常見問題

### Q1: 主題切換後刷新頁面，主題會恢復嗎？

**A**: 不會！你的主題選擇會保存在 localStorage 中，刷新頁面後仍然保持。

### Q2: 如何添加新的語言？

**A**: 
1. 編輯 `assets/js/i18n.js`
2. 添加新的語言對象（例如：`'ko': { ... }`）
3. 更新 HTML 中的語言選單
4. 更新 `updateCurrentLangDisplay()` 函數

範例：
```javascript
// 在 i18n.js 中添加韓文
'ko': {
    site_name: 'NOS SITE',
    nav_home: '홈',
    // ... 更多翻譯
}
```

### Q3: 如何修改主題顏色？

**A**: 編輯 `assets/css/main.css` 中的 CSS 變數：

```css
:root {
    --color-primary: #6366f1;  /* 改成你想要的顏色 */
    --color-secondary: #8b5cf6;
    --color-accent: #ec4899;
}
```

### Q4: SVG 圖標顏色不正確怎麼辦？

**A**: 確保 SVG 使用 `currentColor`：

```html
<svg viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" stroke-width="2" .../>
</svg>
```

這樣圖標會繼承父元素的文字顏色，並自動支援主題切換。

### Q5: 手機版選單無法打開？

**A**: 檢查以下幾點：
1. JavaScript 是否正確載入（檢查瀏覽器控制台）
2. CSS 是否正確載入
3. 是否有 JavaScript 錯誤
4. 嘗試清除瀏覽器快取

### Q6: 動畫效果不流暢？

**A**: 可能原因：
1. 瀏覽器不支援（需要現代瀏覽器）
2. 電腦性能不足
3. 可以在 CSS 中調整動畫時長：
```css
--transition-base: 100ms; /* 減少時長 */
```

### Q7: 如何關閉某些動畫效果？

**A**: 在 `assets/css/main.css` 中找到對應的動畫並註釋：

```css
/* 關閉卡片懸停動畫 */
.tool-card:hover {
    /* transform: translateY(-8px); */
}
```

---

## 📊 性能優化建議

### 1. 圖片優化

如果未來添加圖片，建議：
- 使用 WebP 格式
- 添加 lazy loading
- 壓縮圖片大小

### 2. 生產環境優化

部署前可以：
```bash
# 壓縮 CSS（使用 cssnano 或類似工具）
npx cssnano assets/css/main.css assets/css/main.min.css

# 壓縮 JavaScript（使用 terser）
npx terser assets/js/main.js -o assets/js/main.min.js
```

然後在 HTML 中引用壓縮版本。

### 3. CDN 加速

考慮使用 Cloudflare 或其他 CDN 服務加速靜態資源。

---

## 🎯 下一步

### 推薦的改進方向

1. **添加搜尋功能**：幫助用戶快速找到工具
2. **添加工具評分**：讓用戶可以評價工具
3. **添加最近使用記錄**：記住用戶常用的工具
4. **添加鍵盤快捷鍵**：提升高級用戶體驗
5. **添加 PWA 支援**：讓網站可以安裝到桌面

### 維護建議

- **定期更新**：每月檢查並更新內容
- **用戶反饋**：收集用戶意見並改進
- **性能監控**：使用 Google Analytics 追蹤使用情況
- **瀏覽器測試**：定期測試新版瀏覽器相容性

---

## 📚 相關文檔

- [assets/README.md](assets/README.md) - Assets 詳細文檔
- [TESTING.md](TESTING.md) - 完整測試指南
- [CHANGELOG.md](CHANGELOG.md) - 版本更新記錄

---

## 💬 需要幫助？

如果遇到問題：

1. 查看 [TESTING.md](TESTING.md) 中的疑難排解
2. 檢查瀏覽器控制台的錯誤訊息
3. 確保使用最新版本的現代瀏覽器
4. 清除瀏覽器快取後重試

---

## 🎉 享受全新的 NOS SITE！

感謝使用！如果你喜歡這個設計，別忘了：
- ⭐ 在 GitHub 上給專案加星
- 🔗 分享給你的朋友
- 💬 提供反饋和建議

---

最後更新：2025-10-31
版本：2.0.0

