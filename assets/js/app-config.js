/* =================================================================
   Alzahraa Candles — app-config.js
   Shared runtime config, Supabase client factory, safe redirects,
   and admin role checks.
   ================================================================= */
(function initAppConfig(global) {
  const rawConfig = global.__SITE_CONFIG__ || {};

  function getSupabaseUrl() {
    return String(rawConfig.supabaseUrl || '').trim();
  }

  function getSupabaseAnonKey() {
    return String(rawConfig.supabaseAnonKey || '').trim();
  }

  function hasSupabaseConfig() {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && key.length > 40 && !key.startsWith('PUT_');
  }

  function createSupabaseClient() {
    if (!global.supabase) throw new Error('[Supabase] SDK not loaded');
    if (!hasSupabaseConfig()) throw new Error('[Supabase] Missing or invalid runtime config');
    return global.supabase.createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }

  const allowedRedirects = new Set([
    '/account.html',
    '/my-orders.html',
    '/cart.html',
    '/index.html',
    '/',
  ]);

  function safeRedirectTarget(value, fallback = './account.html') {
    const fallbackUrl = new URL(fallback, global.location.origin);
    const raw = String(value || '').trim();
    if (!raw) return fallback;

    try {
      if (/^[a-z][a-z0-9+.-]*:/i.test(raw) && !raw.startsWith(global.location.origin)) {
        return fallback;
      }
      if (raw.startsWith('//')) return fallback;

      const url = new URL(raw, global.location.origin);
      if (url.origin !== global.location.origin) return fallback;
      if (!allowedRedirects.has(url.pathname)) return fallback;
      return `${url.pathname}${url.search}${url.hash}`.replace(/^\//, './');
    } catch {
      return fallbackUrl.pathname.replace(/^\//, './');
    }
  }

  async function getProfileRole(client, userId) {
    if (!client || !userId) return null;
    const { data, error } = await client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[AdminAuth] Unable to read profile role', error);
      return null;
    }

    return {
      role: data?.role || 'customer',
      isAdmin: data?.role === 'admin',
    };
  }

  async function isAdminUser(client, user) {
    const userId = user?.id || user?.user?.id;
    const role = await getProfileRole(client, userId);
    return !!role?.isAdmin;
  }

  async function requireAdmin(client, options = {}) {
    const loginUrl = options.loginUrl || './admin-login.html';
    const { data } = await client.auth.getUser();
    const user = data?.user || null;

    if (!user) {
      global.location.href = loginUrl;
      return false;
    }

    const allowed = await isAdminUser(client, user);
    if (!allowed) {
      try { await client.auth.signOut(); } catch {}
      global.location.href = `${loginUrl}?error=not_admin`;
      return false;
    }

    return true;
  }

  global.AppConfig = {
    raw: rawConfig,
    getSupabaseUrl,
    getSupabaseAnonKey,
    hasSupabaseConfig,
    createSupabaseClient,
    safeRedirectTarget,
    isAdminUser,
    requireAdmin,
  };
})(window);
