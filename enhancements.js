/* ================================================================
   Alzahraa Candles — enhancements.js
   Quantity picker in modal, MutationObserver cleanup, image
   lightbox, recently viewed, share button, back-to-products,
   product badge tooltips, smooth page transitions.
   Runs AFTER script.js — zero modifications to original files.
   ================================================================ */

(function () {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ─────────────────────────────────────────────────────────────
     1. MODAL QUANTITY PICKER
     Injects a qty control before the Add button in the product
     modal — respects script.js addToCart() which increments qty.
  ───────────────────────────────────────────────────────────── */
  let modalQty = 1;

  function injectModalQty() {
    const modal = document.getElementById('productModalContent');
    if (!modal) return;

    const mo = new MutationObserver(() => {
      // Every time the modal content is replaced by script.js
      const addBtn = modal.querySelector('.modal-add');
      if (!addBtn || modal.querySelector('.modal-qty-wrap')) return;

      modalQty = 1;

      const wrap = document.createElement('div');
      wrap.className = 'modal-qty-wrap';
      wrap.setAttribute('aria-label', 'اختيار الكمية');
      wrap.innerHTML = `
        <span class="modal-qty-label">الكمية</span>
        <div class="modal-qty-row">
          <button class="btn btn-ghost modal-qty-btn" id="mqMinus" type="button" aria-label="تقليل">−</button>
          <span class="modal-qty-val" id="mqVal" aria-live="polite">1</span>
          <button class="btn btn-ghost modal-qty-btn" id="mqPlus"  type="button" aria-label="زيادة">+</button>
        </div>`;

      // Insert before the hero-actions div
      const actions = modal.querySelector('.hero-actions');
      if (actions) actions.parentNode.insertBefore(wrap, actions);

      modal.querySelector('#mqMinus')?.addEventListener('click', () => {
        if (modalQty > 1) { modalQty--; updateMq(); }
      });
      modal.querySelector('#mqPlus')?.addEventListener('click', () => {
        if (modalQty < 99) { modalQty++; updateMq(); }
      });

      // Override the add button to add qty times
      addBtn.addEventListener('click', function override(e) {
        if (modalQty <= 1) return; // qty=1 is handled by script.js normally
        e.stopImmediatePropagation();
        const id = Number(addBtn.dataset.id);
        if (!id) return;

        // Get current cart and bump by extra qty-1 (script.js adds 1)
        try {
          const raw = localStorage.getItem('candles-cart');
          const cart = raw ? JSON.parse(raw) : [];
          const item = cart.find(i => Number(i.id) === id);
          if (item) {
            item.qty = (item.qty || 1) + (modalQty - 1);
          } else {
            // Product not yet in cart — script.js will add it, then we fix qty
            setTimeout(() => {
              const raw2 = localStorage.getItem('candles-cart');
              const cart2 = raw2 ? JSON.parse(raw2) : [];
              const found = cart2.find(i => Number(i.id) === id);
              if (found) {
                found.qty = modalQty;
                localStorage.setItem('candles-cart', JSON.stringify(cart2));
                // Sync badge
                const count = cart2.reduce((s, i) => s + (i.qty || 1), 0);
                $$('#cartCount').forEach(el => el.textContent = count);
              }
            }, 80);
            return; // let script.js proceed normally
          }
          localStorage.setItem('candles-cart', JSON.stringify(cart));
          const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
          $$('#cartCount').forEach(el => el.textContent = count);
        } catch (err) { console.warn(err); }
      }, true);
    });

    mo.observe(modal, { childList: true });
    // Store ref for cleanup
    window.__mqObserver = mo;
  }

  function updateMq() {
    const val = document.getElementById('mqVal');
    const minus = document.getElementById('mqMinus');
    if (val) val.textContent = modalQty;
    if (minus) minus.disabled = modalQty <= 1;
  }

  /* ─────────────────────────────────────────────────────────────
     2. RECENTLY VIEWED — horizontal strip below products
  ───────────────────────────────────────────────────────────── */
  const RV_KEY = 'candles-recent';
  const RV_MAX = 6;

  function getRecentlyViewed() {
    try { return JSON.parse(localStorage.getItem(RV_KEY) || '[]'); } catch { return []; }
  }

  function addRecentlyViewed(product) {
    try {
      let rv = getRecentlyViewed().filter(p => Number(p.id) !== Number(product.id));
      rv.unshift({ id: product.id, name: product.name, price: product.price, image: product.image });
      rv = rv.slice(0, RV_MAX);
      localStorage.setItem(RV_KEY, JSON.stringify(rv));
    } catch {}
  }

  function renderRecentlyViewed() {
    const rv = getRecentlyViewed();
    const section = document.getElementById('recentlyViewedSection');
    if (!section) return;

    if (rv.length < 2) { section.style.display = 'none'; return; }
    section.style.display = '';

    const track = section.querySelector('.rv-track');
    if (!track) return;
    const money = v => `${Number(v || 0).toFixed(0)} ج.م`;
    const escH = str => String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    track.innerHTML = rv.map(p => `
      <div class="rv-card view-product" data-id="${p.id}" role="button" tabindex="0"
           aria-label="عرض ${escH(p.name)}">
        <div class="rv-img">
          ${p.image ? `<img src="${escH(p.image)}" alt="${escH(p.name)}" loading="lazy">` : '<span class="rv-fallback">🕯️</span>'}
        </div>
        <div class="rv-info">
          <p class="rv-name">${escH(p.name)}</p>
          <p class="rv-price">${money(p.price)}</p>
        </div>
      </div>`).join('');
  }

  // Track views when modal opens
  const modalEl = document.getElementById('productModalOverlay');
  if (modalEl) {
    const viewObs = new MutationObserver(() => {
      if (!modalEl.classList.contains('hidden')) {
        const titleEl = document.getElementById('modalTitle');
        const addBtn = document.querySelector('.modal-add');
        if (titleEl && addBtn) {
          const id = Number(addBtn.dataset.id);
          try {
            const raw = localStorage.getItem('candles-cart');
            const cart = raw ? JSON.parse(raw) : [];
            // Get from cart or window.currentProducts
            const prod = window.currentProducts?.find(p => Number(p.id) === id);
            if (prod) {
              addRecentlyViewed(prod);
              renderRecentlyViewed();
            }
          } catch {}
        }
      }
    });
    viewObs.observe(modalEl, { attributes: true, attributeFilter: ['class'] });
    window.__viewObserver = viewObs;
  }

  /* ─────────────────────────────────────────────────────────────
     3. IMAGE LIGHTBOX — tap product image in modal to expand
  ───────────────────────────────────────────────────────────── */
  function initLightbox() {
    const lb = document.createElement('div');
    lb.id = 'imageLightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'عرض الصورة بحجم كامل');
    lb.innerHTML = `
      <div id="lbBackdrop"></div>
      <div id="lbContent">
        <button id="lbClose" aria-label="إغلاق">×</button>
        <img id="lbImg" alt="">
        <p id="lbCaption"></p>
      </div>`;
    document.body.appendChild(lb);

    document.getElementById('lbBackdrop')?.addEventListener('click', closeLb);
    document.getElementById('lbClose')?.addEventListener('click', closeLb);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLb();
    });

    // Open on modal image click
    document.addEventListener('click', e => {
      const img = e.target.closest('.modal-layout img');
      if (!img) return;
      const lbImg = document.getElementById('lbImg');
      const lbCap = document.getElementById('lbCaption');
      if (lbImg) { lbImg.src = img.src; lbImg.alt = img.alt; }
      if (lbCap) lbCap.textContent = img.alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeLb() {
    const lb = document.getElementById('imageLightbox');
    lb?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─────────────────────────────────────────────────────────────
     4. SHARE BUTTON — Web Share API with fallback copy
  ───────────────────────────────────────────────────────────── */
  function initShareButtons() {
    document.addEventListener('click', async e => {
      const btn = e.target.closest('.modal-share-btn');
      if (!btn) return;
      const title = document.getElementById('modalTitle')?.textContent || 'Alzahraa Candles';
      const text = `شاهدي ${title} من Alzahraa Candles 🕯️`;
      const url = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
        } catch {}
      } else {
        try {
          await navigator.clipboard.writeText(`${text} — ${url}`);
          showEnhToast('تم نسخ الرابط ✓');
        } catch {
          showEnhToast('شارك الرابط: ' + url.slice(0, 40) + '...');
        }
      }
    });
  }

  // Inject share button into modal
  function injectShareButton() {
    const modalEl = document.getElementById('productModalContent');
    if (!modalEl) return;

    const mo2 = new MutationObserver(() => {
      const actions = modalEl.querySelector('.hero-actions');
      if (!actions || actions.querySelector('.modal-share-btn')) return;

      const shareBtn = document.createElement('button');
      shareBtn.className = 'btn btn-ghost modal-share-btn';
      shareBtn.type = 'button';
      shareBtn.setAttribute('aria-label', 'مشاركة المنتج');
      shareBtn.innerHTML = '📤 مشاركة';
      actions.appendChild(shareBtn);
    });

    mo2.observe(modalEl, { childList: true });
    window.__shareObserver = mo2;
  }

  /* ─────────────────────────────────────────────────────────────
     5. SMOOTH PAGE TRANSITIONS — fade between pages
  ───────────────────────────────────────────────────────────── */
  function initPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Fade in on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity .3s ease';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    }));

    // Fade out on internal link click
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('https') || href.startsWith('mailto') ||
          href.startsWith('tel') || link.target === '_blank') return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 280);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     6. TOAST HELPER for enhancements
  ───────────────────────────────────────────────────────────── */
  function showEnhToast(msg) {
    const existing = document.getElementById('toast');
    if (existing) {
      existing.textContent = msg;
      existing.classList.add('show');
      clearTimeout(showEnhToast._t);
      showEnhToast._t = setTimeout(() => existing.classList.remove('show'), 2200);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     7. KEYBOARD NAVIGATION — product cards navigable with keys
  ───────────────────────────────────────────────────────────── */
  function initKeyboardNav() {
    document.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.product-card');
      if (card && e.target === card) {
        e.preventDefault();
        card.querySelector('.view-product, .add-to-cart')?.click();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     8. FILTER ACTIVE COUNT — badge on filter section title
  ───────────────────────────────────────────────────────────── */
  function initFilterBadge() {
    const filters = document.getElementById('filters');
    if (!filters) return;

    const mo = new MutationObserver(() => {
      const active = filters.querySelectorAll('.filter-btn.active');
      const existing = document.getElementById('filterActiveBadge');
      if (active.length > 1) {
        // More than 1 active (always includes "الكل")
        const badge = existing || (() => {
          const b = document.createElement('span');
          b.id = 'filterActiveBadge';
          b.className = 'filter-active-badge';
          filters.parentElement?.insertBefore(b, filters);
          return b;
        })();
        badge.textContent = `${active.length - 1} فلتر نشط`;
      } else if (existing) {
        existing.remove();
      }
    });

    mo.observe(filters, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.__filterObs = mo;
  }

  /* ─────────────────────────────────────────────────────────────
     9. COPY TO CLIPBOARD on phone numbers / order numbers
  ───────────────────────────────────────────────────────────── */
  function initCopyClipboard() {
    document.addEventListener('click', async e => {
      const copyBtn = e.target.closest('[data-copy]');
      if (!copyBtn) return;
      const text = copyBtn.dataset.copy || copyBtn.textContent;
      try {
        await navigator.clipboard.writeText(text.trim());
        const orig = copyBtn.textContent;
        copyBtn.textContent = '✓ تم النسخ';
        setTimeout(() => { copyBtn.textContent = orig; }, 1500);
      } catch {}
    });
  }

  /* ─────────────────────────────────────────────────────────────
     10. SCROLL-LINKED HERO PARALLAX — subtle depth effect
  ───────────────────────────────────────────────────────────── */
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    if (!hero || !heroVisual) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroVisual.style.transform = `translateY(${y * 0.12}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    injectModalQty();
    initLightbox();
    initShareButtons();
    injectShareButton();
    initPageTransitions();
    initKeyboardNav();
    initFilterBadge();
    initCopyClipboard();
    initHeroParallax();

    // Recently viewed — render on load, re-render when products change
    renderRecentlyViewed();
    const prodGrid = document.getElementById('productGrid');
    if (prodGrid) {
      let rvRendered = false;
      const rvObs = new MutationObserver(() => {
        renderRecentlyViewed();
        // Disconnect after first real render (skeletons replaced)
        if (!prodGrid.querySelector('.skeleton-card') && prodGrid.children.length > 0) {
          if (!rvRendered) { rvRendered = true; }
        }
      });
      rvObs.observe(prodGrid, { childList: true });
      window.__rvGridObs = rvObs;
    }
  }


  // Clean up observers when page hidden to save memory
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.__mqObserver?.disconnect();
      window.__viewObserver?.disconnect();
      window.__shareObserver?.disconnect();
      window.__rvGridObs?.disconnect();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
