/* =================================================================
   الزّهراء — auth-config.js
   Shared Supabase config and customer auth utilities
   ================================================================= */

(function initAuthConfig(global) {
  const AUTH_SUPABASE_URL = 'https://wihhfwdaysupjpfzshfq.supabase.co';
  const AUTH_SUPABASE_ANON_KEY = 'sb_publishable_UgNH99IH4aP0aLN3OhH-Vw_w2-XqO_v';

  global.AuthConfig = {
    supabaseUrl: AUTH_SUPABASE_URL,
    supabaseAnonKey: AUTH_SUPABASE_ANON_KEY,
  };

  /* Initialise one shared Supabase client for auth/account pages */
  global.createAuthClient = function createAuthClient() {
    if (!global.supabase) throw new Error('[Auth] Supabase SDK not loaded');
    return global.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_ANON_KEY);
  };

  /* Optional phone validation helper for auth/account related pages */
  global.authValidatePhone = function authValidatePhone(phone) {
    const n = (phone || '').replace(/\s+/g, '');
    return /^01[0-2,5][0-9]{8}$/.test(n);
  };



  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeDisplayName(nameLike) {
    const raw = String(nameLike || '').trim();
    if (!raw) return 'حسابي';
    const first = raw.split(/\s+/)[0] || raw;
    return first.length > 18 ? first.slice(0, 18) : first;
  }

  global.renderAccountNav = async function renderAccountNav(options = {}) {
    const wrapSelector = options.wrapSelector || '#accountNavWrap';
    const wrap = typeof wrapSelector === 'string' ? document.querySelector(wrapSelector) : wrapSelector;
    if (!wrap) return;

    let client = options.supabase || null;
    try {
      if (!client) client = global.createAuthClient();
    } catch {
      return;
    }

    let session = options.session || null;
    if (!session) {
      try {
        const { data } = await client.auth.getSession();
        session = data?.session || null;
      } catch {
        session = null;
      }
    }

    if (!session) {
      wrap.innerHTML = `
        <a href="./login.html" class="account-nav-btn is-ghost" aria-label="تسجيل الدخول">
          <span style="font-size:1rem">🔑</span>
          <span class="account-nav-label">دخول</span>
        </a>
      `;
      return;
    }

    let fullName = options.profile?.full_name || '';
    if (!fullName) {
      try {
        const { data: profile } = await client
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();
        fullName = profile?.full_name || '';
      } catch {}
    }

    const displayName = normalizeDisplayName(
      fullName ||
      session.user?.user_metadata?.full_name ||
      session.user?.user_metadata?.name ||
      (session.user?.email || '').split('@')[0]
    );

    wrap.innerHTML = `
      <a href="./account.html" class="account-nav-btn" aria-label="حسابي" title="حسابي — ${escapeHtml(displayName)}">
        <span style="font-size:1.05rem">👤</span>
        <span class="account-nav-label">${escapeHtml(displayName)}</span>
      </a>
    `;
  };

  /* Friendly auth error messages */
  global.authErrorMessage = function authErrorMessage(error) {
    if (!error) return 'حدث خطأ غير متوقع';
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('invalid login credentials')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    if (msg.includes('email not confirmed')) return 'بريدك الإلكتروني لم يتم تأكيده بعد — تحقق من صندوق الوارد أو رسائل Spam';
    if (msg.includes('user already registered') || msg.includes('already been registered')) return 'هذا البريد الإلكتروني مستخدم بالفعل — جرّب تسجيل الدخول';
    if (msg.includes('password')) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (msg.includes('network') || msg.includes('fetch')) return 'تعذر الاتصال — تحقق من الإنترنت وأعد المحاولة';
    return 'حدثت مشكلة، أعد المحاولة بعد قليل';
  };
})(window);
