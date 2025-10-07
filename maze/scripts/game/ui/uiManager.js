import { showModal, hideModal } from '../../utils/dom.js';
import { getTranslation } from '../../utils/translation.js';

const gameTranslations = {
    zh: {
        'game.back': '返回選單',
        'game.steps': '步數',
        'game.time': '時間',
        'game.mazes': '迷宮',
        'game.congrats': '恭喜！',
        'game.timeUp': '時間到！',
        'game.completed': '你完成了',
        'game.playAgain': '再玩一次',
        'game.backMenu': '返回選單',
        'game.paused': '遊戲已暫停',
        'game.resume': '繼續遊戲',
        'game.winMessage': '你完成了迷宮！',
        'game.faultlessWin': '完美通關！沒有任何失誤！',
        'game.hitWall': '撞牆！重新開始',
        'game.noBacktrack': '不能回頭！重新開始',
        'game.raceComplete': '挑戰完成！',
        'game.totalTime': '總耗時',
        'game.totalSteps': '總步數',
        'game.leaderboardSaved': '成績已記錄在排行榜！',
        'game.leaderboardSaveFailed': '無法儲存排行榜成績。',
        'game.personalBestSaved': '刷新個人紀錄！',
        'game.leaderboardNoImprovement': '本次成績沒有超越你的最佳紀錄。',
        'game.sessionStartFailed': '無法建立挑戰會話，成績不會被記錄。',
        'game.sessionCompleteFailed': '無法驗證挑戰成績，請稍後再試。',
        'game.sessionMissing': '沒有有效的挑戰會話，無法儲存成績。',
        'game.darkComplete': '穿越黑暗完成！'
    },
    en: {
        'game.back': 'Back to Menu',
        'game.steps': 'Steps',
        'game.time': 'Time',
        'game.mazes': 'Mazes',
        'game.congrats': 'Congratulations!',
        'game.timeUp': "Time's Up!",
        'game.completed': 'You completed',
        'game.playAgain': 'Play Again',
        'game.backMenu': 'Back to Menu',
        'game.paused': 'Game Paused',
        'game.resume': 'Resume',
        'game.winMessage': 'You completed the maze!',
        'game.faultlessWin': 'Perfect! No mistakes!',
        'game.hitWall': 'Hit wall! Starting over',
        'game.noBacktrack': 'No backtracking! Starting over',
        'game.raceComplete': 'Challenge Complete!',
        'game.totalTime': 'Total Time',
        'game.totalSteps': 'Total Steps',
        'game.leaderboardSaved': 'Result saved to the leaderboard!',
        'game.leaderboardSaveFailed': 'Could not save leaderboard result.',
        'game.personalBestSaved': 'New personal best!',
        'game.leaderboardNoImprovement': 'This run did not beat your best record yet.',
        'game.sessionStartFailed': 'Could not start a verified race session, your score will not be recorded.',
        'game.sessionCompleteFailed': 'Could not verify the race result. Please try again.',
        'game.sessionMissing': 'No active race session; result cannot be saved.',
        'game.darkComplete': 'Conquered the Darkness!'
    }
};

export class GameUIManager {
    constructor({ getLanguage, getMode, onPlayAgain }) {
        this.getLanguage = getLanguage;
        this.getMode = getMode;
        this.onPlayAgain = onPlayAgain;
    }

    init() {
        document.getElementById('winPlayAgainBtn')?.addEventListener('click', () => this.onPlayAgain());
        document.getElementById('winMenuBtn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        document.getElementById('gameOverPlayAgainBtn')?.addEventListener('click', () => this.onPlayAgain());
        document.getElementById('gameOverMenuBtn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.togglePause(false));
        document.getElementById('pauseMenuBtn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.querySelectorAll('.modal').forEach((modal) => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal && modal.id === 'pauseModal') {
                    this.togglePause(false);
                }
            });
        });
    }

    translateUI() {
        const lang = this.getLanguage();
        document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.dataset.i18n;
            if (!key) return;
            const translation = gameTranslations[lang]?.[key] || getTranslation(lang, key) || key;
            element.textContent = translation;
        });
    }

    updateStepCount(count) {
        const element = document.getElementById('stepCount');
        if (element) {
            element.textContent = count;
        }
    }

    showStatus(messageKey, type = 'info') {
        const language = this.getLanguage();
        const message = gameTranslations[language]?.[messageKey] || getTranslation(language, messageKey) || messageKey;
        const status = document.getElementById('gameStatus');
        if (!status) return;

        status.textContent = message;
        status.className = `game-status ${type}`;
        setTimeout(() => {
            status.textContent = '';
            status.className = 'game-status';
        }, 2000);
    }

    showWinModal({ totalTime, totalSteps, mode }) {
        const language = this.getLanguage();
        const winMessage = document.getElementById('winMessage');
        if (!winMessage) return;

        if (mode === 'faultless') {
            winMessage.textContent = gameTranslations[language]['game.faultlessWin'];
        } else if (mode === 'race') {
            const totalTimeLabel = gameTranslations[language]['game.totalTime'];
            const totalStepsLabel = gameTranslations[language]['game.totalSteps'];
            const completeMsg = gameTranslations[language]['game.raceComplete'];
            winMessage.innerHTML = `${completeMsg}<br><br>${totalTimeLabel}: ${totalTime}<br>${totalStepsLabel}: ${totalSteps}`;
        } else if (mode === 'dark') {
            const totalTimeLabel = gameTranslations[language]['game.totalTime'];
            const totalStepsLabel = gameTranslations[language]['game.totalSteps'];
            const completeMsg = gameTranslations[language]['game.darkComplete'];
            winMessage.innerHTML = `${completeMsg}<br><br>${totalTimeLabel}: ${totalTime}<br>${totalStepsLabel}: ${totalSteps}`;
        } else {
            winMessage.textContent = gameTranslations[language]['game.winMessage'];
        }

        showModal('winModal');
    }

    showGameOverModal(completedMazes) {
        const finalCount = document.getElementById('finalCount');
        if (finalCount) {
            finalCount.textContent = completedMazes;
        }
        showModal('gameOverModal');
    }

    togglePause(isPaused) {
        const pauseBtn = document.getElementById('pauseBtn');
        const pauseModal = document.getElementById('pauseModal');
        if (!pauseBtn || !pauseModal) return;

        if (isPaused) {
            showModal('pauseModal');
            pauseBtn.querySelector('.pause-icon')?.setAttribute('style', 'display: none');
            pauseBtn.querySelector('.play-icon')?.setAttribute('style', 'display: block');
        } else {
            hideModal('pauseModal');
            pauseBtn.querySelector('.pause-icon')?.setAttribute('style', 'display: block');
            pauseBtn.querySelector('.play-icon')?.setAttribute('style', 'display: none');
        }
    }

    updateTimerDisplay(timeString) {
        const element = document.getElementById('timeDisplay');
        if (element) {
            element.textContent = timeString;
        }
    }

    showTimerSection() {
        const timer = document.getElementById('timer');
        const counter = document.getElementById('mazeCounter');
        timer?.setAttribute('style', 'display: block');
        counter?.setAttribute('style', 'display: block');
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.style.display = 'none';
        }
    }

    updateMazeCount(content) {
        const countElement = document.getElementById('mazeCount');
        if (countElement) {
            countElement.textContent = content;
        }
    }
}

