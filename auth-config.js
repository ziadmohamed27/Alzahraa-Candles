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
