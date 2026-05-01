/* ================================================================
   Alzahraa Candles — interactions.js
   Dynamic layer: progress bar, cart drawer, sparkles, counters,
   stagger reveals, sticky filters, search highlights, typewriter.
   Zero modifications to script.js or cart.js.
   ================================================================ */

// GUARD: prevent double-initialization
if (window.__alzahraaInteractionsInit) { /* already run */ }
else { window.__alzahraaInteractionsInit = true;

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const raf = requestAnimationFrame;

  /* ─────────────────────────────────────────────────────────────
     1. SCROLL PROGRESS BAR — gold line at very top
  ───────────────────────────────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scrollProgressBar';
    bar.style.cssText = `
      position:fixed;top:0;left:0;height:3px;width:0%;
      background:linear-gradient(90deg,#C9A46A,#A07840,#C9A46A);
      background-size:200% auto;
      z-index:9999;transition:width .1s linear;
      animation:shimmer 2s linear infinite;
    `;
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     2. CART MINI-DRAWER — slide-in panel from right
  ───────────────────────────────────────────────────────────── */
  /* Check if mobile — drawer slides from bottom */
  function isMobile() { return window.innerWidth <= 480; }

  function buildCartDrawer() {
    const drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'سلة التسوق');
    drawer.setAttribute('aria-modal', 'true');
    drawer.innerHTML = `
      <div id="cartDrawerBackdrop"></div>
      <div id="cartDrawerPanel">
        <div class="cd-header">
          <h2 class="cd-title">🛍️ سلة التسوق</h2>
          <button class="cd-close" id="cdClose" aria-label="إغلاق السلة">×</button>
        </div>
        <div class="cd-body" id="cdBody"></div>
        <div class="cd-footer" id="cdFooter"></div>
      </div>
    `;
    document.body.appendChild(drawer);

    // Bind close
    $('#cartDrawerBackdrop').addEventListener('click', closeDrawer);
    $('#cdClose').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  function readCart() {
    try {
      const raw = localStorage.getItem('candles-cart');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function money(v) {
    return `${Number(v || 0).toFixed(0)} ج.م`;
  }

  function escH(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderCartDrawer() {
    const cart = readCart();
    const body = $('#cdBody');
    const footer = $('#cdFooter');
    if (!body || !footer) return;

    if (!cart.length) {
      body.innerHTML = `
        <div class="cd-empty">
          <span class="cd-empty-icon">🕯️</span>
          <p>سلتك فارغة حالياً</p>
          <a href="./index.html#products" class="btn btn-primary btn-sm" onclick="closeCartDrawer()">تصفح المنتجات</a>
        </div>`;
      footer.innerHTML = '';
      return;
    }

    const total = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
    const count = cart.reduce((s, i) => s + (i.qty || 1), 0);

    body.innerHTML = cart.map(item => `
      <div class="cd-item" data-id="${escH(String(item.id))}">
        <div class="cd-item-img">
          ${item.image ? `<img src="${escH(item.image)}" alt="${escH(item.name)}" loading="lazy">` : '<span class="cd-img-fallback">🕯️</span>'}
        </div>
        <div class="cd-item-info">
          <p class="cd-item-name">${escH(item.name)}</p>
          <p class="cd-item-weight">${escH(item.weight || '')}</p>
          <div class="cd-item-controls">
            <button class="cd-qty-btn cd-minus" data-id="${escH(String(item.id))}" aria-label="تقليل الكمية">−</button>
            <span class="cd-qty-val">${item.qty || 1}</span>
            <button class="cd-qty-btn cd-plus" data-id="${escH(String(item.id))}" aria-label="زيادة الكمية">+</button>
            <button class="cd-remove" data-id="${escH(String(item.id))}" aria-label="إزالة من السلة">🗑️</button>
          </div>
        </div>
        <div class="cd-item-price">${money((item.price || 0) * (item.qty || 1))}</div>
      </div>`).join('');

    footer.innerHTML = `
      <div class="cd-total-row">
        <span>الإجمالي (${count} منتج)</span>
        <strong class="cd-total-price">${money(total)}</strong>
      </div>
      <a href="./cart.html" class="btn btn-primary cd-checkout-btn">متابعة الطلب →</a>
      <button class="btn btn-ghost cd-continue-btn" id="cdContinue">متابعة التسوق</button>`;

    $('#cdContinue')?.addEventListener('click', closeDrawer);

    // Qty controls — bind ONCE, not on every render
    if (!body._drawerClickBound) {
      body._drawerClickBound = true;
      body.addEventListener('click', handleDrawerCartClick);
    }
  }

  function handleDrawerCartClick(e) {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (!id) return;

    let cart = readCart();
    const idx = cart.findIndex(i => Number(i.id) === id);
    if (idx === -1) return;

    if (btn.classList.contains('cd-minus')) {
      cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
    } else if (btn.classList.contains('cd-plus')) {
      cart[idx].qty = (cart[idx].qty || 1) + 1;
    } else if (btn.classList.contains('cd-remove')) {
      const removed = cart.splice(idx, 1)[0];
      showUndoToast(removed, cart, idx);
    }

    localStorage.setItem('candles-cart', JSON.stringify(cart));
    renderCartDrawer();
    syncCartCount(cart);
  }

  // Undo toast for remove
  let undoTimer = null;
  function showUndoToast(removed, cart, idx) {
    clearTimeout(undoTimer);
    const existing = $('#undoToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'undoToast';
    toast.className = 'undo-toast';
    toast.innerHTML = `
      <span>تم إزالة «${escH(removed.name)}»</span>
      <button class="undo-toast-btn" id="undoRemoveBtn">تراجع</button>`;
    document.body.appendChild(toast);

    raf(() => toast.classList.add('show'));

    $('#undoRemoveBtn')?.addEventListener('click', () => {
      cart.splice(idx, 0, removed);
      localStorage.setItem('candles-cart', JSON.stringify(cart));
      renderCartDrawer();
      syncCartCount(cart);
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
      clearTimeout(undoTimer);
    });

    undoTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  function syncCartCount(cart) {
    const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
    $$('#cartCount').forEach(el => el.textContent = count);
  }

  function openDrawer() {
    const drawer = $('#cartDrawer');
    if (!drawer) return;
    const panel = $('#cartDrawerPanel');
    if (isMobile() && panel) {
      panel.classList.add('slide-from-bottom');
    } else {
      panel?.classList.remove('slide-from-bottom');
    }
    renderCartDrawer();
    drawer.classList.add('open');
    document.body.classList.add('drawer-open');
    setTimeout(() => $('#cdClose')?.focus(), 150);
  }

  function closeDrawer() {
    const drawer = $('#cartDrawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    document.body.classList.remove('drawer-open');
    if (typeof window.__alzahraaUnlockScroll === 'function') window.__alzahraaUnlockScroll();
  }

  window.closeCartDrawer = closeDrawer;

  // Cart icon should navigate to cart.html by default.
  // Mini-drawer is only enabled for elements that explicitly request it.
  document.addEventListener('click', e => {
    const cartBtn = e.target.closest('.cart-btn[data-drawer="true"]');
    if (!cartBtn) return;
    if (cartBtn.closest('.site-header')) {
      e.preventDefault();
      openDrawer();
    }
  });

  // Also re-render drawer when cart changes (other tabs)
  window.addEventListener('storage', e => {
    if (e.key === 'candles-cart') {
      renderCartDrawer();
      syncCartCount(readCart());
    }
  });

  /* ─────────────────────────────────────────────────────────────
     3. ADD-TO-CART SPARKLE BURST
  ───────────────────────────────────────────────────────────── */
  function spawnSparkles(originEl) {
    if (!originEl) return;
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + window.scrollX;
    const cy = rect.top + rect.height / 2 + window.scrollY;

    const colors = ['#C9A46A','#F5D78E','#A07840','#FFE4A0','#D4A86A'];
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle-particle';
      const angle = (360 / 12) * i;
      const dist = 40 + Math.random() * 50;
      const dx = Math.cos(angle * Math.PI / 180) * dist;
      const dy = Math.sin(angle * Math.PI / 180) * dist;
      const size = 6 + Math.random() * 6;
      s.style.cssText = `
        left:${cx}px; top:${cy}px; width:${size}px; height:${size}px;
        background:${colors[i % colors.length]};
        --dx:${dx}px; --dy:${dy}px;
      `;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  }

  // Observe add-to-cart clicks (after script.js fires)
  document.addEventListener('click', e => {
    const addBtn = e.target.closest('.add-to-cart, .modal-add, .card-atc');
    if (!addBtn) return;
    // Skip if button is in disabled/success state
    if (addBtn.disabled || addBtn.classList.contains('btn--added') || addBtn.classList.contains('btn--go-cart')) return;
    // Flash the button
    addBtn.classList.add('btn-success-flash');
    setTimeout(() => addBtn.classList.remove('btn-success-flash'), 500);
    // Sparkles from the button
    spawnSparkles(addBtn);
    // Bounce the cart count badge
    $$('#cartCount').forEach(el => {
      el.classList.add('cart-bounce');
      setTimeout(() => el.classList.remove('cart-bounce'), 500);
    });
  }, true); // capture phase — cosmetic only, script.js handles logic

  /* ─────────────────────────────────────────────────────────────
     4. PRODUCT CARD STAGGER — animate cards as they appear
  ───────────────────────────────────────────────────────────── */
  function staggerCards(container) {
    const cards = $$('.product-card:not(.skeleton-card)', container);
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition = `opacity .45s ease ${i * 0.06}s, transform .45s ease ${i * 0.06}s`;
      raf(() => raf(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }));
    });
  }

  // Watch for script.js to render products
  const productGrid = document.getElementById('productGrid');
  if (productGrid) {
    const mo = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.addedNodes.length && !$$('.skeleton-card', productGrid).length) {
          staggerCards(productGrid);
        }
      });
    });
    mo.observe(productGrid, { childList: true });
    window.__staggerObs = mo;
  }

  /* ─────────────────────────────────────────────────────────────
     5. STICKY FILTER BAR with active indicator pill
  ───────────────────────────────────────────────────────────── */
  function initStickyFilters() {
    const filtersEl = document.getElementById('filters');
    if (!filtersEl) return;

    const sentinel = document.createElement('div');
    sentinel.id = 'filtersSentinel';
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:100%;pointer-events:none';
    const section = filtersEl.closest('section');
    if (section) section.style.position = 'relative';
    filtersEl.parentElement?.insertBefore(sentinel, filtersEl);

    const io = new IntersectionObserver(
      ([entry]) => filtersEl.classList.toggle('filters-sticky', !entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(sentinel);
  }

  /* ─────────────────────────────────────────────────────────────
     6. ANIMATED STAT COUNTERS — count up when in view
  ───────────────────────────────────────────────────────────── */
  function animateCounter(el, target, suffix, duration = 1200) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('ar-EG') + suffix;
      if (progress < 1) raf(update);
    };
    raf(update);
  }

  function initCounters() {
    const statCards = $$('.stat-card');
    if (!statCards.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const strong = $('strong', entry.target);
        if (!strong) return;
        const text = strong.textContent.trim();
        const match = text.match(/^(\d+)(.*)$/);
        if (match) {
          animateCounter(strong, parseInt(match[1]), match[2]);
        }
      });
    }, { threshold: 0.6 });

    statCards.forEach(card => io.observe(card));
  }

  /* ─────────────────────────────────────────────────────────────
     7. PRODUCT COUNT DISPLAY — live "عرض X منتج"
  ───────────────────────────────────────────────────────────── */
  function initProductCounter() {
    const grid = document.getElementById('productGrid');
    const hint = document.getElementById('productAnnounce');
    if (!grid || !hint) return;

    const mo = new MutationObserver(() => {
      const cards = $$('.product-card:not(.skeleton-card)', grid);
      if (cards.length) {
        hint.textContent = `يتم عرض ${cards.length} منتج`;
      }
    });
    mo.observe(grid, { childList: true, subtree: false });
  }

  /* ─────────────────────────────────────────────────────────────
     8. SEARCH HIGHLIGHT — highlight matching text in product titles
  ───────────────────────────────────────────────────────────── */
  function highlightSearch() {
    const input = document.getElementById('productSearchInput');
    if (!input) return;
    const grid = document.getElementById('productGrid');

    input.addEventListener('input', () => {
      const query = input.value.trim();
      $$('.product-title', grid).forEach(title => {
        if (!query) {
          title.innerHTML = escH(title.textContent);
          return;
        }
        const text = title.textContent;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        title.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     9. TYPEWRITER HERO SUBTITLE — cycling scent descriptions
  ───────────────────────────────────────────────────────────── */
  function initTypewriter() {
    const target = document.querySelector('.hero-copy .subtitle');
    if (!target) return;

    const phrases = [
      'شمع طبيعي وروائح مختارة — لمسات ديكور تُضيء المكان.',
      'كل شمعة مصبوبة يدويًا بعناية لأجواء أكثر دفئًا.',
      'روائح فانيلا، عود، لافندر — اختر ما يناسب لحظتك.',
      'هدايا أنيقة أو ديكور هادئ — لكل مناسبة شمعتها.',
    ];

    const originalText = target.textContent.trim();
    let currentPhrase = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    // Don't run if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Don't run on mobile — saves CPU, users scroll past hero quickly
    if (window.innerWidth < 768) return;

    // Wait 3 seconds before starting
    setTimeout(() => {
      target.setAttribute('data-typewriter', 'true');
      tick();
    }, 3000);

    function tick() {
      const phrase = phrases[currentPhrase];

      if (!isDeleting) {
        target.textContent = phrase.slice(0, ++charIndex);
        if (charIndex === phrase.length) {
          isPaused = true;
          setTimeout(() => { isPaused = false; isDeleting = true; tick(); }, 2200);
          return;
        }
      } else {
        target.textContent = phrase.slice(0, --charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          currentPhrase = (currentPhrase + 1) % phrases.length;
        }
      }

      const speed = isDeleting ? 28 : 42;
      setTimeout(tick, speed);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     10. WHATSAPP BUTTON — attention pulse after idle
  ───────────────────────────────────────────────────────────── */
  function initWAPulse() {
    const waBtn = document.getElementById('floatingWhatsApp');
    if (!waBtn) return;

    // Pulse after 18 seconds of no interaction
    let timer = setTimeout(pulse, 18000);

    function pulse() {
      waBtn.classList.add('wa-pulse');
      setTimeout(() => waBtn.classList.remove('wa-pulse'), 2000);
      timer = setTimeout(pulse, 30000);
    }

    // Reset timer on first interaction only — then rebind with once:true pattern
    function resetPulseTimer() {
      clearTimeout(timer);
      timer = setTimeout(pulse, 25000);
    }
    ['click','scroll','keydown','mousemove','touchstart'].forEach(ev => {
      document.addEventListener(ev, resetPulseTimer, { once: false, passive: true, capture: false });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     11. IMAGE HOVER ZOOM CURSOR
  ───────────────────────────────────────────────────────────── */
  function initImageZoomCursor() {
    // Throttle with RAF — mousemove fires 60-300x/sec
    let rafPending = false;
    document.addEventListener('mousemove', e => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const img = e.target.closest('.product-card .product-image');
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = `${x}% ${y}%`;
      });
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     12. LIFESTYLE TRACK — auto-scroll on desktop
  ───────────────────────────────────────────────────────────── */
  function initLifestyleAutoScroll() {
    const track = document.getElementById('lifestyleTrack');
    if (!track) return;

    let paused = false;
    let scrollPos = 0;
    const speed = 0.6;

    function autoScroll() {
      if (!paused) {
        scrollPos += speed;
        if (scrollPos >= track.scrollWidth - track.clientWidth) {
          scrollPos = 0;
        }
        track.scrollLeft = scrollPos;
      }
      raf(autoScroll);
    }

    // Pause on hover / touch
    track.addEventListener('mouseenter', () => paused = true);
    track.addEventListener('mouseleave', () => paused = false);
    track.addEventListener('touchstart', () => paused = true, { passive: true });

    // Only on pointer devices — never on touch (let users swipe naturally)
    const noTouch = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const noReduce = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noTouch && noReduce) {
      raf(autoScroll);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     13. SMOOTH SECTION NUMBERS — animated entrance for stats
  ───────────────────────────────────────────────────────────── */
  function initTrustHoverTip() {
    $$('.trust-card').forEach(card => {
      card.setAttribute('tabindex', '0');
    });
    $$('.feature').forEach(f => f.setAttribute('tabindex', '0'));
  }

  /* ─────────────────────────────────────────────────────────────
     INIT — wait for DOM
  ───────────────────────────────────────────────────────────── */

  /* ── Swipe-to-close cart drawer on mobile ── */
  function initDrawerSwipe() {
    const panel = document.getElementById('cartDrawerPanel');
    if (!panel) return;
    let startX = 0, startY = 0, isDragging = false;
    const SWIPE_THRESHOLD = 80;

    panel.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    panel.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      if (isMobile()) {
        // Bottom-sheet: swipe down to close
        if (dy > 0 && !isHorizontal) {
          panel.style.transform = `translateY(${dy}px)`;
        }
      } else {
        // Side panel: swipe left to close
        if (dx < 0 && isHorizontal) {
          panel.style.transform = `translateX(${dx}px)`;
        }
      }
    }, { passive: true });

    panel.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      panel.style.transform = '';
      panel.style.transition = '';
      if (isMobile() ? dy > SWIPE_THRESHOLD : dx < -SWIPE_THRESHOLD) {
        closeDrawer();
      }
    }, { passive: true });
  }

  function init() {
    initScrollProgress();
    buildCartDrawer();
    initStickyFilters();
    initCounters();
    initProductCounter();
    highlightSearch();
    initWAPulse();
    initImageZoomCursor();
    initLifestyleAutoScroll();
    initTrustHoverTip();

    // Typewriter: delay to avoid competing with page load
    if (document.readyState === 'complete') {
      initTypewriter();
    } else {
      window.addEventListener('load', initTypewriter);
    }
  }

  // Disconnect observers on page hide to free memory
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.__staggerObs?.disconnect();
      window.__filterObs?.disconnect();
      window.__wlObs?.disconnect();
      window.__spObs?.disconnect();
      window.__priceFilterObs?.disconnect();
    }
  });


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ════════════════════════════════════════════════════════
   PREMIUM CARD QUICK ACTIONS
   Injects quick-action overlay into product cards
   ════════════════════════════════════════════════════════ */
(function initQuickActions() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  function injectActions(card) {
    if (card.querySelector('.card-quick-actions')) return;
    if (card.classList.contains('skeleton-card')) return;

    const id = card.dataset.id;
    if (!id) return;

    const wrap = document.createElement('div');
    wrap.className = 'card-quick-actions';
    // Only inject "view" overlay — ATC is already on the card to avoid double-fire
    wrap.innerHTML = `
      <button class="card-quick-btn cqb-view" data-id="${id}" type="button" aria-label="عرض المنتج">
        👁 عرض التفاصيل
      </button>`;

    // Insert inside card, after image
    const img = card.querySelector('.product-image');
    if (img) img.parentNode.insertBefore(wrap, img.nextSibling);
    else card.insertBefore(wrap, card.firstChild);
  }

  const mo = new MutationObserver(() => {
    grid.querySelectorAll('.product-card:not(.skeleton-card)').forEach(injectActions);
  });
  mo.observe(grid, { childList: true, subtree: false });
  grid.querySelectorAll('.product-card:not(.skeleton-card)').forEach(injectActions);
  /* ═══════════════════════════════════════════════════════════
     CANDLE RIPPLE — warm amber burst on product card click
  ═══════════════════════════════════════════════════════════ */
  (function initCandleRipple() {
    document.addEventListener('pointerdown', function (e) {
      var card = e.target.closest('.product-card:not(.skeleton-card)');
      if (!card) return;

      var existing = card.querySelector('.card-ripple');
      if (existing) existing.remove();

      var rect   = card.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'card-ripple';
      ripple.style.top  = (e.clientY - rect.top)  + 'px';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      card.appendChild(ripple);

      ripple.addEventListener('animationend', function() { ripple.remove(); }, { once: true });
    }, { passive: true });
  })();


  /* ═══════════════════════════════════════════════════════════
     UX ENHANCEMENTS — card feedback · search hint · scroll cue
  ═══════════════════════════════════════════════════════════ */
  (function initUXEnhancements() {

    // ── 1. Card feedback handled by script.js (card--added class) ──
    // Removed duplicate here to avoid double-feedback on add-to-cart clicks.

    // ── 2. Search hint fades when user starts typing ───────────
    const searchInput = document.getElementById('productSearchInput');
    const searchHint  = document.getElementById('searchHint');
    if (searchInput && searchHint) {
      searchInput.addEventListener('input', function() {
        searchHint.classList.toggle('hidden', this.value.length > 0);
      });
    }

    // ── 3. Hero scroll cue — hide mobile sticky on hero ────────
    // Show mobile sticky CTA only after user scrolls past hero
    const heroSection = document.getElementById('hero-section');
    const stickyCta   = document.querySelector('.mobile-sticky-cta');
    if (heroSection && stickyCta) {
      const heroObs = new IntersectionObserver(
        ([entry]) => stickyCta.classList.toggle('above-fold', entry.isIntersecting),
        { threshold: 0.10 }
      );
      heroObs.observe(heroSection);
    }

    // ── 4. Keyboard: Enter on product card opens modal ──────────
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter') return;
      const card = e.target.closest('.product-card:not(.skeleton-card)');
      if (card && e.target === card) {
        e.preventDefault();
        const id = card.dataset.id;
        if (id && typeof openProduct === 'function') openProduct(Number(id));
      }
    });

    // ── 5. Filter change announces count to screen readers ──────
    const announce = document.getElementById('productAnnounce');
    const grid     = document.getElementById('productGrid');
    if (announce && grid) {
      new MutationObserver(() => {
        const count = grid.querySelectorAll('.product-card:not(.skeleton-card)').length;
        if (count > 0) announce.textContent = `${count} منتج متاح`;
      }).observe(grid, { childList: true });
    }

  })();


})();
} // end guard
