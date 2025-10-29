# 開發者工具文件夾

⚠️ **注意**：此文件夾已被添加到 `.gitignore`，不會提交到版本控制系統。

## 📁 文件夾結構

```
dev-tools/
├── README.md              # 本文件
├── scripts/               # 開發者工具腳本
│   ├── autoSolver.js     # 自動解迷宮核心邏輯
│   ├── devPanel.js       # 開發者工具UI面板
│   └── pathfinder.js     # BFS 尋路算法
├── docs/                  # 開發者文檔
│   ├── DEVELOPER_FEATURES.md      # 完整功能文檔
│   ├── DEVELOPER_QUICKSTART.md    # 快速入門指南
│   └── CHANGES_SUMMARY.md         # 變更摘要
└── database/              # 資料庫腳本
    └── add_developer_flag.sql     # 添加開發者標籤的遷移
```

## 🚀 快速開始

### 1. 設置開發者權限

在 Supabase Dashboard 的 SQL Editor 中執行 `database/add_developer_flag.sql`：

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_developer BOOLEAN DEFAULT false;

UPDATE profiles 
SET is_developer = true 
WHERE username = 'your_username';
```

### 2. 啟用開發者工具

1. 重新登入遊戲
2. 進入任何遊戲模式
3. 點擊右下角的 🛠️ 按鈕
4. 開始使用開發者工具

## 📚 文檔

- **[快速入門](docs/DEVELOPER_QUICKSTART.md)** - 5分鐘快速上手
- **[完整功能說明](docs/DEVELOPER_FEATURES.md)** - 詳細的技術文檔
- **[變更摘要](docs/CHANGES_SUMMARY.md)** - 實現細節和變更記錄

## 🔧 腳本說明

### `scripts/autoSolver.js`
自動解迷宮的核心邏輯，包含：
- 自動尋路和執行
- 速度控制
- 自動完成模式
- 記錄控制

### `scripts/devPanel.js`
開發者工具UI面板，提供：
- 速度調整滑桿
- 自動完成選項
- 記錄控制開關
- 狀態訊息顯示

### `scripts/pathfinder.js`
BFS（廣度優先搜索）最短路徑算法：
- 保證找到最短路徑
- 考慮迷宮牆壁約束
- 返回完整移動序列

## 🔗 與主專案的整合

這些開發者工具已整合到主遊戲中：

**導入路徑**（在 `scripts/game/index.js` 中）：
```javascript
import { AutoSolver } from '../../dev-tools/scripts/autoSolver.js';
import { DevPanel } from '../../dev-tools/scripts/devPanel.js';
```

## ⚠️ 重要提醒

1. **不要刪除此文件夾**：雖然不提交到 Git，但本地開發需要這些文件
2. **更新路徑**：如果移動文件，記得更新導入路徑
3. **保護隱私**：開發者工具僅供授權開發者使用

## 🛡️ 安全性

- 開發者權限由 Supabase `profiles.is_developer` 欄位控制
- 僅標記為開發者的用戶可見工具按鈕
- 測試數據可選擇不記錄到伺服器，避免污染排行榜

## 📝 維護

如需添加新的開發者功能：
1. 在 `scripts/` 中創建新模組
2. 在主遊戲 (`scripts/game/index.js`) 中導入
3. 更新相關文檔

---

**版本**: 1.0.0  
**最後更新**: 2025-10-08

