/* =================================================================
   Alzahraa Candles — auth-config.js
   Shared Supabase config and customer auth utilities
   ================================================================= */

(function initAuthConfig(global) {
  const SITE_CONFIG = global.__SITE_CONFIG__ || {};
  const AUTH_SUPABASE_URL = SITE_CONFIG.supabaseUrl || 'https://wihhfwdaysupjpfzshfq.supabase.co';
    const AUTH_SUPABASE_ANON_KEY = SITE_CONFIG.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGhmd2RheXN1cGpwZnpzaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTI4MjAsImV4cCI6MjA4ODkyODgyMH0.Eem_ytvdtd7UnkWaguief7WeaZFbP4vU16gfl4gefls';

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

  const ORDER_STATUS_LABELS = {
    pending: 'قيد المراجعة',
    confirmed: 'تم التأكيد',
    processing: 'قيد التجهيز',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };

  function getWishlistCount() {
    try {
      const parsed = JSON.parse(global.localStorage.getItem('candles-wishlist') || '[]');
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }

  function getCartCount() {
    try {
      const parsed = JSON.parse(global.localStorage.getItem('candles-cart') || '[]');
      return Array.isArray(parsed) ? parsed.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0) : 0;
    } catch {
      return 0;
    }
  }

  async function getCurrentSession(client, providedSession = null) {
    if (providedSession) return providedSession;
    try {
      const { data } = await client.auth.getSession();
      return data?.session || null;
    } catch {
      return null;
    }
  }

  async function signOutAndGoHome(client) {
    try { await client.auth.signOut(); } catch {}
    global.location.href = './index.html';
  }

  function closeHeaderMenus(except = null) {
    document.querySelectorAll('.account-menu-wrap.is-open, .notification-wrap.is-open').forEach((wrap) => {
      if (wrap !== except) wrap.classList.remove('is-open');
    });
  }

  function bindHeaderMenuEvents() {
    if (global.__alzahraaHeaderMenuEventsBound) return;
    global.__alzahraaHeaderMenuEventsBound = true;

    document.addEventListener('click', async (event) => {
      const accountToggle = event.target.closest('[data-account-menu-toggle]');
      if (accountToggle) {
        const wrap = accountToggle.closest('.account-menu-wrap');
        const willOpen = !wrap?.classList.contains('is-open');
        closeHeaderMenus(wrap);
        wrap?.classList.toggle('is-open', willOpen);
        accountToggle.setAttribute('aria-expanded', String(willOpen));
        return;
      }

      const notificationToggle = event.target.closest('[data-notification-toggle]');
      if (notificationToggle) {
        const wrap = notificationToggle.closest('.notification-wrap');
        const willOpen = !wrap?.classList.contains('is-open');
        closeHeaderMenus(wrap);
        wrap?.classList.toggle('is-open', willOpen);
        notificationToggle.setAttribute('aria-expanded', String(willOpen));
        if (willOpen && typeof global.__markNotificationsRead === 'function') {
          global.__markNotificationsRead();
        }
        return;
      }

      const logoutBtn = event.target.closest('[data-account-logout]');
      if (logoutBtn) {
        event.preventDefault();
        let client = null;
        try { client = global.createAuthClient(); } catch {}
        if (client) await signOutAndGoHome(client);
        else global.location.href = './index.html';
        return;
      }

      if (!event.target.closest('.account-menu-wrap, .notification-wrap')) {
        closeHeaderMenus();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeHeaderMenus();
    });
  }

  global.renderAccountNav = async function renderAccountNav(options = {}) {
    bindHeaderMenuEvents();
    const wrapSelector = options.wrapSelector || '#accountNavWrap';
    const wrap = typeof wrapSelector === 'string' ? document.querySelector(wrapSelector) : wrapSelector;
    if (!wrap) return;

    let client = options.supabase || null;
    try {
      if (!client) client = global.createAuthClient();
    } catch {
      return;
    }

    const session = await getCurrentSession(client, options.session || null);
    const wishlistCount = getWishlistCount();
    const wishlistHref = global.location.pathname.endsWith('/index.html') || global.location.pathname === '/' ? '#wishlistSection' : './index.html#wishlistSection';

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
      <div class="account-menu-wrap">
        <button type="button" class="account-nav-btn account-menu-toggle" data-account-menu-toggle aria-label="قائمة الحساب" aria-haspopup="menu" aria-expanded="false" title="قائمة الحساب — ${escapeHtml(displayName)}">
          <span class="account-nav-label">${escapeHtml(displayName)}</span>
          <span style="font-size:1.05rem">👤</span>
        </button>
        <div class="account-dropdown" role="menu" aria-label="قائمة الحساب">
          <a role="menuitem" href="./account.html">👤 حسابي</a>
          <a role="menuitem" href="./my-orders.html">📦 طلباتي</a>
          <a role="menuitem" href="${wishlistHref}">❤ المفضلة <span class="menu-count">${wishlistCount}</span></a>
          <button role="menuitem" type="button" data-account-logout>🚪 تسجيل الخروج</button>
        </div>
      </div>
    `;
  };

  function readKnownOrderStatuses() {
    try { return JSON.parse(global.localStorage.getItem('candles-known-order-statuses') || '{}') || {}; }
    catch { return {}; }
  }

  function saveKnownOrderStatuses(map) {
    try { global.localStorage.setItem('candles-known-order-statuses', JSON.stringify(map || {})); } catch {}
  }

  function renderNotificationMarkup(wrap, { session, orders = [], unreadCount = 0, cartCount = 0, error = false }) {
    const orderItems = orders.slice(0, 4).map((order) => {
      const label = ORDER_STATUS_LABELS[order.status] || order.status || 'قيد المتابعة';
      return `<a href="./my-orders.html" class="notification-item ${order.__changed ? 'is-new' : ''}">
        <span>📦</span>
        <span><strong>${escapeHtml(order.order_number || `#${order.id}`)}</strong><small>حالة الطلب: ${escapeHtml(label)}</small></span>
      </a>`;
    }).join('');

    const extraItems = [];
    if (cartCount > 0) {
      extraItems.push(`<a href="./cart.html" class="notification-item"><span>🛍️</span><span><strong>السلة</strong><small>لديك ${cartCount} منتج/قطعة في السلة.</small></span></a>`);
    }

    let body = '';
    if (!session) {
      body = `<div class="notification-empty">سجل الدخول لمتابعة إشعارات الطلبات.</div>`;
    } else if (error) {
      body = `<div class="notification-empty">تعذر تحميل الإشعارات الآن.</div>`;
    } else if (orderItems || extraItems.length) {
      body = `${orderItems}${extraItems.join('')}`;
    } else {
      body = `<div class="notification-empty">لا توجد إشعارات جديدة.</div>`;
    }

    wrap.innerHTML = `
      <div class="notification-wrap">
        <button type="button" class="icon-btn notification-btn" data-notification-toggle aria-label="الإشعارات" aria-haspopup="menu" aria-expanded="false" title="الإشعارات">
          <span class="notification-emoji">🔔</span>
          <span class="notification-count ${unreadCount ? '' : 'is-zero'}">${unreadCount}</span>
        </button>
        <div class="notification-panel" role="menu" aria-label="الإشعارات">
          <div class="notification-title">الإشعارات</div>
          ${body}
          <a href="./my-orders.html" class="notification-all">عرض كل الطلبات</a>
        </div>
      </div>
    `;
  }

  global.renderNotificationNav = async function renderNotificationNav(options = {}) {
    bindHeaderMenuEvents();
    const wrapSelector = options.wrapSelector || '#notificationNavWrap';
    const wrap = typeof wrapSelector === 'string' ? document.querySelector(wrapSelector) : wrapSelector;
    if (!wrap) return;

    let client = options.supabase || null;
    try {
      if (!client) client = global.createAuthClient();
    } catch {
      renderNotificationMarkup(wrap, { session: null, cartCount: getCartCount() });
      return;
    }

    const session = await getCurrentSession(client, options.session || null);
    const cartCount = getCartCount();
    if (!session) {
      renderNotificationMarkup(wrap, { session: null, cartCount });
      return;
    }

    try {
      const { data: orders, error } = await client
        .from('orders')
        .select('id, order_number, status, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const known = readKnownOrderStatuses();
      let unreadCount = 0;
      const currentStatuses = { ...known };
      const decorated = (orders || []).map((order) => {
        const key = String(order.id || order.order_number || '');
        const previous = known[key];
        const changed = Boolean(previous && previous !== order.status);
        if (changed) unreadCount += 1;
        currentStatuses[key] = order.status || '';
        return { ...order, __changed: changed };
      });

      global.__markNotificationsRead = function markNotificationsRead() {
        saveKnownOrderStatuses(currentStatuses);
        const countEl = wrap.querySelector('.notification-count');
        if (countEl) {
          countEl.textContent = '0';
          countEl.classList.add('is-zero');
        }
      };

      renderNotificationMarkup(wrap, { session, orders: decorated, unreadCount, cartCount });
    } catch {
      renderNotificationMarkup(wrap, { session, cartCount, error: true });
    }
  };

  global.renderHeaderWidgets = async function renderHeaderWidgets(options = {}) {
    try { await global.renderAccountNav(options); } catch {}
    try { await global.renderNotificationNav(options); } catch {}
  };

  function autoRenderHeaderWidgets() {
    if (!document.querySelector('#accountNavWrap, #notificationNavWrap')) return;
    global.renderHeaderWidgets();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRenderHeaderWidgets, { once: true });
  } else {
    autoRenderHeaderWidgets();
  }

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
