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
 * Stronghold Hex Map - Main Logic
 * 六邊形地圖主邏輯文件
 * 
 * 依賴: config.js (必須先載入)
 */

(() => {
  "use strict";

  const svgNS = "http://www.w3.org/2000/svg";

  // Use configuration from config.js
  const config = {
    r: mapConfig.r,
    maxEven: mapConfig.maxEven,
    maxOdd: mapConfig.maxOdd,
    padding: mapConfig.padding,
    minScale: mapConfig.minScale,
    maxScale: mapConfig.maxScale,
  };

  // Derived geometric constants
  // For flat-top hexagons: width w = 2r, height h = sqrt(3) * r
  config.w = config.r * 2;
  config.h = Math.sqrt(3) * config.r;
  // Horizontal step between centers: dx = 3/2 * r
  config.dx = 1.5 * config.r;
  // Vertical step between rows: dy = h
  config.dy = config.h;

  const mapRoot = document.getElementById("map-root");
  const svg = document.getElementById("hex-map");
  const hexLayer = document.getElementById("hex-layer");
  const markLayer = document.getElementById("mark-layer");
  const buildingLayer = document.getElementById("building-layer");
  const labelLayer = document.getElementById("label-layer");

  const cellMap = new Map();
  const highlighted = new Map();
  const markedCells = new Map();
  let selectedColor = '#ff6961';
  let markMode = 'add'; // 'add' or 'remove'
  const eventHandlers = new Map();
  const mainCityArea = specialAreas && specialAreas.mainCityArea ? specialAreas.mainCityArea : null;
  
  // 防抖保存狀態的計時器
  let saveStateDebounce = null;

  const state = {
    scale: 1,
    translate: { x: 0, y: 0 },
    minScale: config.minScale,
    maxScale: config.maxScale,
    isPanning: false,
    dragging: false,
    lastPointer: { x: 0, y: 0 },
    pointers: new Map(),
    pinch: {
      active: false,
      startDistance: 0,
      startScale: 1,
      center: { x: 0, y: 0 },
    },
  };

  // ==================== View State Persistence ====================

  const VIEW_STATE_KEY = 'stronghold-hex-map-view';
  const MARKS_STATE_KEY = 'stronghold-hex-map-marks';
  const MARK_COLOR_KEY = 'stronghold-hex-map-mark-color';
  const MARK_MODE_KEY = 'stronghold-hex-map-mark-mode';

  function saveViewState() {
    try {
      const viewState = {
        scale: state.scale,
        translateX: state.translate.x,
        translateY: state.translate.y,
        timestamp: Date.now()
      };
      localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(viewState));
    } catch (error) {
      // localStorage may be unavailable in some contexts (e.g., private browsing)
      console.warn('無法保存視角狀態:', error);
    }
  }

  function loadViewState() {
    try {
      const saved = localStorage.getItem(VIEW_STATE_KEY);
      if (!saved) return null;
      
      const viewState = JSON.parse(saved);
      
      // 驗證數據有效性
      if (typeof viewState.scale !== 'number' || 
          typeof viewState.translateX !== 'number' || 
          typeof viewState.translateY !== 'number') {
        return null;
      }
      
      return viewState;
    } catch (error) {
      console.warn('無法加載視角狀態:', error);
      return null;
    }
  }

  function saveMarksState() {
    try {
      const marksArray = Array.from(markedCells.entries()).map(([key, data]) => ({
        key,
        x: data.x,
        y: data.y,
        color: data.color
      }));
      localStorage.setItem(MARKS_STATE_KEY, JSON.stringify(marksArray));
    } catch (error) {
      console.warn('無法保存標記狀態:', error);
    }
  }

  function loadMarksState() {
    try {
      const saved = localStorage.getItem(MARKS_STATE_KEY);
      if (!saved) return null;
      
      const marksArray = JSON.parse(saved);
      
      // 驗證數據有效性
      if (!Array.isArray(marksArray)) {
        return null;
      }
      
      return marksArray;
    } catch (error) {
      console.warn('無法加載標記狀態:', error);
      return null;
    }
  }

  function saveMarkColorState(color) {
    try {
      localStorage.setItem(MARK_COLOR_KEY, color);
    } catch (error) {
      console.warn('無法保存顏色設定:', error);
    }
  }

  function loadMarkColorState() {
    try {
      return localStorage.getItem(MARK_COLOR_KEY);
    } catch (error) {
      console.warn('無法加載顏色設定:', error);
      return null;
    }
  }

  function saveMarkModeState(mode) {
    try {
      localStorage.setItem(MARK_MODE_KEY, mode);
    } catch (error) {
      console.warn('無法保存標記模式:', error);
    }
  }

  function loadMarkModeState() {
    try {
      return localStorage.getItem(MARK_MODE_KEY);
    } catch (error) {
      console.warn('無法加載標記模式:', error);
      return null;
    }
  }

  function restoreSavedMarks() {
    const savedMarks = loadMarksState();
    if (!savedMarks || savedMarks.length === 0) {
      console.log('沒有保存的標記數據');
      return;
    }

    let restoredCount = 0;
    savedMarks.forEach(({ x, y, color }) => {
      const key = keyFor(x, y);
      const entry = cellMap.get(key);
      
      if (entry && entry.markPolygon) {
        const normalizedColor = normalizeHexColor(color);
        const fillColor = colorWithAlpha(normalizedColor, 0.32);
        const strokeColor = colorWithAlpha(normalizedColor, 0.94);
        
        entry.markPolygon.classList.add('marked');
        entry.markPolygon.style.fill = fillColor;
        entry.markPolygon.style.stroke = strokeColor;
        
        markedCells.set(key, { x, y, color: normalizedColor, fillColor, strokeColor });
        restoredCount++;
      }
    });

    console.log(`已恢復 ${restoredCount} 個標記`);
  }

  // ==================== Initialization ====================

  const mapBounds = calculateMapBounds();
  setupInitialView();
  generateGrid();
  setupIconSymbols();
  placeAllBuildingImages();
  restoreSavedMarks(); // 恢復保存的標記
  applyTransform();
  setupInteractions();
  setupBlockMarkingPanel();

  // ==================== Public API ====================

  window.map = {
    config,
    getBounds: () => ({ ...mapBounds }),
    worldToScreen,
    screenToWorld,
    pick,
    highlight,
    unhighlight,
    setZoom,
    panBy,
    setPan,
    neighbors,
    inBounds,
    toggleLabels,
    getBuildingData: () => ({ ...buildingData }),
    getBuildingAt: (x, y) => {
      for (const [type, coords] of Object.entries(buildingData)) {
        if (coords.some(([bx, by]) => bx === x && by === y)) {
          return type;
        }
      }
      return null;
    },
    getSpecialAreas: () => specialAreas ? { ...specialAreas } : {},
    isInMainCityArea,
    updateMainCityBadge: (imagePath) => {
      const mainCityCoord = buildingData.mainCity[0];
      if (!mainCityCoord) return;
      const [x, y] = mainCityCoord;
      
      // 主城圖片現在在 buildingLayer 中
      const badgeGroup = buildingLayer.querySelector('.hex-badge-group');
      if (badgeGroup) {
        const badge = badgeGroup.querySelector('.hex-badge');
        if (badge) {
          badge.setAttribute('href', imagePath);
        }
      }
    },
    on,
    off,
    markCell,
    clearMarks,
    getMarkedCells: () => new Map(markedCells),
    setMarkColor,
  };

  // ==================== Setup Functions ====================

  function setupInitialView() {
    // 嘗試從 localStorage 恢復用戶視角
    const savedView = loadViewState();
    
    if (savedView) {
      // 恢復保存的視角
      state.scale = clamp(savedView.scale, state.minScale, state.maxScale);
      state.translate.x = savedView.translateX;
      state.translate.y = savedView.translateY;
      console.log('已恢復用戶視角:', savedView);
    } else {
      // 首次訪問，使用默認視角
      const viewportWidth = window.innerWidth || mapBounds.width;
      const viewportHeight = window.innerHeight || mapBounds.height;
      const idealScale = Math.min(
        viewportWidth / (mapBounds.width + config.padding * 2),
        viewportHeight / (mapBounds.height + config.padding * 2)
      );

      const clampedScale = clamp(
        isFinite(idealScale) ? idealScale : 1,
        state.minScale,
        state.maxScale
      );

      state.scale = clampedScale;
      // Ensure (0,0) hex is fully visible by offsetting left/top by its half extents plus padding
      state.translate.x = config.padding + config.r * state.scale;
      state.translate.y = config.padding + (config.h / 2) * state.scale;
    }
  }

  function calculateMapBounds() {
    const minX = -config.r;
    const maxX = config.maxEven.x * config.dx + config.r;
    const minY = -config.h / 2;
    const bottomEvenCenter = config.maxEven.y * (config.dy / 2);
    const bottomOddCenter = config.maxOdd.y * (config.dy / 2);
    const maxCenterY = Math.max(bottomEvenCenter, bottomOddCenter);
    const maxY = maxCenterY + config.h / 2;
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  function setupIconSymbols() {
    const defs = svg.querySelector('defs') || document.createElementNS(svgNS, 'defs');
    if (!svg.querySelector('defs')) {
      svg.insertBefore(defs, svg.firstChild);
    }

    // Create symbol for each icon type
    for (const [iconId, iconContent] of Object.entries(iconDefinitions)) {
      const symbol = document.createElementNS(svgNS, 'symbol');
      symbol.id = iconId;
      symbol.setAttribute('viewBox', '0 0 24 24');
      symbol.innerHTML = iconContent;
      defs.appendChild(symbol);
    }

    console.log(`已載入 ${Object.keys(iconDefinitions).length} 個建築物圖標`);
  }

  // ==================== Grid Generation ====================

  function generateGrid() {
    const hexFragment = document.createDocumentFragment();
    const markFragment = document.createDocumentFragment();
    const hexOffsets = computeHexOffsets();
    const pointsAttr = hexOffsets
      .map(([x, y]) => `${x},${y}`)
      .join(" ");

    for (let y = 0; y <= config.maxOdd.y; y += 1) {
      const startX = y % 2 === 0 ? 0 : 1;
      const maxX = y % 2 === 0 ? config.maxEven.x : config.maxOdd.x;
      for (let x = startX; x <= maxX; x += 2) {
        if (!inBounds(x, y)) continue;
        const center = computeCenter(x, y);
        const { hexGroup, markPolygon } = createHexGroup(x, y, center, pointsAttr);
        hexFragment.appendChild(hexGroup);
        if (markPolygon) {
          markFragment.appendChild(markPolygon);
        }
      }
    }

    hexLayer.appendChild(hexFragment);
    if (markLayer) {
      markLayer.appendChild(markFragment);
    }
    
    // 顯示主城區域信息
    if (specialAreas && specialAreas.mainCityArea) {
      console.log(`主城區域已標記 (中心: ${specialAreas.mainCityArea.center}, 包含 ${specialAreas.mainCityArea.cells.length} 個格子)`);
    }
  }

  function computeHexOffsets() {
    const halfH = config.h / 2;
    const halfR = config.r / 2;
    // Vertex list (clockwise from rightmost point) relative to center
    return [
      [config.r, 0],
      [halfR, halfH],
      [-halfR, halfH],
      [-config.r, 0],
      [-halfR, -halfH],
      [halfR, -halfH],
    ];
  }

  function createHexGroup(x, y, center, pointsAttr) {
    const group = document.createElementNS(svgNS, "g");
    group.classList.add("hex-group");
    
    // 檢查是否屬於主城區域
    const inMainCity = isInMainCityArea(x, y);
    if (inMainCity) {
      group.classList.add("main-city-area");
    }
    
    group.dataset.x = String(x);
    group.dataset.y = String(y);
    group.setAttribute("transform", `translate(${center.cx}, ${center.cy})`);

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.classList.add("hex-polygon");
    polygon.setAttribute("data-x", String(x));
    polygon.setAttribute("data-y", String(y));
    polygon.setAttribute("points", pointsAttr);

    group.appendChild(polygon);

    // 創建標記多邊形（放在獨立的標記圖層）
    let markPolygon = null;
    if (markLayer) {
      markPolygon = document.createElementNS(svgNS, "polygon");
      markPolygon.classList.add("hex-mark");
      markPolygon.setAttribute("data-x", String(x));
      markPolygon.setAttribute("data-y", String(y));
      markPolygon.setAttribute("points", pointsAttr);
      markPolygon.setAttribute("transform", `translate(${center.cx}, ${center.cy})`);
    }

    // 創建標籤（放在獨立的標籤圖層）
    // 主城區域只在中心點顯示標籤
    let labelGroup = null;
    let label = null;
    
    const isMainCityCenter = inMainCity && 
                              specialAreas && 
                              specialAreas.mainCityArea &&
                              x === specialAreas.mainCityArea.center[0] && 
                              y === specialAreas.mainCityArea.center[1];
    
    // 只為非主城格子或主城中心點創建標籤
    if (!inMainCity || isMainCityCenter) {
      labelGroup = document.createElementNS(svgNS, "g");
      labelGroup.classList.add("hex-label-group");
      labelGroup.setAttribute("transform", `translate(${center.cx}, ${center.cy})`);
      labelGroup.dataset.x = String(x);
      labelGroup.dataset.y = String(y);
      
      if (isMainCityCenter) {
        labelGroup.classList.add("main-city-center-label");
      }

      label = document.createElementNS(svgNS, "text");
      label.classList.add("hex-label");
      label.textContent = `(${x},${y})`;

      labelGroup.appendChild(label);
      labelLayer.appendChild(labelGroup);
    }

    cellMap.set(keyFor(x, y), {
      group,
      polygon,
      markPolygon,
      label,
      labelGroup,
      center,
    });

    return { hexGroup: group, markPolygon };
  }

  function isInMainCityArea(x, y) {
    // 檢查座標是否在主城區域內
    if (!specialAreas || !specialAreas.mainCityArea) return false;
    
    return specialAreas.mainCityArea.cells.some(([cx, cy]) => cx === x && cy === y);
  }

  function computeCenter(x, y) {
    const cx = x * config.dx;
    const cy = y * (config.dy / 2);
    // With x,y sharing parity, odd rows (x,y odd) naturally sit midway between
    // adjacent even rows because y increases in single steps
    return { cx, cy };
  }

  // ==================== Building Placement ====================

  function placeAllBuildingImages() {
    for (const [buildingType, coordinates] of Object.entries(buildingData)) {
      const cfg = buildingConfig[buildingType];
      
      if (!cfg) {
        console.warn(`No configuration found for building type: ${buildingType}`);
        continue;
      }

      let placedCount = 0;

      for (const [x, y] of coordinates) {
        if (!inBounds(x, y)) {
          console.warn(`Coordinates (${x},${y}) for ${buildingType} are out of bounds`);
          continue;
        }

        const key = keyFor(x, y);
        const cell = cellMap.get(key);
        
        if (!cell) {
          console.warn(`Cell not found at (${x},${y}) for ${buildingType}`);
          continue;
        }

        // 創建包含位置變換的 group
        const buildingGroup = document.createElementNS(svgNS, "g");
        buildingGroup.classList.add(`hex-${buildingType}-group`);
        buildingGroup.setAttribute("transform", `translate(${cell.center.cx}, ${cell.center.cy})`);
        buildingGroup.dataset.x = String(x);
        buildingGroup.dataset.y = String(y);

        // ===== 使用配置區的設定計算圖片大小和位置 =====
        
        // 計算寬度和高度
        const imageWidth = config.dx * cfg.widthScale;
        const imageHeight = imageWidth * cfg.aspectRatio;
        
        // 計算垂直位置
        let imageY;
        switch(cfg.verticalAlign) {
          case 'bottom':
            imageY = config.h / 2 - imageHeight; // 底部對齊
            break;
          case 'center':
            imageY = -imageHeight / 2; // 居中
            break;
          case 'top':
            imageY = -config.h / 2; // 頂部對齊
            break;
          default:
            imageY = -imageHeight / 2; // 預設居中
        }
        imageY += cfg.verticalOffset; // 加上額外偏移
        
        // 計算水平位置
        const imageX = -imageWidth / 2 + cfg.horizontalOffset;
        // ==============================================

        // Create the building image
        const buildingImage = document.createElementNS(svgNS, "image");
        buildingImage.setAttribute("href", cfg.imagePath);
        buildingImage.classList.add("hex-icon");
        if (buildingType === 'mainCity') {
          buildingImage.classList.add("hex-badge");
        }
        buildingImage.setAttribute("x", imageX);
        buildingImage.setAttribute("y", imageY);
        buildingImage.setAttribute("width", imageWidth);
        buildingImage.setAttribute("height", imageHeight);
        buildingImage.setAttribute("preserveAspectRatio", "xMidYMid meet");
        buildingImage.dataset.buildingType = buildingType;

        buildingGroup.appendChild(buildingImage);
        // 將建築圖片添加到獨立的建築物圖層（在網格上方）
        buildingLayer.appendChild(buildingGroup);
        
        placedCount++;
      }
      
      console.log(`已放置 ${placedCount} 個 ${buildingType} 圖片`);
    }
  }

  // ==================== Interaction Handlers ====================

  function setupInteractions() {
    svg.addEventListener("pointerdown", handlePointerDown);
    svg.addEventListener("pointermove", handlePointerMove);
    svg.addEventListener("pointerup", handlePointerUpOrCancel);
    svg.addEventListener("pointercancel", handlePointerUpOrCancel);
    svg.addEventListener("wheel", handleWheel, { passive: false });
    svg.addEventListener("click", handleClick);
    svg.addEventListener("contextmenu", handleContextMenu);
    svg.addEventListener("mouseover", handleMouseOver);
    svg.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("resize", handleResize);
  }

  function handleMouseOver(event) {
    const group = event.target.closest?.(".hex-group");
    if (!group) return;
    
    const x = Number(group.dataset.x);
    const y = Number(group.dataset.y);
    
    // 檢查是否為損壞區塊
    let isBlock = false;
    if (buildingData.block) {
      isBlock = buildingData.block.some(([bx, by]) => bx === x && by === y);
    }
    
    // 如果是損壞區塊，不執行任何 hover 效果
    if (isBlock) {
      return;
    }
    
    // 如果是主城區域，高亮整個區域並只顯示中心點標籤
    if (isInMainCityArea(x, y) && specialAreas && specialAreas.mainCityArea) {
      const [centerX, centerY] = specialAreas.mainCityArea.center;
      
      // 高亮所有主城區域的六邊形
      specialAreas.mainCityArea.cells.forEach(([cx, cy]) => {
        const key = keyFor(cx, cy);
        const cell = cellMap.get(key);
        if (cell && cell.group) {
          cell.group.classList.add("area-hover");
        }
      });
      
      // 只顯示中心點的標籤
      const centerKey = keyFor(centerX, centerY);
      const centerCell = cellMap.get(centerKey);
      if (centerCell && centerCell.labelGroup) {
        centerCell.labelGroup.classList.add("force-visible");
      }
    } else {
      // 普通格子，只顯示自己的標籤
      const key = keyFor(x, y);
      const cell = cellMap.get(key);
      if (cell && cell.labelGroup) {
        cell.labelGroup.classList.add("force-visible");
      }
    }
  }

  function handleMouseOut(event) {
    const group = event.target.closest?.(".hex-group");
    if (!group) return;
    
    const x = Number(group.dataset.x);
    const y = Number(group.dataset.y);
    
    // 如果是主城區域，取消高亮並隱藏標籤
    if (isInMainCityArea(x, y) && specialAreas && specialAreas.mainCityArea) {
      const [centerX, centerY] = specialAreas.mainCityArea.center;
      
      // 取消所有主城區域六邊形的高亮
      specialAreas.mainCityArea.cells.forEach(([cx, cy]) => {
        const key = keyFor(cx, cy);
        const cell = cellMap.get(key);
        if (cell && cell.group) {
          cell.group.classList.remove("area-hover");
        }
      });
      
      // 隱藏中心點的標籤
      const centerKey = keyFor(centerX, centerY);
      const centerCell = cellMap.get(centerKey);
      if (centerCell && centerCell.labelGroup) {
        centerCell.labelGroup.classList.remove("force-visible");
      }
    } else {
      // 普通格子，只隱藏自己的標籤
      const key = keyFor(x, y);
      const cell = cellMap.get(key);
      if (cell && cell.labelGroup) {
        cell.labelGroup.classList.remove("force-visible");
      }
    }
  }

  function handlePointerDown(event) {
    svg.setPointerCapture(event.pointerId);
    state.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (state.pointers.size === 1) {
      state.isPanning = true;
      state.dragging = false;
      state.lastPointer.x = event.clientX;
      state.lastPointer.y = event.clientY;
      svg.classList.add("dragging");
    } else if (state.pointers.size === 2) {
      state.isPanning = false;
      state.dragging = true;
      initPinch();
    }
  }

  function handlePointerMove(event) {
    if (!state.pointers.has(event.pointerId)) {
      return;
    }

    state.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (state.pointers.size === 1 && state.isPanning) {
      const dx = event.clientX - state.lastPointer.x;
      const dy = event.clientY - state.lastPointer.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        state.dragging = true;
      }
      state.translate.x += dx;
      state.translate.y += dy;
      state.lastPointer.x = event.clientX;
      state.lastPointer.y = event.clientY;
      applyTransform();
    } else if (state.pointers.size === 2) {
      updatePinch();
    }
  }

  function handlePointerUpOrCancel(event) {
    state.pointers.delete(event.pointerId);
    svg.releasePointerCapture(event.pointerId);
    if (state.pointers.size === 0) {
      state.isPanning = false;
      state.pinch.active = false;
      svg.classList.remove("dragging");
    } else if (state.pointers.size === 1) {
      const remaining = state.pointers.values().next().value;
      state.lastPointer.x = remaining.x;
      state.lastPointer.y = remaining.y;
      state.isPanning = true;
      state.pinch.active = false;
    }
    setTimeout(() => {
      state.dragging = false;
    }, 50);
  }

  function initPinch() {
    const pointers = Array.from(state.pointers.values());
    const [p1, p2] = pointers;
    state.pinch.active = true;
    state.pinch.startDistance = distance(p1, p2);
    state.pinch.startScale = state.scale;
    state.pinch.center = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  function updatePinch() {
    const pointers = Array.from(state.pointers.values());
    if (pointers.length < 2) return;
    const [p1, p2] = pointers;
    const currentDistance = distance(p1, p2);
    if (!state.pinch.active || state.pinch.startDistance === 0) {
      initPinch();
      return;
    }
    const scaleFactor = currentDistance / state.pinch.startDistance;
    const targetScale = clamp(
      state.pinch.startScale * scaleFactor,
      state.minScale,
      state.maxScale
    );
    setZoom(targetScale, state.pinch.center);
  }

  function handleWheel(event) {
    event.preventDefault();
    const baseIntensity = 1.08;
    const preciseIntensity = 1.04;
    const zoomIntensity = event.metaKey || event.ctrlKey ? preciseIntensity : baseIntensity;
    const direction = event.deltaY < 0 ? zoomIntensity : 1 / zoomIntensity;
    const targetScale = clamp(
      state.scale * direction,
      state.minScale,
      state.maxScale
    );
    setZoom(targetScale, { x: event.clientX, y: event.clientY });
  }

  function handleClick(event) {
    if (state.dragging) {
      return;
    }
    
    // 左鍵點擊 - 添加標記
    let group = event.target.closest?.(".hex-group");
    let x;
    let y;

    if (group) {
      x = Number(group.dataset.x);
      y = Number(group.dataset.y);
    } else {
      const picked = pick(event.clientX, event.clientY);
      if (!picked) {
        return;
      }
      x = picked.x;
      y = picked.y;
      const entry = cellMap.get(keyFor(x, y));
      group = entry?.group ?? null;
    }
    
    // Check if this cell has a building
    let buildingType = null;
    for (const [type, coords] of Object.entries(buildingData)) {
      if (coords.some(([bx, by]) => bx === x && by === y)) {
        buildingType = type;
        break;
      }
    }
    
    // 如果是損壞區塊，不執行任何操作
    if (buildingType === 'block') {
      return;
    }
    
    const detail = {
      x,
      y,
      buildingType,
      originalEvent: event
    };
    
    emit("cellclick", detail);
    svg.dispatchEvent(
      new CustomEvent("map:cellclick", {
        detail,
        bubbles: true,
      })
    );

    // 左鍵點擊：添加標記
    const cellsToMark = collectMarkingCells(x, y);
    applyColorToCells(cellsToMark, selectedColor);
  }

  function handleContextMenu(event) {
    event.preventDefault(); // 阻止瀏覽器默認右鍵菜單
    
    if (state.dragging) {
      return;
    }
    
    // 右鍵點擊 - 清除標記
    let group = event.target.closest?.(".hex-group");
    let x;
    let y;

    if (group) {
      x = Number(group.dataset.x);
      y = Number(group.dataset.y);
    } else {
      const picked = pick(event.clientX, event.clientY);
      if (!picked) {
        return;
      }
      x = picked.x;
      y = picked.y;
      const entry = cellMap.get(keyFor(x, y));
      group = entry?.group ?? null;
    }
    
    // Check if this cell has a building
    let buildingType = null;
    for (const [type, coords] of Object.entries(buildingData)) {
      if (coords.some(([bx, by]) => bx === x && by === y)) {
        buildingType = type;
        break;
      }
    }
    
    // 如果是損壞區塊，不執行任何操作
    if (buildingType === 'block') {
      return;
    }

    // 右鍵點擊：清除標記
    const cellsToMark = collectMarkingCells(x, y);
    cellsToMark.forEach(cell => {
      const key = keyFor(cell.x, cell.y);
      if (markedCells.has(key)) {
        clearMarkedCell(key);
      }
    });
  }

  function handleResize() {
    applyTransform();
  }

  function setupBlockMarkingPanel() {
    const panel = document.getElementById('control-panel');
    const toggleButton = document.getElementById('panel-toggle');
    if (!panel || !toggleButton) return;

    // 面板開關狀態
    let isPanelOpen = true;

    // 切換面板顯示/隱藏
    toggleButton.addEventListener('click', () => {
      isPanelOpen = !isPanelOpen;
      
      if (isPanelOpen) {
        panel.classList.remove('panel-hidden');
        toggleButton.classList.add('panel-open');
        toggleButton.setAttribute('aria-label', '關閉功能面板');
        toggleButton.setAttribute('title', '關閉功能面板');
      } else {
        panel.classList.add('panel-hidden');
        toggleButton.classList.remove('panel-open');
        toggleButton.setAttribute('aria-label', '開啟功能面板');
        toggleButton.setAttribute('title', '開啟功能面板');
      }
    });

    const colorInputs = panel.querySelectorAll('input[name="block-color"]');
    const customInput = panel.querySelector('#block-color-custom');
    const clearButton = panel.querySelector('#block-clear');
    const exportButton = panel.querySelector('#map-export');

    // 恢復保存的顏色設定
    const savedColor = loadMarkColorState();
    if (savedColor) {
      selectedColor = savedColor;
      
      // 檢查是否為預設顏色
      let isPresetColor = false;
      colorInputs.forEach((input) => {
        if (input.value === savedColor) {
          input.checked = true;
          isPresetColor = true;
        }
      });
      
      // 如果不是預設顏色，設置為自訂顏色
      if (!isPresetColor && customInput) {
        const customRadio = panel.querySelector('input[name="block-color"][value="custom"]');
        if (customRadio instanceof HTMLInputElement) {
          customRadio.checked = true;
        }
        customInput.value = savedColor;
        const customSwatch = customInput.closest('.color-swatch');
        if (customSwatch instanceof HTMLElement) {
          customSwatch.style.setProperty('--swatch-color', savedColor);
        }
      }
      
      console.log(`已恢復標記顏色: ${savedColor}`);
    }

    colorInputs.forEach((input) => {
      input.addEventListener('change', () => {
        const nextColor = input.value === 'custom' && customInput ? customInput.value : input.value;
        setMarkColor(nextColor);
      });
    });

    if (customInput) {
      customInput.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;
        const customRadio = panel.querySelector('input[name="block-color"][value="custom"]');
        if (customRadio instanceof HTMLInputElement) {
          customRadio.checked = true;
        }
        const customSwatch = target.closest('.color-swatch');
        if (customSwatch instanceof HTMLElement) {
          customSwatch.style.setProperty('--swatch-color', target.value);
        }
        setMarkColor(target.value);
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        clearMarks();
      });
    }

    if (exportButton) {
      exportButton.addEventListener('click', () => {
        exportMapToPng();
      });
    }

    // 設定標記顏色（使用恢復的或預設的）
    setMarkColor(selectedColor);
    
    // 設置主題切換功能
    setupThemeToggle();
  }
  
  // ==================== Theme Toggle ====================
  
  function setupThemeToggle() {
    const darkButton = document.getElementById('theme-dark');
    const lightButton = document.getElementById('theme-light');
    const root = document.documentElement;
    
    if (!darkButton || !lightButton) return;
    
    // 從 localStorage 讀取用戶偏好
    const savedTheme = localStorage.getItem('stronghold-theme') || 'dark';
    setTheme(savedTheme);
    
    darkButton.addEventListener('click', () => setTheme('dark'));
    lightButton.addEventListener('click', () => setTheme('light'));
    
    function setTheme(theme) {
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        darkButton.classList.remove('active');
        lightButton.classList.add('active');
      } else {
        root.removeAttribute('data-theme');
        darkButton.classList.add('active');
        lightButton.classList.remove('active');
      }
      
      // 保存到 localStorage
      localStorage.setItem('stronghold-theme', theme);
      console.log(`主題已切換為: ${theme === 'light' ? '明亮' : '暗黑'}`);
    }
  }

  async function exportMapToPng() {
    try {
      console.log('開始導出地圖...');
      
      const serializer = new XMLSerializer();
      const clone = svg.cloneNode(true);
      
      // 設置 SVG 命名空間
      clone.setAttribute('xmlns', svgNS);
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      clone.removeAttribute('style');
      clone.classList.remove('dragging');
      
      // 強制顯示所有標籤
      clone.classList.add('labels-visible');
      
      // 移除變換（導出完整地圖，不使用當前視角）
      const layers = ['hex-layer', 'mark-layer', 'building-layer', 'label-layer'];
      layers.forEach(layerId => {
        const layer = clone.querySelector(`#${layerId}`);
        if (layer) {
          layer.removeAttribute('transform');
        }
      });
      
      // 使用地圖邊界計算完整尺寸（而不是當前可見的 bbox）
      const padding = 100;
      const minX = mapBounds.minX - padding;
      const minY = mapBounds.minY - padding;
      const width = mapBounds.width + padding * 2;
      const height = mapBounds.height + padding * 2;
      
      console.log(`地圖完整尺寸: ${width} x ${height}`);
      
      // 設置 viewBox 和尺寸以包含整個地圖
      clone.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
      clone.setAttribute('width', String(width));
      clone.setAttribute('height', String(height));
      
      // 將所有建築物圖片轉換為 base64
      const images = clone.querySelectorAll('image');
      console.log(`找到 ${images.length} 個圖片元素`);
      
      for (const img of images) {
        const href = img.getAttribute('href') || img.getAttribute('xlink:href');
        if (href && !href.startsWith('data:')) {
          try {
            const base64 = await imageToBase64(href);
            img.setAttribute('href', base64);
            img.removeAttribute('xlink:href');
          } catch (error) {
            console.warn(`無法轉換圖片 ${href}:`, error);
          }
        }
      }
      
      // 移除沒有建築物的標籤（只保留有建筑物的格子的坐標）
      const labelLayer = clone.querySelector('#label-layer');
      if (labelLayer) {
        const labelGroups = labelLayer.querySelectorAll('.hex-label-group');
        let removedCount = 0;
        
        labelGroups.forEach(labelGroup => {
          const x = Number(labelGroup.dataset.x);
          const y = Number(labelGroup.dataset.y);
          
          // 檢查該座標是否有建築物
          let hasBuilding = false;
          for (const coords of Object.values(buildingData)) {
            if (coords.some(([bx, by]) => bx === x && by === y)) {
              hasBuilding = true;
              break;
            }
          }
          
          // 如果沒有建築物，移除該標籤
          if (!hasBuilding) {
            labelGroup.remove();
            removedCount++;
          }
        });
        
        console.log(`已移除 ${removedCount} 個空位標籤，保留有建築物的標籤`);
      }
      
      // 獲取當前主題
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const bgColor = currentTheme === 'light' ? '#e8eef5' : '#0e1420';
      const labelColor = currentTheme === 'light' ? '#1e2936' : '#e8eef5';
      const labelStroke = currentTheme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(14, 20, 32, 0.9)';
      
      // 內嵌優化的樣式
      const style = document.createElementNS(svgNS, 'style');
      const cssText = Array.from(document.styleSheets)
        .filter(sheet => {
          try {
            return sheet.cssRules;
          } catch {
            return false;
          }
        })
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');
      
      // 為導出添加高質量樣式規則
      const exportEnhancements = `
        /* 導出專用高質量樣式 */
        .hex-polygon {
          vector-effect: non-scaling-stroke;
        }
        .hex-label {
          fill: ${labelColor};
          font-size: 14px;
          font-weight: 600;
          text-anchor: middle;
          dominant-baseline: middle;
          pointer-events: none;
          paint-order: stroke;
          stroke: ${labelStroke};
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 1 !important;
          transform: scale(1) !important;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }
        .hex-icon, .hex-badge {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        .hex-mark {
          vector-effect: non-scaling-stroke;
        }
      `;
      
      style.textContent = cssText + exportEnhancements;
      
      const defs = clone.querySelector('defs');
      if (defs) {
        defs.appendChild(style);
      } else {
        const newDefs = document.createElementNS(svgNS, 'defs');
        newDefs.appendChild(style);
        clone.insertBefore(newDefs, clone.firstChild);
      }
      
      // 序列化 SVG
      const svgString = serializer.serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      console.log('SVG 已準備好，開始轉換為 PNG...');
      
      // 載入背景圖片
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'Anonymous';
      backgroundImg.onload = () => {
        console.log('背景圖片已載入');
        
        // 創建圖像並轉換為 Canvas
        const img = new Image();
        img.onload = () => {
          console.log('SVG 圖片已載入，開始繪製 Canvas...');
          
          const canvas = document.createElement('canvas');
          const scale = 3; // 高解析度，3倍已經足夠清晰
          canvas.width = width * scale;
          canvas.height = height * scale;
          
          const ctx = canvas.getContext('2d', { 
            alpha: false,  // 使用不透明背景以獲得更好的質量
            desynchronized: false
          });
          
          if (!ctx) {
            console.error('無法取得 Canvas 上下文');
            URL.revokeObjectURL(url);
            return;
          }
          
          // 啟用高質量圖像平滑
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // 先繪製純色背景
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 繪製背景圖片（覆蓋整個canvas）
          ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
          
          // 繪製半透明疊加層（根據主題）
          const overlayOpacity1 = currentTheme === 'light' ? 0.9 : 0.88;
          const overlayOpacity2 = currentTheme === 'light' ? 0.85 : 0.82;
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, currentTheme === 'light' 
            ? `rgba(232, 238, 245, ${overlayOpacity1})` 
            : `rgba(14, 20, 32, ${overlayOpacity1})`);
          gradient.addColorStop(1, currentTheme === 'light' 
            ? `rgba(232, 238, 245, ${overlayOpacity2})` 
            : `rgba(14, 20, 32, ${overlayOpacity2})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 繪製SVG圖像
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);
          
          console.log(`Canvas 繪製完成 (${canvas.width}x${canvas.height})，生成 PNG...`);
          
          // 導出為高質量 PNG
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('無法生成 PNG');
              return;
            }
            
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            link.download = `stronghold-map-${timestamp}.png`;
            link.href = pngUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
            
            console.log('地圖已成功導出！');
          }, 'image/png', 0.98); // 使用高質量壓縮
        };
        
        img.onerror = (error) => {
          console.error('載入 SVG 圖像失敗:', error);
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      };
      
      backgroundImg.onerror = (error) => {
        console.error('載入背景圖片失敗:', error);
        // 如果背景圖片載入失敗，繼續導出但不包含背景
        const img = new Image();
        img.onload = () => {
          console.log('圖片已載入，開始繪製 Canvas（無背景）...');
          
          const canvas = document.createElement('canvas');
          const scale = 3;
          canvas.width = width * scale;
          canvas.height = height * scale;
          
          const ctx = canvas.getContext('2d', { 
            alpha: false,
            desynchronized: false
          });
          
          if (!ctx) {
            console.error('無法取得 Canvas 上下文');
            URL.revokeObjectURL(url);
            return;
          }
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('無法生成 PNG');
              return;
            }
            
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            link.download = `stronghold-map-${timestamp}.png`;
            link.href = pngUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
            
            console.log('地圖已成功導出（無背景）！');
          }, 'image/png', 0.98);
        };
        
        img.onerror = (error) => {
          console.error('載入 SVG 圖像失敗:', error);
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      };
      
      // 開始載入背景圖片
      backgroundImg.src = 'assets/background.png';
    } catch (error) {
      console.error('導出地圖失敗:', error);
    }
  }
  
  function imageToBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('無法取得 Canvas 上下文'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error(`無法載入圖片: ${url}`));
      img.src = url;
    });
  }

  function collectMarkingCells(x, y) {
    if (mainCityArea && mainCityArea.cells && isInMainCityArea(x, y)) {
      return mainCityArea.cells.map(([cx, cy]) => ({ x: cx, y: cy }));
    }
    return [{ x, y }];
  }

  function applyColorToCells(cells, color) {
    const normalizedColor = normalizeHexColor(color);
    cells.forEach((cell) => {
      const key = keyFor(cell.x, cell.y);
      markCell({ x: cell.x, y: cell.y, color: normalizedColor });
    });
  }

  function markCell({ x, y, color }) {
    const key = keyFor(x, y);
    const entry = cellMap.get(key);
    if (!entry) return;

    const markPolygon = entry.markPolygon;
    if (markPolygon) {
      markPolygon.classList.add('marked');
      const fillColor = colorWithAlpha(color, 0.32);
      const strokeColor = colorWithAlpha(color, 0.94);
      markPolygon.style.fill = fillColor;
      markPolygon.style.stroke = strokeColor;
      markedCells.set(key, { x, y, color, fillColor, strokeColor });
      
      // 保存標記狀態
      saveMarksState();
    }
  }

  function clearMarks() {
    for (const key of markedCells.keys()) {
      const entry = cellMap.get(key);
      if (!entry) continue;

      const markPolygon = entry.markPolygon;
      if (markPolygon) {
        markPolygon.classList.remove('marked');
        markPolygon.style.fill = '';
        markPolygon.style.stroke = '';
      }
    }
    markedCells.clear();
    
    // 保存標記狀態（清空）
    saveMarksState();
  }

  function clearMarkedCell(key) {
    const entry = cellMap.get(key);
    if (!entry) return;

    const markPolygon = entry.markPolygon;
    if (markPolygon) {
      markPolygon.classList.remove('marked');
      markPolygon.style.fill = '';
      markPolygon.style.stroke = '';
    }
    markedCells.delete(key);
    
    // 保存標記狀態
    saveMarksState();
  }

  function setMarkColor(color) {
    selectedColor = normalizeHexColor(color);
    document.documentElement.style.setProperty('--mark-color-active', colorWithAlpha(selectedColor, 0.32));
    document.documentElement.style.setProperty('--mark-stroke-active', colorWithAlpha(selectedColor, 0.94));
    
    // 保存顏色設定
    saveMarkColorState(selectedColor);
  }

  function colorWithAlpha(hexColor, alpha) {
    const rgba = hexToRgba(hexColor, alpha);
    return rgba;
  }

  function hexToRgba(hex, alpha) {
    const formatted = normalizeHexColor(hex).replace('#', '');
    const bigint = parseInt(formatted, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function normalizeHexColor(hex) {
    let formatted = String(hex || '').trim();
    if (!formatted.startsWith('#')) {
      formatted = `#${formatted}`;
    }
    formatted = formatted.replace(/[^#0-9a-fA-F]/g, '');
    if (formatted.length === 4) {
      formatted = `#${formatted
        .slice(1)
        .split('')
        .map((char) => char + char)
        .join('')}`;
    }
    if (formatted.length !== 7) {
      return '#ff6961';
    }
    return formatted.toLowerCase();
  }
  
  function constrainPan() {
    // 獲取視口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 計算地圖的邊界（世界座標）
    const minWorldX = mapBounds.minX;
    const minWorldY = mapBounds.minY;
    const maxWorldX = mapBounds.maxX;
    const maxWorldY = mapBounds.maxY;
    
    // 允許的邊距（讓地圖至少有這麼多像素可見）
    const minVisibleMargin = Math.min(viewportWidth, viewportHeight) * 0.2; // 20% 的視口大小
    
    // 計算允許的平移範圍
    // 左邊界：地圖右邊緣不能超出視口左側太多
    const maxTranslateX = -minWorldX * state.scale + viewportWidth - minVisibleMargin;
    // 右邊界：地圖左邊緣不能超出視口右側太多
    const minTranslateX = -maxWorldX * state.scale + minVisibleMargin;
    
    // 上邊界：地圖下邊緣不能超出視口上側太多
    const maxTranslateY = -minWorldY * state.scale + viewportHeight - minVisibleMargin;
    // 下邊界：地圖上邊緣不能超出視口下側太多
    const minTranslateY = -maxWorldY * state.scale + minVisibleMargin;
    
    // 限制平移範圍
    state.translate.x = clamp(state.translate.x, minTranslateX, maxTranslateX);
    state.translate.y = clamp(state.translate.y, minTranslateY, maxTranslateY);
  }

  function applyTransform() {
    // 限制平移範圍
    constrainPan();
    
    const matrix = `matrix(${state.scale}, 0, 0, ${state.scale}, ${state.translate.x}, ${state.translate.y})`;
    // 同時變換所有圖層
    hexLayer.setAttribute("transform", matrix);
    if (markLayer) {
      markLayer.setAttribute("transform", matrix);
    }
    buildingLayer.setAttribute("transform", matrix);
    labelLayer.setAttribute("transform", matrix);
    updateLabelScale();
    
    // 使用防抖延遲保存用戶視角，避免頻繁寫入 localStorage
    if (saveStateDebounce) {
      clearTimeout(saveStateDebounce);
    }
    saveStateDebounce = setTimeout(() => {
      saveViewState();
    }, 150);
  }

  function updateLabelScale() {
    const labelScale = 1 / state.scale;
    document.documentElement.style.setProperty(
      "--label-scale",
      labelScale.toFixed(4)
    );
  }

  // ==================== Coordinate Transformation ====================

  function worldToScreen(x, y) {
    const center = computeCenter(x, y);
    return canvasToScreen(center.cx, center.cy);
  }

  function canvasToScreen(wx, wy) {
    return {
      px: wx * state.scale + state.translate.x,
      py: wy * state.scale + state.translate.y,
    };
  }

  function screenToWorld(px, py) {
    const canvasPoint = screenToCanvas(px, py);
    return {
      // Approximate continuous world coordinates before parity snapping
      xApprox: canvasPoint.x / config.dx,
      yApprox: canvasPoint.y / (config.dy / 2),
      canvas: canvasPoint,
    };
  }

  function screenToCanvas(px, py) {
    const wx = (px - state.translate.x) / state.scale;
    const wy = (py - state.translate.y) / state.scale;
    return { x: wx, y: wy };
  }

  function pick(px, py) {
    const canvasPoint = screenToCanvas(px, py);
    const result = resolveNearestCell(canvasPoint.x, canvasPoint.y);
    return result ? { ...result } : null;
  }

  function resolveNearestCell(wx, wy) {
    const candidates = gatherCandidateCells(wx, wy);
    let closest = null;
    let minDistance = Infinity;
    for (const { x, y } of candidates) {
      const center = computeCenter(x, y);
      const dist = squaredDistance(wx, wy, center.cx, center.cy);
      if (dist < minDistance) {
        minDistance = dist;
        closest = { x, y };
      }
    }
    return closest;
  }

  function gatherCandidateCells(wx, wy) {
    const candidates = [];
    const inserted = new Set();
    const yEvenFloat = wy / (config.dy / 2);
    const yOddFloat = (wy - config.dy / 2) / (config.dy / 2);
    const xFloat = wx / config.dx;

    const evenXBase = nearestEven(xFloat);
    const evenYBase = nearestEven(yEvenFloat);
    const oddXBase = nearestOdd(xFloat);
    const oddYBase = nearestOdd(yOddFloat);

    const evenOffsets = [0, 2, -2];
    const oddOffsets = [0, 2, -2];

    for (const dx of evenOffsets) {
      for (const dy of evenOffsets) {
        pushCandidate(evenXBase + dx, evenYBase + dy);
      }
    }

    for (const dx of oddOffsets) {
      for (const dy of oddOffsets) {
        pushCandidate(oddXBase + dx, oddYBase + dy);
      }
    }

    // Additional diagonal adjustments to improve accuracy around boundaries
    const diagOffsets = [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ];

    for (const [dx, dy] of diagOffsets) {
      pushCandidate(evenXBase + dx, evenYBase + dy);
      pushCandidate(oddXBase + dx, oddYBase + dy);
    }

    return candidates;

    function pushCandidate(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const xi = Math.round(x);
      const yi = Math.round(y);
      if ((xi + yi) % 2 !== 0) return; // Enforce parity consistency
      if (!inBounds(xi, yi)) return;
      const key = keyFor(xi, yi);
      if (inserted.has(key)) return;
      inserted.add(key);
      candidates.push({ x: xi, y: yi });
    }
  }

  // ==================== Highlight & Visual Control ====================

  function highlight(cells, options = {}) {
    if (!Array.isArray(cells)) return;
    for (const cell of cells) {
      const key = keyFor(cell.x, cell.y);
      const entry = cellMap.get(key);
      if (!entry) continue;
      entry.group.classList.add("highlighted");
      applyHighlightStyles(entry, options);
      highlighted.set(key, { entry, options });
    }
  }

  function unhighlight(cells) {
    if (!cells) {
      for (const { entry } of highlighted.values()) {
        clearHighlightStyles(entry);
      }
      highlighted.clear();
      return;
    }
    for (const cell of cells) {
      const key = keyFor(cell.x, cell.y);
      const stored = highlighted.get(key);
      if (!stored) continue;
      clearHighlightStyles(stored.entry);
      highlighted.delete(key);
    }
  }

  function applyHighlightStyles(entry, options) {
    const { polygon } = entry;
    if (options.stroke) {
      polygon.style.stroke = options.stroke;
    }
    if (options.fill) {
      polygon.style.fill = options.fill;
    }
    if (options.pulse) {
      polygon.classList.add("pulsing");
    }
  }

  function clearHighlightStyles(entry) {
    entry.group.classList.remove("highlighted");
    entry.polygon.classList.remove("pulsing");
    entry.polygon.style.stroke = "";
    entry.polygon.style.fill = "";
  }

  function toggleLabels(show) {
    if (show) {
      svg.classList.add("labels-visible");
      svg.classList.remove("labels-hidden");
    } else {
      svg.classList.add("labels-hidden");
      svg.classList.remove("labels-visible");
    }
  }

  // ==================== View Control ====================

  function setZoom(newScale, center) {
    const targetScale = clamp(newScale, state.minScale, state.maxScale);
    const focusPoint = center
      ? screenToCanvas(center.x, center.y)
      : screenToCanvas(
          window.innerWidth / 2,
          window.innerHeight / 2
        );
    state.scale = targetScale;
    const screenAfter = canvasToScreen(focusPoint.x, focusPoint.y);
    if (center) {
      state.translate.x += center.x - screenAfter.px;
      state.translate.y += center.y - screenAfter.py;
    } else {
      const defaultCenter = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      state.translate.x += defaultCenter.x - screenAfter.px;
      state.translate.y += defaultCenter.y - screenAfter.py;
    }
    applyTransform();
  }

  function panBy(dx, dy) {
    state.translate.x += dx;
    state.translate.y += dy;
    applyTransform();
  }

  function setPan(x, y) {
    state.translate.x = x;
    state.translate.y = y;
    applyTransform();
  }

  // ==================== Grid Navigation ====================

  function neighbors(x, y) {
    const deltas = [
      [2, 0],
      [-2, 0],
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ];
    const results = [];
    for (const [dx, dy] of deltas) {
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny)) {
        results.push({ x: nx, y: ny });
      }
    }
    return results;
  }

  function inBounds(x, y) {
    if ((x + y) % 2 !== 0) return false;
    if (x % 2 === 0) {
      return (
        x >= 0 &&
        x <= config.maxEven.x &&
        y >= 0 &&
        y <= config.maxEven.y &&
        y % 2 === 0
      );
    }
    return (
      x >= 1 &&
      x <= config.maxOdd.x &&
      y >= 1 &&
      y <= config.maxOdd.y &&
      y % 2 !== 0
    );
  }

  // ==================== Event System ====================

  function on(event, handler) {
    if (typeof handler !== "function") {
      eventHandlers.delete(event);
      return;
    }
    eventHandlers.set(event, handler);
  }

  function off(event) {
    eventHandlers.delete(event);
  }

  function emit(event, payload) {
    const handler = eventHandlers.get(event);
    if (typeof handler === "function") {
      handler(payload);
    }
  }

  // ==================== Utility Functions ====================

  function keyFor(x, y) {
    return `${x},${y}`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function squaredDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
  }

  function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  function nearestEven(value) {
    return Math.round(value / 2) * 2;
  }

  function nearestOdd(value) {
    return Math.round((value - 1) / 2) * 2 + 1;
  }
})();

// ==================== Usage Examples ====================
// 
// Listen for cell clicks:
// window.map.on('cellclick', function(detail) {
//   console.log(`Clicked cell at (${detail.x}, ${detail.y})`);
//   if (detail.buildingType) {
//     console.log(`Building type: ${detail.buildingType}`);
//   }
// });
//
// Or listen via native event:
// document.getElementById('hex-map').addEventListener('map:cellclick', function(e) {
//   const { x, y, buildingType } = e.detail;
//   console.log(`Cell: (${x}, ${y}), Building: ${buildingType || 'none'}`);
// });
//
// Check building at specific coordinates:
// const building = window.map.getBuildingAt(30, 50); // Returns 'mainCity'
//
// Get all building data:
// const allBuildings = window.map.getBuildingData();
//
// Update main city image:
// window.map.updateMainCityBadge('assets/3000.png');


