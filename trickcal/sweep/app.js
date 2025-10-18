const DATA_URL = "data.json";
const LANG_PATH = "assets/lang";
const GEARS_PATH = "assets/gears";
const PLACEHOLDER_IMG = "assets/gears/placeholder.svg";

// Supabase configuration
const SUPABASE_URL = "https://phiemgvtolycpmpbgzan.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaWVtZ3Z0b2x5Y3BtcGJnemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTQ5NDksImV4cCI6MjA3NjMzMDk0OX0.-nSfSQpKvD6Ye0GJ0BVJMamFWrHjqriQbXJ1n0T9Pas";

// Initialize Supabase client
let supabase = null;

// Session ID for tracking user usage (persisted in localStorage)
let sessionId = null;

// Local counter state
let localCounterState = {
  count: 0,           // Local counter
  remoteCount: 0,     // Last known remote count
  pendingEvents: [],  // Events waiting to be sent
  syncTimer: null,    // Timer for periodic sync
};

// 根据材料名称生成图片路径
function getMaterialImagePath(materialName) {
  return `${GEARS_PATH}/${materialName}.png`;
}

const LANG_MAP = {
  "zh-TW": "zh-TW.json",
  "zh-CN": "zh-CN.json",
  en: "en.json",
  ja: "ja.json",
  ko: "ko.json",
};

const DEFAULT_LANG = "zh-TW";
const STORAGE_KEYS = {
  theme: "trickcal-theme",
  lang: "trickcal-lang",
  selected: "trickcal-selected-materials",
  sessionId: "trickcal-session-id",
  localCounter: "trickcal-local-counter",
  pendingEvents: "trickcal-pending-events",
};

const state = {
  data: {},
  stages: {},
  materials: [],
  translations: {},
  language: DEFAULT_LANG,
  theme: "light",
  selectedMaterials: new Set(),
};

const refs = {
  body: document.body,
  modeToggle: document.querySelector(".mode-toggle"),
  languageSelector: document.querySelector(".language-selector"),
  languageToggle: document.querySelector(".language-toggle"),
  languageMenu: document.querySelector(".language-menu"),
  languageLabel: document.querySelector(".language-label"),
  catalogGrid: document.querySelector(".catalog-grid"),
  searchInput: document.querySelector("#material-search"),
  planSummary: document.querySelector(".plan-summary"),
  stageList: document.querySelector(".stage-list"),
  planWarning: document.querySelector(".plan-warning"),
  pageIndicator: document.querySelector(".page-indicator"),
  catalogPrev: document.querySelector(".catalog-nav.prev"),
  catalogNext: document.querySelector(".catalog-nav.next"),
  clearSelection: document.querySelector(".clear-selection"),
  modal: document.querySelector(".modal"),
  modalClose: document.querySelector(".modal-close"),
  tooltip: null, // 將在初始化時創建
  counterValue: document.querySelector(".counter-value"),
};

const catalogState = {
  page: 1,
  pageSize: 24,
  filteredMaterials: [],
};

async function init() {
  // Initialize Supabase
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Initialize or get session ID
  initSessionId();
  
  // 立即應用主題，避免閃爍
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (storedTheme === "dark" || storedTheme === "light") {
    state.theme = storedTheme;
    refs.body.dataset.theme = state.theme;
  }
  
  // 顯示頁面
  document.body.style.visibility = "visible";
  
  // 創建 tooltip 元素
  createTooltip();
  
  await loadData();
  hydrateStages();
  restorePreferences();
  await loadTranslations(state.language);
  bindEvents();
  renderMaterials();
  updatePlan();
  
  // Load and display usage counter
  await loadUsageCounter();
}

function createTooltip() {
  const tooltip = document.createElement("div");
  tooltip.className = "material-tooltip";
  tooltip.dataset.visible = "false";
  document.body.appendChild(tooltip);
  refs.tooltip = tooltip;
}

function showTooltip(text, x, y) {
  if (!refs.tooltip) return;
  refs.tooltip.textContent = text;
  refs.tooltip.style.left = `${x}px`;
  refs.tooltip.style.top = `${y}px`;
  refs.tooltip.dataset.visible = "true";
}

function hideTooltip() {
  if (!refs.tooltip) return;
  refs.tooltip.dataset.visible = "false";
}

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  parseData(data);
}

function parseData(data) {
  const materials = [];
  const stagesMap = {};
  const materialMap = {};

  // Process JSON data
  for (const [materialName, stages] of Object.entries(data)) {
    if (!materialName || !Array.isArray(stages) || stages.length === 0) {
      continue;
    }

    materials.push(materialName);
    materialMap[materialName] = stages;

    // Build reverse mapping: stage -> materials
    for (const stage of stages) {
      if (!stagesMap[stage]) {
        stagesMap[stage] = new Set();
      }
      stagesMap[stage].add(materialName);
    }
  }

  state.materials = materials;
  state.data = materialMap;
  state.stages = Object.fromEntries(
    Object.entries(stagesMap)
      .map(([stage, materialSet]) => [stage, [...materialSet]])
      .sort((a, b) => stageComparator(a[0], b[0]))
  );

  catalogState.filteredMaterials = [...state.materials];
}

function hydrateStages() {
  // Already constructed during parseData.
}

function restorePreferences() {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  const storedLang = localStorage.getItem(STORAGE_KEYS.lang);
  const storedSelected = localStorage.getItem(STORAGE_KEYS.selected);

  if (storedTheme === "dark" || storedTheme === "light") {
    state.theme = storedTheme;
  }

  if (storedLang && LANG_MAP[storedLang]) {
    state.language = storedLang;
  }

  if (storedSelected) {
    try {
      const parsed = JSON.parse(storedSelected);
      state.selectedMaterials = new Set(parsed.filter((name) => state.data[name]));
    } catch {
      state.selectedMaterials = new Set();
    }
  }

  applyTheme();
  updateLanguageLabel();
}

function applyTheme() {
  refs.body.dataset.theme = state.theme;
  localStorage.setItem(STORAGE_KEYS.theme, state.theme);
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  applyTheme();
}

async function loadTranslations(lang) {
  try {
    const response = await fetch(`${LANG_PATH}/${LANG_MAP[lang]}`);
    state.translations = await response.json();
    state.language = lang;
    localStorage.setItem(STORAGE_KEYS.lang, lang);
    applyTranslations();
  } catch (error) {
    console.error("Failed to load translations", error);
  }
}

function applyTranslations() {
  const translatable = document.querySelectorAll("[data-i18n]");
  translatable.forEach((element) => {
    const key = element.dataset.i18n;
    const value = t(key);
    if (value) {
      element.textContent = value;
    }
  });

  const placeholderNodes = document.querySelectorAll("[data-i18n-placeholder]");
  placeholderNodes.forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    const value = t(key);
    if (value) {
      element.setAttribute("placeholder", value);
    }
  });

  // 更新頁面標題
  const pageTitle = t("nav.title");
  if (pageTitle) {
    document.title = pageTitle;
  }

  updateLanguageLabel();
  updateCatalogPageIndicator();
  renderMaterials();
  updatePlan();
}

function t(key) {
  const segments = key.split(".");
  let current = state.translations;

  for (const segment of segments) {
    if (current && segment in current) {
      current = current[segment];
    } else {
      return key;
    }
  }
  if (typeof current === "string") return current;
  return key;
}

// 获取材料的翻译名称
function getMaterialName(materialKey) {
  const translated = t(`materials.${materialKey}`);
  // 如果没有翻译，返回原始名称
  return translated.startsWith("materials.") ? materialKey : translated;
}

function bindEvents() {
  refs.modeToggle.addEventListener("click", toggleTheme);

  refs.languageToggle.addEventListener("click", () => {
    const open = refs.languageSelector.dataset.open === "true";
    refs.languageSelector.dataset.open = open ? "false" : "true";
    refs.languageToggle.setAttribute("aria-expanded", (!open).toString());
  });

  document.addEventListener("click", (event) => {
    if (!refs.languageSelector.contains(event.target)) {
      refs.languageSelector.dataset.open = "false";
      refs.languageToggle.setAttribute("aria-expanded", "false");
    }
  });

  refs.languageMenu.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-lang]");
    if (!target) return;

    const lang = target.dataset.lang;
    await loadTranslations(lang);
    refs.languageSelector.dataset.open = "false";
    refs.languageToggle.setAttribute("aria-expanded", "false");
  });

  refs.catalogPrev.addEventListener("click", () => changeCatalogPage(-1));
  refs.catalogNext.addEventListener("click", () => changeCatalogPage(1));

  refs.searchInput.addEventListener("input", () => {
    filterMaterials(refs.searchInput.value);
  });

  refs.clearSelection.addEventListener("click", () => {
    state.selectedMaterials.clear();
    persistSelection();
    renderMaterials();
    updatePlan();
    incrementUsageCounter('clear_selection');
  });
}

function updateLanguageLabel() {
  const currentOption = refs.languageMenu.querySelector(`[data-lang="${state.language}"]`);
  refs.languageLabel.textContent = currentOption ? currentOption.textContent : "繁體中文";
  refs.languageMenu.querySelectorAll("li").forEach((li) => {
    li.setAttribute("aria-selected", li.dataset.lang === state.language ? "true" : "false");
  });
}

function renderMaterials() {
  const start = (catalogState.page - 1) * catalogState.pageSize;
  const pageItems = catalogState.filteredMaterials.slice(start, start + catalogState.pageSize);

  refs.catalogGrid.innerHTML = "";

  for (const name of pageItems) {
    const card = document.createElement("button");
    card.className = "catalog-card";
    card.type = "button";
    card.dataset.name = name;
    card.setAttribute("data-selected", state.selectedMaterials.has(name));

    const img = document.createElement("img");
    img.src = getMaterialImagePath(name);
    img.alt = getMaterialName(name);
    // 如果图片加载失败，使用占位符
    img.onerror = () => {
      img.src = PLACEHOLDER_IMG;
    };

    const label = document.createElement("span");
    label.textContent = getMaterialName(name);

    card.appendChild(img);
    card.appendChild(label);
    card.addEventListener("click", () => toggleMaterial(name));
    
    // 添加 tooltip 事件
    card.addEventListener("mouseenter", (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      showTooltip(getMaterialName(name), x, y);
    });
    
    card.addEventListener("mousemove", (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      showTooltip(getMaterialName(name), x, y);
    });
    
    card.addEventListener("mouseleave", () => {
      hideTooltip();
    });

    refs.catalogGrid.appendChild(card);
  }

  updateCatalogPageIndicator();
}

function changeCatalogPage(delta) {
  const total = Math.max(1, Math.ceil(catalogState.filteredMaterials.length / catalogState.pageSize));
  catalogState.page = Math.min(total, Math.max(1, catalogState.page + delta));
  renderMaterials();
}

function updateCatalogPageIndicator() {
  const total = Math.max(1, Math.ceil(catalogState.filteredMaterials.length / catalogState.pageSize));
  const text = t("catalog.page")
    .replace("{current}", catalogState.page)
    .replace("{total}", total);
  refs.pageIndicator.textContent = text;
  refs.catalogPrev.disabled = catalogState.page === 1;
  refs.catalogNext.disabled = catalogState.page === total;
}

function filterMaterials(keyword) {
  const term = keyword.trim().toLowerCase();
  if (!term) {
    catalogState.filteredMaterials = [...state.materials];
  } else {
    catalogState.filteredMaterials = state.materials.filter((name) => {
      // 搜索原始名称和翻译名称
      const originalName = name.toLowerCase();
      const translatedName = getMaterialName(name).toLowerCase();
      return originalName.includes(term) || translatedName.includes(term);
    });
  }
  catalogState.page = 1;
  renderMaterials();
}

function toggleMaterial(name) {
  if (state.selectedMaterials.has(name)) {
    state.selectedMaterials.delete(name);
  } else {
    state.selectedMaterials.add(name);
  }
  persistSelection();
  renderMaterials();
  updatePlan();
  
  // Increment usage counter
  incrementUsageCounter('material_toggle');
}

function persistSelection() {
  localStorage.setItem(STORAGE_KEYS.selected, JSON.stringify([...state.selectedMaterials]));
  refs.clearSelection.disabled = state.selectedMaterials.size === 0;
}

function updatePlan() {
  if (state.selectedMaterials.size === 0) {
    refs.planSummary.textContent = t("plan.empty");
    refs.stageList.innerHTML = "";
    refs.planWarning.hidden = true;
    return;
  }

  const selected = [...state.selectedMaterials];
  const plan = computeMinimumStages(selected);

  const totalStages = plan.length;

  const summaryTemplate = t("plan.summary");
  refs.planSummary.textContent = summaryTemplate.replace("{stages}", totalStages);

  const warning = t("plan.warning");
  const missing = selected.filter((material) => !plan.some((stage) => (state.stages[stage] || []).includes(material)));
  if (missing.length > 0) {
    refs.planWarning.hidden = false;
    refs.planWarning.textContent = warning.replace("{count}", missing.length);
  } else {
    refs.planWarning.hidden = true;
  }

  // 按關卡順序排序
  const sortedPlan = [...plan].sort((a, b) => stageComparator(a, b));

  refs.stageList.innerHTML = "";
  for (const stage of sortedPlan) {
    const li = document.createElement("li");

    const header = document.createElement("div");
    header.className = "stage-header";
    header.innerHTML = `<span>${stage}</span><span>${t("plan.energyPerStage").replace("{energy}", "10")}</span>`;

    const materials = document.createElement("div");
    materials.className = "stage-materials";

    const drops = state.stages[stage] || [];
    for (const material of drops) {
      if (!state.selectedMaterials.has(material)) continue;
      const chip = document.createElement("div");
      chip.className = "material-chip";
      
      const chipImg = document.createElement("img");
      chipImg.src = getMaterialImagePath(material);
      chipImg.alt = getMaterialName(material);
      // 如果图片加载失败，使用占位符
      chipImg.onerror = () => {
        chipImg.src = PLACEHOLDER_IMG;
      };
      
      const chipLabel = document.createElement("span");
      chipLabel.textContent = getMaterialName(material);
      
      chip.appendChild(chipImg);
      chip.appendChild(chipLabel);
      chip.addEventListener("click", () => {
        toggleMaterial(material);
      });
      
      // 添加 tooltip 事件
      chip.addEventListener("mouseenter", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        showTooltip(getMaterialName(material), x, y);
      });
      
      chip.addEventListener("mousemove", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        showTooltip(getMaterialName(material), x, y);
      });
      
      chip.addEventListener("mouseleave", () => {
        hideTooltip();
      });
      
      materials.appendChild(chip);
    }

    li.appendChild(header);
    li.appendChild(materials);
    refs.stageList.appendChild(li);
  }
}

function computeMinimumStages(selected) {
  const remaining = new Set(selected);
  const chosenStages = [];

  const stagesEntries = Object.entries(state.stages).sort(([a], [b]) => stageComparator(a, b));

  while (remaining.size > 0) {
    let bestStage = null;
    let bestCover = 0;

    for (const [stage, materials] of stagesEntries) {
      const cover = materials.filter((m) => remaining.has(m)).length;
      if (cover > bestCover) {
        bestCover = cover;
        bestStage = stage;
      }
    }

    if (!bestStage) break;

    chosenStages.push(bestStage);

    for (const material of state.stages[bestStage]) {
      remaining.delete(material);
    }
  }

  return chosenStages;
}

function stageComparator(a, b) {
  const [aChapter, aStage] = a.split("-").map(Number);
  const [bChapter, bStage] = b.split("-").map(Number);
  if (aChapter !== bChapter) return aChapter - bChapter;
  return aStage - bStage;
}

// ========== Usage Counter Functions ==========

// Initialize or get session ID
function initSessionId() {
  let stored = localStorage.getItem(STORAGE_KEYS.sessionId);
  if (!stored) {
    // Generate a unique session ID
    stored = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.sessionId, stored);
  }
  sessionId = stored;
}

// Load local counter state from localStorage
function loadLocalCounterState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.localCounter);
    if (stored) {
      const parsed = JSON.parse(stored);
      localCounterState.count = parsed.count || 0;
    }
    
    const storedEvents = localStorage.getItem(STORAGE_KEYS.pendingEvents);
    if (storedEvents) {
      localCounterState.pendingEvents = JSON.parse(storedEvents) || [];
    }
  } catch (err) {
    console.error('Error loading local counter:', err);
    localCounterState.count = 0;
    localCounterState.pendingEvents = [];
  }
}

// Save local counter state to localStorage
function saveLocalCounterState() {
  try {
    localStorage.setItem(STORAGE_KEYS.localCounter, JSON.stringify({
      count: localCounterState.count
    }));
    localStorage.setItem(STORAGE_KEYS.pendingEvents, JSON.stringify(localCounterState.pendingEvents));
  } catch (err) {
    console.error('Error saving local counter:', err);
  }
}

// Load and display the current total usage count
async function loadUsageCounter() {
  try {
    // Load local state first
    loadLocalCounterState();
    
    // Fetch remote count
    const { data, error } = await supabase
      .from('total_usage_count')
      .select('total_count')
      .single();
    
    if (error) {
      console.error('Error loading usage counter:', error);
      localCounterState.remoteCount = 0;
    } else {
      localCounterState.remoteCount = data.total_count || 0;
    }
    
    // Display total (remote + local)
    updateCounterDisplay();
    
    // Start periodic sync (every 1 minute)
    startPeriodicSync();
    
    // Setup beforeunload handler to send pending events
    window.addEventListener('beforeunload', handleBeforeUnload);
    
  } catch (err) {
    console.error('Error loading usage counter:', err);
    refs.counterValue.textContent = '0';
  }
}

// Update the counter display
function updateCounterDisplay() {
  const total = localCounterState.remoteCount + localCounterState.count;
  refs.counterValue.textContent = formatNumber(total);
}

// Increment the local usage counter
function incrementUsageCounter(actionType = 'interaction') {
  // Increment local count
  localCounterState.count++;
  
  // Add to pending events
  localCounterState.pendingEvents.push({
    action_type: actionType,
    timestamp: Date.now()
  });
  
  // Save to localStorage
  saveLocalCounterState();
  
  // Update display with animation
  refs.counterValue.classList.add('updating');
  updateCounterDisplay();
  
  setTimeout(() => {
    refs.counterValue.classList.remove('updating');
  }, 300);
}

// Send pending events to Supabase
async function syncPendingEvents() {
  if (localCounterState.pendingEvents.length === 0) {
    return;
  }
  
  try {
    console.log(`Syncing ${localCounterState.pendingEvents.length} pending events...`);
    
    // Prepare batch insert
    const events = localCounterState.pendingEvents.map(event => ({
      session_id: sessionId,
      action_type: event.action_type,
      created_at: new Date(event.timestamp).toISOString()
    }));
    
    // Insert all events at once
    const { error } = await supabase
      .from('usage_events')
      .insert(events);
    
    if (error) {
      console.error('Error syncing events:', error);
      return;
    }
    
    // Update remote count
    localCounterState.remoteCount += localCounterState.pendingEvents.length;
    
    // Clear pending events and local count
    localCounterState.pendingEvents = [];
    localCounterState.count = 0;
    
    // Save state
    saveLocalCounterState();
    
    // Update display
    updateCounterDisplay();
    
    console.log('Events synced successfully');
    
  } catch (err) {
    console.error('Error syncing events:', err);
  }
}

// Start periodic sync (every 1 minute)
function startPeriodicSync() {
  // Clear existing timer if any
  if (localCounterState.syncTimer) {
    clearInterval(localCounterState.syncTimer);
  }
  
  // Sync every 60 seconds (1 minute)
  localCounterState.syncTimer = setInterval(() => {
    syncPendingEvents();
  }, 60000);
  
  console.log('Periodic sync started (every 1 minute)');
}

// Handle page unload - send remaining events
function handleBeforeUnload() {
  if (localCounterState.pendingEvents.length > 0) {
    // Use sendBeacon for reliable sending on page unload
    const events = localCounterState.pendingEvents.map(event => ({
      session_id: sessionId,
      action_type: event.action_type,
      created_at: new Date(event.timestamp).toISOString()
    }));
    
    // Send using fetch with keepalive flag
    fetch(`${SUPABASE_URL}/rest/v1/usage_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(events),
      keepalive: true
    }).catch(err => console.error('Error sending final events:', err));
  }
}

// Format number with thousands separator
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

window.addEventListener("DOMContentLoaded", init);

