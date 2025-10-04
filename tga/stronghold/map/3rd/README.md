## ✨ 核心功能

- 🗺️ **互動式六邊形地圖** - 支援平移、縮放、點擊
- 🏗️ **分層渲染** - 建築物圖標獨立圖層，始終顯示在網格上方
- 💾 **視角記憶** - 自動保存和恢復用戶的平移/縮放狀態
- 🏰 **特殊區域分組** - 將多個六邊形組合為一個整體區域（如主城）
- 🎨 **高度可配置** - 集中式配置文件，輕鬆調整所有參數
- 📱 **響應式設計** - 支援桌面和移動設備

## 📁 文件結構

```
map/3rd/
├── map.html              # 主 HTML 文件（簡化版）
├── README.md             # 本說明文件
├── styles/
│   └── map.css          # 所有CSS樣式
├── scripts/
│   ├── config.js        # 配置文件（建築位置、大小等）
│   └── map.js           # 主要JavaScript邏輯
└── assets/
    ├── city.png         # 主城圖片
    ├── building.png     # 大樓圖片
    ├── house.png        # 房子圖片
    ├── hospital.png     # 醫院圖片
    ├── fortress.png     # 壁壘圖片
    └── org.png          # 組織圖片
```

## 🎯 各文件功能說明

### 1. `map.html` - 主頁面
- 簡潔的 HTML 結構
- 引用外部 CSS 和 JavaScript 文件
- 包含 SVG 容器和必要的 DOM 結構

### 2. `styles/map.css` - 樣式文件
包含所有視覺樣式：
- CSS 變數（顏色、大小等）
- 六邊形樣式
- 標籤樣式
- 圖標樣式
- 動畫效果

### 3. `scripts/config.js` - 配置文件
**這是您最常修改的文件！**

包含：
- 地圖幾何配置（大小、邊界等）
- 建築物位置數據
- 建築物大小配置 ⭐
- SVG 圖標定義

#### 快速調整建築物大小：

所有建築物都使用圖片顯示，可以統一調整：

```javascript
// 在 config.js 中找到 buildingConfig 對象

// 調整主城圖片 (city.png)
buildingConfig.mainCity = {
  imagePath: 'assets/city.png',
  widthScale: 2.8,           // 變大：2.8, 3.0 | 變小：2.2, 2.4
  verticalAlign: 'center',   // 改變對齊：'bottom', 'center', 'top'
  verticalOffset: -20,       // 向上移動 20px
  ...
};

// 調整大樓圖片 (building.png)
buildingConfig.building = {
  imagePath: 'assets/building.png',
  widthScale: 1.5,           // 調整大小
  verticalAlign: 'center',   // 改變對齊
  ...
};

// 其他建築物也可以用相同方式調整：
// - hospital (hospital.png)
// - house (house.png)
// - fortress (fortress.png)
// - organization (org.png)
```

### 4. `scripts/map.js` - 主邏輯文件
包含所有地圖功能：
- 六邊形網格生成
- 互動控制（拖曳、縮放）
- 建築物放置
- 事件處理
- API 接口

**一般情況下不需要修改此文件**

## 🔧 常見修改場景

### 場景 1：調整建築物大小
📝 **修改文件**：`scripts/config.js`
📍 **位置**：`buildingConfig` 對象

### 場景 2：添加/移除建築物
📝 **修改文件**：`scripts/config.js`
📍 **位置**：`buildingData` 對象

### 場景 3：更改顏色主題
📝 **修改文件**：`styles/map.css`
📍 **位置**：`:root` 變數區塊

### 場景 4：調整地圖大小
📝 **修改文件**：`scripts/config.js`
📍 **位置**：`mapConfig` 對象

## 🏗️ 建築物統計

地圖上共有 **6 種建築類型**，總計 **44 個建築物**：

| 建築類型 | 圖片文件 | 數量 | 座標範例 |
|---------|---------|------|---------|
| 主城 (Main City) | city.png | 1 | (30,50) |
| 大樓 (Building) | building.png | 5 | (26,60), (34,60)... |
| 房子 (House) | house.png | 15 | (18,74), (12,56)... |
| 醫院 (Hospital) | hospital.png | 11 | (23,79), (12,58)... |
| 壁壘 (Fortress) | fortress.png | 3 | (41,39), (19,39)... |
| 組織 (Organization) | org.png | 16 | (33,99), (13,85)... |

所有建築物都使用高質量的圖片資源，統一管理和配置。

## 📝 使用示例

### 示例 1：讓所有建築變大
打開 `scripts/config.js`，找到對應的建築配置：

```javascript
buildingConfig.mainCity.widthScale = 3.0;      // 主城變大
buildingConfig.building.widthScale = 1.8;      // 大樓變大
buildingConfig.house.widthScale = 1.5;         // 房子變大
// ... 其他建築
```

### 示例 2：添加新建築
打開 `scripts/config.js`，在 `buildingData` 中添加：

```javascript
buildingData.hospital.push([40, 50]);  // 在 (40,50) 添加醫院
```

### 示例 3：更改主題顏色
打開 `styles/map.css`，修改：

```css
:root {
  --hex-stroke: #ff0000;  /* 改成紅色邊框 */
  --hex-fill: rgba(255, 0, 0, 0.1);  /* 改成淡紅色填充 */
}
```

## 🚀 開發工作流程

1. **修改配置** → 編輯 `scripts/config.js`
2. **保存文件**
3. **刷新瀏覽器** → 按 `⌘+R` (Mac) 或 `Ctrl+R` (Windows)
4. **查看效果**

## 🐛 調試技巧

### 查看控制台日誌
打開瀏覽器開發者工具（F12），查看 Console 標籤：
- 主城圖片放置信息
- 建築物數量統計
- 錯誤信息

### 常見問題

**Q: 修改後沒有效果？**
A: 確保刷新瀏覽器並清除緩存（⌘+Shift+R 或 Ctrl+Shift+R）

**Q: 建築物位置錯誤？**
A: 檢查座標是否符合「同奇同偶」規則

**Q: 圖標沒有顯示？**
A: 檢查文件路徑是否正確，特別是 assets/2500.png

## 💾 視角記憶功能

地圖會自動保存您的瀏覽位置和縮放級別：

- **自動保存**：每次平移或縮放時自動保存到瀏覽器的 localStorage
- **自動恢復**：重新訪問頁面時自動恢復到上次的視角
- **數據儲存**：保存縮放級別和平移位置
- **隱私安全**：數據只存在您的瀏覽器中，不會上傳到服務器

### 清除保存的視角

如果想回到默認視角，在瀏覽器控制台執行：

```javascript
localStorage.removeItem('stronghold-hex-map-view');
location.reload(); // 刷新頁面
```

## 🎨 圖層系統

地圖使用三層渲染系統（從下到上）：

1. **網格圖層** (`hex-layer`) - 底層，包含所有六邊形多邊形
2. **建築物圖層** (`building-layer`) - 中層，包含所有建築物圖標和主城圖片
3. **標籤圖層** (`label-layer`) - 頂層，包含所有座標標籤

這確保：
- ✅ 建築物始終顯示在網格上方
- ✅ 座標標籤始終顯示在建築物圖片之上，清晰可見
- ✅ 三個圖層會同步進行平移和縮放變換

## 🏰 特殊區域配置

您可以將多個六邊形組合成一個特殊區域。例如，主城區域由7個格子組成：

```javascript
// 在 config.js 中配置
const specialAreas = {
  mainCityArea: {
    center: [30, 50],  // 中心點
    cells: [
      [29, 49], [29, 51], 
      [30, 48], [30, 50], [30, 52], 
      [31, 49], [31, 51]
    ]
  }
};
```

### 特殊區域特性

- 🏷️ **中心標籤** - 只在區域中心點 (30,50) 顯示一個座標標籤
- 🌐 **區域聯動** - 懸停區域內任一格子時，整個區域的7個六邊形同時高亮
- ✨ **統一高亮** - 所有格子以相同的懸停效果亮起，視覺上形成一個整體
- 🔍 **API 查詢** - 可以通過 API 查詢某個格子是否屬於特殊區域
- 🖱️ **整體互動** - 所有格子會被視為一個整體進行處理

### 查詢特殊區域

```javascript
// 檢查格子是否在主城區域內
const isMainCity = window.map.isInMainCityArea(30, 50);

// 獲取所有特殊區域配置
const areas = window.map.getSpecialAreas();
```

## 📚 API 使用

在瀏覽器控制台中使用：

```javascript
// 高亮特定格子
window.map.highlight([{x: 30, y: 50}], {pulse: true});

// 取消高亮
window.map.unhighlight();

// 獲取鄰居格子
const neighbors = window.map.neighbors(30, 50);

// 切換座標標籤顯示
window.map.toggleLabels(true);  // 顯示所有標籤
window.map.toggleLabels(false); // 隱藏標籤

// 更改主城圖片
window.map.updateMainCityBadge('assets/3000.png');
```

## ⚠️ 注意事項

1. **文件路徑**：所有路徑都是相對於 `map.html` 的
2. **同奇同偶規則**：建築物座標必須 x、y 同為奇數或同為偶數
3. **瀏覽器兼容**：建議使用現代瀏覽器（Chrome, Firefox, Safari, Edge）
4. **性能**：大量建築物可能影響性能，建議控制在合理範圍

## 📞 需要幫助？

- 查看代碼註釋以了解詳細說明
- 使用瀏覽器開發者工具進行調試
- 參考本 README 中的示例

---

**最後更新**：2025-10-04
**版本**：4.0 (完整圖片系統 - 所有建築使用圖片)

