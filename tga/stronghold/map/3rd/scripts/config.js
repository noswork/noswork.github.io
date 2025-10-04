/**
 * Copyright © 2025 nos
 * All Rights Reserved.
 * 
 * 未經授權，禁止使用、複製、修改或分發本代碼。
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * 
 * Contact: discord: nos1130
 */

/**
 * Stronghold Hex Map - Configuration
 * 六邊形地圖配置文件
 * 
 * 📝 在此處統一管理地圖配置和建築物位置
 */

// ==================== 地圖幾何配置 ====================
const mapConfig = {
  r: 40,                        // 六邊形邊長
  maxEven: { x: 60, y: 100 },  // 最大偶數座標
  maxOdd: { x: 59, y: 101 },   // 最大奇數座標
  padding: 120,                 // 額外邊距
  minScale: 0.1,                // 最小縮放
  maxScale: 3,                  // 最大縮放
};

// ==================== 特殊區域配置 ====================
// 主城區域：由多個六邊形組成的特殊區域
const specialAreas = {
  mainCityArea: {
    center: [30, 50],  // 中心點
    cells: [
      [29, 49], [29, 51], 
      [30, 48], [30, 50], [30, 52], 
      [31, 49], [31, 51]
    ]  // 包含的所有格子
  }
};

// ==================== 建築物位置數據 ====================
// 主城(Main City), 大樓(Building), 房子(House), 醫院(Hospital), 壁壘(Fortress), 組織(Organization)
const buildingData = {
  mainCity: [
    [30, 50]
  ],
  
  building: [
    [26, 60], [34, 60], [37, 45], [30, 36], [23, 45]
  ],
  
  house: [
    [18, 74], [12, 56], [12, 44], [12, 32], [18, 26], 
    [24, 20], [36, 20], [42, 26], [48, 32], [48, 44], 
    [48, 56], [42, 74], [36, 80], [30, 86], [24, 80]
  ],
  
  hospital: [
    [23, 79], [12, 58], [18, 38], [23, 21], [41, 25], 
    [42, 38], [43, 73], [30, 74], [35, 61], [28, 48], [30, 34]
  ],
  
  fortress: [
    [41, 39], [19, 39], [30, 72]
  ],
  
  organization: [
    [33, 99], [13, 85], [7, 67], [4, 58], [7, 21], 
    [14, 14], [21, 7], [27, 7], [39, 7], [46, 14], 
    [53, 21], [56, 44], [53, 67], [50, 76], [47, 85], [40, 92]
  ],
  
  block: [
    [31, 71], [32, 70], [33, 69], [34, 68], [35, 67], [36, 66], [37, 65], [38, 64], 
    [39, 63], [40, 62], [41, 61], [41, 59], [41, 57], [41, 55], [41, 53], [41, 51], 
    [41, 49], [41, 47], [41, 45], [41, 43], [41, 41], [40, 38], [39, 37], [38, 36], 
    [37, 35], [36, 34], [35, 33], [34, 32], [33, 31], [32, 30], [31, 29], [30, 28], 
    [20, 38], [21, 37], [22, 36], [23, 35], [24, 34], [25, 33], [26, 32], [27, 31], 
    [28, 30], [29, 29], [19, 41], [19, 43], [19, 45], [19, 47], [19, 49], [19, 51], 
    [19, 53], [19, 55], [19, 57], [19, 59], [19, 61], [20, 62], [21, 63], [22, 64], 
    [23, 65], [24, 66], [25, 67], [26, 68], [27, 69], [28, 70], [29, 71]
  ]
};

// ==================== 建築物大小配置 ====================
// 📝 在此處統一調整所有建築物的顯示大小
//
// 💡 快速調整示例：
//    1. 主城圖片變大：widthScale: 2.8, 3.0
//    2. 主城圖片變小：widthScale: 2.2, 2.4
//    3. 主城圖片居中：verticalAlign: 'center'
//    4. 主城圖片向上移：verticalOffset: -20
//    5. 其他建築變大：把數值增加（例如 building: 28）
//
const buildingConfig = {
  // 主城圖片配置（city.png）
  mainCity: {
    imagePath: 'assets/city.png',
    widthScale: 2.85,           // 🔧 寬度倍數（相對於 config.dx = 60）
                                // 當前值 2.85 = 171px
                                // 建議範圍：2.2 - 3.0
    aspectRatio: 1,             // 🔧 高度比例
    verticalAlign: 'bottom',    // 🔧 垂直對齊方式
                                // 'bottom' = 底部貼齊六邊形底邊
                                // 'center' = 居中
                                // 'top' = 頂部對齊
    verticalOffset: 38,         // 🔧 額外垂直偏移（像素）
                                // 正數向下，負數向上
    horizontalOffset: 0,        // 🔧 額外水平偏移（像素）
                                // 正數向右，負數向左
  },
  
  // 大樓圖片配置（building.png）
  building: {
    imagePath: 'assets/building.png',
    widthScale: 1.5,
    aspectRatio: 1,
    verticalAlign: 'center',
    verticalOffset: 5,
    horizontalOffset: 0,
  },
  
  // 房子圖片配置（house.png）
  house: {
    imagePath: 'assets/house.png',
    widthScale: 1.2,
    aspectRatio: 1,
    verticalAlign: 'center',
    verticalOffset: 5,
    horizontalOffset: -1.8,
  },
  
  // 醫院圖片配置（hospital.png）
  hospital: {
    imagePath: 'assets/hospital.png',
    widthScale: 1.5,
    aspectRatio: 1,
    verticalAlign: 'center',
    verticalOffset: -8.5,
    horizontalOffset: -2.5,
  },
  
  // 壁壘圖片配置（fortress.png）
  fortress: {
    imagePath: 'assets/fortress.png',
    widthScale: 1.6,
    aspectRatio: 1,
    verticalAlign: 'center',
    verticalOffset: -8.5,
    horizontalOffset: -0,
  },
  
  // 組織圖片配置（org.png）
  organization: {
    imagePath: 'assets/org.png',
    widthScale: 1.2,
    aspectRatio: 1,
    verticalAlign: 'center',
    verticalOffset: 0,
    horizontalOffset: 1,
  },
  
  // 損壞區塊圖片配置（block.png）
  block: {
    imagePath: 'assets/block.png',
    widthScale: 1.5,
    aspectRatio: 1,
    verticalAlign: 'center',
    verticalOffset: 0,
    horizontalOffset: 0,
  }
};

// ==================== Icon 定義 ====================
const iconDefinitions = {
  'icon-main-city': `
    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
    <circle cx="12" cy="12" r="6" fill="#FFA500"/>
    <path d="M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z" fill="#FFD700"/>
  `,
  
  'icon-building': `
    <rect x="6" y="4" width="12" height="16" fill="#6B7280" stroke="#374151" stroke-width="1"/>
    <rect x="8" y="7" width="3" height="3" fill="#93C5FD"/>
    <rect x="13" y="7" width="3" height="3" fill="#93C5FD"/>
    <rect x="8" y="12" width="3" height="3" fill="#93C5FD"/>
    <rect x="13" y="12" width="3" height="3" fill="#93C5FD"/>
    <rect x="10" y="17" width="4" height="3" fill="#1F2937"/>
  `,
  
  'icon-house': `
    <path d="M12 3 L20 10 L20 20 L4 20 L4 10 Z" fill="#8B4513" stroke="#654321" stroke-width="1"/>
    <rect x="10" y="14" width="4" height="6" fill="#654321"/>
    <rect x="7" y="11" width="3" height="3" fill="#87CEEB"/>
    <rect x="14" y="11" width="3" height="3" fill="#87CEEB"/>
  `,
  
  'icon-hospital': `
    <rect x="5" y="7" width="14" height="14" fill="#DC2626" stroke="#991B1B" stroke-width="1"/>
    <path d="M12 9 L12 19 M7 14 L17 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  `,
  
  'icon-fortress': `
    <path d="M4 20 L4 10 L8 10 L8 8 L10 8 L10 10 L14 10 L14 8 L16 8 L16 10 L20 10 L20 20 Z" fill="#4B5563" stroke="#1F2937" stroke-width="1"/>
    <rect x="8" y="12" width="2" height="3" fill="#374151"/>
    <rect x="14" y="12" width="2" height="3" fill="#374151"/>
    <rect x="10" y="15" width="4" height="5" fill="#1F2937"/>
  `,
  
  'icon-organization': `
    <circle cx="12" cy="12" r="9" fill="#7C3AED" stroke="#5B21B6" stroke-width="1.5"/>
    <circle cx="12" cy="10" r="3" fill="#A78BFA"/>
    <path d="M6 18 Q6 14 12 14 Q18 14 18 18" fill="#A78BFA"/>
  `,
  
  'icon-block': `
    <rect x="3" y="3" width="18" height="18" fill="#3B3B3B" stroke="#1F1F1F" stroke-width="1.5"/>
    <path d="M3 3 L21 21 M21 3 L3 21" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"/>
  `
};

