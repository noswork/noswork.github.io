const AUTH_ERROR_CODES = {
    USERNAME_TAKEN: 'USERNAME_TAKEN',
    USERNAME_CHECK_FAILED: 'USERNAME_CHECK_FAILED',
    EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_NOT_CONFIRMED: 'EMAIL_NOT_CONFIRMED',
    RATE_LIMITED: 'RATE_LIMITED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    GENERIC_SIGNUP_ERROR: 'GENERIC_SIGNUP_ERROR',
    GENERIC_SIGNIN_ERROR: 'GENERIC_SIGNIN_ERROR'
};

export class AuthService {
    constructor(client) {
        this.client = client;
        this.currentUser = null;
        this.authStateChangeCallbacks = [];
    }

    static get ERRORS() {
        return { ...AUTH_ERROR_CODES };
    }

    static get ERROR_TRANSLATIONS() {
        return {
            [AUTH_ERROR_CODES.USERNAME_TAKEN]: 'auth.usernameTaken',
            [AUTH_ERROR_CODES.USERNAME_CHECK_FAILED]: 'auth.usernameCheckFailed',
            [AUTH_ERROR_CODES.EMAIL_ALREADY_REGISTERED]: 'auth.emailAlreadyRegistered',
            [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'auth.invalidCredentials',
            [AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED]: 'auth.emailNotConfirmed',
            [AUTH_ERROR_CODES.RATE_LIMITED]: 'auth.rateLimited',
            [AUTH_ERROR_CODES.NETWORK_ERROR]: 'auth.networkError',
            [AUTH_ERROR_CODES.GENERIC_SIGNUP_ERROR]: 'auth.genericSignUpError',
            [AUTH_ERROR_CODES.GENERIC_SIGNIN_ERROR]: 'auth.genericSignInError'
        };
    }

    static get ERROR_MESSAGES() {
        return {
            [AUTH_ERROR_CODES.USERNAME_TAKEN]: 'Display name is already taken.',
            [AUTH_ERROR_CODES.USERNAME_CHECK_FAILED]: 'Unable to verify display name availability.',
            [AUTH_ERROR_CODES.EMAIL_ALREADY_REGISTERED]: 'An account already exists for this email.',
            [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Incorrect email or password.',
            [AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED]: 'Please confirm your email address before signing in.',
            [AUTH_ERROR_CODES.RATE_LIMITED]: 'Too many attempts. Please wait a moment and try again.',
            [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error. Check your connection and try again.',
            [AUTH_ERROR_CODES.GENERIC_SIGNUP_ERROR]: 'Unable to complete sign up. Please try again later.',
            [AUTH_ERROR_CODES.GENERIC_SIGNIN_ERROR]: 'Unable to complete sign in. Please try again later.'
        };
    }

    createAuthError(code, fallbackMessage, originalError) {
        const message = AuthService.ERROR_MESSAGES[code] || fallbackMessage || 'Authentication error.';
        const authError = new Error(message);
        authError.code = code;
        authError.translationKey = AuthService.ERROR_TRANSLATIONS[code] || null;
        if (originalError) {
            authError.originalError = originalError;
        }
        return authError;
    }

    isNetworkError(error) {
        if (!error) return false;
        const message = (error.message || '').toLowerCase();
        return (error.name === 'TypeError' && (message.includes('fetch') || message.includes('network')))
            || message.includes('failed to fetch')
            || message.includes('networkerror')
            || message.includes('network error');
    }

    mapSignUpError(error) {
        if (!error) {
            return this.createAuthError(AUTH_ERROR_CODES.GENERIC_SIGNUP_ERROR);
        }

        const knownCodes = Object.values(AuthService.ERRORS || {});
        if (knownCodes.includes(error.code)) {
            return error;
        }

        if (error.translationKey) {
            return error;
        }

        console.error('[AuthService] Sign-up error:', error);

        if (this.isNetworkError(error)) {
            return this.createAuthError(AUTH_ERROR_CODES.NETWORK_ERROR, null, error);
        }

        const normalizedCode = typeof error.code === 'string' ? error.code.toLowerCase() : '';
        const normalizedMessage = (error.message || '').toLowerCase();
        const normalizedDescription = (error.error_description || error.error || '').toLowerCase();

        if (error.status === 429
            || normalizedCode.includes('rate_limit')
            || normalizedMessage.includes('rate limit')
            || normalizedMessage.includes('too many requests')) {
            return this.createAuthError(AUTH_ERROR_CODES.RATE_LIMITED, null, error);
        }

        if (normalizedCode === 'user_already_exists'
            || normalizedMessage.includes('already registered')
            || normalizedMessage.includes('already exists')) {
            return this.createAuthError(AUTH_ERROR_CODES.EMAIL_ALREADY_REGISTERED, null, error);
        }

        const isDatabaseSaveError = normalizedMessage.includes('database error saving new user')
            || normalizedDescription.includes('duplicate key value')
            || normalizedDescription.includes('database error saving new user');

        if (error.status === 500 && isDatabaseSaveError) {
            return this.createAuthError(AUTH_ERROR_CODES.USERNAME_TAKEN, null, error);
        }

        return this.createAuthError(AUTH_ERROR_CODES.GENERIC_SIGNUP_ERROR, error.message, error);
    }

    mapSignInError(error) {
        if (!error) {
            return this.createAuthError(AUTH_ERROR_CODES.GENERIC_SIGNIN_ERROR);
        }

        const knownCodes = Object.values(AuthService.ERRORS || {});
        if (knownCodes.includes(error.code)) {
            return error;
        }

        if (error.translationKey) {
            return error;
        }

        console.error('[AuthService] Sign-in error:', error);

        if (this.isNetworkError(error)) {
            return this.createAuthError(AUTH_ERROR_CODES.NETWORK_ERROR, null, error);
        }

        const normalizedCode = typeof error.code === 'string' ? error.code.toLowerCase() : '';
        const normalizedMessage = (error.message || '').toLowerCase();

        if (error.status === 429
            || normalizedCode.includes('rate_limit')
            || normalizedMessage.includes('rate limit')
            || normalizedMessage.includes('too many requests')) {
            return this.createAuthError(AUTH_ERROR_CODES.RATE_LIMITED, null, error);
        }

        if (normalizedCode === 'email_not_confirmed' || normalizedMessage.includes('email not confirmed')) {
            return this.createAuthError(AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED, null, error);
        }

        if (normalizedCode === 'invalid_login_credentials'
            || normalizedMessage.includes('invalid login credentials')
            || normalizedMessage.includes('invalid credential')
            || normalizedMessage.includes('wrong email or password')) {
            return this.createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS, null, error);
        }

        return this.createAuthError(AUTH_ERROR_CODES.GENERIC_SIGNIN_ERROR, error.message, error);
    }

    escapeForILike(value) {
        return value.replace(/([%_\\])/g, '\\$1');
    }

    async usernameExists(username) {
        if (!this.client || !username) return false;

        const escapedUsername = this.escapeForILike(username);

        const { data, error } = await this.client
            .from('profiles')
            .select('id')
            .ilike('username', escapedUsername)
            .maybeSingle();

        if (error) {
            if (error.code === 'PGRST116') {
                return true;
            }
            throw error;
        }

        return Boolean(data);
    }

    async ensureUsernameAvailable(username) {
        try {
            const exists = await this.usernameExists(username);
            if (exists) {
                throw this.createAuthError(AuthService.ERRORS.USERNAME_TAKEN);
            }
        } catch (error) {
            if (error.code === AuthService.ERRORS.USERNAME_TAKEN) {
                throw error;
            }
            console.error('[AuthService] Username availability check failed:', error);
            throw this.createAuthError(AuthService.ERRORS.USERNAME_CHECK_FAILED, null, error);
        }
    }

    async enrichUser(user) {
        if (!user || !this.client) {
            return user || null;
        }

        let username = user.user_metadata?.username;

        if (!username) {
            try {
                const { data, error } = await this.client
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!error && data?.username) {
                    username = data.username;
                }
            } catch (profileError) {
                console.error('[AuthService] Failed to fetch profile:', profileError);
            }
        }

        if (!username) {
            return user;
        }

        return {
            ...user,
            user_metadata: {
                ...user.user_metadata,
                username
            }
        };
    }

    async upsertProfile({ id, username, email }) {
        if (!this.client || !id || !username) return;

        try {
            const { error } = await this.client
                .from('profiles')
                .upsert({
                    id,
                    username,
                    email
                }, { onConflict: 'id' });

            if (error) {
                if (error.code === '23505') {
                    throw this.createAuthError(AuthService.ERRORS.USERNAME_TAKEN, null, error);
                }

                console.error('[AuthService] Failed to upsert profile:', error);
                throw error;
            }
        } catch (profileError) {
            console.error('[AuthService] Error upserting profile:', profileError);
            if (profileError.code === AuthService.ERRORS.USERNAME_TAKEN) {
                throw profileError;
            }
            throw profileError;
        }
    }

    async ensureProfileForUser(user, fallbackEmail) {
        if (!this.client || !user) return;

        const username = user.user_metadata?.username;
        if (!username) return;

        await this.upsertProfile({
            id: user.id,
            username,
            email: user.email || fallbackEmail || null
        });
    }

    async init() {
        if (!this.client) {
            console.error('[AuthService] Supabase client is not available.');
            return;
        }

        const { data, error } = await this.client.auth.getSession();
        if (error) {
            console.error('[AuthService] Failed to retrieve session:', error);
        }

        this.currentUser = await this.enrichUser(data?.session?.user || null);
        this.notifyAuthStateChange();

        this.client.auth.onAuthStateChange(async (_event, session) => {
            this.currentUser = await this.enrichUser(session?.user || null);
            this.notifyAuthStateChange();
        });
    }

    onAuthStateChange(callback) {
        this.authStateChangeCallbacks.push(callback);
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
    }

    notifyAuthStateChange() {
        this.authStateChangeCallbacks.forEach((cb) => cb(this.currentUser));
    }

    getUser() {
        return this.currentUser;
    }

    async signUp({ username, password }) {
        const sanitizedUsername = username?.trim();
        if (!sanitizedUsername || sanitizedUsername.length < 2) {
            throw new Error('Display name must be at least 2 characters long.');
        }

        await this.ensureUsernameAvailable(sanitizedUsername);

        const fakeEmail = `${sanitizedUsername.toLowerCase().replace(/\s+/g, '_')}@maze.local`;

        const { data, error } = await this.client.auth.signUp({
            email: fakeEmail,
            password,
            options: {
                data: {
                    username: sanitizedUsername
                },
                emailRedirectTo: undefined
            }
        });

        if (error) {
            throw this.mapSignUpError(error);
        }

        const createdUser = data.user;

        if (createdUser && Array.isArray(createdUser.identities) && createdUser.identities.length === 0) {
            throw this.createAuthError(AuthService.ERRORS.EMAIL_ALREADY_REGISTERED);
        }

        if (createdUser) {
            createdUser.user_metadata = {
                ...createdUser.user_metadata,
                username: sanitizedUsername
            };
            if (data.session) {
                await this.ensureProfileForUser(createdUser, null);
            } else {
                console.info('[AuthService] Sign-up requires email confirmation before profile creation.');
            }
        }

        return createdUser;
    }

    async signIn({ username, password }) {
        const sanitizedUsername = username?.trim();
        if (!sanitizedUsername) {
            throw this.createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
        }

        let userEmail = null;
        try {
            const { data: profileData, error: profileError } = await this.client
                .from('profiles')
                .select('email, id')
                .ilike('username', sanitizedUsername)
                .maybeSingle();

            if (profileError || !profileData) {
                throw this.createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
            }

            userEmail = profileData.email || `${sanitizedUsername.toLowerCase().replace(/\s+/g, '_')}@maze.local`;
        } catch (lookupError) {
            console.error('[AuthService] Username lookup failed:', lookupError);
            throw this.createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS);
        }

        const { data, error } = await this.client.auth.signInWithPassword({
            email: userEmail,
            password
        });
        if (error) {
            throw this.mapSignInError(error);
        }
        if (data.user) {
            await this.ensureProfileForUser(data.user, null);
        }
        const enrichedUser = await this.enrichUser(data.user);
        this.currentUser = enrichedUser;
        return enrichedUser;
    }

    async signOut() {
        const { error } = await this.client.auth.signOut();
        if (error) throw error;
    }
}

