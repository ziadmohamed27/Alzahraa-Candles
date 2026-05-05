/* ═══════════════════════════════════════════════════════════════
   Mobile Bottom Navigation Bar — Alzahraa Candles
   Visible only on mobile (max-width: 768px)
   ═══════════════════════════════════════════════════════════════ */

/* ── Body padding so content is never hidden under the bar ── */
@media (max-width: 768px) {
  body {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
  }

  /* Make sure toast clears the bar */
  .toast,
  .undo-toast {
    bottom: calc(82px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

/* ── The bar itself ── */
.mobile-bottom-nav {
  display: none; /* hidden by default, shown via media query */
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;

    /* Warm creamy background with blur */
    background: rgba(255, 248, 235, 0.92);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);

    /* Top border accent */
    border-top: 1px solid rgba(180, 135, 65, 0.18);
    box-shadow: 0 -4px 24px rgba(120, 80, 20, 0.10);

    /* Safe area on notched iPhones */
    padding-bottom: env(safe-area-inset-bottom, 0px);

    /* Layout */
    align-items: stretch;
    justify-content: space-around;
    height: calc(64px + env(safe-area-inset-bottom, 0px));
    min-height: 64px;
  }

  /* ── Individual nav item ── */
  .mbn-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 3px;
    padding: 8px 4px;
    text-decoration: none;
    cursor: pointer;
    position: relative;
    border: none;
    background: transparent;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s ease;
  }

  .mbn-item:active {
    transform: scale(0.91);
  }

  /* ── Icon wrapper ── */
  .mbn-icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
  }

  /* ── SVG icons ── */
  .mbn-icon {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: #9c7340;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke 0.2s ease, transform 0.2s ease;
  }

  /* ── Labels ── */
  .mbn-label {
    font-size: 10px;
    font-weight: 500;
    color: #9c7340;
    letter-spacing: 0.01em;
    transition: color 0.2s ease;
    white-space: nowrap;
    font-family: 'Tajawal', 'Segoe UI', Arial, sans-serif;
    line-height: 1;
  }

  /* ── Active state ── */
  .mbn-item.mbn-active .mbn-icon {
    stroke: #b07d35;
    transform: translateY(-1px);
  }

  .mbn-item.mbn-active .mbn-label {
    color: #b07d35;
    font-weight: 700;
  }

  /* Active dot indicator */
  .mbn-item.mbn-active::after {
    content: '';
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #b07d35;
    opacity: 0.7;
  }

  /* ── Cart badge ── */
  .mbn-cart-badge {
    position: absolute;
    top: -2px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: #c0392b;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-family: 'Tajawal', Arial, sans-serif;
    border: 1.5px solid rgba(255, 248, 235, 0.9);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
    pointer-events: none;
  }

  .mbn-cart-badge[data-count="0"],
  .mbn-cart-badge:empty {
    opacity: 0;
    transform: scale(0.6);
    pointer-events: none;
  }

  .mbn-cart-badge.mbn-badge-pop {
    animation: mbnBadgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes mbnBadgePop {
    0% { transform: scale(1); }
    50% { transform: scale(1.45); }
    100% { transform: scale(1); }
  }

  /* ── Entrance animation ── */
  .mobile-bottom-nav {
    animation: mbnSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes mbnSlideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}
