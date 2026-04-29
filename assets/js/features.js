/* ================================================================
   Alzahraa Candles — features.js
   New business features: Wishlist, Search Autocomplete,
   Scent Quiz, Price Slider, WA bubble, Recently Searched.
   ================================================================ */

if (window.__alzahraaFeaturesInit) { /* guard */ } else {
window.__alzahraaFeaturesInit = true;
(function () {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const escH = str => String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const money = v => `${Number(v || 0).toFixed(0)} ج.م`;

  /* ── helpers ── */
  function getProds() { return window.currentProducts || []; }
  function toast(msg, dur = 2000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), dur);
  }

  /* ═══════════════════════════════════════════════════════════
     1. WISHLIST — heart button on every product card
  ═══════════════════════════════════════════════════════════ */
  const WL_KEY = 'candles-wishlist';

  function getWishlist() {
    try { return new Set(JSON.parse(localStorage.getItem(WL_KEY) || '[]')); }
    catch { return new Set(); }
  }

  function saveWishlist(set) {
    localStorage.setItem(WL_KEY, JSON.stringify([...set]));
  }

  function toggleWishlist(id) {
    const wl = getWishlist();
    const numId = Number(id);
    if (wl.has(numId)) {
      wl.delete(numId);
      toast('تمت إزالة المنتج من المفضلة');
    } else {
      wl.add(numId);
      toast('تمت إضافة المنتج إلى المفضلة');
    }
    saveWishlist(wl);
    updateHearts();
  }

  function updateHearts() {
    const wl = getWishlist();
    $$('.wl-btn').forEach(btn => {
      const id = Number(btn.dataset.id);
      const active = wl.has(id);
      btn.classList.toggle('wl-active', active);
      btn.setAttribute('aria-pressed', active);
      btn.title = active ? 'إزالة من المفضلة' : 'إضافة للمفضلة';
      btn.innerHTML = active ? '❤️' : '🤍';
    });
    updateWishlistNav(wl.size);
  }

  function updateWishlistNav(count) {
    const navBtn = document.getElementById('wishlistNavBtn');
    const countEl = document.getElementById('wishlistCount');
    if (!navBtn || !countEl) return;
    const size = Number(count) || 0;
    countEl.textContent = size;
    navBtn.classList.toggle('is-empty', size === 0);
    navBtn.setAttribute('href', size ? '#wishlistSection' : '#products');
    navBtn.setAttribute('title', size ? `المفضلة (${size})` : 'المفضلة');
    navBtn.setAttribute('aria-label', size ? `المفضلة، ${size} عناصر` : 'المفضلة');
  }

  function injectHeartButtons() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const mo = new MutationObserver(() => {
      // childList only (not subtree) — prevents observing our own mutations
      $$('.product-card:not(.skeleton-card)', grid).forEach(card => {
        if (card.querySelector('.wl-btn')) return;
        const id = card.dataset.id;
        if (!id) return;
        const btn = document.createElement('button');
        btn.className = 'wl-btn';
        btn.dataset.id = id;
        btn.type = 'button';
        btn.setAttribute('aria-label', 'إضافة للمفضلة');
        btn.innerHTML = '🤍';
        card.appendChild(btn);
      });
      updateHearts();
    });

    mo.observe(grid, { childList: true, subtree: false });
    window.__wlObs = mo;
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.wl-btn');
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(btn.dataset.id);
    // Animate
    btn.classList.add('wl-pop');
    setTimeout(() => btn.classList.remove('wl-pop'), 400);
  });

  /* Wishlist page — show favorites section when any saved */
  function renderWishlistSection() {
    const section = document.getElementById('wishlistSection');
    if (!section) return;
    const wl = getWishlist();
    const prods = getProds().filter(p => wl.has(Number(p.id)));

    if (!prods.length) { section.style.display = 'none'; updateWishlistNav(0); return; }
    section.style.display = '';

    updateWishlistNav(prods.length);

    const track = section.querySelector('.wl-track');
    if (!track) return;
    track.innerHTML = prods.map(p => `
      <div class="rv-card view-product" data-id="${p.id}" role="button" tabindex="0"
           aria-label="${escH(p.name)}">
        <div class="rv-img">
          ${p.image ? `<img src="${escH(p.image)}" alt="${escH(p.name)}" loading="lazy">` : '<span class="rv-fallback">🕯️</span>'}
        </div>
        <div class="rv-info">
          <p class="rv-name">${escH(p.name)}</p>
          <p class="rv-price">${money(p.price)}</p>
        </div>
      </div>`).join('');
  }

  /* ═══════════════════════════════════════════════════════════
     2. SEARCH AUTOCOMPLETE — live dropdown
  ═══════════════════════════════════════════════════════════ */
  const RS_KEY = 'candles-recent-search';

  function getRecentSearches() {
    try { return JSON.parse(localStorage.getItem(RS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveSearch(q) {
    if (!q || q.length < 2) return;
    let rs = getRecentSearches().filter(s => s !== q);
    rs.unshift(q);
    rs = rs.slice(0, 5);
    localStorage.setItem(RS_KEY, JSON.stringify(rs));
  }

  function initSearchAutocomplete() {
    const input = document.getElementById('productSearchInput');
    if (!input) return;

    // Build dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'searchDropdown';
    dropdown.className = 'search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', 'اقتراحات البحث');
    input.parentElement?.parentElement?.style.setProperty('position', 'relative');
    input.closest('.products-search-field')?.parentElement?.appendChild(dropdown);

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => updateDropdown(input.value.trim()), 120);
    });

    input.addEventListener('focus', () => {
      if (!input.value.trim()) showRecentSearches(dropdown);
    });

    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target) && e.target !== input) {
        dropdown.classList.remove('open');
      }
    });

    // Keyboard navigation
    input.addEventListener('keydown', e => {
      if (!dropdown.classList.contains('open')) return;
      const items = $$('.sd-item', dropdown);
      const current = dropdown.querySelector('.sd-item.focused');
      const idx = items.indexOf(current);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[idx + 1] || items[0];
        current?.classList.remove('focused');
        next?.classList.add('focused');
        input.value = next?.dataset.value || input.value;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[idx - 1] || items[items.length - 1];
        current?.classList.remove('focused');
        prev?.classList.add('focused');
        input.value = prev?.dataset.value || input.value;
      } else if (e.key === 'Enter') {
        dropdown.classList.remove('open');
        saveSearch(input.value.trim());
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('open');
      }
    });
  }

  function updateDropdown(query) {
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    if (!query) { showRecentSearches(dropdown); return; }

    const prods = getProds();
    const matches = prods
      .filter(p => p.name.toLowerCase().includes(query) ||
                   (p.bestFor || '').toLowerCase().includes(query) ||
                   (p.description || '').toLowerCase().includes(query) ||
                   (p.category || '').toLowerCase().includes(query))
      .slice(0, 6);

    if (!matches.length) { dropdown.classList.remove('open'); return; }

    dropdown.innerHTML = matches.map(p => `
      <button class="sd-item" role="option" data-id="${p.id}" data-value="${escH(p.name)}" type="button">
        <span class="sd-icon">🕯️</span>
        <span class="sd-text">
          <span class="sd-name">${highlightMatch(p.name, query)}</span>
          ${p.category ? `<span class="sd-cat">${escH(p.category)}</span>` : ''}
        </span>
        <span class="sd-price">${money(p.price)}</span>
      </button>`).join('');

    dropdown.classList.add('open');

    // Click on suggestion
    $$('.sd-item', dropdown).forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const name = item.dataset.value;
        const input = document.getElementById('productSearchInput');
        if (input) {
          input.value = name;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        saveSearch(name);
        dropdown.classList.remove('open');
        // Open modal for this product
        document.querySelector(`.product-card[data-id="${id}"]`)?.click();
      });
    });
  }

  function showRecentSearches(dropdown) {
    const rs = getRecentSearches();
    if (!rs.length) { dropdown.classList.remove('open'); return; }

    dropdown.innerHTML = `
      <div class="sd-section-label">🕐 بحثت مؤخرًا</div>
      ${rs.map(s => `
        <button class="sd-item sd-recent" data-value="${escH(s)}" type="button">
          <span class="sd-icon">🔍</span>
          <span class="sd-text"><span class="sd-name">${escH(s)}</span></span>
          <button class="sd-remove" data-remove="${escH(s)}" aria-label="حذف" type="button">✕</button>
        </button>`).join('')}`;

    dropdown.classList.add('open');

    $$('.sd-recent', dropdown).forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('.sd-remove')) return;
        const val = item.dataset.value;
        const input = document.getElementById('productSearchInput');
        if (input) {
          input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        dropdown.classList.remove('open');
      });
    });

    $$('.sd-remove', dropdown).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const val = btn.dataset.remove;
        const rs2 = getRecentSearches().filter(s => s !== val);
        localStorage.setItem(RS_KEY, JSON.stringify(rs2));
        showRecentSearches(dropdown);
      });
    });
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escH(text).replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  /* ═══════════════════════════════════════════════════════════
     3. SCENT FINDER QUIZ — 3-step interactive quiz
  ═══════════════════════════════════════════════════════════ */
  const quiz = {
    steps: [
      {
        q: 'ما الأجواء التي تبحث عنها؟',
        icon: '🌸',
        choices: [
          { label: 'هادئة ومريحة', value: 'calm', icon: '😌' },
          { label: 'دافئة ومنزلية', value: 'warm', icon: '🏡' },
          { label: 'أنيقة وفاخرة', value: 'luxury', icon: '✨' },
          { label: 'منعشة ومفرحة', value: 'fresh', icon: '🌿' },
        ],
      },
      {
        q: 'ما الرائحة المفضلة لديك؟',
        icon: '👃',
        choices: [
          { label: 'فانيلا وكراميل', value: 'vanilla', icon: '🍦' },
          { label: 'ورد وأزهار', value: 'floral', icon: '🌹' },
          { label: 'عود وأمبر', value: 'oud', icon: '🪵' },
          { label: 'لافندر ومينت', value: 'lavender', icon: '💜' },
        ],
      },
      {
        q: 'لماذا الشمعة؟',
        icon: '🎯',
        choices: [
          { label: 'هدية لشخص أحبه', value: 'gift', icon: '🎁' },
          { label: 'ديكور المنزل', value: 'decor', icon: '🏠' },
          { label: 'لحظات الاسترخاء', value: 'relax', icon: '🛁' },
          { label: 'أجواء رومانسية', value: 'romantic', icon: '🕯️' },
        ],
      },
    ],
    answers: [],
    current: 0,
  };

  function buildQuizModal() {
    const modal = document.createElement('div');
    modal.id = 'quizModal';
    modal.className = 'quiz-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'مساعد اختيار الشمعة');
    modal.innerHTML = `
      <div class="quiz-backdrop" id="quizBackdrop"></div>
      <div class="quiz-panel" id="quizPanel">
        <button class="quiz-close" id="quizClose" aria-label="إغلاق">×</button>
        <div id="quizContent"></div>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('quizBackdrop')?.addEventListener('click', closeQuiz);
    document.getElementById('quizClose')?.addEventListener('click', closeQuiz);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeQuiz();
    });
  }

  function openQuiz() {
    quiz.answers = [];
    quiz.current = 0;
    const modal = document.getElementById('quizModal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderQuizStep();
  }

  function closeQuiz() {
    const modal = document.getElementById('quizModal');
    modal?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderQuizStep() {
    const content = document.getElementById('quizContent');
    if (!content) return;

    const step = quiz.steps[quiz.current];
    const total = quiz.steps.length;
    const progress = ((quiz.current) / total) * 100;

    content.innerHTML = `
      <div class="quiz-header">
        <p class="quiz-step-label">خطوة ${quiz.current + 1} من ${total}</p>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
      </div>
      <div class="quiz-question">
        <span class="quiz-q-icon">${step.icon}</span>
        <h3 class="quiz-q-text">${escH(step.q)}</h3>
      </div>
      <div class="quiz-choices">
        ${step.choices.map(c => `
          <button class="quiz-choice" data-value="${escH(c.value)}" type="button">
            <span class="qc-icon">${c.icon}</span>
            <span class="qc-label">${escH(c.label)}</span>
          </button>`).join('')}
      </div>`;

    // Animate in
    requestAnimationFrame(() => content.classList.add('quiz-animated'));

    $$('.quiz-choice', content).forEach(btn => {
      btn.addEventListener('click', () => {
        quiz.answers.push(btn.dataset.value);
        quiz.current++;
        if (quiz.current >= quiz.steps.length) {
          renderQuizResult();
        } else {
          content.classList.remove('quiz-animated');
          setTimeout(() => renderQuizStep(), 120);
        }
      });
    });
  }

  function renderQuizResult() {
    const content = document.getElementById('quizContent');
    if (!content) return;

    const prods = getProds();
    const answers = quiz.answers.join(' ');

    // Score products against answers
    const scored = prods.map(p => {
      let score = 0;
      const haystack = `${p.name} ${p.description} ${p.bestFor} ${p.category} ${p.tag} ${p.badge}`.toLowerCase();
      quiz.answers.forEach(ans => {
        if (haystack.includes(ans)) score += 2;
      });
      // Boost products matching mood words
      if (answers.includes('calm') && haystack.match(/هادئ|calm|lavender|ناعم/)) score += 3;
      if (answers.includes('warm') && haystack.match(/دافئ|vanilla|فانيل|warm|cinnamon/)) score += 3;
      if (answers.includes('luxury') && haystack.match(/فاخر|oud|عود|luxury|gold/)) score += 3;
      if (answers.includes('gift') && haystack.match(/هدية|gift|box/)) score += 2;
      return { ...p, _score: score };
    });

    const top = scored
      .sort((a, b) => b._score - a._score || Math.random() - 0.5)
      .slice(0, 4);

    content.innerHTML = `
      <div class="quiz-result-header">
        <span class="quiz-result-icon">🕯️</span>
        <h3>الشمعة المناسبة لك</h3>
        <p>بناءً على إجاباتك، نقترح عليكِ هذه الخيارات:</p>
      </div>
      <div class="quiz-result-grid">
        ${top.map(p => `
          <button class="quiz-result-card view-product" data-id="${p.id}" type="button">
            <div class="qrc-img">
              ${p.image ? `<img src="${escH(p.image)}" alt="${escH(p.name)}" loading="lazy">` : '<span>🕯️</span>'}
            </div>
            <div class="qrc-info">
              <p class="qrc-name">${escH(p.name)}</p>
              <p class="qrc-price">${money(p.price)}</p>
            </div>
          </button>`).join('')}
      </div>
      <div class="quiz-result-actions">
        <button class="btn btn-ghost" id="quizRetry" type="button">🔄 إعادة الاختبار</button>
        <button class="btn btn-primary" id="quizClose2" type="button">✓ موافق، عودة للمتجر</button>
      </div>`;

    requestAnimationFrame(() => content.classList.add('quiz-animated'));

    document.getElementById('quizRetry')?.addEventListener('click', () => {
      quiz.answers = []; quiz.current = 0;
      content.classList.remove('quiz-animated');
      setTimeout(() => renderQuizStep(), 120);
    });
    document.getElementById('quizClose2')?.addEventListener('click', closeQuiz);
  }

  /* ═══════════════════════════════════════════════════════════
     4. PRICE RANGE FILTER
  ═══════════════════════════════════════════════════════════ */
  function injectPriceFilter() {
    const filtersEl = document.getElementById('filters');
    if (!filtersEl || document.getElementById('priceFilterWrap')) return;

    // Wait for products to load
    const checkProds = setInterval(() => {
      const prods = getProds();
      if (!prods.length) return;
      clearInterval(checkProds);

      const prices = prods.map(p => p.price).filter(Boolean);
      const minP = Math.floor(Math.min(...prices) / 10) * 10;
      const maxP = Math.ceil(Math.max(...prices) / 10) * 10;

      if (maxP <= minP) return;

      const wrap = document.createElement('div');
      wrap.id = 'priceFilterWrap';
      wrap.className = 'price-filter-wrap';
      wrap.innerHTML = `
        <div class="price-filter-label">
          <span>السعر:</span>
          <span id="priceFilterDisplay" class="price-filter-val">
            ${minP} — ${maxP} ج.م
          </span>
          <button class="price-filter-reset" id="priceReset" type="button" title="إعادة تعيين">✕</button>
        </div>
        <div class="price-range-slider">
          <input type="range" id="priceMin" min="${minP}" max="${maxP}"
                 value="${minP}" step="5" class="range-track" aria-label="الحد الأدنى للسعر">
          <input type="range" id="priceMax" min="${minP}" max="${maxP}"
                 value="${maxP}" step="5" class="range-track" aria-label="الحد الأقصى للسعر">
          <div class="range-fill" id="rangeFill"></div>
        </div>`;

      filtersEl.parentElement?.insertBefore(wrap, filtersEl.nextSibling);

      let currentMin = minP, currentMax = maxP;

      function updatePriceDisplay() {
        const display = document.getElementById('priceFilterDisplay');
        if (display) display.textContent = `${currentMin} — ${currentMax} ج.م`;
        updateRangeFill(minP, maxP, currentMin, currentMax);
        filterByPrice(currentMin, currentMax);
      }

      function updateRangeFill(absMin, absMax, curMin, curMax) {
        const fill = document.getElementById('rangeFill');
        if (!fill) return;
        const range = absMax - absMin;
        const left = ((curMin - absMin) / range) * 100;
        const right = 100 - ((curMax - absMin) / range) * 100;
        fill.style.left = `${left}%`;
        fill.style.right = `${right}%`;
      }

      document.getElementById('priceMin')?.addEventListener('input', e => {
        currentMin = Math.min(Number(e.target.value), currentMax - 10);
        e.target.value = currentMin;
        updatePriceDisplay();
      });

      document.getElementById('priceMax')?.addEventListener('input', e => {
        currentMax = Math.max(Number(e.target.value), currentMin + 10);
        e.target.value = currentMax;
        updatePriceDisplay();
      });

      document.getElementById('priceReset')?.addEventListener('click', () => {
        currentMin = minP; currentMax = maxP;
        document.getElementById('priceMin').value = minP;
        document.getElementById('priceMax').value = maxP;
        updatePriceDisplay();
        window.__priceFilter = null;
        triggerRender();
      });

      updateRangeFill(minP, maxP, currentMin, currentMax);
    }, 500);
  }

  function filterByPrice(min, max) {
    window.__priceFilter = { min, max };
    triggerRender();
  }

  function triggerRender() {
    // Trigger script.js to re-render by dispatching input on search field
    const inp = document.getElementById('productSearchInput');
    if (inp) {
      const orig = inp.value;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Hook into script.js getVisibleProducts via product grid observer
  function hookPriceFilter() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const mo = new MutationObserver(() => {
      const filter = window.__priceFilter;
      if (!filter) return;

      $$('.product-card:not(.skeleton-card)', grid).forEach(card => {
        const id = Number(card.dataset.id);
        const prod = getProds().find(p => Number(p.id) === id);
        if (!prod) return;
        const show = prod.price >= filter.min && prod.price <= filter.max;
        card.style.display = show ? '' : 'none';
      });
    });

    mo.observe(grid, { childList: true });
    window.__priceFilterObs = mo;
  }

  /* ═══════════════════════════════════════════════════════════
     5. "BACK TO PRODUCTS" STICKY BUTTON
  ═══════════════════════════════════════════════════════════ */
  function initBackToProducts() {
    const btn = document.createElement('button');
    btn.id = 'backToProdsBtn';
    btn.className = 'back-to-prods-btn';
    btn.setAttribute('aria-label', 'العودة للمنتجات');
    btn.innerHTML = '⬆ المنتجات';
    document.body.appendChild(btn);

    const prodSection = document.getElementById('products');
    if (!prodSection) return;

    const io = new IntersectionObserver(([entry]) => {
      btn.classList.toggle('visible', !entry.isIntersecting && window.scrollY > 200);
    }, { threshold: 0 });
    io.observe(prodSection);

    btn.addEventListener('click', () => {
      prodSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     QUIZ TRIGGER — add to guide section
  ═══════════════════════════════════════════════════════════ */
  function injectQuizTrigger() {
    const guide = document.getElementById('guide');
    if (!guide) return;

    const existing = guide.querySelector('.quiz-trigger-btn');
    if (existing) return;

    const btn = document.createElement('button');
    btn.className = 'btn btn-primary quiz-trigger-btn';
    btn.type = 'button';
    btn.innerHTML = '✨ ساعدني أختار الشمعة المناسبة';
    btn.addEventListener('click', openQuiz);

    // Insert at top of guide section container
    const container = guide.querySelector('.container');
    if (container) container.insertBefore(btn, container.firstChild);
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    injectHeartButtons();
    initSearchAutocomplete();
    buildQuizModal();
    injectPriceFilter();
    hookPriceFilter();
    initBackToProducts();

    // Inject quiz trigger — just try immediately, no observer needed
    injectQuizTrigger();

    // Wishlist section
    renderWishlistSection();
    window.addEventListener('storage', e => {
      if (e.key === WL_KEY) { updateHearts(); renderWishlistSection(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for other scripts
  window.openScentQuiz = openQuiz;

})();
} // end features guard
