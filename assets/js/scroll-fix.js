/* =================================================================
   Alzahraa Candles — scroll-fix.js
   Purpose: prevent stale scroll locks from drawers/modals blocking pages.
   ================================================================= */
(function () {
  'use strict';

  const LOCK_CLASSES = ['drawer-open', 'modal-open'];
  const ACTIVE_LOCK_SELECTORS = [
    '#cartDrawer.open',
    '#productModalOverlay:not(.hidden)',
    '#quizModal.open',
    '.quiz-modal.open',
    '.lightbox.open',
    '.delivery-location-modal:not(.hidden)',
    '.delivery-location-modal.is-open'
  ];

  function isActuallyVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function hasActiveScrollLockLayer() {
    return ACTIVE_LOCK_SELECTORS.some((selector) => {
      try {
        return Array.from(document.querySelectorAll(selector)).some(isActuallyVisible);
      } catch {
        return false;
      }
    });
  }

  function unlockStalePageScroll() {
    const body = document.body;
    const html = document.documentElement;
    if (!body || !html) return;

    if (hasActiveScrollLockLayer()) return;

    LOCK_CLASSES.forEach((cls) => body.classList.remove(cls));

    if (body.style.overflow === 'hidden' || body.style.overflowY === 'hidden') {
      body.style.overflow = '';
      body.style.overflowY = '';
    }

    if (html.style.overflow === 'hidden' || html.style.overflowY === 'hidden') {
      html.style.overflow = '';
      html.style.overflowY = '';
    }

    body.style.position = body.style.position === 'fixed' ? '' : body.style.position;
    body.style.top = body.style.position ? body.style.top : '';
    body.style.width = body.style.position ? body.style.width : '';
  }

  function scheduleUnlock() {
    unlockStalePageScroll();
    setTimeout(unlockStalePageScroll, 0);
    setTimeout(unlockStalePageScroll, 120);
    setTimeout(unlockStalePageScroll, 600);
  }

  window.__alzahraaUnlockScroll = scheduleUnlock;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleUnlock, { once: true });
  } else {
    scheduleUnlock();
  }

  window.addEventListener('pageshow', scheduleUnlock);
  window.addEventListener('popstate', scheduleUnlock);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleUnlock();
  });

  document.addEventListener('click', () => {
    setTimeout(unlockStalePageScroll, 80);
  }, true);
})();
