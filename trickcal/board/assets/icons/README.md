# 📁 Icons 資料夾

這個資料夾包含遊戲的所有圖標和 UI 元素。

## 📋 檔案清單

### 🎯 遊戲功能圖標
- `gold_crayon.png` - 金蠟筆圖標
- `check.png` - 勾選圖標
- `unit_star.png` - 星級圖標

### 🎮 著色版相關
- `board_atk.png` - 攻擊力格子
- `board_crit.png` - 暴擊格子
- `board_hp.png` - HP 格子
- `board_critResist.png` - 暴擊抵抗格子
- `board_def.png` - 防禦力格子
- `board_base_2.png` - 第二層背景
- `board_base_3.png` - 第三層背景

### 👤 角色屬性圖標

#### 性格
- `unit_personality_naive.png` - 天真
- `unit_personality_cool.png` - 冷靜
- `unit_personality_mad.png` - 狂亂
- `unit_personality_jolly.png` - 活潑
- `unit_personality_gloomy.png` - 憂鬱

#### 攻擊類型
- `unit_attack_physic.png` - 物理攻擊
- `unit_attack_magic.png` - 魔法攻擊

#### 部署位置
- `unit_position_front.png` - 前排
- `unit_position_middle.png` - 中排
- `unit_position_back.png` - 後排

---

## 🆕 自訂 Favicon

### 📍 位置
將你的 favicon 圖片命名為 `favicon.png` 並放在這個資料夾中：
```
board/assets/icons/favicon.png
```

### 🎯 規格建議
- **格式**: PNG（推薦）或 ICO
- **尺寸**: 32x32 px 或 64x64 px
- **透明背景**: 建議使用
- **顏色**: 使用高對比度以便在各種背景上顯示

### 💡 設計建議
1. 使用簡單、辨識度高的圖案
2. 避免過於複雜的細節（在小尺寸下會模糊）
3. 可以使用金蠟筆的主題顏色
4. 建議使用 SVG 轉換為 PNG 以保持清晰度

### 🔧 如何使用
1. 準備你的 favicon 圖片
2. 將檔案命名為 `favicon.png`
3. 放入此資料夾
4. HTML 已自動設定好（在 `index.html`）
5. 重新整理瀏覽器即可看到

### 📝 HTML 設定（已完成）
```html
<link rel="icon" type="image/png" href="assets/icons/favicon.png">
<link rel="apple-touch-icon" href="assets/icons/favicon.png">
```

---

## 🎨 圖片規格

所有圖標遵循以下規格：
- **格式**: PNG（透明背景）
- **最大尺寸**: 200x200 px
- **檔案大小**: 建議小於 50KB
- **色彩模式**: RGBA

---

## 📦 新增圖標

如果需要新增圖標：
1. 確保圖片為 PNG 格式且有透明背景
2. 將檔案放入此資料夾
3. 在 `data.json` 中更新對應的圖標路徑
4. 遵循命名規範：
   - 格子類型：`board_*.png`
   - 單位屬性：`unit_*.png`
   - 其他功能：使用描述性名稱

---

**最後更新**: 2025-10-22
