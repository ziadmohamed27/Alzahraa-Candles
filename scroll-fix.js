/* ================================================================
   Alzahraa Candles — ux-v09.css
   Conversion-focused UX layer. Loaded last.
   Philosophy: every rule earns its place or it's not here.
   ================================================================ */

/* ── TOKENS (supplement luxury-polish.css) ───────────────── */
:root {
  --card-radius:   26px;
  --card-shadow:   0 2px 16px rgba(40,18,5,.048);
  --card-shadow-h: 0 14px 44px rgba(40,18,5,.10), 0 3px 10px rgba(40,18,5,.055);
  /* Aligned with luxury-polish.css for consistent warmth */
  --gold:          #BF8E52;
  --gold-dark:     #96601E;
  --gold-light:    #DEC08A;
  --text:          #291508;
  --text-mid:      #4A2E1A;
  --muted:         #8C7060;
  --cream-bg:      #FFFDFA;
  --ease:          cubic-bezier(0.22, 1, 0.36, 1);
}

/* ═══════════════════════════════════════════════════════════
   HERO — above the fold, clear & confident
   ═══════════════════════════════════════════════════════════ */
.hero-cta-primary {
  font-size: 1.06rem !important;
  padding: 16px 38px !important;
  border-radius: 16px !important;
  letter-spacing: .01em;
  box-shadow: 0 6px 26px rgba(150,90,30,.30), inset 0 1px 0 rgba(255,255,255,.12) !important;
}
.hero-cta-primary:hover {
  box-shadow: 0 10px 36px rgba(150,90,30,.40), inset 0 1px 0 rgba(255,255,255,.16) !important;
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT GRID
   ═══════════════════════════════════════════════════════════ */
.product-grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
  align-items: start;
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD — editorial, scannable, one clear CTA
   ═══════════════════════════════════════════════════════════ */
.product-card {
  border-radius: var(--card-radius);
  background: var(--cream-bg);
  border: 1px solid rgba(215,195,165,.50);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition:
    transform  0.38s var(--ease),
    box-shadow 0.38s var(--ease),
    border-color 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}

/* Image wrap */
.card-img-wrap {
  position: relative;
  overflow: hidden;
  border-radius: calc(var(--card-radius) - 1px) calc(var(--card-radius) - 1px) 0 0;
  background: linear-gradient(155deg, #F5EAD5, #E8D4B0);
  flex-shrink: 0;
}
.card-img-wrap .product-image {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  display: block;
  transition: transform 0.55s var(--ease);
}

/* Badge on image */
.card-badge {
  position: absolute;
  top: 10px;
  left: 10px; /* RTL: visually right */
  padding: 3px 10px;
  border-radius: 999px;
  font-size: .66rem;
  font-weight: 800;
  letter-spacing: .07em;
  text-transform: uppercase;
  pointer-events: none;
  z-index: 3;
  background: rgba(255,255,255,.88);
  color: var(--gold-dark);
  border: 1px solid rgba(191,142,82,.28);
  backdrop-filter: blur(8px);
}
.card-badge--highlight {
  background: linear-gradient(135deg, #BF8E52, #96601E);
  color: #fff;
  border: none;
  box-shadow: 0 2px 10px rgba(142,88,24,.26);
}

/* Card body */
.card-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--cream-bg);
}

/* Product name */
.card-name {
  font-family: "El Messiri", serif;
  font-size: 1.10rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.26;
  letter-spacing: -.012em;
  margin: 0 0 5px;
}

/* Scent hint */
.card-scent {
  font-size: .79rem;
  color: var(--muted);
  line-height: 1.42;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Price + CTA footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(215,195,165,.35);
}

.card-price {
  font-family: "El Messiri", serif;
  font-size: 1.12rem;
  font-weight: 800;
  color: var(--gold-dark);
  letter-spacing: -.01em;
  white-space: nowrap;
}

/* Add-to-cart button — compact, clear */
.card-atc {
  padding: 9px 16px !important;
  font-size: .82rem !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .18s ease, box-shadow .18s ease, transform .14s var(--ease);
}
.card-atc:hover { transform: scale(1.03); }
.card-atc:active { transform: scale(.96) !important; }

/* ── Hover state ── */
@media (hover: hover) {
  .product-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--card-shadow-h);
    border-color: rgba(191,142,82,.28);
  }
  .product-card:hover .card-img-wrap .product-image {
    transform: scale(1.04);
  }
  .product-card:hover .card-atc {
    background: linear-gradient(145deg, #BE8438, #9A6025) !important;
    box-shadow: 0 4px 18px rgba(150,90,30,.28);
    color: #fff !important;
  }
}

/* ── Active tap ── */
.product-card:active {
  transform: scale(.98) !important;
  transition-duration: 0.09s !important;
}

/* ── Added feedback ── */
.product-card.card--added {
  animation: cardAddedPulse 0.50s var(--ease);
}
@keyframes cardAddedPulse {
  0%   { box-shadow: var(--card-shadow); }
  40%  { box-shadow: 0 0 0 5px rgba(191,142,82,.18), var(--card-shadow-h); }
  100% { box-shadow: var(--card-shadow); }
}

/* Card–added button state */
.card-atc:disabled {
  background: linear-gradient(135deg, #5A8A3A, #3E6A28) !important;
  opacity: 1 !important;
  pointer-events: none;
}

/* Missing image fallback */
.product-card.img-missing .card-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4/5;
  font-size: 3rem;
}
.product-card.img-missing .card-img-wrap::after {
  content: '🕯️';
  opacity: .4;
}
.product-card.img-missing .product-image { display: none; }

/* ═══════════════════════════════════════════════════════════
   EMPTY / ERROR STATES — actionable, warm
   ═══════════════════════════════════════════════════════════ */
.products-empty-state {
  grid-column: 1/-1;
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: fadeUp .45s var(--ease) both;
}
.pes-icon  { font-size: 2.8rem; opacity: .7; margin-bottom: 4px; }
.pes-title { font-family: "El Messiri", serif; font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 0; }
.pes-hint  { font-size: .86rem; color: var(--muted); margin: 4px 0 0; }
.pes-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 16px; }
@keyframes fadeUp {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0);    }
}

/* ═══════════════════════════════════════════════════════════
   MODAL — conversion-optimised decision view
   ═══════════════════════════════════════════════════════════ */
.modal {
  border-radius: 36px;
  overflow: hidden;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
}

.modal-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-height: 90vh;
  overflow: hidden;
}

/* Image */
.modal-img-wrap {
  position: relative;
  overflow: hidden;
  background: linear-gradient(155deg, #F5EAD5, #E8D4B0);
  min-height: 320px;
}
.modal-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.modal-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: linear-gradient(135deg, #BF8E52, #96601E);
  color: #fff;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: .70rem;
  font-weight: 800;
  letter-spacing: .07em;
  text-transform: uppercase;
  box-shadow: 0 2px 12px rgba(142,88,24,.28);
}

/* Info column — scrollable */
.modal-info {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 28px 28px 0;
  max-height: 90vh;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(191,142,82,.28) transparent;
}

/* ① Name + price */
.modal-header-block {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.modal-name {
  font-family: "El Messiri", serif;
  font-size: 1.42rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
  margin: 0;
  flex: 1;
}
.modal-price-wrap { flex-shrink: 0; }
.modal-price {
  font-family: "El Messiri", serif;
  font-size: 1.45rem;
  font-weight: 900;
  color: var(--gold-dark);
  letter-spacing: -.01em;
  display: block;
}

/* ② Spec pills */
.modal-spec-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.mspec-pill {
  background: rgba(191,142,82,.08);
  border: 1px solid rgba(191,142,82,.20);
  color: #6A4018;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: .76rem;
  font-weight: 600;
}
.mspec-pill b { font-weight: 700; margin-left: 3px; }

/* ③ CTA block — primary action always visible */
.modal-cta-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.modal-add-main {
  font-size: .98rem !important;
  padding: 14px 20px !important;
  border-radius: 14px !important;
  width: 100%;
  justify-content: center;
  text-align: center;
  letter-spacing: .01em;
}
.btn-wa-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 18px;
  border-radius: 12px;
  border: 1.5px solid rgba(34,197,94,.35);
  color: #166534;
  background: rgba(34,197,94,.06);
  font-size: .86rem;
  font-weight: 700;
  text-decoration: none;
  transition: background .18s ease, border-color .18s ease, transform .18s var(--ease);
}
.btn-wa-outline:hover {
  background: rgba(34,197,94,.10);
  border-color: rgba(34,197,94,.55);
  transform: translateY(-1px);
}

/* ④ Trust strip */
.modal-trust-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding: 10px 14px;
  background: rgba(191,142,82,.06);
  border: 1px solid rgba(191,142,82,.14);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: .74rem;
  color: #6A4018;
  font-weight: 600;
}
.modal-trust-strip span { white-space: nowrap; }

/* ⑤ Description */
.modal-desc {
  font-size: .90rem;
  line-height: 1.72;
  color: #5A3A22;
  margin: 0 0 14px;
}

/* ⑥ Highlight chips */
.modal-hl-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.modal-hl-chips span {
  background: rgba(255,253,247,.95);
  border: 1px solid rgba(191,142,82,.24);
  color: var(--gold-dark);
  padding: 4px 11px;
  border-radius: 999px;
  font-size: .76rem;
  font-weight: 700;
}

/* ⑦⑧ Details / secondary info */
.modal-details {
  border: 1px solid rgba(215,195,165,.55);
  border-radius: 12px;
  margin-bottom: 10px;
  overflow: hidden;
}
.modal-details summary {
  padding: 11px 16px;
  font-size: .86rem;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,253,247,.95);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.modal-details summary::-webkit-details-marker { display: none; }
.modal-details summary::after {
  content: '+';
  font-size: 1.1rem;
  color: var(--gold-dark);
  font-weight: 700;
  transition: transform .22s ease;
  flex-shrink: 0;
}
.modal-details[open] summary::after { transform: rotate(45deg); }
.modal-details > *:not(summary) {
  padding: 12px 16px;
  background: rgba(255,253,247,.6);
}
.modal-details-sub {
  font-size: .78rem;
  font-weight: 700;
  color: var(--gold-dark);
  text-transform: uppercase;
  letter-spacing: .08em;
  margin: 8px 0 4px;
}
.modal-list {
  padding-right: 16px;
  margin: 0;
}
.modal-list li {
  font-size: .86rem;
  color: #5A3A22;
  line-height: 1.65;
  margin-bottom: 4px;
}

/* Padding at bottom of modal info for scroll breathing */
.modal-info::after {
  content: '';
  display: block;
  height: 28px;
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════
   TOAST — rich, directional
   ═══════════════════════════════════════════════════════════ */
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px !important;
  min-width: 240px;
  max-width: 340px;
}
.toast-icon {
  width: 22px;
  height: 22px;
  background: rgba(255,255,255,.15);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: .8rem;
  font-weight: 900;
  flex-shrink: 0;
}
.toast-cta {
  margin-right: auto;
  color: var(--gold-light, #DDBF88);
  font-size: .78rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  border-bottom: 1px solid rgba(221,191,136,.35);
  transition: color .14s ease;
}
.toast-cta:hover { color: #fff; }

/* ═══════════════════════════════════════════════════════════
   SELECTION GUIDE CARDS — sg-card
   ═══════════════════════════════════════════════════════════ */
.sg-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(148deg, #FFFDF7, #FFF9EE);
  border: 1px solid rgba(215,195,165,.60);
  border-radius: 22px;
  padding: 20px;
  gap: 10px;
  transition: transform .32s var(--ease), box-shadow .32s var(--ease), border-color .18s ease;
}
.sg-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 36px rgba(40,18,5,.085);
  border-color: rgba(191,142,82,.26);
}
.sg-top { flex: 1; }
.sg-label {
  font-size: .68rem;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--gold-dark);
  background: rgba(191,142,82,.10);
  border: 1px solid rgba(191,142,82,.18);
  padding: 2px 9px;
  border-radius: 999px;
  display: inline-block;
  margin-bottom: 8px;
}
.sg-title {
  font-family: "El Messiri", serif;
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.28;
  margin: 0 0 6px;
}
.sg-desc {
  font-size: .82rem;
  color: var(--muted);
  line-height: 1.55;
  margin: 0;
}
.sg-suggest {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(191,142,82,.07);
  border: 1px solid rgba(191,142,82,.18);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: .78rem;
}
.sg-suggest-label { color: var(--muted); flex-shrink: 0; }
.sg-suggest-name { font-weight: 700; color: var(--text); flex: 1; }
.sg-suggest-price { color: var(--gold-dark); font-weight: 700; white-space: nowrap; }
.sg-cta {
  width: 100%;
  justify-content: center;
  text-align: center;
  font-size: .88rem !important;
  padding: 11px 16px !important;
  border-radius: 12px !important;
}

/* ═══════════════════════════════════════════════════════════
   SEARCH FIELD — focused, useful
   ═══════════════════════════════════════════════════════════ */
.products-search-hint {
  font-size: .74rem;
  color: var(--muted);
  text-align: center;
  margin-top: 7px;
  letter-spacing: .015em;
}
mark.search-highlight {
  background: rgba(191,142,82,.20);
  color: inherit;
  border-radius: 3px;
  padding: 0 2px;
}

/* ═══════════════════════════════════════════════════════════
   TRUST STRIP — meaningful signals
   ═══════════════════════════════════════════════════════════ */
.trust-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.trust-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}
.trust-card h3 { font-size: .94rem; font-weight: 700; margin: 0 0 3px; }
.trust-card p  { font-size: .80rem; color: var(--muted); margin: 0; line-height: 1.55; }

/* ═══════════════════════════════════════════════════════════
   FILTER BAR — sticky, clean
   ═══════════════════════════════════════════════════════════ */
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.filter-btn {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: .84rem;
  font-weight: 600;
  border: 1.5px solid rgba(215,195,165,.65);
  background: rgba(255,253,247,.90);
  color: var(--text);
  cursor: pointer;
  transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s var(--ease);
  white-space: nowrap;
  min-height: 38px;
}
.filter-btn:hover { border-color: var(--gold); background: rgba(191,142,82,.07); }
.filter-btn.active {
  background: linear-gradient(135deg, #9A6025, #7A4815);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 3px 12px rgba(150,90,30,.22);
}
.filter-btn:active { transform: scale(.95); }

/* Sticky filter bar */
.filters-sticky {
  position: sticky !important;
  top: 60px;
  z-index: 88;
  background: rgba(250,246,239,.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(191,142,82,.12);
  padding: 10px 0 !important;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px !important;
  padding-right: 16px !important;
  box-shadow: 0 3px 16px rgba(40,18,5,.05);
}

/* ═══════════════════════════════════════════════════════════
   SECTION ANCHORS — prevent header overlap
   ═══════════════════════════════════════════════════════════ */
#products, #guide, #about, #shipping, #confidence, #faq, #story, #lifestyle, #collections {
  scroll-margin-top: 68px;
}

/* ═══════════════════════════════════════════════════════════
   MOBILE-FIRST — thumb-friendly, clean
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}

@media (max-width: 768px) {
  /* Modal stacks vertically */
  .modal-layout {
    grid-template-columns: 1fr;
    overflow-y: auto;
    max-height: 92vh;
  }
  .modal-img-wrap {
    min-height: 220px;
    max-height: 40vw;
  }
  .modal-info {
    padding: 20px 20px 0;
    max-height: none;
    overflow-y: visible;
  }
  .modal-header-block { flex-direction: column; gap: 4px; }
  .modal-price-wrap { align-self: flex-start; }
  .modal-name  { font-size: 1.26rem; }
  .modal-price { font-size: 1.28rem; }

  /* Cards */
  .product-grid { gap: 10px; }
  .card-body { padding: 12px 13px 14px; }
  .card-name  { font-size: 1.00rem; }
  .card-scent { -webkit-line-clamp: 1; font-size: .76rem; }
  .card-atc   { padding: 8px 13px !important; font-size: .78rem !important; }
  .card-price { font-size: 1.00rem; }

  /* Trust strip */
  .trust-strip { flex-direction: column; gap: 12px; }

  /* Hero */
  .hero-cta-primary { padding: 14px 28px !important; font-size: 1rem !important; }

  /* Guide cards */
  .sg-card { padding: 16px; }
}

@media (max-width: 480px) {
  /* Single column on very small screens */
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }

  .card-body    { padding: 10px 11px 12px; }
  .card-name    { font-size: .94rem; }
  .card-scent   { display: none; } /* reclaim space on tiny screens */
  .card-footer  { padding-top: 8px; }
  .card-atc     { padding: 8px 10px !important; font-size: .74rem !important; border-radius: 9px !important; }
  .card-price   { font-size: .94rem; }

  /* Bigger tap targets */
  .filter-btn { min-height: 40px; font-size: .82rem; padding: 8px 14px; }

  /* Modal full-screen feel */
  .modal {
    border-radius: 28px 28px 0 0;
    max-height: 96vh;
    margin: auto 0 0;
  }
  .modal-img-wrap { max-height: 38vw; min-height: 180px; }
  .modal-info { padding: 16px 16px 0; }
  .modal-name  { font-size: 1.14rem; }
  .modal-price { font-size: 1.18rem; }
  .modal-add-main { padding: 13px 16px !important; font-size: .92rem !important; }
  .modal-trust-strip { font-size: .70rem; }
}

/* Touch active states */
@media (hover: none) {
  .product-card:active { transform: scale(.97) !important; }
  .card-atc:active     { transform: scale(.94) !important; }
  .btn:active          { transform: scale(.96) !important; }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition-duration: .01ms !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
}

/* Keyboard focus */
.product-card:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.btn:focus-visible           { outline: 2px solid var(--gold); outline-offset: 2px; }
.filter-btn:focus-visible    { outline: 2px solid var(--gold); outline-offset: 2px; }


/* ================================================================
   DECISION UX — v09 additions
   Focus: product confidence · hesitation reduction · CTA clarity
   ================================================================ */


/* ═══════════════════════════════════════════════════════════
   MOOD BAR — scent/ambiance context overlaid on product image
   ═══════════════════════════════════════════════════════════ */

.modal-mood-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  backdrop-filter: blur(14px) saturate(1.3);
  -webkit-backdrop-filter: blur(14px) saturate(1.3);
  background: rgba(20, 10, 3, 0.52);
  border-top: 1px solid rgba(255,255,255,.08);
}
.modal-img-wrap { position: relative; overflow: hidden; }

.mood-emoji  { font-size: 1.08rem; line-height: 1; flex-shrink: 0; }
.mood-label  {
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .04em;
  color: rgba(255,255,255,.90);
}

/* Mood theme tints — subtle ambient color on the bar */
.modal-mood-bar.mood--oud     { background: rgba(45, 20, 5, 0.62); }
.modal-mood-bar.mood--vanilla { background: rgba(60, 30, 5, 0.56); }
.modal-mood-bar.mood--herbal  { background: rgba(15, 40, 15, 0.54); }
.modal-mood-bar.mood--floral  { background: rgba(50, 15, 30, 0.52); }
.modal-mood-bar.mood--citrus  { background: rgba(55, 35, 5, 0.52);  }
.modal-mood-bar.mood--gift    { background: rgba(40, 20, 5, 0.58);  }
.modal-mood-bar.mood--calm    { background: rgba(10, 20, 35, 0.55); }
.modal-mood-bar.mood--default { background: rgba(20, 10, 3, 0.52);  }


/* ═══════════════════════════════════════════════════════════
   MODAL INFO — scrollable body + sticky footer CTA
   ═══════════════════════════════════════════════════════════ */

/* Override old layout to use sticky footer pattern */
.modal-info {
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
}

.modal-info-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px 12px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.modal-info-scroll::-webkit-scrollbar { width: 3px; }
.modal-info-scroll::-webkit-scrollbar-thumb {
  background: rgba(191,142,82,.28);
  border-radius: 2px;
}

/* ── Name ── */
.modal-name {
  font-family: "El Messiri", serif !important;
  font-size: 1.52rem !important;
  font-weight: 700 !important;
  color: var(--text) !important;
  line-height: 1.16 !important;
  letter-spacing: -.02em !important;
  margin: 0 0 12px !important;
}

/* ── Price + value chips row ── */
.modal-price-chips-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.modal-price {
  font-size: 1.52rem !important;
  font-weight: 800 !important;
  color: var(--gold-dark) !important;
  letter-spacing: -.01em !important;
  flex-shrink: 0;
}
.modal-value-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  padding-top: 4px;
}
/* mvc = mini value chip */
.mvc {
  background: rgba(191,142,82,.10);
  border: 1px solid rgba(191,142,82,.22);
  color: #6A4018;
  font-size: .72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}


/* ═══════════════════════════════════════════════════════════
   MODAL STICKY CTA FOOTER — always visible
   ═══════════════════════════════════════════════════════════ */

.modal-cta-footer {
  flex-shrink: 0;
  padding: 14px 20px 16px;
  background: rgba(250, 246, 239, 0.98);
  border-top: 1px solid rgba(191,142,82,.14);
  backdrop-filter: blur(10px);
}

/* Micro-trust copy — quells last-second doubt */
.modal-micro-trust {
  font-size: .75rem;
  color: #7A5530;
  letter-spacing: .01em;
  margin: 0 0 10px;
  text-align: center;
  opacity: .85;
}

/* CTA row: big button + compact WA */
.modal-cta-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.modal-add-main {
  flex: 1 !important;
  font-size: .96rem !important;
  padding: 14px 16px !important;
  border-radius: 14px !important;
  text-align: center !important;
  justify-content: center !important;
  position: relative;
  overflow: hidden;
  transition: background .22s ease, box-shadow .22s ease, transform .18s ease !important;
}

/* Compact WA icon button */
.btn-wa-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 1.5px solid rgba(34,197,94,.35);
  background: rgba(34,197,94,.06);
  font-size: 1.1rem;
  text-decoration: none;
  flex-shrink: 0;
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
  cursor: pointer;
}
.btn-wa-compact:hover {
  background: rgba(34,197,94,.12);
  border-color: rgba(34,197,94,.55);
  transform: scale(1.05);
}

/* ── CTA success states ── */
.modal-add-main .atc-check {
  display: inline-block;
  margin-left: 5px;
  transition: transform .22s cubic-bezier(.34,1.56,.64,1);
}

/* Added state — green */
.modal-add-main.btn--added {
  background: linear-gradient(135deg, #4A7A2A, #3A6020) !important;
  box-shadow: 0 4px 16px rgba(60,100,30,.28) !important;
  transform: scale(1.012) !important;
}

/* Go-to-cart state — warm gold with arrow */
.modal-add-main.btn--go-cart {
  background: linear-gradient(135deg, #7A5018, #5A3A10) !important;
  box-shadow: 0 4px 18px rgba(100,60,20,.30) !important;
  animation: cartPulse .38s ease;
}
@keyframes cartPulse {
  0%   { transform: scale(1.00); }
  45%  { transform: scale(1.04); }
  100% { transform: scale(1.00); }
}


/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD — mood tag for quick scent comparison
   ═══════════════════════════════════════════════════════════ */

.card-mood-row {
  margin-bottom: 5px;
}
.card-mood-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .03em;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap;
}
/* Mood theme colors on cards */
.card-mood-tag.mood--oud     { background: rgba(60,30,10,.08); border-color: rgba(120,70,20,.20); color: #5A3010; }
.card-mood-tag.mood--vanilla { background: rgba(80,45,10,.07); border-color: rgba(150,90,25,.18); color: #6A4015; }
.card-mood-tag.mood--herbal  { background: rgba(20,55,20,.08); border-color: rgba(40,100,40,.18); color: #1A5010; }
.card-mood-tag.mood--floral  { background: rgba(80,20,50,.07); border-color: rgba(150,50,90,.18); color: #6A1040; }
.card-mood-tag.mood--citrus  { background: rgba(80,55,5,.08);  border-color: rgba(160,110,10,.18); color: #6A4805; }
.card-mood-tag.mood--gift    { background: rgba(60,30,5,.08);  border-color: rgba(120,70,20,.20); color: #5A2A08; }
.card-mood-tag.mood--calm    { background: rgba(10,20,50,.07); border-color: rgba(30,50,110,.18); color: #102055; }
.card-mood-tag.mood--default { background: rgba(191,142,82,.08); border-color: rgba(191,142,82,.20); color: #6A4018; }
/* coffee theme → same warm palette as vanilla */
.card-mood-tag.mood--coffee { background: rgba(80,45,10,.07); border-color: rgba(150,90,25,.18); color: #6A4015; }
.modal-mood-bar.mood--coffee { background: rgba(55, 28, 5, 0.58); }


/* ═══════════════════════════════════════════════════════════
   MODAL RESPONSIVE — mobile first, thumb-friendly
   ═══════════════════════════════════════════════════════════ */

@media (min-width: 700px) {
  .modal-layout {
    display: grid !important;
    grid-template-columns: 1fr 1.1fr !important;
    overflow: hidden !important;
    max-height: 88vh;
  }
  .modal-img-wrap {
    height: 100%;
    max-height: 88vh;
    border-radius: 32px 0 0 32px;
  }
  .modal-img-wrap img { height: 100%; width: 100%; object-fit: cover; max-height: none; }
  .modal-info { border-radius: 0 32px 32px 0; height: 100%; }
  .modal-info-scroll { padding: 26px 28px 16px; }
  .modal-cta-footer  { padding: 16px 24px 20px; }
}

@media (max-width: 699px) {
  .modal-layout {
    display: flex !important;
    flex-direction: column !important;
    max-height: 94vh;
    overflow: hidden;
  }
  .modal-img-wrap {
    height: 38vw;
    min-height: 170px;
    max-height: 240px;
    flex-shrink: 0;
    border-radius: 24px 24px 0 0;
  }
  .modal-img-wrap img { height: 100%; object-fit: cover; }
  .modal-info { flex: 1; min-height: 0; border-radius: 0 0 24px 24px; }
  .modal-info-scroll { padding: 16px 18px 8px; }
  .modal-name  { font-size: 1.24rem !important; margin-bottom: 8px !important; }
  .modal-price { font-size: 1.28rem !important; }
  .modal-cta-footer { padding: 12px 16px 14px; }
  .modal-add-main { font-size: .90rem !important; padding: 13px 14px !important; }
  .btn-wa-compact { width: 46px; height: 46px; font-size: 1rem; }
  .modal-micro-trust { font-size: .72rem; margin-bottom: 8px; }
  .modal-mood-bar { padding: 8px 14px; }
  .mood-label { font-size: .72rem; }
}

@media (max-width: 380px) {
  .modal-img-wrap { height: 32vw; min-height: 150px; }
  .modal-info-scroll { padding: 13px 14px 6px; }
  .modal-name  { font-size: 1.12rem !important; }
  .modal-price { font-size: 1.14rem !important; }
  .mvc { font-size: .68rem; }
}

/* ── Card mood tag on mobile: smaller ── */
@media (max-width: 480px) {
  .card-mood-tag { font-size: .64rem; padding: 2px 7px; }
  .card-mood-row { margin-bottom: 3px; }
}

