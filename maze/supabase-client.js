// Initializes a Supabase client instance using the configuration defined in
// `supabase-config.js`. The resulting client is exposed globally as
// `window.supabaseClient` so other scripts can reuse a single connection.

(function initializeSupabase() {
    if (!window.SUPABASE_CONFIG) {
        console.warn('[Supabase] Missing configuration. Make sure supabase-config.js is loaded first.');
        return;
    }

    if (!window.supabase) {
        console.error('[Supabase] The Supabase JS library is not loaded.');
        return;
    }

    const { url, anonKey } = window.SUPABASE_CONFIG;

    if (!url || !anonKey || url.includes('YOUR_PROJECT_REF') || anonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
        console.warn('[Supabase] Please update supabase-config.js with your project URL and anon key.');
    }

    window.supabaseClient = window.supabase.createClient(url, anonKey, {
        auth: {
            persistSession: true,
            detectSessionInUrl: true
        }
    });
})();


