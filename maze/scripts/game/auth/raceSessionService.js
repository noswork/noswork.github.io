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
        this.pendingSessionPromise = null; // 用於防止重複請求
    }

    reset() {
        this.session = null;
        this.sessionStartInProgress = false;
        this.latestSessionToken = null;
        this.pendingSessionPromise = null;
        console.log('[Race] Session state reset');
    }

    async refreshSessionToken() {
        if (!this.supabaseClient) {
            this.latestSessionToken = null;
            return null;
        }

        try {
            // First try to get the current session
            const { data, error } = await this.supabaseClient.auth.getSession();
            if (error) {
                console.error('[Race] Unable to refresh session token', error);
                this.latestSessionToken = null;
                return null;
            }

            // Validate that we have a complete session with all required fields
            const session = data?.session;
            if (!session || !session.access_token || !session.user) {
                console.warn('[Race] Session is incomplete or missing:', {
                    hasSession: !!session,
                    hasToken: !!session?.access_token,
                    hasUser: !!session?.user
                });
                this.latestSessionToken = null;
                return null;
            }

            // Check if the token is expired
            const expiresAt = session.expires_at;
            if (expiresAt) {
                const expiresAtMs = expiresAt * 1000; // Convert to milliseconds
                const now = Date.now();
                if (now >= expiresAtMs) {
                    console.warn('[Race] Access token has expired at', new Date(expiresAtMs).toISOString());
                    this.latestSessionToken = null;
                    return null;
                }
            }

            const token = session.access_token;
            this.latestSessionToken = token;
            console.log('[Race] Valid access token obtained');
            
            return token;
        } catch (error) {
            console.error('[Race] Failed to obtain session token', error);
            this.latestSessionToken = null;
            return null;
        }
    }

    async ensureSession({ mode, size, target }) {
        // 如果已有 session 或正在創建，直接返回
        if (!target || this.session?.id) {
            return;
        }
        
        // 如果已有進行中的請求，等待它完成
        if (this.pendingSessionPromise) {
            await this.pendingSessionPromise;
            return;
        }

        if (!this.supabaseClient || !this.authService) {
            return;
        }

        const user = this.authService.getUser();
        if (!user) {
            console.warn('[Race] No user found when trying to ensure session');
            return;
        }

        const accessToken = this.latestSessionToken || await this.refreshSessionToken();
        if (!accessToken) {
            console.error('[Race] No access token available. User might need to re-authenticate.');
            
            // Clear any stale session data
            this.session = null;
            this.latestSessionToken = null;
            
            const lang = this.settingsManager.getLanguage();
            this.showStatus(getTranslation(lang, 'game.sessionTokenMissing'), 'error');
            return;
        }

        // 創建 Promise 並保存，防止並發請求
        this.pendingSessionPromise = (async () => {
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
                    // Try to get error details from response
                    let errorDetails = '';
                    try {
                        const errorBody = await response.json();
                        errorDetails = errorBody?.error?.message || JSON.stringify(errorBody);
                    } catch {
                        errorDetails = await response.text();
                    }
                    console.error(`[Race] Server returned ${response.status}:`, errorDetails);
                    
                    // If 401, the session might have expired - try refreshing
                    if (response.status === 401) {
                        console.log('[Race] Got 401, attempting to refresh session token...');
                        const newToken = await this.refreshSessionToken();
                        if (newToken !== accessToken) {
                            console.log('[Race] Token was refreshed, session might work on retry');
                        }
                    }
                    
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
                this.pendingSessionPromise = null;
            }
        })();
        
        await this.pendingSessionPromise;
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

