import { getTranslation } from '../utils/translation.js';
import { hideModal, showModal } from '../utils/dom.js';
import { AuthService } from './authService.js';

const AUTH_ERROR_MESSAGE_KEYS = {
    DEFAULT_SIGNUP: 'auth.genericSignUpError',
    DEFAULT_SIGNIN: 'auth.genericSignInError'
};

const hydrateAuthErrorMessageKeys = () => {
    const authErrors = AuthService.ERRORS || {};
    const authTranslationKeys = AuthService.ERROR_TRANSLATIONS || {};

    Object.values(authErrors).forEach((code) => {
        const translationKey = authTranslationKeys[code];
        if (code && translationKey) {
            AUTH_ERROR_MESSAGE_KEYS[code] = translationKey;
        }
    });
};

const passwordStrengthLevels = {
    none: { barClass: '', textKey: 'auth.passwordStrengthWeak' },
    weak: { barClass: 'weak', textKey: 'auth.passwordStrengthWeak' },
    medium: { barClass: 'medium', textKey: 'auth.passwordStrengthMedium' },
    strong: { barClass: 'strong', textKey: 'auth.passwordStrengthStrong' }
};

const calculatePasswordStrength = (password) => {
    let strength = 0;

    if (password.length === 0) return { level: 'none', score: 0 };

    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    if (strength <= 2) return { level: 'weak', score: strength };
    if (strength <= 4) return { level: 'medium', score: strength };
    return { level: 'strong', score: strength };
};

const createStatusManager = (languageResolver) => {
    const authStatus = document.getElementById('authStatus');

    return {
        set(message, type = 'info') {
            if (!authStatus) return;
            authStatus.textContent = message;
            authStatus.className = '';
            if (type === 'error') authStatus.classList.add('auth-error');
            if (type === 'success') authStatus.classList.add('auth-success');
            if (type === 'loading') authStatus.classList.add('auth-loading');
        },
        clear() {
            this.set('', 'info');
        },
        resolveError(error, defaultKey) {
            const language = languageResolver();
            const code = error?.code;
            const messageKey = error?.translationKey || AUTH_ERROR_MESSAGE_KEYS[code] || defaultKey;
            return getTranslation(language, messageKey);
        }
    };
};

const createPasswordStrengthIndicator = (languageResolver) => {
    const indicator = document.getElementById('passwordStrength');
    const bar = indicator?.querySelector('.strength-bar-fill');
    const text = indicator?.querySelector('.strength-text');

    return {
        update(password) {
            if (!indicator || !bar || !text) return;

            if (password.length === 0) {
                indicator.classList.remove('visible');
                return;
            }

            indicator.classList.add('visible');
            const { level } = calculatePasswordStrength(password);
            const { barClass, textKey } = passwordStrengthLevels[level];

            bar.className = 'strength-bar-fill';
            text.className = 'strength-text';
            if (barClass) {
                bar.classList.add(barClass);
                text.classList.add(barClass);
            }

            const language = languageResolver();
            const translation = getTranslation(language, textKey);
            text.textContent = translation;
            text.dataset.i18n = textKey;
        }
    };
};

const switchAuthTab = (tab, languageResolver) => {
    const authTabButtons = document.querySelectorAll('.auth-tab-btn');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const authAlternativeAction = document.getElementById('authAlternativeAction');
    const authModalTitle = document.getElementById('authModalTitle');

    authTabButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.authTab === tab);
    });

    const language = languageResolver();

    if (tab === 'signin') {
        signInForm?.classList.remove('hidden');
        signUpForm?.classList.add('hidden');
        if (authAlternativeAction) {
            const textKey = 'auth.needAccount';
            authAlternativeAction.dataset.i18n = textKey;
            authAlternativeAction.textContent = getTranslation(language, textKey);
        }
        if (authModalTitle) {
            const titleKey = 'auth.modalTitleSignin';
            authModalTitle.dataset.i18n = titleKey;
            authModalTitle.textContent = getTranslation(language, titleKey);
        }
    } else {
        signInForm?.classList.add('hidden');
        signUpForm?.classList.remove('hidden');
        if (authAlternativeAction) {
            const textKey = 'auth.haveAccount';
            authAlternativeAction.dataset.i18n = textKey;
            authAlternativeAction.textContent = getTranslation(language, textKey);
        }
        if (authModalTitle) {
            const titleKey = 'auth.modalTitleSignup';
            authModalTitle.dataset.i18n = titleKey;
            authModalTitle.textContent = getTranslation(language, titleKey);
        }
    }
};

const setupPasswordToggleButtons = () => {
    const buttons = document.querySelectorAll('.toggle-password');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const input = targetId ? document.getElementById(targetId) : null;
            const eyeIcon = button.querySelector('.eye-icon');
            const eyeOffIcon = button.querySelector('.eye-off-icon');

            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon?.classList.add('hidden');
                eyeOffIcon?.classList.remove('hidden');
            } else {
                input.type = 'password';
                eyeIcon?.classList.remove('hidden');
                eyeOffIcon?.classList.add('hidden');
            }
        });
    });
};

export const createAuthModal = ({ settingsManager, authService }) => {
    hydrateAuthErrorMessageKeys();

    const statusManager = createStatusManager(() => settingsManager.getLanguage());
    const passwordIndicator = createPasswordStrengthIndicator(() => settingsManager.getLanguage());
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authAlternativeAction = document.getElementById('authAlternativeAction');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const signupPasswordInput = document.getElementById('signupPassword');
    const authTabButtons = document.querySelectorAll('.auth-tab-btn');
    let activeTab = 'signin';

    const openModal = (tab = 'signin') => {
        activeTab = tab;
        switchAuthTab(activeTab, () => settingsManager.getLanguage());
        statusManager.clear();
        showModal('authModal');
    };

    const closeModal = () => {
        hideModal('authModal');
    };

    authTabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.authTab;
            if (!tab) return;
            activeTab = tab;
            switchAuthTab(activeTab, () => settingsManager.getLanguage());
        });
    });

    authAlternativeAction?.addEventListener('click', () => {
        activeTab = activeTab === 'signin' ? 'signup' : 'signin';
        switchAuthTab(activeTab, () => settingsManager.getLanguage());
    });

    closeAuthModal?.addEventListener('click', closeModal);
    authModal?.addEventListener('click', (event) => {
        if (event.target === authModal) {
            closeModal();
        }
    });

    signupPasswordInput?.addEventListener('input', (event) => {
        const value = event.target.value;
        passwordIndicator.update(value);
    });

    setupPasswordToggleButtons();

    const handleSignIn = async (event) => {
        event.preventDefault();
        if (!authService) return;

        statusManager.set(getTranslation(settingsManager.getLanguage(), 'auth.signingIn'), 'loading');

        const username = document.getElementById('signinUsername')?.value.trim();
        const password = document.getElementById('signinPassword')?.value;

        try {
            await authService.signIn({ username, password });
            statusManager.set(getTranslation(settingsManager.getLanguage(), 'auth.signedIn'), 'success');
        } catch (error) {
            const message = statusManager.resolveError(error, AUTH_ERROR_MESSAGE_KEYS.DEFAULT_SIGNIN);
            statusManager.set(message, 'error');
            console.error('[SignIn]', error);
        }
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        if (!authService) return;

        const username = document.getElementById('signupUsername')?.value.trim();
        const password = document.getElementById('signupPassword')?.value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm')?.value;

        if (!username || username.length < 2) {
            statusManager.set(getTranslation(settingsManager.getLanguage(), 'auth.usernameRequired'), 'error');
            return;
        }

        if (password !== passwordConfirm) {
            statusManager.set(getTranslation(settingsManager.getLanguage(), 'auth.passwordMismatch'), 'error');
            return;
        }

        statusManager.set(getTranslation(settingsManager.getLanguage(), 'auth.creatingAccount'), 'loading');

        try {
            await authService.signUp({ username, password });
            statusManager.set(getTranslation(settingsManager.getLanguage(), 'auth.accountCreated'), 'success');
            setTimeout(() => {
                activeTab = 'signin';
                switchAuthTab(activeTab, () => settingsManager.getLanguage());
                const signinUsername = document.getElementById('signinUsername');
                if (signinUsername) {
                    signinUsername.value = username;
                }
                signUpForm?.reset();
            }, 1500);
        } catch (error) {
            const message = statusManager.resolveError(error, AUTH_ERROR_MESSAGE_KEYS.DEFAULT_SIGNUP);
            statusManager.set(message, 'error');
            console.error('[SignUp]', error);
        }
    };

    signInForm?.addEventListener('submit', handleSignIn);
    signUpForm?.addEventListener('submit', handleSignUp);

    return {
        open: openModal,
        close: closeModal,
        switchTab(tab) {
            activeTab = tab;
            switchAuthTab(activeTab, () => settingsManager.getLanguage());
        },
        setStatus(message, type) {
            statusManager.set(message, type);
        }
    };
};

