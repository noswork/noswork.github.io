# NOS SITE - Assets Documentation

## 概述

本目錄包含 NOS SITE 主頁的所有靜態資源文件。

## 目錄結構

```
assets/
├── css/
│   └── main.css         # 主樣式表
├── js/
│   ├── main.js          # 主 JavaScript 文件
│   └── i18n.js          # 多語言翻譯
└── README.md            # 本文件
```

## 功能特色

### 1. 🎨 主題系統（明亮/昏暗模式）

使用 CSS 變數實現的主題系統，支援無縫切換：

- **明亮模式**：清新、專業的淺色主題
- **昏暗模式**：護眼、現代的深色主題
- **主題記憶**：使用 localStorage 保存用戶偏好
- **平滑過渡**：主題切換時的流暢動畫效果

#### 實現方式

```css
:root {
    /* 明亮模式變數 */
}

[data-theme="dark"] {
    /* 昏暗模式變數 */
}
```

### 2. 🌍 多語言系統

支援四種語言的完整國際化：

- 🇹🇼 **繁體中文（zh-TW）** - 預設語言
- 🇨🇳 **簡體中文（zh-CN）**
- 🇺🇸 **英文（en）**
- 🇯🇵 **日文（ja）**

#### 特點

- 動態語言切換，無需重新載入頁面
- 語言偏好持久化儲存
- 易於擴展的翻譯結構
- 所有 UI 元素完整翻譯

### 3. 🎯 自定義 SVG 圖標

所有圖標均使用自定義 SVG，無需外部字體庫：

#### 圖標列表

- **Logo 圖標**：方形漸層標誌
- **語言圖標**：地球儀圖標
- **主題圖標**：太陽/月亮切換
- **工具圖標**：
  - 📅 詭計少女計算器（日曆圖標）
  - 🧩 迷宮遊戲（迷宮圖標）
  - ⭐ Prompt 優化器（星星圖標）
  - 📄 簡繁轉換工具（文件圖標）
- **功能圖標**：剪貼板、圖表、書籍、地球、調色盤等

#### 優點

- ✅ 無需載入外部字體庫
- ✅ 更快的載入速度
- ✅ 完全可自定義顏色
- ✅ 支援主題切換
- ✅ 向量圖形，完美縮放

### 4. 📱 響應式設計

完整的響應式支援：

- **桌面（>1024px）**：雙欄布局，完整功能
- **平板（768px-1024px）**：自適應單欄布局
- **手機（<768px）**：優化的移動端體驗
  - 側邊導航選單
  - 觸控優化的按鈕
  - 堆疊式卡片布局

### 5. 🎬 動畫效果

#### 滾動動畫

- 使用 Intersection Observer API
- 元素進入視窗時淡入
- 平滑的視差效果

#### 互動動畫

- 導航欄滾動時自動隱藏
- 卡片懸停提升效果
- 按鈕點擊反饋
- 主題切換過渡

#### 性能優化

- 使用 CSS transform 而非 position 動畫
- 節流和防抖優化
- GPU 加速的動畫

### 6. 🎨 設計系統

#### 色彩系統

```css
/* 主色 */
--color-primary: #6366f1;        /* Indigo */
--color-secondary: #8b5cf6;      /* Purple */
--color-accent: #ec4899;         /* Pink */

/* 語義色彩 */
--color-bg: 背景色
--color-text: 文字色
--color-border: 邊框色
```

#### 間距系統

```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
```

#### 圓角系統

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
```

## 使用方式

### 添加新語言

1. 在 `i18n.js` 中添加新的語言對象：

```javascript
'es': {
    site_name: 'NOS SITE',
    nav_home: 'Inicio',
    // ... 更多翻譯
}
```

2. 在 HTML 的語言下拉選單中添加選項：

```html
<button class="dropdown-item" data-lang="es">Español</button>
```

3. 更新 `updateCurrentLangDisplay()` 函數。

### 修改主題色彩

編輯 `main.css` 中的 CSS 變數：

```css
:root {
    --color-primary: #your-color;
    /* 或 */
}
```

### 添加新的 SVG 圖標

在 HTML 中直接內嵌 SVG：

```html
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="..." stroke="currentColor" stroke-width="2"/>
</svg>
```

## 瀏覽器支援

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

## 性能優化

### 已實現

- CSS 變數減少樣式重複
- 模組化 JavaScript
- Intersection Observer 替代滾動監聽
- 使用 transform 實現動畫
- 圖片/字體延遲載入

### 建議

- 考慮添加 Service Worker 實現離線支援
- 使用 CDN 加速靜態資源
- 啟用 HTTP/2 推送

## 維護指南

### 添加新頁面

1. 複製 `index.html` 作為模板
2. 確保引入相同的 CSS 和 JS 文件
3. 保持一致的 HTML 結構

### 更新翻譯

1. 編輯 `i18n.js` 中對應的語言對象
2. 確保所有語言都有相同的鍵
3. 測試所有語言切換

### 調整樣式

1. 優先修改 CSS 變數而非具體樣式
2. 保持響應式斷點一致
3. 測試明暗兩種主題

## License

MIT License - 詳見專案根目錄的 LICENSE 文件

