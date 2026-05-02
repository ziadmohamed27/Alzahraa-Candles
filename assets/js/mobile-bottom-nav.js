/* ═══════════════════════════════════════════════════════════════
   Mobile Bottom Navigation — Alzahraa Candles
   v2 — Smart Products button · Mini Cart bar · Cart sync · Auth
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Only run on mobile ──────────────────────────────────────── */
  if (window.innerWidth > 900) return;

  /* ── Prevent double-init ─────────────────────────────────────── */
  if (document.getElementById('mbn-root')) return;

  /* ── Page detection ──────────────────────────────────────────── */
  var path = (window.location.pathname || '').toLowerCase();

  function isHomePage() {
    return (
      path === '/' ||
      path === '' ||
      path.endsWith('/index.html') ||
      path.endsWith('/index')
    );
  }

  var IS_HOME    = isHomePage();
  var IS_CART    = path.endsWith('cart.html')      || path.endsWith('/cart');
  var IS_ACCOUNT = path.endsWith('account.html')   || path.endsWith('/account');
  var IS_ORDERS  = path.endsWith('my-orders.html') || path.endsWith('/my-orders');
  var IS_LOGIN   = path.endsWith('login.html')  || path.endsWith('signup.html') ||
                   path.endsWith('/login')      || path.endsWith('/signup');

  /* ── Cart count helpers ──────────────────────────────────────── */
  function getCartCount() {
    try {
      var raw = localStorage.getItem('candles-cart');
      if (!raw) return 0;
      var items = JSON.parse(raw);
      if (!Array.isArray(items)) return 0;
      return items.reduce(function (sum, item) {
        return sum + (parseInt(item.qty, 10) || 0);
      }, 0);
    } catch (e) { return 0; }
  }

  function updateBadge(badge, count) {
    if (!badge) return;
    var prev = badge.getAttribute('data-count');
    badge.setAttribute('data-count', count);
    badge.textContent = count > 0 ? (count > 99 ? '99+' : String(count)) : '';
    if (prev !== String(count) && count > 0) {
      badge.classList.remove('mbn-badge-pop');
      void badge.offsetWidth;
      badge.classList.add('mbn-badge-pop');
    }
  }

  /* ── Build Nav HTML ──────────────────────────────────────────── */
  var nav = document.createElement('nav');
  nav.id = 'mbn-root';
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'التنقل السريع');
  nav.setAttribute('role', 'navigation');

  nav.innerHTML =
    /* 1. Home */
    '<a href="./index.html" class="mbn-item' + (IS_HOME ? ' mbn-active' : '') + '" aria-label="الرئيسية">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>' +
          '<path d="M9 21V12h6v9"/>' +
        '</svg>' +
      '</span>' +
      '<span class="mbn-label">الرئيسية</span>' +
    '</a>' +

    /* 2. Products — data-bottom-nav="products" drives event delegation */
    '<a href="./index.html#products" class="mbn-item" data-bottom-nav="products" aria-label="المنتجات">' +
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

    /* 3. Cart */
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

    /* 4. My Orders */
    '<a href="./my-orders.html" class="mbn-item' + (IS_ORDERS ? ' mbn-active' : '') + '" aria-label="طلباتي">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>' +
          '<polyline points="14 2 14 8 20 8"/>' +
          '<line x1="16" y1="13" x2="8" y2="13"/>' +
          '<line x1="16" y1="17" x2="8" y2="17"/>' +
        '</svg>' +
      '</span>' +
      '<span class="mbn-label">طلباتي</span>' +
    '</a>' +

    /* 5. Account */
    '<a href="./login.html" class="mbn-item' + (IS_ACCOUNT || IS_LOGIN ? ' mbn-active' : '') + '" aria-label="حسابي" id="mbn-account-link">' +
      '<span class="mbn-icon-wrap">' +
        '<svg class="mbn-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>' +
          '<circle cx="12" cy="7" r="4"/>' +
        '</svg>' +
      '</span>' +
      '<span class="mbn-label" id="mbn-account-label">حسابي</span>' +
    '</a>';

  document.body.appendChild(nav);

  /* ═══════════════════════════════════════════════════════════════
     PRODUCTS BUTTON — Smart scroll / navigate
     ═══════════════════════════════════════════════════════════════ */
  function scrollToProducts() {
    var target = document.getElementById('products');
    if (!target) return false;
    var headerOffset = 90;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: top, behavior: 'smooth' });
    return true;
  }

  /* Event delegation on the nav */
  nav.addEventListener('click', function (event) {
    var el = event.target.closest('[data-bottom-nav="products"]');
    if (!el) return;
    event.preventDefault();
    event.stopPropagation();

    if (isHomePage()) {
      try { history.replaceState(null, '', '#products'); } catch (e) {}
      scrollToProducts();
    } else {
      window.location.href = './index.html#products';
    }
  });

  /* On page load: if URL hash is #products, scroll there */
  window.addEventListener('load', function () {
    if (window.location.hash === '#products') {
      setTimeout(function () {
        if (!scrollToProducts()) {
          setTimeout(scrollToProducts, 700);
        }
      }, 250);
    }
  });

  /* ═══════════════════════════════════════════════════════════════
     MINI CART BAR — sits above bottom nav, shown after add-to-cart
     ═══════════════════════════════════════════════════════════════ */
  var miniCart = document.createElement('div');
  miniCart.id = 'ms-mini-cart';
  miniCart.setAttribute('role', 'status');
  miniCart.setAttribute('aria-live', 'polite');
  miniCart.innerHTML =
    '<span class="ms-mini-cart__msg">' +
      '<span class="ms-mini-cart__check" aria-hidden="true">✓</span>' +
      '<span id="ms-mini-cart-text">تمت الإضافة للسلة</span>' +
    '</span>' +
    '<button class="ms-mini-cart__cta" id="ms-mini-cart-btn" type="button">عرض السلة</button>';
  document.body.appendChild(miniCart);

  var _miniTimer = null;

  document.getElementById('ms-mini-cart-btn').addEventListener('click', function () {
    window.location.href = './cart.html';
  });

  /* Exposed globally — called by script.js after addToCart */
  window.alzahraaShowMiniCart = function (productName) {
    var textEl = document.getElementById('ms-mini-cart-text');
    if (textEl) {
      textEl.textContent = productName
        ? ('تمت إضافة ' + productName)
        : 'تمت الإضافة للسلة';
    }
    miniCart.classList.add('ms-mini-cart--visible');
    clearTimeout(_miniTimer);
    _miniTimer = setTimeout(function () {
      miniCart.classList.remove('ms-mini-cart--visible');
    }, 3200);
    updateBadge(document.getElementById('mbn-cart-badge'), getCartCount());
  };

  /* ═══════════════════════════════════════════════════════════════
     CART BADGE SYNC
     ═══════════════════════════════════════════════════════════════ */
  var badge = document.getElementById('mbn-cart-badge');
  updateBadge(badge, getCartCount());

  function attachHeaderObserver() {
    var headerCount = document.getElementById('cartCount');
    if (!headerCount) return;
    var obs = new MutationObserver(function () {
      var n = parseInt(headerCount.textContent, 10) || 0;
      updateBadge(badge, n);
    });
    obs.observe(headerCount, { childList: true, characterData: true, subtree: true });
  }

  window.addEventListener('storage', function (e) {
    if (e.key === 'candles-cart') {
      updateBadge(badge, getCartCount());
    }
  });

  /* ═══════════════════════════════════════════════════════════════
     AUTH STATE
     ═══════════════════════════════════════════════════════════════ */
  function applyAuthState(loggedIn, name) {
    var link  = document.getElementById('mbn-account-link');
    var label = document.getElementById('mbn-account-label');
    if (!link) return;
    if (loggedIn) {
      link.href = './account.html';
      if (label) label.textContent = name ? name.split(' ')[0].substring(0, 6) : 'حسابي';
    } else {
      link.href = './login.html';
      if (label) label.textContent = 'تسجيل';
    }
  }

  function checkAuth() {
    if (window.authGetSupabaseClient) {
      try {
        var sb = window.authGetSupabaseClient();
        if (sb && sb.auth) {
          sb.auth.getSession().then(function (res) {
            var session = res && res.data && res.data.session;
            if (session) {
              var meta = session.user && session.user.user_metadata;
              applyAuthState(true, (meta && (meta.full_name || meta.name)) || '');
            } else {
              applyAuthState(false);
            }
          }).catch(function () { applyAuthState(false); });
          return;
        }
      } catch (e) {}
    }
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('supabase') !== -1 && keys[i].indexOf('auth-token') !== -1) {
          var raw = localStorage.getItem(keys[i]);
          if (raw) {
            var parsed = JSON.parse(raw);
            var token = parsed && (parsed.access_token || (parsed.currentSession && parsed.currentSession.access_token));
            if (token) {
              var ud = (parsed.user && parsed.user.user_metadata) ||
                       (parsed.currentSession && parsed.currentSession.user && parsed.currentSession.user.user_metadata) || {};
              applyAuthState(true, (ud.full_name || ud.name) || '');
              return;
            }
          }
        }
      }
    } catch (e) {}
    applyAuthState(false);
  }

  /* ── DOM / Load hooks ── */
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

  window.addEventListener('load', function () {
    checkAuth();
    updateBadge(badge, getCartCount());
  });

})();
