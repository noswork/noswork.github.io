import { SettingsManager } from '../settings/settingsManager.js';
import { createAuthModal } from '../auth/authModal.js';
import { AuthService } from '../auth/authService.js';
import { getTranslation } from '../utils/translation.js';

const createTabManager = () => {
    // 恢復保存的 tab 狀態，如果沒有則使用默認值
    let currentTab = localStorage.getItem('maze-current-tab') || 'just-maze';
    let currentRaceMode = localStorage.getItem('maze-current-race-mode') || 'classic';
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const raceSubButtons = document.querySelectorAll('.race-sub-btn');
    const raceModeContents = document.querySelectorAll('.race-mode-content');

    const switchTab = (tabId, saveState = true) => {
        currentTab = tabId;
        if (saveState) {
            localStorage.setItem('maze-current-tab', tabId);
        }
        tabButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        tabContents.forEach((content) => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    };

    const switchRaceMode = (raceMode, saveState = true) => {
        currentRaceMode = raceMode;
        if (saveState) {
            localStorage.setItem('maze-current-race-mode', raceMode);
        }
        raceSubButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.raceMode === raceMode);
        });
        raceModeContents.forEach((content) => {
            content.classList.toggle('active', content.id === `${raceMode}-race`);
        });
    };

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (!tab) return;
            switchTab(tab);
        });
    });

    raceSubButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const raceMode = btn.dataset.raceMode;
            if (!raceMode) return;
            switchRaceMode(raceMode);
        });
    });

    // 恢復上次的 tab 狀態
    switchTab(currentTab, false);
    if (currentTab === 'race') {
        switchRaceMode(currentRaceMode, false);
    }

    return { switchTab, getCurrentTab: () => currentTab, switchRaceMode, getCurrentRaceMode: () => currentRaceMode };
};

const setupGameButtons = ({ authService, authModal, settingsManager, tabManager }) => {
    const buttons = document.querySelectorAll('.game-btn');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            const size = button.dataset.size;
            const time = button.dataset.time;
            const count = button.dataset.count;

            const params = new URLSearchParams();
            if (mode) params.append('mode', mode);
            if (size) params.append('size', size);
            if (time) params.append('time', time);
            if (count) params.append('count', count);

            const user = authService?.getUser();
            if (!user) {
                authModal.open('signin');
                authModal.setStatus(getTranslation(settingsManager.getLanguage(), 'auth.requireSignIn'), 'error');
                return;
            }

            // 在跳轉前保存當前 tab 狀態
            const currentTab = tabManager.getCurrentTab();
            const currentRaceMode = tabManager.getCurrentRaceMode();
            localStorage.setItem('maze-current-tab', currentTab);
            localStorage.setItem('maze-current-race-mode', currentRaceMode);

            window.location.href = `game.html?${params.toString()}`;
        });
    });
};

const createUserStatusManager = ({ settingsManager, authModal, authService }) => {
    const userStatus = document.getElementById('userStatus');

    const update = async (user) => {
        if (!userStatus) return;

        const language = settingsManager.getLanguage();
        userStatus.style.opacity = '0';

        setTimeout(() => {
            userStatus.classList.remove('user-status-loading');

            if (user) {
                const logoutLabel = getTranslation(language, 'auth.logout');
                const displayName = user.user_metadata?.username || user.email || '';
                userStatus.innerHTML = `
                    <span class="user-chip">${displayName}</span>
                    <button class="menu-btn secondary" id="signOutBtn" data-i18n="auth.logout">${logoutLabel}</button>
                `;
                document.getElementById('signOutBtn')?.addEventListener('click', async () => {
                    try {
                        await authService.signOut();
                    } catch (error) {
                        console.error(error);
                        authModal.setStatus(error.message, 'error');
                    }
                });
            } else {
                const loginLabel = getTranslation(language, 'auth.login');
                userStatus.innerHTML = `
                    <button class="menu-btn secondary" id="authTriggerBtn" data-i18n="auth.login">${loginLabel}</button>
                `;
                document.getElementById('authTriggerBtn')?.addEventListener('click', () => authModal.open('signin'));
            }

            userStatus.style.opacity = '1';
            settingsManager.applyLanguage(settingsManager.getLanguage());
        }, 150);
    };

    return { update };
};

document.addEventListener('DOMContentLoaded', async () => {
    const settingsManager = new SettingsManager();
    settingsManager.init();
    window.mazeSettings = settingsManager;

    const tabManager = createTabManager();
    window.mazeTabs = tabManager;

    const supabaseClient = window.supabaseClient;
    const authService = supabaseClient ? new AuthService(supabaseClient) : null;
    window.authService = authService;

    const authModal = createAuthModal({ settingsManager, authService });

    const userStatusManager = createUserStatusManager({ settingsManager, authModal, authService });

    if (authService) {
        await authService.init();
        authService.onAuthStateChange(async (user) => {
            await userStatusManager.update(user);
        });
    } else {
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            userStatus.innerHTML = '<span class="user-chip error">Supabase unavailable</span>';
        }
    }

    setupGameButtons({ authService, authModal, settingsManager, tabManager });
});

