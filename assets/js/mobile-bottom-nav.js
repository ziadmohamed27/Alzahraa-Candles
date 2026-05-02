/* ═══════════════════════════════════════════════════════════════
   Mobile Bottom Navigation — Alzahraa Candles
   Handles: cart count sync, auth state, active page detection
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Only run on mobile ──────────────────────────────────────
  if (window.innerWidth > 768) return;

  // ── Prevent double-init ────────────────────────────────────
  if (document.getElementById('mbn-root')) return;

  // ── Detect current page ────────────────────────────────────
  var path = window.location.pathname;
  function isPage(name) {
    return path.endsWith(name) || path.endsWith(name.replace('.html', ''));
  }

  var IS_HOME    = isPage('index.html') || path === '/' || path.endsWith('/');
  var IS_CART    = isPage('cart.html');
  var IS_ACCOUNT = isPage('account.html');
  var IS_ORDERS  = isPage('my-orders.html');
  var IS_LOGIN   = isPage('login.html') || isPage('signup.html');

  // ── Cart count helpers ──────────────────────────────────────
  function getCartCount() {
    try {
      var raw = localStorage.getItem('candles-cart');
      if (!raw) return 0;
      var items = JSON.parse(raw);
      if (!Array.isArray(items)) return 0;
      return items.reduce(function (sum, item) {
        return sum + (parseInt(item.qty, 10) || 0);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  function updateBadge(badge, count) {
    if (!badge) return;
    var prev = badge.getAttribute('data-count');
    badge.setAttribute('data-count', count);
    badge.textContent = count > 0 ? (count > 99 ? '99+' : count) : '';
    // Pop animation on change
    if (prev !== String(count) && count > 0) {
      badge.classList.remove('mbn-badge-pop');
      void badge.offsetWidth; // reflow
      badge.classList.add('mbn-badge-pop');
    }
  }

  // ── Build HTML ──────────────────────────────────────────────
  var nav = document.createElement('nav');
  nav.id = 'mbn-root';
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'التنقل السريع');
  nav.setAttribute('role', 'navigation');

  // Determine account href (will be updated after auth check)
  var accountHref = './login.html';

  nav.innerHTML =
    // 1. Home
    '<a href="./index.html" class="mbn-item' + (IS_HOME ? ' mbn-active' : '') + '" aria-label="الرئيسية">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>' +
          '<path d="M9 21V12h6v9"/>' +
        '</svg>' +
      '</span>' +
      '<span class="mbn-label">الرئيسية</span>' +
    '</a>' +

    // 2. Products
    '<a href="./index.html#products" class="mbn-item" aria-label="المنتجات">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<rect x="2" y="7" width="20" height="14" rx="2"/>' +
          '<path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>' +
          '<line x1="12" y1="12" x2="12" y2="16"/>' +
          '<line x1="10" y1="14" x2="14" y2="14"/>' +
        '</svg>' +
      '</span>' +
      '<span class="mbn-label">المنتجات</span>' +
    '</a>' +

    // 3. Cart
    '<a href="./cart.html" class="mbn-item' + (IS_CART ? ' mbn-active' : '') + '" aria-label="السلة" id="mbn-cart-link">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>' +
          '<line x1="3" y1="6" x2="21" y2="6"/>' +
          '<path d="M16 10a4 4 0 01-8 0"/>' +
        '</svg>' +
        '<span class="mbn-cart-badge" id="mbn-cart-badge" data-count="0" aria-live="polite" aria-label="عدد منتجات السلة"></span>' +
      '</span>' +
      '<span class="mbn-label">السلة</span>' +
    '</a>' +

    // 4. Account
    '<a href="./login.html" class="mbn-item' + (IS_ACCOUNT || IS_LOGIN ? ' mbn-active' : '') + '" aria-label="حسابي" id="mbn-account-link">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>' +
          '<circle cx="12" cy="7" r="4"/>' +
        '</svg>' +
      '</span>' +
      '<span class="mbn-label" id="mbn-account-label">حسابي</span>' +
    '</a>' +

    // 5. My Orders
    '<a href="./my-orders.html" class="mbn-item' + (IS_ORDERS ? ' mbn-active' : '') + '" aria-label="طلباتي">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>' +
          '<polyline points="14 2 14 8 20 8"/>' +
          '<line x1="16" y1="13" x2="8" y2="13"/>' +
          '<line x1="16" y1="17" x2="8" y2="17"/>' +
          '<polyline points="10 9 9 9 8 9"/>' +
        '</svg>' +
      '</span>' +
      '<span class="mbn-label">طلباتي</span>' +
    '</a>';

  document.body.appendChild(nav);


  // Products shortcut: on the homepage, scroll without reloading.
  function bindProductsShortcut() {
    var productLinks = nav.querySelectorAll('a[href$="#products"]');
    for (var i = 0; i < productLinks.length; i++) {
      productLinks[i].addEventListener('click', function (event) {
        var section = document.getElementById('products');
        var path = window.location.pathname || '';
        var isHome = path === '/' || /\/index\.html$/i.test(path) || path === '';
        if (!section || !isHome) return;
        event.preventDefault();
        try { history.replaceState(null, '', '#products'); } catch (e) {}
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  bindProductsShortcut();

  // ── Initial cart count ──────────────────────────────────────
  var badge = document.getElementById('mbn-cart-badge');
  updateBadge(badge, getCartCount());

  // ── Sync with header #cartCount via MutationObserver ───────
  function attachHeaderObserver() {
    var headerCount = document.getElementById('cartCount');
    if (!headerCount) return;
    var obs = new MutationObserver(function () {
      var n = parseInt(headerCount.textContent, 10) || 0;
      updateBadge(badge, n);
    });
    obs.observe(headerCount, { childList: true, characterData: true, subtree: true });
  }

  // Also listen for localStorage changes (cross-page, same origin)
  window.addEventListener('storage', function (e) {
    if (e.key === 'candles-cart') {
      updateBadge(badge, getCartCount());
    }
  });

  // ── Auth state: update account link ────────────────────────
  function applyAuthState(loggedIn, name) {
    var link  = document.getElementById('mbn-account-link');
    var label = document.getElementById('mbn-account-label');
    if (!link) return;
    if (loggedIn) {
      link.href = './account.html';
      if (label) {
        var short = name ? name.split(' ')[0].substring(0, 6) : 'حسابي';
        label.textContent = short;
      }
    } else {
      link.href = './login.html';
      if (label) label.textContent = 'تسجيل';
    }
  }

  function checkAuth() {
    // Strategy 1: use Supabase if already initialised
    if (window.authGetSupabaseClient) {
      try {
        var sb = window.authGetSupabaseClient();
        if (sb && sb.auth) {
          sb.auth.getSession().then(function (res) {
            var session = res && res.data && res.data.session;
            if (session) {
              var name = (session.user && session.user.user_metadata &&
                (session.user.user_metadata.full_name || session.user.user_metadata.name)) || '';
              applyAuthState(true, name);
            } else {
              applyAuthState(false);
            }
          }).catch(function () { applyAuthState(false); });
          return;
        }
      } catch (e) {}
    }

    // Strategy 2: check a known Supabase session key in localStorage
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('supabase') !== -1 && keys[i].indexOf('auth-token') !== -1) {
          var raw = localStorage.getItem(keys[i]);
          if (raw) {
            var parsed = JSON.parse(raw);
            var token = parsed && (parsed.access_token || (parsed.currentSession && parsed.currentSession.access_token));
            if (token) {
              var name = '';
              try {
                var ud = parsed.user && parsed.user.user_metadata;
                if (!ud && parsed.currentSession) ud = parsed.currentSession.user && parsed.currentSession.user.user_metadata;
                name = (ud && (ud.full_name || ud.name)) || '';
              } catch (e2) {}
              applyAuthState(true, name);
              return;
            }
          }
        }
      }
    } catch (e) {}

    applyAuthState(false);
  }

  // ── Run after DOM ready ────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      attachHeaderObserver();
      updateBadge(badge, getCartCount());
      checkAuth();
    });
  } else {
    attachHeaderObserver();
    updateBadge(badge, getCartCount());
    checkAuth();
  }

  // ── Re-check auth after Supabase scripts load ──────────────
  window.addEventListener('load', function () {
    checkAuth();
    updateBadge(badge, getCartCount());
  });

})();
