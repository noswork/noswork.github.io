import { getTranslation } from '../../utils/translation.js';

export class RaceSessionService {
    constructor({ supabaseClient, authService, settingsManager, showStatus }) {
        this.supabaseClient = supabaseClient;
        this.authService = authService;
        this.settingsManager = settingsManager;
        this.showStatus = showStatus;
        this.session = null;
        this.sessionStartInProgress = false;
        this.latestSessionToken = null;
    }

    async refreshSessionToken() {
        if (!this.supabaseClient) {
            this.latestSessionToken = null;
            return null;
        }

        try {
            const { data, error } = await this.supabaseClient.auth.getSession();
            if (error) {
                console.error('[Race] Unable to refresh session token', error);
                this.latestSessionToken = null;
                return null;
            }

            const token = data?.session?.access_token || null;
            this.latestSessionToken = token;
            return token;
        } catch (error) {
            console.error('[Race] Failed to obtain session token', error);
            this.latestSessionToken = null;
            return null;
        }
    }

    async ensureSession({ mode, size, target }) {
        if (!target || this.session?.id || this.sessionStartInProgress) {
            return;
        }

        if (!this.supabaseClient || !this.authService) {
            return;
        }

        const user = this.authService.getUser();
        if (!user) {
            return;
        }

        const accessToken = this.latestSessionToken || await this.refreshSessionToken();
        if (!accessToken) {
            return;
        }

        this.sessionStartInProgress = true;

        try {
            const response = await fetch(`${window.SUPABASE_CONFIG?.url}/functions/v1/race-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    action: 'start',
                    payload: { mode, size, target }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP_${response.status}`);
            }

            const result = await response.json();
            if (!result?.success || !result?.session?.id) {
                throw new Error(result?.error?.code || 'INVALID_RESPONSE');
            }

            this.session = result.session;
        } catch (error) {
            console.error('[Race] Failed to start verified session', error);
            this.session = null;
            const lang = this.settingsManager.getLanguage();
            this.showStatus(getTranslation(lang, 'game.sessionStartFailed'), 'error');
        } finally {
            this.sessionStartInProgress = false;
        }
    }

    async submitResult({ totalSeconds, totalSteps }) {
        if (!this.session?.id) {
            const lang = this.settingsManager.getLanguage();
            this.showStatus(getTranslation(lang, 'game.sessionMissing'), 'error');
            return null;
        }

        try {
            const accessToken = this.latestSessionToken || await this.refreshSessionToken();
            if (!accessToken) {
                throw new Error('MISSING_TOKEN');
            }

            const response = await fetch(`${window.SUPABASE_CONFIG?.url}/functions/v1/race-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    action: 'complete',
                    payload: {
                        session_id: this.session.id,
                        total_steps: totalSteps,
                        client_elapsed_seconds: totalSeconds
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP_${response.status}`);
            }

            const result = await response.json();
            if (!result?.success) {
                throw new Error(result?.error?.code || 'UNKNOWN_RESULT');
            }

            if (result.result?.personal_best) {
                this.showStatus(getTranslation(this.settingsManager.getLanguage(), 'game.personalBestSaved'), 'success');
            } else {
                this.showStatus(getTranslation(this.settingsManager.getLanguage(), 'game.leaderboardNoImprovement'), 'info');
            }

            // 返回伺服器計算的結果
            return result.result;
        } catch (error) {
            console.error('[Race] Verified result submission failed', error);
            const lang = this.settingsManager.getLanguage();
            this.showStatus(getTranslation(lang, 'game.sessionCompleteFailed'), 'error');
            return null;
        } finally {
            this.session = null;
        }
    }
}

