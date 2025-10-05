# 🗺️ 據點地圖系統 - 項目總結

> 一個功能完整的互動式六邊形地圖系統，具備建築物管理、區塊標記、地圖導出等功能

![版本](https://img.shields.io/badge/版本-4.0-blue)
![授權](https://img.shields.io/badge/授權-Private-red)
![語言](https://img.shields.io/badge/語言-JavaScript-yellow)

---

## 📋 目錄

- [項目簡介](#項目簡介)
- [核心功能](#核心功能)
- [快速開始](#快速開始)
- [技術架構](#技術架構)
- [文件結構](#文件結構)
- [功能模塊](#功能模塊)
- [開發指南](#開發指南)
- [配置說明](#配置說明)
- [文檔索引](#文檔索引)
- [更新日誌](#更新日誌)
- [聯繫方式](#聯繫方式)

---

## 🎯 項目簡介

**據點地圖系統** 是一個基於 Web 的互動式六邊形地圖應用，專為策略遊戲或區域管理而設計。系統提供直觀的界面和豐富的功能，讓用戶可以輕鬆管理地圖上的建築物、標記區塊、導出地圖等。

### ✨ 主要亮點

- 🎨 **視覺精美**：現代化 UI 設計，支持暗黑/明亮雙主題
- 🌐 **多語言**：完整支持繁體中文和英文
- 📱 **響應式**：完美適配桌面和移動設備
- ⚡ **高性能**：優化渲染，支持大量建築物
- 💾 **數據持久化**：自動保存用戶的視角和標記
- 🎬 **動態載入**：383 個 Tokyo Ghoul GIF 動畫

---

## 🚀 核心功能

### 1. 互動式六邊形地圖

- **平移**：拖曳地圖到任意位置
- **縮放**：滾輪或手勢縮放（0.5x - 3x）
- **視角記憶**：自動保存和恢復瀏覽位置
- **平滑動畫**：所有操作都有流暢的過渡效果

### 2. 建築物管理系統

支持 **6 種建築類型**，共 **44 個建築物**：

| 建築類型            | 圖標 | 數量 | 說明                  |
| ------------------- | ---- | ---- | --------------------- |
| 主城 (Main City)    | 🏰   | 1    | 地圖中心，7格特殊區域 |
| 大樓 (Building)     | 🏢   | 5    | 大型建築              |
| 房子 (House)        | 🏠   | 15   | 住宅建築              |
| 醫院 (Hospital)     | 🏥   | 11   | 醫療設施              |
| 壁壘 (Fortress)     | 🛡️ | 3    | 防禦設施              |
| 組織 (Organization) | 🏛️ | 16   | 組織據點              |

### 3. 區塊標記功能

- **6 種預設顏色**：紅、橙、黃、綠、藍、紫
- **自訂顏色**：色彩選擇器支持任意顏色
- **兩種模式**：標記模式 / 清除模式
- **批量操作**：一鍵清除所有標記
- **持久化**：標記自動保存到瀏覽器

### 4. 地圖導出功能

- **高質量導出**：支持低/中/高三種品質
- **背景圖片**：自動添加背景紋理
- **PNG 格式**：兼容性最佳的圖片格式
- **進度顯示**：實時顯示導出進度
- **隨機動畫**：從 383 個 GIF 中隨機選擇 loading 動畫

### 5. 頁面載入動畫

- **全屏動畫**：頁面打開時的歡迎動畫
- **隨機 GIF**：每次載入顯示不同的 Tokyo Ghoul 動畫
- **平滑過渡**：淡入淡出效果
- **最小時長**：確保至少顯示 1 秒，避免閃爍

### 6. 特殊區域系統

- **區域分組**：將多個六邊形組合成一個整體
- **聯動高亮**：懸停時整個區域同時亮起
- **中心標籤**：只在中心顯示一個座標
- **API 查詢**：檢查格子是否屬於特殊區域

### 7. 多語言系統

- **雙語支持**：繁體中文 / English
- **動態切換**：無需刷新頁面
- **持久化**：記住用戶的語言偏好
- **28 個翻譯鍵值**：完整覆蓋所有界面文字

### 8. 主題系統

- **暗黑主題**：默認主題，適合長時間使用
- **明亮主題**：明亮清新的配色方案
- **一鍵切換**：實時預覽效果
- **CSS 變量**：易於自定義和擴展

---

## ⚡ 快速開始

### 方法 1：直接打開（最簡單）

```bash
# 啟動本地服務器
cd ../noswork.github.io/tga/stronghold/map/3rd
python3 -m http.server 8000

# 在瀏覽器打開
open http://localhost:8000/index.html
```

### 方法 2：使用 Node.js

```bash
# 安裝 http-server（首次使用）
npm install -g http-server

# 啟動服務器
cd ../noswork.github.io/tga/stronghold/map/3rd
http-server -p 8000

# 在瀏覽器打開
open http://localhost:8000/index.html
```

### 方法 3：查看預覽頁面

```bash
# 啟動服務器
python3 -m http.server 8000

# 打開 loading 動畫預覽
open http://localhost:8000/loading-preview.html
```

---

## 🏗️ 技術架構

### 前端技術棧

- **HTML5**：語義化標記，無障礙支持
- **CSS3**：CSS 變量、Grid、Flexbox、動畫
- **JavaScript (ES6+)**：模塊化、異步處理
- **SVG**：矢量圖形渲染
- **Canvas API**：地圖導出功能

### 核心庫

- **D3.js** (思路參考)：六邊形布局算法
- **原生 JavaScript**：無依賴，輕量高效

### 瀏覽器要求

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### 開發工具

- Python 3 (本地服務器)
- 任意文本編輯器
- 瀏覽器開發者工具

---

## 📁 文件結構

```
3rd/
├── 📄 index.html                     # 主頁面入口 (249 行)
├── 📄 loading-preview.html           # Loading 預覽頁面 (495 行)
│
├── 📁 assets/                        # 資源文件目錄
│   ├── 📁 favicon/                   # 網站圖標
│   │   ├── favicon.ico
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   └── apple-touch-icon.png
│   ├── 📁 loading-gifs/              # 383 個 Tokyo Ghoul GIF (50 MB)
│   │   ├── 0P6ZV9L.gif
│   │   ├── 0QaCOxt.gif
│   │   └── ...
│   ├── background.png                # 地圖背景圖片
│   ├── block.png                     # 損壞區塊圖標
│   ├── city.png                      # 主城圖片
│   ├── building.png                  # 大樓圖片
│   ├── house.png                     # 房子圖片
│   ├── hospital.png                  # 醫院圖片
│   ├── fortress.png                  # 壁壘圖片
│   └── org.png                       # 組織圖片
│
├── 📁 data/                          # 數據文件目錄
│   ├── gif-index.json                # GIF 文件名索引 (6.4 KB, 383 個)
│   └── tokyo-ghoul-gifs.json         # 原始 Imgur URL (27 KB)
│
├── 📁 scripts/                       # JavaScript 文件
│   ├── config.js                     # 配置文件 (227 行)
│   ├── map.js                        # 主邏輯文件 (2311 行)
│   ├── locales.json                  # 多語言翻譯 (83 行)
│   └── download_gifs.py              # GIF 下載腳本 (223 行)
│
├── 📁 styles/                        # 樣式文件
│   └── map.css                       # 主樣式文件 (1195 行)
│
└── 📁 文檔/                          # 說明文檔
    ├── PROJECT-SUMMARY.md            # 📌 本文件 - 項目總結
    ├── README.md                     # 核心功能說明
    ├── QUICK-START.md                # 快速開始指南
    ├── GIF-DOWNLOAD-SUMMARY.md       # GIF 下載統計
    ├── LANGUAGE-UPDATE-SUMMARY.md    # 語言更新說明
    ├── LOADING-PREVIEW-README.md     # Loading 預覽說明
    ├── PAGE-LOADING-README.md        # 頁面載入動畫說明
    └── RANDOM-GIF-IMPLEMENTATION.md  # 隨機 GIF 實現說明

總計：
- 2 個 HTML 文件
- 3 個 JavaScript 文件 (2,821 行代碼)
- 1 個 CSS 文件 (1,195 行)
- 1 個 Python 腳本 (223 行)
- 383 個 GIF 動畫 (50 MB)
- 8 個建築物圖片
- 8 個說明文檔
```

---

## 🎮 功能模塊

### 1. 地圖渲染模塊 (`scripts/map.js`)

**核心功能**：

- 六邊形網格生成
- SVG 元素創建和管理
- 三層渲染系統（網格、標記、建築）
- 座標計算和轉換

**關鍵函數**：

```javascript
- hexToPixel(q, r)           // 六邊形座標轉像素座標
- pixelToHex(x, y)           // 像素座標轉六邊形座標
- createHexGrid()            // 創建六邊形網格
- placeBuildings()           // 放置建築物
```

### 2. 互動控制模塊 (`scripts/map.js`)

**核心功能**：

- 拖曳平移
- 滾輪縮放
- 觸摸手勢支持
- 視角記憶

**關鍵函數**：

```javascript
- handleMouseDown(event)     // 處理鼠標按下
- handleMouseMove(event)     // 處理鼠標移動
- handleWheel(event)         // 處理滾輪縮放
- saveViewState()            // 保存視角狀態
- restoreViewState()         // 恢復視角狀態
```

### 3. 標記管理模塊 (`scripts/map.js`)

**核心功能**：

- 添加/移除標記
- 顏色選擇
- 長按清除
- 批量清除

**關鍵函數**：

```javascript
- addMark(q, r, color)       // 添加標記
- removeMark(q, r)           // 移除標記
- clearAllMarks()            // 清除所有標記
- saveMark(q, r, color)      // 保存標記到 localStorage
```

### 4. 導出功能模塊 (`scripts/map.js`)

**核心功能**：

- SVG 到 Canvas 轉換
- 背景圖片合成
- 進度跟蹤
- PNG 文件生成

**關鍵函數**：

```javascript
- exportMap(quality)         // 導出地圖
- updateProgress(percent)    // 更新進度
- getRandomLoadingGif()      // 獲取隨機 GIF
```

### 5. 多語言模塊 (`scripts/map.js` + `scripts/locales.json`)

**核心功能**：

- 語言文件載入
- 動態文本更新
- 語言偏好保存

**關鍵函數**：

```javascript
- loadTranslations()         // 載入翻譯文件
- setLanguage(lang)          // 設置語言
- updateTextContent()        // 更新界面文字
```

### 6. 主題系統 (`scripts/map.js` + `styles/map.css`)

**核心功能**：

- CSS 變量切換
- 主題偏好保存
- 實時預覽

**關鍵函數**：

```javascript
- setTheme(theme)            // 設置主題
- applyTheme(theme)          // 應用主題
```

### 7. 配置管理 (`scripts/config.js`)

**核心配置**：

```javascript
- mapConfig                  // 地圖幾何配置
- buildingData               // 建築物位置數據
- buildingConfig             // 建築物顯示配置
- specialAreas               // 特殊區域配置
```

---

## 🛠️ 開發指南

### 常見修改場景

#### 場景 1：調整建築物大小

📝 **修改文件**：`scripts/config.js`
📍 **位置**：`buildingConfig` 對象

```javascript
// 調整主城大小
buildingConfig.mainCity = {
  imagePath: 'assets/city.png',
  widthScale: 2.8,           // 變大：3.0, 3.2 | 變小：2.4, 2.6
  verticalAlign: 'center',   // 對齊方式：'bottom', 'center', 'top'
  verticalOffset: -20,       // 向上移動 20px（負值向上）
  ...
};
```

#### 場景 2：添加/移除建築物

📝 **修改文件**：`scripts/config.js`
📍 **位置**：`buildingData` 對象

```javascript
// 添加一個醫院
buildingData.hospital.push([40, 50]);

// 移除一個房子（刪除數組中的元素）
buildingData.house = buildingData.house.filter(([x, y]) => x !== 18 || y !== 74);
```

#### 場景 3：更改顏色主題

📝 **修改文件**：`styles/map.css`
📍 **位置**：`:root` 變數區塊

```css
:root {
  --hex-stroke: #ff0000;              /* 六邊形邊框顏色 */
  --hex-fill: rgba(255, 0, 0, 0.1);   /* 六邊形填充顏色 */
  --building-icon-size: 24px;         /* 建築物圖標大小 */
  --label-font-size: 10px;            /* 座標標籤字體大小 */
}
```

#### 場景 4：調整地圖範圍

📝 **修改文件**：`scripts/config.js`
📍 **位置**：`mapConfig` 對象

```javascript
const mapConfig = {
  minQ: 10,   // 最小 q 座標
  maxQ: 50,   // 最大 q 座標
  minR: 30,   // 最小 r 座標
  maxR: 110,  // 最大 r 座標
  ...
};
```

#### 場景 5：添加新的建築類型

**步驟 1**：準備圖片資源（放到 `assets/` 目錄）

**步驟 2**：在 `config.js` 的 `buildingConfig` 中添加配置：

```javascript
buildingConfig.newType = {
  imagePath: 'assets/new-type.png',
  widthScale: 1.5,
  verticalAlign: 'center',
  verticalOffset: 0,
  category: 'newType'
};
```

**步驟 3**：在 `buildingData` 中添加位置數據：

```javascript
buildingData.newType = [
  [20, 40],
  [30, 50],
  [40, 60]
];
```

**步驟 4**：在 `locales.json` 中添加翻譯：

```json
{
  "zh-TW": {
    "newType": "新建築類型"
  },
  "en": {
    "newType": "New Building Type"
  }
}
```

### 開發工作流程

```
1. 修改代碼
   ↓
2. 保存文件
   ↓
3. 刷新瀏覽器 (Cmd+R / Ctrl+R)
   ↓
4. 檢查效果
   ↓
5. 打開開發者工具查看錯誤（如有）
   ↓
6. 重複步驟 1-5 直到滿意
```

### 調試技巧

#### 1. 使用瀏覽器控制台

```javascript
// 查看當前縮放級別
console.log(window.map.currentScale);

// 查看所有建築物
console.log(window.map.buildings);

// 查看當前標記
console.log(window.map.marks);

// 高亮特定格子
window.map.highlight([{x: 30, y: 50}], {pulse: true});
```

#### 2. 檢查 localStorage

```javascript
// 查看保存的視角
console.log(localStorage.getItem('stronghold-hex-map-view'));

// 查看保存的標記
console.log(localStorage.getItem('stronghold-hex-map-marks'));

// 清除所有保存數據
localStorage.clear();
```

#### 3. 性能分析

```javascript
// 記錄渲染時間
console.time('render');
window.map.render();
console.timeEnd('render');

// 查看 FPS
// 打開 Chrome DevTools > Performance > Record
```

---

## ⚙️ 配置說明

### 地圖配置 (`mapConfig`)

```javascript
const mapConfig = {
  // 地圖範圍
  minQ: 10,                    // 最小 q 座標
  maxQ: 50,                    // 最大 q 座標
  minR: 30,                    // 最小 r 座標
  maxR: 110,                   // 最大 r 座標
  
  // 六邊形尺寸
  hexSize: 20,                 // 六邊形半徑（像素）
  
  // 視口設置
  viewBox: {
    width: 2000,               // SVG 視口寬度
    height: 2000               // SVG 視口高度
  },
  
  // 縮放限制
  minScale: 0.5,               // 最小縮放倍數
  maxScale: 3.0,               // 最大縮放倍數
  
  // 性能優化
  enableCache: true,           // 啟用緩存
  lazyLoad: false              // 延遲載入（大地圖建議啟用）
};
```

### 建築物配置 (`buildingConfig`)

```javascript
const buildingConfig = {
  mainCity: {
    imagePath: 'assets/city.png',
    widthScale: 2.8,           // 圖片寬度相對於六邊形的倍數
    verticalAlign: 'center',   // 垂直對齊：'top', 'center', 'bottom'
    verticalOffset: -20,       // 額外的垂直偏移（像素）
    category: 'mainCity',      // 建築類別
    zIndex: 100                // 層級（數字越大越上層）
  },
  // ... 其他建築類型
};
```

### 特殊區域配置 (`specialAreas`)

```javascript
const specialAreas = {
  mainCityArea: {
    center: [30, 50],          // 中心座標
    cells: [                   // 包含的格子
      [29, 49], [29, 51], 
      [30, 48], [30, 50], [30, 52], 
      [31, 49], [31, 51]
    ],
    label: '主城',             // 顯示標籤
    highlightColor: '#ffd700'  // 高亮顏色
  }
};
```

---

## 📚 文檔索引

### 主要文檔

| 文檔名稱                                | 說明               | 適合閱讀對象 |
| --------------------------------------- | ------------------ | ------------ |
| 📌[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) | 項目總結（本文件） | 所有用戶     |
| 📖[README.md](README.md)                   | 核心功能和使用說明 | 新手入門     |
| 🚀[QUICK-START.md](QUICK-START.md)         | 快速開始指南       | 新手入門     |

### 功能文檔

| 文檔名稱                                                    | 說明                     | 適合閱讀對象  |
| ----------------------------------------------------------- | ------------------------ | ------------- |
| 🎬[LOADING-PREVIEW-README.md](LOADING-PREVIEW-README.md)       | Loading 動畫預覽頁面說明 | 開發者        |
| 📄[PAGE-LOADING-README.md](PAGE-LOADING-README.md)             | 頁面載入動畫說明         | 開發者        |
| 🎲[RANDOM-GIF-IMPLEMENTATION.md](RANDOM-GIF-IMPLEMENTATION.md) | 隨機 GIF 實現詳解        | 開發者        |
| 📥[GIF-DOWNLOAD-SUMMARY.md](GIF-DOWNLOAD-SUMMARY.md)           | GIF 下載統計和腳本說明   | 開發者/維護者 |
| 🌐[LANGUAGE-UPDATE-SUMMARY.md](LANGUAGE-UPDATE-SUMMARY.md)     | 多語言系統更新說明       | 開發者/翻譯者 |

### 代碼文檔

| 文件名稱                     | 行數  | 說明                         |
| ---------------------------- | ----- | ---------------------------- |
| `scripts/map.js`           | 2,311 | 主邏輯文件，包含所有功能實現 |
| `scripts/config.js`        | 227   | 配置文件，定義地圖和建築物   |
| `scripts/locales.json`     | 83    | 多語言翻譯文件               |
| `styles/map.css`           | 1,195 | 主樣式文件，包含所有 CSS     |
| `scripts/download_gifs.py` | 223   | GIF 下載腳本                 |

---

## 🔄 更新日誌

### v4.0 (2025-10-05) - 完整圖片系統

**新功能**：

- ✨ 所有建築物改用圖片顯示（city.png, building.png 等）
- 🎬 添加頁面載入動畫（隨機 Tokyo Ghoul GIF）
- 🎲 導出時顯示隨機 loading 動畫（383 個 GIF）
- 📁 添加 GIF 下載腳本和索引系統
- 🌐 完善多語言系統（28 個翻譯鍵值）

**改進**：

- 🎨 優化建築物顯示效果
- ⚡ 改進渲染性能
- 📱 增強移動端體驗
- 💾 優化數據持久化

**修復**：

- 🐛 修復座標標籤在某些情況下不顯示的問題
- 🐛 修復導出時背景圖片偶爾不載入的問題
- 🐛 修復長按清除在觸摸設備上的兼容性問題

### v3.x (2025-10-04) - 多語言和主題系統

- 🌐 添加繁體中文/英文雙語支持
- 🎨 添加暗黑/明亮雙主題
- 💾 添加視角記憶功能
- 🏗️ 添加特殊區域系統

### v2.x (2025-10-03) - 導出功能

- 📤 添加地圖導出功能
- 🎨 添加三種導出品質選項
- 📊 添加導出進度顯示

### v1.x (2025-10-02) - 基礎功能

- 🗺️ 實現六邊形地圖系統
- 🏗️ 實現建築物放置功能
- 🎨 實現區塊標記功能
- 🖱️ 實現拖曳和縮放

---

## 📊 項目統計

### 代碼統計

```
總行數：約 5,500 行
├── JavaScript: 2,821 行 (51%)
├── CSS: 1,195 行 (22%)
├── HTML: 744 行 (13%)
└── 文檔: 740 行 (14%)
```

### 資源統計

```
總大小：約 55 MB
├── GIF 動畫: 50 MB (91%)
├── 建築物圖片: 2 MB (3%)
├── 代碼: 500 KB (1%)
└── 文檔: 100 KB (<1%)
```

### 功能統計

```
- 6 種建築類型
- 44 個建築物
- 383 個 loading GIF
- 28 個多語言鍵值
- 2 種主題
- 2 種語言
- 3 種導出品質
- 6 種預設標記顏色
```

---

## 🎓 學習資源

### 推薦閱讀順序

1. **新手** → 從頭開始學習

   - 📖 [README.md](README.md) - 了解核心功能
   - 🚀 [QUICK-START.md](QUICK-START.md) - 快速上手
   - 打開 `index.html` 開始使用
2. **進階用戶** → 自定義和配置

   - 📖 [README.md](README.md) - 查看配置說明
   - 編輯 `scripts/config.js` - 調整建築物和地圖
   - 編輯 `styles/map.css` - 自定義樣式
3. **開發者** → 深入理解實現

   - 📌 [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - 本文件
   - 🎲 [RANDOM-GIF-IMPLEMENTATION.md](RANDOM-GIF-IMPLEMENTATION.md) - GIF 系統
   - 🌐 [LANGUAGE-UPDATE-SUMMARY.md](LANGUAGE-UPDATE-SUMMARY.md) - 多語言系統
   - 閱讀 `scripts/map.js` 源代碼

### 技術概念

#### 六邊形座標系統

本項目使用 **軸向座標系統** (Axial Coordinates)：

```
座標表示：(q, r)
- q: 列（column）
- r: 行（row）

鄰居計算：
- 右上：(q+1, r-1)
- 右：  (q+1, r)
- 右下：(q, r+1)
- 左下：(q-1, r+1)
- 左：  (q-1, r)
- 左上：(q, r-1)
```

#### 座標轉換

```javascript
// 六邊形座標 → 像素座標
function hexToPixel(q, r) {
  const x = hexSize * (3/2 * q);
  const y = hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
}

// 像素座標 → 六邊形座標
function pixelToHex(x, y) {
  const q = (2/3 * x) / hexSize;
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / hexSize;
  return axialRound(q, r);
}
```

#### 分層渲染

SVG 使用三層結構：

```html
<svg id="hex-map">
  <g id="hex-layer">     <!-- 1. 底層：六邊形網格 -->
  <g id="mark-layer">    <!-- 2. 中層：標記 -->
  <g id="building-layer"><!-- 3. 頂層：建築物 -->
  <g id="label-layer">   <!-- 4. 最頂層：座標標籤 -->
</svg>
```

---

## 🔐 授權信息

```
Copyright © 2025 nos
All Rights Reserved.

未經授權，禁止使用、複製、修改或分發本代碼。
Unauthorized copying, modification, or distribution is strictly prohibited.
```

---

## 📞 聯繫方式

**開發者**：nos

**Discord**：nos1130

**項目位置**：`../noswork.github.io/tga/stronghold/map/3rd/`

---

## 🙏 致謝

- **Tokyo Ghoul** - GIF 動畫來源
- **巴哈姆特論壇** - GIF 資源收集
- **D3.js** - 六邊形算法參考
- **所有用戶** - 反饋和建議

---

## 📝 附錄

### A. 常見問題 (FAQ)

<details>
<summary><strong>Q1: 為什麼需要本地服務器？</strong></summary>

A: 因為瀏覽器的 CORS 安全策略，直接用 `file://` 協議打開 HTML 無法載入 JSON 等外部資源。使用本地服務器（如 `python3 -m http.server`）可以模擬正常的 HTTP 環境。

</details>

<details>
<summary><strong>Q2: 如何添加自己的 GIF？</strong></summary>

A:

1. 將 GIF 文件放到 `assets/loading-gifs/` 目錄
2. 編輯 `data/gif-index.json`，添加文件名到數組中
3. 刷新頁面即可

</details>

<details>
<summary><strong>Q3: 如何修改默認語言？</strong></summary>

A: 在 `scripts/map.js` 中修改：

```javascript
let currentLanguage = 'zh-TW'; // 改為 'en' 使用英文
```

</details>

<details>
<summary><strong>Q4: 如何清除所有保存數據？</strong></summary>

A: 在瀏覽器控制台執行：

```javascript
localStorage.clear();
location.reload();
```

</details>

<details>
<summary><strong>Q5: 建築物座標有什麼規則？</strong></summary>

A: 必須遵守 **"同奇同偶"規則**：

- ✅ 正確：(30, 50) - 都是偶數
- ✅ 正確：(31, 51) - 都是奇數
- ❌ 錯誤：(30, 51) - 一奇一偶

</details>

### B. 鍵盤快捷鍵

| 快捷鍵                   | 功能                 |
| ------------------------ | -------------------- |
| `Cmd/Ctrl + R`         | 刷新頁面             |
| `Cmd/Ctrl + Shift + R` | 強制刷新（清除緩存） |
| `F12`                  | 打開開發者工具       |
| `Esc`                  | 取消當前操作         |

### C. 瀏覽器控制台命令

```javascript
// 地圖 API
window.map.highlight([{x: 30, y: 50}]);  // 高亮格子
window.map.unhighlight();                 // 取消高亮
window.map.neighbors(30, 50);             // 獲取鄰居
window.map.toggleLabels(true);            // 顯示標籤
window.map.updateMainCityBadge('path');   // 更新主城圖片

// 數據查詢
window.map.buildings;                     // 所有建築物
window.map.marks;                         // 所有標記
window.map.currentScale;                  // 當前縮放級別
window.map.getSpecialAreas();             // 特殊區域

// 功能測試
window.map.exportMap('high');             // 導出地圖
window.map.clearAllMarks();               // 清除標記
window.map.setLanguage('en');             // 切換語言
window.map.setTheme('light');             // 切換主題
```

### D. 性能優化建議

1. **減少 GIF 數量**

   - 如果不需要 383 個 GIF，可以刪減到 50-100 個
   - 編輯 `data/gif-index.json` 移除不需要的
2. **優化建築物圖片**

   - 使用 WebP 格式代替 PNG
   - 壓縮圖片大小（建議每個 < 100KB）
3. **調整地圖範圍**

   - 減小 `mapConfig` 中的範圍
   - 或啟用 `lazyLoad` 選項
4. **禁用不需要的功能**

   - 關閉頁面載入動畫（移除 `#page-loading` 元素）
   - 關閉座標標籤（預設隱藏）

---

## 🎉 結語

感謝使用 **據點地圖系統**！

這是一個功能豐富、高度可定制的六邊形地圖應用。無論您是新手還是開發者，都能找到適合自己的使用方式。

如果您有任何問題、建議或發現 bug，歡迎聯繫我！

**祝使用愉快！** 🗺️✨

---

*最後更新：2025-10-05*
*版本：4.0*
*作者：nos (Discord: nos1130)*
