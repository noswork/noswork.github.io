# 開發者工具遷移指南

## 📦 文件夾重組

所有開發者相關的文件已從專案根目錄和 `scripts/game/` 移動到專門的 `dev-tools/` 文件夾。

## 🔄 文件移動對照表

### 腳本文件
| 舊位置 | 新位置 |
|--------|--------|
| `scripts/game/dev/autoSolver.js` | `dev-tools/scripts/autoSolver.js` |
| `scripts/game/dev/devPanel.js` | `dev-tools/scripts/devPanel.js` |
| `scripts/game/utils/pathfinder.js` | `dev-tools/scripts/pathfinder.js` |

### 文檔文件
| 舊位置 | 新位置 |
|--------|--------|
| `DEVELOPER_FEATURES.md` | `dev-tools/docs/DEVELOPER_FEATURES.md` |
| `DEVELOPER_QUICKSTART.md` | `dev-tools/docs/DEVELOPER_QUICKSTART.md` |
| `CHANGES_SUMMARY.md` | `dev-tools/docs/CHANGES_SUMMARY.md` |

### 資料庫文件
| 舊位置 | 新位置 |
|--------|--------|
| `supabase/migrations/add_developer_flag.sql` | `dev-tools/database/add_developer_flag.sql` |

## 📝 代碼變更

### `scripts/game/index.js`

**舊導入路徑**：
```javascript
import { AutoSolver } from './dev/autoSolver.js';
import { DevPanel } from './dev/devPanel.js';
```

**新導入路徑**：
```javascript
import { AutoSolver } from '../../dev-tools/scripts/autoSolver.js';
import { DevPanel } from '../../dev-tools/scripts/devPanel.js';
```

### `dev-tools/scripts/autoSolver.js`

**舊導入路徑**：
```javascript
import { findShortestPath } from '../utils/pathfinder.js';
```

**新導入路徑**：
```javascript
import { findShortestPath } from './pathfinder.js';
```

## 🚫 .gitignore 變更

新增了 `.gitignore` 文件，內容包括：

```gitignore
# 開發者工具（不提交到版本控制）
dev-tools/

# macOS
.DS_Store

# Editor
.vscode/
.idea/

# 環境變數
.env
.env.local

# 依賴
node_modules/

# 日誌
*.log
npm-debug.log*

# 臨時文件
*.tmp
*.temp
```

## ⚠️ 重要注意事項

### 1. 本地保留 dev-tools 文件夾
雖然 `dev-tools/` 被添加到 `.gitignore`，但**不要刪除本地的 dev-tools 文件夾**。這些文件在本地開發時仍然需要。

### 2. 團隊協作
如果團隊成員需要使用開發者工具：
1. 手動複製 `dev-tools/` 文件夾給他們
2. 或者提供 ZIP 壓縮包
3. 確保他們執行資料庫遷移腳本

### 3. 更新現有克隆
如果已經有專案的克隆：
```bash
# 如果拉取代碼後開發者工具消失
# 需要重新獲取 dev-tools 文件夾
```

## 📂 新的文件夾結構

```
maze/
├── .gitignore                    # 新增：包含 dev-tools/
├── dev-tools/                    # 新增：開發者工具文件夾（被 gitignore）
│   ├── README.md                # 文件夾說明
│   ├── MIGRATION_GUIDE.md       # 本遷移指南
│   ├── scripts/                 # 開發者腳本
│   │   ├── autoSolver.js       
│   │   ├── devPanel.js         
│   │   └── pathfinder.js       
│   ├── docs/                    # 開發者文檔
│   │   ├── DEVELOPER_FEATURES.md
│   │   ├── DEVELOPER_QUICKSTART.md
│   │   └── CHANGES_SUMMARY.md
│   └── database/                # 資料庫腳本
│       └── add_developer_flag.sql
├── scripts/
│   └── game/
│       ├── index.js             # 已更新導入路徑
│       └── ...
└── ...
```

## ✅ 驗證清單

遷移後請確認：

- [ ] `scripts/game/index.js` 中的導入路徑已更新
- [ ] `dev-tools/scripts/autoSolver.js` 中的導入路徑已更新
- [ ] 舊的 `scripts/game/dev/` 文件夾已刪除
- [ ] `.gitignore` 文件已創建並包含 `dev-tools/`
- [ ] 開發者工具功能正常運作
- [ ] 沒有 linting 錯誤

## 🔄 回滾（如需要）

如果遷移出現問題，可以手動回滾：

1. 從 `dev-tools/scripts/` 複製文件回 `scripts/game/dev/`
2. 從 `dev-tools/docs/` 複製文件回專案根目錄
3. 從 `dev-tools/database/` 複製文件回 `supabase/migrations/`
4. 恢復原始導入路徑
5. 刪除 `.gitignore` 中的 `dev-tools/` 行

## 🎯 遷移目的

1. **專案結構更清晰**：開發者工具與主要代碼分離
2. **避免意外提交**：通過 .gitignore 保護開發者工具
3. **便於管理**：所有開發者相關文件集中在一個位置
4. **保持專案整潔**：減少根目錄的文件數量

---

**遷移日期**: 2025-10-08  
**影響範圍**: 開發者工具相關文件  
**狀態**: ✅ 完成

