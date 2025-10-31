# Icons 目錄

此目錄包含網站的各種圖標和 favicon 文件。

## 📁 文件列表

### SVG 圖標（向量格式）
- `../../favicon.svg` - 主 favicon（SVG 格式，支援現代瀏覽器）
- `../../favicon-dark.svg` - 深色模式 favicon

### PNG 圖標（點陣格式）
需要生成以下文件以支援舊版瀏覽器和不同平台：

- `favicon-16x16.png` - 16x16 像素 favicon
- `favicon-32x32.png` - 32x32 像素 favicon
- `apple-touch-icon.png` - 180x180 像素（iOS Safari）
- `icon-192.png` - 192x192 像素（Android）
- `icon-512.png` - 512x512 像素（Android）
- `icon-maskable-192.png` - 192x192 像素（可遮罩圖標）
- `icon-maskable-512.png` - 512x512 像素（可遮罩圖標）

## 🎨 設計說明

### 顏色方案
- **主色**：Indigo (#6366f1)
- **輔色**：Purple (#8b5cf6)
- **強調色**：Pink (#ec4899)
- **文字**：White (#ffffff)

### 設計元素
- 圓角方形背景（22px 圓角）
- 漸層色彩（從左上到右下）
- 白色 "NOS" 文字
- 輕微陰影效果

## 🔧 如何生成 PNG 圖標

### 方法 1: 使用在線工具（推薦）

1. **訪問 SVG to PNG 轉換器**：
   - https://cloudconvert.com/svg-to-png
   - https://svgtopng.com/
   - https://convertio.co/svg-png/

2. **上傳 favicon.svg**

3. **生成不同尺寸**：
   - 16x16 → `favicon-16x16.png`
   - 32x32 → `favicon-32x32.png`
   - 180x180 → `apple-touch-icon.png`
   - 192x192 → `icon-192.png`
   - 512x512 → `icon-512.png`

4. **生成可遮罩圖標**（Maskable Icons）：
   - 需要添加安全區域（Safe Zone）
   - 訪問：https://maskable.app/editor
   - 上傳 icon-512.png
   - 調整安全區域
   - 導出為 `icon-maskable-192.png` 和 `icon-maskable-512.png`

### 方法 2: 使用 ImageMagick（命令列）

如果你已安裝 ImageMagick：

```bash
# 安裝 ImageMagick（macOS）
brew install imagemagick

# 轉換 SVG 到不同尺寸的 PNG
convert -background none favicon.svg -resize 16x16 favicon-16x16.png
convert -background none favicon.svg -resize 32x32 favicon-32x32.png
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png
convert -background none favicon.svg -resize 192x192 icon-192.png
convert -background none favicon.svg -resize 512x512 icon-512.png
```

### 方法 3: 使用 Node.js 腳本

創建一個 `generate-icons.js` 文件：

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync('../../favicon.svg');
  
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(name);
    
    console.log(`✅ Generated ${name}`);
  }
}

generateIcons().then(() => {
  console.log('🎉 All icons generated!');
}).catch(err => {
  console.error('❌ Error:', err);
});
```

運行：
```bash
npm install sharp
node generate-icons.js
```

### 方法 4: 使用在線 Favicon 生成器

推薦使用：
- **RealFaviconGenerator**: https://realfavicongenerator.net/
  - 上傳 SVG 或 PNG
  - 自動生成所有需要的尺寸和格式
  - 提供完整的 HTML 代碼
  - 包含 Web App Manifest

步驟：
1. 訪問 https://realfavicongenerator.net/
2. 上傳 `favicon.svg`
3. 配置各平台的圖標外觀
4. 下載生成的圖標包
5. 解壓並複製到此目錄

## 📱 可遮罩圖標（Maskable Icons）

### 什麼是可遮罩圖標？

可遮罩圖標允許 Android 系統根據用戶主題應用不同形狀的遮罩（圓形、方形、圓角方形等）。

### 設計要求

1. **安全區域**：內容應在中心 80% 區域內
2. **背景**：應填滿整個畫布
3. **尺寸**：192x192 和 512x512

### 生成步驟

1. 訪問 https://maskable.app/editor
2. 上傳 `icon-512.png`
3. 確保重要內容在安全區域內
4. 導出為 `icon-maskable-512.png`
5. 重複步驟生成 192x192 版本

## 🧪 測試 Favicon

### 瀏覽器測試
1. 清除瀏覽器快取
2. 訪問網站
3. 檢查瀏覽器標籤頁圖標
4. 將網站添加到書籤，檢查書籤圖標

### 多平台測試
- **Chrome（桌面）**：標籤頁、書籤
- **Safari（桌面）**：標籤頁、書籤
- **iOS Safari**：添加到主畫面
- **Android Chrome**：添加到主畫面
- **Edge**：標籤頁、收藏
- **Firefox**：標籤頁、書籤

### 在線測試工具
- https://realfavicongenerator.net/favicon_checker
- 輸入你的網站 URL
- 檢查各平台的圖標顯示效果

## 🎯 檢查清單

在生成圖標後，確保：

- [ ] 所有 PNG 文件都已生成
- [ ] 圖標在不同尺寸下清晰可見
- [ ] 顏色和設計與網站主題一致
- [ ] 在不同瀏覽器中測試
- [ ] 在不同裝置上測試
- [ ] 可遮罩圖標的安全區域正確
- [ ] Web App Manifest 配置正確

## 📝 注意事項

1. **SVG 優先**：現代瀏覽器優先使用 SVG favicon
2. **PNG 後備**：舊版瀏覽器使用 PNG 格式
3. **快取問題**：更新 favicon 後可能需要清除瀏覽器快取
4. **文件大小**：
   - SVG：< 5KB
   - PNG (16x16, 32x32)：< 2KB
   - PNG (180x180, 192x192)：< 10KB
   - PNG (512x512)：< 30KB

## 🔗 相關資源

### 設計工具
- [Figma](https://figma.com) - 專業設計工具
- [Inkscape](https://inkscape.org) - 免費 SVG 編輯器
- [GIMP](https://gimp.org) - 免費圖片編輯器

### 轉換工具
- [CloudConvert](https://cloudconvert.com/svg-to-png) - SVG 轉 PNG
- [Squoosh](https://squoosh.app/) - 圖片壓縮優化
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG 優化

### 測試工具
- [RealFaviconGenerator Checker](https://realfavicongenerator.net/favicon_checker)
- [Favicon.io](https://favicon.io/) - Favicon 生成器
- [Maskable.app](https://maskable.app/) - 可遮罩圖標編輯器

### 文檔
- [Web App Manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Favicon - MDN](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML#adding_custom_icons_to_your_site)
- [Maskable Icons](https://web.dev/maskable-icon/)

---

最後更新：2025-10-31

