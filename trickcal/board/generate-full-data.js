// 生成完整的角色數據
const fs = require('fs');
const path = require('path');

// 讀取角色圖片文件名
const charactersDir = path.join(__dirname, 'assets/characters');
const characterFiles = fs.readdirSync(charactersDir).filter(f => f.endsWith('.png'));
const characterNames = characterFiles.map(f => f.replace('.png', ''));

// 配置
const personalities = ["冷靜", "憂鬱", "活潑", "狂亂"];
const races = ["妖精", "龍族", "魔靈", "精靈", "獸人", "魔女", "幽靈", "???"];
const attackTypes = ["物理", "魔法"];
const deployRows = ["前排", "中排", "後排"];
const roles = ["輸出", "肉盾", "輔助"];
const cellTypes = ["attack", "crit", "hp", "critResist", "defense"];

// 生成角色數據
const characters = characterNames.map((name, index) => {
    // 隨機選擇屬性
    const personality = personalities[index % personalities.length];
    const race = races[index % races.length];
    const stars = (index % 3) + 1; // 1-3星
    const attackType = attackTypes[index % attackTypes.length];
    const deployRow = deployRows[index % deployRows.length];
    const role = roles[index % roles.length];
    
    // 隨機分配格子（每層2-3個格子）
    const getRandomCells = (count) => {
        const shuffled = [...cellTypes].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };
    
    return {
        name: name,
        en: name, // 預設英文名稱與中文名稱相同，需要手動修改
        personality: personality,
        stars: stars,
        attackType: attackType,
        deployRow: deployRow,
        role: role,
        race: race,
        boardTypes: {
            layer1: getRandomCells(2 + Math.floor(Math.random() * 2)),
            layer2: getRandomCells(2 + Math.floor(Math.random() * 2)),
            layer3: getRandomCells(2 + Math.floor(Math.random() * 2))
        }
    };
});

// 創建完整數據
const gameData = {
    characters: characters,
    boardConfig: {
        layer1: { name: "第一層", bonusPerCell: 0.5 },
        layer2: { name: "第二層", bonusPerCell: 0.8 },
        layer3: { name: "第三層", bonusPerCell: 1.0 }
    },
    cellTypes: {
        attack: { name: "攻擊力", color: "#ff6b6b", icon: "assets/icons/board_atk.png" },
        crit: { name: "暴擊", color: "#fab005", icon: "assets/icons/board_crit.png" },
        hp: { name: "HP", color: "#ff8787", icon: "assets/icons/board_hp.png" },
        critResist: { name: "暴擊抵抗", color: "#74c0fc", icon: "assets/icons/board_critResist.png" },
        defense: { name: "防禦力", color: "#da77f2", icon: "assets/icons/board_def.png" }
    },
    personalities: personalities,
    races: races,
    attackTypes: attackTypes,
    deployRows: deployRows,
    roles: roles
};

// 寫入文件
fs.writeFileSync(
    path.join(__dirname, 'data.json'),
    JSON.stringify(gameData, null, 2),
    'utf8'
);

console.log(`✓ 已生成 ${characters.length} 個角色的數據文件`);
console.log('✓ data.json 已更新');

