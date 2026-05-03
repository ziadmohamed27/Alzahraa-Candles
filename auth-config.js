/* ═══════════════════════════════════════════════════════════════
   mobile-conversion.js — Alzahraa Candles
   Quick Filter Chips · Recently Viewed · Trust Strip helpers
   Mobile only (max 900px)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     QUICK CHIPS — rendered into #qs-chips-inner
     Each chip sets state.search / state.filter / state.priceMax
     then triggers renderProducts() via window.alzahraaApplyChip
  ───────────────────────────────────────────────────────────── */
  var CHIPS = [
    { label: 'الكل',            type: 'reset' },
    { label: '🏆 الأكثر مبيعًا', search: 'best seller', filter: null },
    { label: '🎁 للهدايا',       search: 'هدية' },
    { label: '🧘 استرخاء',       search: 'استرخاء' },
    { label: '🔥 روائح دافئة',   search: 'دافئ' },
    { label: '🌿 روائح هادئة',   search: 'هادئ' },
    { label: '💰 أقل من 300',    type: 'priceMax', value: 300 },
  ];

  var _activeChip = null;

  /* Build the chips bar */
  function buildChips() {
    var container = document.getElementById('qs-chips-inner');
    if (!container) return;

    container.innerHTML = CHIPS.map(function(chip, i) {
      return '<button class="qs-chip' + (i === 0 ? ' qs-chip--active' : '') + '" ' +
             'type="button" data-chip-idx="' + i + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
             chip.label + '</button>';
    }).join('');

    container.addEventListener('click', function(e) {
      var btn = e.target.closest('.qs-chip');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-chip-idx'), 10);
      applyChip(idx, container);
    });
  }

  function applyChip(idx, container) {
    var chip = CHIPS[idx];
    if (!chip) return;

    _activeChip = idx;

    /* Update visual active state */
    var buttons = container.querySelectorAll('.qs-chip');
    buttons.forEach(function(b, i) {
      b.classList.toggle('qs-chip--active', i === idx);
      b.setAttribute('aria-pressed', String(i === idx));
    });

    /* Apply state via window.state (script.js exposes state globally) */
    var s = window.__alzahraaState;
    if (!s) return;

    if (chip.type === 'reset') {
      s.search = '';
      s.filter = 'all';
      s.priceMax = null;
      /* Also clear the search input */
      var inp = document.getElementById('productSearchInput');
      if (inp) inp.value = '';
      var clr = document.getElementById('productSearchClear');
      if (clr) clr.hidden = true;
    } else if (chip.type === 'priceMax') {
      s.search = '';
      s.filter = 'all';
      s.priceMax = chip.value;
      var inp2 = document.getElementById('productSearchInput');
      if (inp2) inp2.value = '';
    } else {
      s.search = chip.search || '';
      s.filter = chip.filter || 'all';
      s.priceMax = null;
      var inp3 = document.getElementById('productSearchInput');
      if (inp3) inp3.value = s.search;
      var clr2 = document.getElementById('productSearchClear');
      if (clr2) clr2.hidden = !s.search;
    }

    /* Trigger re-render */
    if (typeof window.alzahraaRenderProducts === 'function') {
      window.alzahraaRenderProducts();
    }

    /* Scroll to products section */
    var productsSection = document.getElementById('products');
    if (productsSection) {
      var top = productsSection.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  /* Expose chip reset (called when regular search input changes) */
  window.alzahraaResetChips = function() {
    _activeChip = 0;
    var container = document.getElementById('qs-chips-inner');
    if (!container) return;
    container.querySelectorAll('.qs-chip').forEach(function(b, i) {
      b.classList.toggle('qs-chip--active', i === 0);
      b.setAttribute('aria-pressed', String(i === 0));
    });
  };

  /* ─────────────────────────────────────────────────────────────
     Sync chips reset when user types in search input
  ───────────────────────────────────────────────────────────── */
  function bindSearchSync() {
    var inp = document.getElementById('productSearchInput');
    if (!inp) return;
    inp.addEventListener('input', function() {
      if (inp.value.trim()) {
        /* User is typing manually — reset active chip to "الكل" visual */
        var container = document.getElementById('qs-chips-inner');
        if (container) {
          container.querySelectorAll('.qs-chip').forEach(function(b, i) {
            b.classList.toggle('qs-chip--active', i === 0);
          });
        }
        /* also clear priceMax */
        if (window.__alzahraaState) window.__alzahraaState.priceMax = null;
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     Init — wait for DOM
  ───────────────────────────────────────────────────────────── */
  function init() {
    buildChips();
    bindSearchSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
