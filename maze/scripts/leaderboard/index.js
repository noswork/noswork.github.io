import { getTranslation, setDocumentLanguage } from '../utils/translation.js';
import { SettingsManager } from '../settings/settingsManager.js';
import { AuthService } from '../auth/authService.js';

const leaderboardConfig = {
    modes: [
        { value: 'race', label: 'leaderboard.mode.race' },
        { value: 'dark', label: 'leaderboard.mode.dark' }
    ],
    sizes: [
        { value: 'teensy', counts: [5, 10, 20], darkCount: 1 },
        { value: 'mini', counts: [5, 10, 15], darkCount: 1 },
        { value: 'medium', counts: [3, 5, 10], darkCount: 1 },
        { value: 'mighty', counts: [], darkCount: 1 },
        { value: 'mega', counts: [], darkCount: 1 }
    ],
    table: 'race_leaderboard'
};

const formatSeconds = (totalSeconds) => {
    if (typeof totalSeconds !== 'number') return '--:--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDate = (isoString) => {
    if (!isoString) return '--';
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString();
    } catch (_error) {
        return isoString;
    }
};

const applyLanguage = (lang) => {
    setDocumentLanguage(lang);
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;
        if (!key) return;
        element.textContent = getTranslation(lang, key);
    });
};

const getModeLabel = (modeValue, lang) => {
    const modeKey = `leaderboard.mode.${modeValue}`;
    return getTranslation(lang, modeKey) ?? modeValue;
};

const getSizeLabel = (sizeValue, lang) => {
    const sizeKey = `size.${sizeValue}`;
    return getTranslation(lang, sizeKey) ?? sizeValue;
};

const getCountLabel = (count, lang) => {
    const mazeWord = getTranslation(lang, 'race.mazes') ?? '個迷宮';
    return `${count} ${mazeWord}`;
};

const setStatus = (messageKey, type = 'info') => {
    const status = document.getElementById('leaderboardStatus');
    const wrapper = document.getElementById('leaderboardTableWrapper');
    if (!status || !wrapper) return;

    const lang = document.documentElement.lang?.startsWith('en') ? 'en' : 'zh';
    const message = getTranslation(lang, messageKey) ?? messageKey;

    status.textContent = message;
    status.className = `leaderboard-status ${type}`;
    wrapper.classList.add('hidden');
};

const showTable = () => {
    const status = document.getElementById('leaderboardStatus');
    const wrapper = document.getElementById('leaderboardTableWrapper');
    if (!status || !wrapper) return;

    status.textContent = '';
    status.className = 'leaderboard-status';
    wrapper.classList.remove('hidden');
};

const renderRows = (records, currentUserId) => {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const lang = document.documentElement.lang?.startsWith('en') ? 'en' : 'zh';
    const highlightLabel = getTranslation(lang, 'leaderboard.highlightLabel') ?? 'You';

    records.forEach((record, index) => {
        const tr = document.createElement('tr');
        const isCurrentUser = record.user_id === currentUserId;
        if (isCurrentUser) {
            tr.classList.add('leaderboard-row-highlight');
        }

        const rankCell = document.createElement('td');
        rankCell.textContent = String(index + 1);
        tr.appendChild(rankCell);

        const playerCell = document.createElement('td');
        const name = record.username || record.display_name || '—';
        playerCell.textContent = name;
        if (isCurrentUser) {
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'highlight-label';
            highlightSpan.textContent = ` (${highlightLabel})`;
            playerCell.appendChild(highlightSpan);
        }
        tr.appendChild(playerCell);

        const timeCell = document.createElement('td');
        timeCell.textContent = formatSeconds(record.total_seconds);
        tr.appendChild(timeCell);

        const stepsCell = document.createElement('td');
        stepsCell.textContent = record.total_steps != null ? String(record.total_steps) : '—';
        tr.appendChild(stepsCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(record.completed_at);
        tr.appendChild(dateCell);

        tbody.appendChild(tr);
    });
};

const populateModeSelect = (modes, activeMode, lang) => {
    const select = document.getElementById('modeSelect');
    if (!select) return;

    select.innerHTML = '';

    modes.forEach((modeObj) => {
        const option = document.createElement('option');
        option.value = modeObj.value;
        option.textContent = getModeLabel(modeObj.value, lang);
        if (modeObj.value === activeMode) {
            option.selected = true;
        }
        select.appendChild(option);
    });
};

const populateSizeSelect = (sizes, activeSize, lang) => {
    const select = document.getElementById('sizeSelect');
    if (!select) return;

    select.innerHTML = '';

    sizes.forEach((sizeObj) => {
        const option = document.createElement('option');
        option.value = sizeObj.value;
        option.textContent = getSizeLabel(sizeObj.value, lang);
        if (sizeObj.value === activeSize) {
            option.selected = true;
        }
        select.appendChild(option);
    });
};

const populateCountSelect = (counts, activeCount, lang) => {
    const select = document.getElementById('countSelect');
    if (!select) return;

    select.innerHTML = '';

    counts.forEach((count) => {
        const option = document.createElement('option');
        option.value = count.toString();
        option.textContent = getCountLabel(count, lang);
        if (count === activeCount) {
            option.selected = true;
        }
        select.appendChild(option);
    });
};

const fetchLeaderboard = async (mode, size, count, supabaseClient) => {
    if (!supabaseClient) throw new Error('Supabase client missing');

    const query = supabaseClient
        .from(leaderboardConfig.table)
        .select('user_id, username, total_seconds, total_steps, completed_at')
        .eq('mode', mode)
        .eq('size', size)
        .eq('target', count)
        .order('total_seconds', { ascending: true })
        .order('total_steps', { ascending: true })
        .limit(50);

    const { data, error } = await query;
    if (error) {
        throw error;
    }
    return data ?? [];
};

const initAuth = async () => {
    if (!window.supabaseClient) return null;
    const authService = new AuthService(window.supabaseClient);
    await authService.init();
    return authService;
};

document.addEventListener('DOMContentLoaded', async () => {
    const settingsManager = window.mazeSettings || new SettingsManager();
    const lang = settingsManager.getLanguage();
    applyLanguage(lang);

    const authService = await initAuth();
    const currentUser = authService?.getUser();

    const theme = settingsManager.getTheme();
    document.documentElement.className = `theme-${theme}`;
    document.body.className = 'leaderboard-page';

    const modes = leaderboardConfig.modes;
    const sizes = leaderboardConfig.sizes;
    let activeMode = modes[0].value;
    
    // 根據模式過濾可用的大小選項
    const getAvailableSizes = (mode) => {
        if (mode === 'dark') {
            // 黑暗模式：顯示所有大小
            return sizes;
        } else {
            // 競速模式：只顯示有 counts 的大小
            return sizes.filter(s => s.counts && s.counts.length > 0);
        }
    };

    let availableSizes = getAvailableSizes(activeMode);
    let activeSize = availableSizes[0].value;
    let activeCounts = availableSizes[0].counts || [availableSizes[0].darkCount];
    let activeCount = activeCounts[0];

    populateModeSelect(modes, activeMode, lang);
    populateSizeSelect(availableSizes, activeSize, lang);
    populateCountSelect(activeCounts, activeCount, lang);

    // 根據模式更新迷宮數量選擇和大小選項
    const updateSelectsForMode = (mode) => {
        availableSizes = getAvailableSizes(mode);
        activeSize = availableSizes[0].value;
        populateSizeSelect(availableSizes, activeSize, lang);
        
        const sizeObj = availableSizes.find((s) => s.value === activeSize);
        if (!sizeObj) return;

        if (mode === 'dark') {
            // 黑暗模式固定為 1 個迷宮
            activeCounts = [sizeObj.darkCount];
            activeCount = sizeObj.darkCount;
            populateCountSelect(activeCounts, activeCount, lang);
            // 隱藏數量選擇器（黑暗模式只有一個選項）
            const countGroup = document.getElementById('countSelect')?.closest('.select-group');
            if (countGroup) {
                countGroup.style.display = 'none';
            }
        } else {
            // 競速模式顯示所有選項
            activeCounts = sizeObj.counts;
            activeCount = activeCounts[0];
            populateCountSelect(activeCounts, activeCount, lang);
            const countGroup = document.getElementById('countSelect')?.closest('.select-group');
            if (countGroup) {
                countGroup.style.display = '';
            }
        }
    };

    // 根據模式更新迷宮數量選擇（當切換大小時）
    const updateCountSelectForSize = (mode, size) => {
        const sizeObj = availableSizes.find((s) => s.value === size);
        if (!sizeObj) return;

        if (mode === 'dark') {
            activeCounts = [sizeObj.darkCount];
            activeCount = sizeObj.darkCount;
            populateCountSelect(activeCounts, activeCount, lang);
        } else {
            activeCounts = sizeObj.counts;
            activeCount = activeCounts[0];
            populateCountSelect(activeCounts, activeCount, lang);
        }
    };

    // 初始化時設定數量選擇
    updateSelectsForMode(activeMode);

    document.getElementById('leaderboardBackBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    const supabaseClient = window.supabaseClient;
    if (!supabaseClient) {
        setStatus('leaderboard.error', 'error');
        return;
    }

    const loadLeaderboard = async (mode, size, count) => {
        try {
            setStatus('leaderboard.loading', 'info');
            const data = await fetchLeaderboard(mode, size, count, supabaseClient);
            if (!data.length) {
                setStatus('leaderboard.empty', 'info');
                return;
            }
            showTable();
            renderRows(data, currentUser?.id ?? null);
        } catch (error) {
            console.error('[Leaderboard] Fetch failed', error);
            setStatus('leaderboard.error', 'error');
        }
    };

    document.getElementById('modeSelect')?.addEventListener('change', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) return;
        const newMode = target.value;
        if (newMode === activeMode) return;

        activeMode = newMode;
        updateSelectsForMode(activeMode);
        await loadLeaderboard(activeMode, activeSize, activeCount);
    });

    document.getElementById('sizeSelect')?.addEventListener('change', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) return;
        const newSize = target.value;
        if (newSize === activeSize) return;

        activeSize = newSize;
        updateCountSelectForSize(activeMode, activeSize);
        await loadLeaderboard(activeMode, activeSize, activeCount);
    });

    document.getElementById('countSelect')?.addEventListener('change', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLSelectElement)) return;
        const newCount = parseInt(target.value, 10);
        if (Number.isNaN(newCount) || newCount === activeCount) return;

        activeCount = newCount;
        await loadLeaderboard(activeMode, activeSize, activeCount);
    });

    await loadLeaderboard(activeMode, activeSize, activeCount);
});


