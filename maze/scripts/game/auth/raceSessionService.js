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
        console.log('[submitResult] Called with:', { totalSeconds, totalSteps });
        console.log('[submitResult] Session:', this.session);
        
        if (!this.session?.id) {
            console.log('[submitResult] No session ID, returning null');
            const lang = this.settingsManager.getLanguage();
            this.showStatus(getTranslation(lang, 'game.sessionMissing'), 'error');
            return null;
        }

        try {
            const accessToken = this.latestSessionToken || await this.refreshSessionToken();
            console.log('[submitResult] Access token:', accessToken ? 'exists' : 'missing');
            
            if (!accessToken) {
                throw new Error('MISSING_TOKEN');
            }

            const requestBody = {
                action: 'complete',
                payload: {
                    session_id: this.session.id,
                    total_steps: totalSteps,
                    client_elapsed_seconds: totalSeconds
                }
            };
            console.log('[submitResult] Request body:', requestBody);

            const response = await fetch(`${window.SUPABASE_CONFIG?.url}/functions/v1/race-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('[submitResult] Response status:', response.status, response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('[submitResult] Error response:', errorText);
                throw new Error(`HTTP_${response.status}`);
            }

            const result = await response.json();
            console.log('[submitResult] Response JSON:', result);
            
            if (!result?.success) {
                throw new Error(result?.error?.code || 'UNKNOWN_RESULT');
            }

            // 處理新舊兩種回應格式
            // 新格式: {success: true, result: {total_seconds, total_steps, personal_best}}
            // 舊格式: {success: true, server_seconds, client_seconds, total_seconds, total_steps, personal_best}
            const serverResult = result.result || {
                total_seconds: result.server_seconds || result.total_seconds,
                total_steps: result.total_steps,
                personal_best: result.personal_best
            };

            if (serverResult.personal_best) {
                this.showStatus(getTranslation(this.settingsManager.getLanguage(), 'game.personalBestSaved'), 'success');
            } else {
                this.showStatus(getTranslation(this.settingsManager.getLanguage(), 'game.leaderboardNoImprovement'), 'info');
            }

            console.log('[submitResult] Returning result:', serverResult);
            // 返回伺服器計算的結果
            return serverResult;
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

