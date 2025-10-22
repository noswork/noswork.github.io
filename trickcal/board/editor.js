// 編輯器全局狀態
let gameData = null;
let currentEditingChar = null;
let currentTab = 'characters';
let currentImageData = null; // 儲存當前上傳的圖片資料

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadGameData();
    initializeEventListeners();
    renderCharacterList();
    loadConfigToForm();
    updateJSONPreview();
});

// 載入遊戲數據
function loadGameData() {
    const savedData = localStorage.getItem('trickcal_board_data');
    if (savedData) {
        try {
            gameData = JSON.parse(savedData);
        } catch (error) {
            console.error('讀取數據失敗:', error);
            gameData = createDefaultData();
        }
    } else {
        gameData = createDefaultData();
    }
}

// 創建默認數據
function createDefaultData() {
    return {
        characters: [],
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
        personalities: {
            "天真": { icon: "assets/icons/unit_personality_naive.png" },
            "冷靜": { icon: "assets/icons/unit_personality_cool.png" },
            "狂亂": { icon: "assets/icons/unit_personality_mad.png" },
            "活潑": { icon: "assets/icons/unit_personality_jolly.png" },
            "憂鬱": { icon: "assets/icons/unit_personality_gloomy.png" }
        },
        races: ["龍族", "精靈", "妖精", "獸人", "幽靈", "魔靈", "魔女", "???"],
        attackTypes: {
            "物理": { icon: "assets/icons/unit_attack_physic.png" },
            "魔法": { icon: "assets/icons/unit_attack_magic.png" }
        },
        deployRows: {
            "前排": { icon: "assets/icons/unit_position_front.png" },
            "中排": { icon: "assets/icons/unit_position_middle.png" },
            "後排": { icon: "assets/icons/unit_position_back.png" }
        },
        roles: ["輸出", "肉盾", "輔助"]
    };
}

// 保存遊戲數據
function saveGameData() {
    localStorage.setItem('trickcal_board_data', JSON.stringify(gameData));
    
    // 觸發跨頁面同步事件（使用 storage 事件）
    // 設置一個特殊的標記來通知其他頁面數據已更新
    localStorage.setItem('trickcal_board_data_timestamp', Date.now().toString());
    
    updateJSONPreview();
}

// 初始化事件監聽器
function initializeEventListeners() {
    // 標籤切換
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const tab = e.target.dataset.tab;
            currentTab = tab;
            document.getElementById(tab + 'Tab').classList.add('active');
            
            if (tab === 'importExport') {
                updateJSONPreview();
            }
        });
    });
    
    // 角色管理
    document.getElementById('addCharacterBtn').addEventListener('click', () => {
        currentEditingChar = null;
        openCharacterModal();
    });
    
    // 角色表單
    document.getElementById('characterForm').addEventListener('submit', handleCharacterSubmit);
    document.getElementById('cancelCharBtn').addEventListener('click', () => {
        document.getElementById('characterModal').classList.remove('active');
    });
    
    // 配置保存
    document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
    
    // 導入/導出
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    
    // 圖片上傳相關
    document.getElementById('uploadImageBtn').addEventListener('click', () => {
        document.getElementById('charImageInput').click();
    });
    document.getElementById('charImageInput').addEventListener('change', handleImageUpload);
    document.getElementById('removeImageBtn').addEventListener('click', removeImage);
    document.getElementById('imagePreview').addEventListener('click', () => {
        document.getElementById('charImageInput').click();
    });
    
    // 角色英文名稱變更時更新檔名提示
    document.getElementById('charNameEn').addEventListener('input', updateImageFilename);
}

// 渲染角色列表
function renderCharacterList() {
    const list = document.getElementById('characterList');
    if (!gameData || !gameData.characters || gameData.characters.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">尚無角色數據</p>';
        return;
    }
    
    list.innerHTML = gameData.characters.map(char => `
        <div class="character-item">
            <div class="character-item-avatar">
                <img src="assets/characters/${char.en}.png" 
                     alt="${char.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="character-item-fallback" style="display: none;">
                    ${char.name.charAt(0)}
                </div>
            </div>
            <div class="character-info">
                <h3>${char.name}${char.en ? ` (${char.en})` : ''}</h3>
                <p>${char.personality} · ${char.race} · ${char.stars}星 · ${char.attackType} · ${char.role}</p>
            </div>
            <div class="character-actions">
                <button class="btn btn-secondary btn-small" onclick="editCharacter('${char.name}')">✏️ 編輯</button>
                <button class="btn btn-danger btn-small" onclick="deleteCharacter('${char.name}')">🗑️ 刪除</button>
            </div>
        </div>
    `).join('');
}

// 打開角色模態框
function openCharacterModal() {
    const modal = document.getElementById('characterModal');
    const form = document.getElementById('characterForm');
    
    // 填充下拉選單
    populateCharacterForm();
    
    // 重置圖片狀態
    currentImageData = null;
    resetImagePreview();
    
    if (currentEditingChar) {
        document.getElementById('modalTitle').textContent = '編輯角色';
        const char = gameData.characters.find(c => c.name === currentEditingChar);
        if (char) {
            document.getElementById('charName').value = char.name;
            document.getElementById('charNameEn').value = char.en || '';
            document.getElementById('charPersonality').value = char.personality;
            document.getElementById('charStars').value = char.stars;
            document.getElementById('charAttackType').value = char.attackType;
            document.getElementById('charDeployRow').value = char.deployRow;
            document.getElementById('charRole').value = char.role;
            document.getElementById('charRace').value = char.race;
            
            // 設置格子配置
            document.querySelectorAll('.board-check').forEach(checkbox => {
                const layer = checkbox.dataset.layer;
                const type = checkbox.dataset.type;
                checkbox.checked = char.boardTypes[layer]?.includes(type) || false;
            });
            
            // 載入現有圖片
            loadExistingImage(char.en);
        }
    } else {
        document.getElementById('modalTitle').textContent = '新增角色';
        form.reset();
    }
    
    updateImageFilename();
    modal.classList.add('active');
}

// 填充角色表單下拉選單
function populateCharacterForm() {
    const selects = {
        'charPersonality': typeof gameData.personalities === 'object' && !Array.isArray(gameData.personalities)
            ? Object.keys(gameData.personalities)
            : gameData.personalities,
        'charAttackType': typeof gameData.attackTypes === 'object' && !Array.isArray(gameData.attackTypes)
            ? Object.keys(gameData.attackTypes)
            : gameData.attackTypes,
        'charDeployRow': typeof gameData.deployRows === 'object' && !Array.isArray(gameData.deployRows)
            ? Object.keys(gameData.deployRows)
            : gameData.deployRows,
        'charRole': gameData.roles,
        'charRace': gameData.races
    };
    
    for (const [id, options] of Object.entries(selects)) {
        const select = document.getElementById(id);
        select.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    }
}

// 處理角色提交
function handleCharacterSubmit(e) {
    e.preventDefault();
    
    const characterData = {
        name: document.getElementById('charName').value,
        en: document.getElementById('charNameEn').value,
        personality: document.getElementById('charPersonality').value,
        stars: parseInt(document.getElementById('charStars').value),
        attackType: document.getElementById('charAttackType').value,
        deployRow: document.getElementById('charDeployRow').value,
        role: document.getElementById('charRole').value,
        race: document.getElementById('charRace').value,
        boardTypes: {
            layer1: [],
            layer2: [],
            layer3: []
        }
    };
    
    // 收集格子配置
    document.querySelectorAll('.board-check:checked').forEach(checkbox => {
        const layer = checkbox.dataset.layer;
        const type = checkbox.dataset.type;
        characterData.boardTypes[layer].push(type);
    });
    
    if (currentEditingChar) {
        // 編輯現有角色
        const index = gameData.characters.findIndex(c => c.name === currentEditingChar);
        if (index !== -1) {
            gameData.characters[index] = characterData;
        }
    } else {
        // 新增角色（檢查名稱是否重複）
        const existingChar = gameData.characters.find(c => c.name === characterData.name);
        if (existingChar) {
            alert('已存在同名角色！請使用不同的名稱。');
            return;
        }
        gameData.characters.push(characterData);
    }
    
    saveGameData();
    renderCharacterList();
    
    // 如果有上傳圖片，自動下載
    if (currentImageData) {
        downloadImage();
    }
    
    document.getElementById('characterModal').classList.remove('active');
    
    // 觸發數據更新事件，通知主應用重新載入
    window.dispatchEvent(new CustomEvent('gameDataUpdated', { detail: { gameData } }));
}

// 編輯角色
function editCharacter(name) {
    currentEditingChar = name;
    openCharacterModal();
}

// 刪除角色
function deleteCharacter(name) {
    if (!confirm(`確定要刪除「${name}」嗎？`)) return;
    
    gameData.characters = gameData.characters.filter(c => c.name !== name);
    saveGameData();
    renderCharacterList();
    
    // 觸發數據更新事件，通知主應用重新載入
    window.dispatchEvent(new CustomEvent('gameDataUpdated', { detail: { gameData } }));
}

// 載入配置到表單
function loadConfigToForm() {
    if (!gameData) return;
    
    // 處理可能是物件或陣列的數據
    const personalitiesArr = typeof gameData.personalities === 'object' && !Array.isArray(gameData.personalities)
        ? Object.keys(gameData.personalities)
        : gameData.personalities;
    const attackTypesArr = typeof gameData.attackTypes === 'object' && !Array.isArray(gameData.attackTypes)
        ? Object.keys(gameData.attackTypes)
        : gameData.attackTypes;
    const deployRowsArr = typeof gameData.deployRows === 'object' && !Array.isArray(gameData.deployRows)
        ? Object.keys(gameData.deployRows)
        : gameData.deployRows;
    
    document.getElementById('personalitiesInput').value = personalitiesArr.join(',');
    document.getElementById('racesInput').value = gameData.races.join(',');
    document.getElementById('attackTypesInput').value = attackTypesArr.join(',');
    document.getElementById('deployRowsInput').value = deployRowsArr.join(',');
    document.getElementById('rolesInput').value = gameData.roles.join(',');
}

// 保存配置
function saveConfig() {
    // 將輸入轉換為物件格式（帶圖標）
    const personalities = document.getElementById('personalitiesInput').value.split(',').map(s => s.trim()).filter(s => s);
    const attackTypes = document.getElementById('attackTypesInput').value.split(',').map(s => s.trim()).filter(s => s);
    const deployRows = document.getElementById('deployRowsInput').value.split(',').map(s => s.trim()).filter(s => s);
    
    // 保持圖標路徑（如果已存在）或使用默認值
    gameData.personalities = {};
    personalities.forEach(p => {
        if (gameData.personalities[p]) {
            gameData.personalities[p] = gameData.personalities[p];
        } else {
            gameData.personalities[p] = { icon: `assets/icons/unit_personality_${p}.png` };
        }
    });
    
    gameData.attackTypes = {};
    attackTypes.forEach(a => {
        if (gameData.attackTypes[a]) {
            gameData.attackTypes[a] = gameData.attackTypes[a];
        } else {
            gameData.attackTypes[a] = { icon: `assets/icons/unit_attack_${a}.png` };
        }
    });
    
    gameData.deployRows = {};
    deployRows.forEach(d => {
        if (gameData.deployRows[d]) {
            gameData.deployRows[d] = gameData.deployRows[d];
        } else {
            gameData.deployRows[d] = { icon: `assets/icons/unit_position_${d}.png` };
        }
    });
    
    gameData.races = document.getElementById('racesInput').value.split(',').map(s => s.trim()).filter(s => s);
    gameData.roles = document.getElementById('rolesInput').value.split(',').map(s => s.trim()).filter(s => s);
    
    saveGameData();
    alert('配置已保存！');
    
    // 觸發數據更新事件，通知主應用重新載入
    window.dispatchEvent(new CustomEvent('gameDataUpdated', { detail: { gameData } }));
}

// 導出數據
function exportData() {
    // 直接導出 gameData，格式與 data.json 相同
    const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';  // 直接命名為 data.json，方便替換
    a.click();
    URL.revokeObjectURL(url);
    
    alert('數據已導出為 data.json\n\n你可以用這個文件替換原本的 data.json 來永久保存修改。');
}

// 導入數據
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            // 支援兩種格式：直接的 gameData 或包含 gameData 的對象
            let importedData = null;
            if (data.gameData) {
                // 舊格式（包含 gameData）
                importedData = data.gameData;
            } else if (data.characters && data.boardConfig) {
                // 新格式（直接是 gameData，與 data.json 相同）
                importedData = data;
            }
            
            if (importedData) {
                if (confirm('確定要導入這個數據嗎？這會覆蓋現有的遊戲數據。')) {
                    gameData = importedData;
                    saveGameData();
                    renderCharacterList();
                    loadConfigToForm();
                    updateJSONPreview();
                    alert('數據導入成功！');
                }
            } else {
                alert('無效的數據格式！');
            }
        } catch (error) {
            alert('數據解析失敗：' + error.message);
        }
    };
    reader.readAsText(file);
    
    // 重置輸入
    e.target.value = '';
}

// 清除所有數據
function clearAllData() {
    if (!confirm('確定要清除所有數據嗎？這個操作無法撤銷！')) return;
    if (!confirm('真的確定嗎？所有角色和配置都會被刪除！')) return;
    
    gameData = createDefaultData();
    saveGameData();
    
    // 同時清除用戶進度
    localStorage.removeItem('trickcal_board_progress');
    
    renderCharacterList();
    loadConfigToForm();
    updateJSONPreview();
    alert('所有數據已清除！');
    
    // 觸發數據更新事件，通知主應用重新載入
    window.dispatchEvent(new CustomEvent('gameDataUpdated', { detail: { gameData } }));
}

// 更新 JSON 預覽
function updateJSONPreview() {
    const preview = document.getElementById('jsonPreview');
    if (preview && gameData) {
        preview.value = JSON.stringify(gameData, null, 2);
    }
}

// 圖片處理函數
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 檢查檔案類型
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
        alert('請選擇 PNG、JPG 或 WebP 格式的圖片！');
        return;
    }
    
    // 檢查檔案大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案過大！請選擇小於 5MB 的圖片。');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        currentImageData = event.target.result;
        displayImagePreview(currentImageData);
    };
    reader.readAsDataURL(file);
    
    // 重置輸入
    e.target.value = '';
}

function displayImagePreview(imageData) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${imageData}" alt="角色圖片預覽">`;
    
    // 顯示移除按鈕
    document.getElementById('removeImageBtn').style.display = 'inline-block';
}

function resetImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `
        <div class="image-preview-placeholder">
            <span>📷</span>
            <p>點擊上傳圖片</p>
            <small>建議尺寸: 200x200 px</small>
        </div>
    `;
    document.getElementById('removeImageBtn').style.display = 'none';
}

function removeImage() {
    currentImageData = null;
    resetImagePreview();
}

function loadExistingImage(charEnName) {
    // 嘗試載入現有角色圖片
    const img = new Image();
    img.onload = () => {
        displayImagePreview(`assets/characters/${charEnName}.png`);
    };
    img.onerror = () => {
        // 圖片不存在，保持預設狀態
        resetImagePreview();
    };
    img.src = `assets/characters/${charEnName}.png`;
}

function updateImageFilename() {
    const charNameEn = document.getElementById('charNameEn').value.trim();
    const filename = charNameEn ? `${charNameEn}.png` : '英文名稱.png';
    document.getElementById('imageFilename').textContent = filename;
}

function downloadImage() {
    if (!currentImageData) return;
    
    const charNameEn = document.getElementById('charNameEn').value.trim();
    if (!charNameEn) {
        alert('請先輸入角色英文名稱！');
        return;
    }
    
    // 建立下載連結
    const link = document.createElement('a');
    link.href = currentImageData;
    link.download = `${charNameEn}.png`;
    link.click();
    
    alert(`✅ 圖片已下載！\n\n請將 ${charNameEn}.png 手動放入以下資料夾：\nassets/characters/\n\n這樣角色卡片就會顯示圖片了。`);
}

// 讓函數可以從 HTML 調用
window.editCharacter = editCharacter;
window.deleteCharacter = deleteCharacter;

