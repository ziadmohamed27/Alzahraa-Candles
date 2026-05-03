/* =================================================================
   Alzahraa Candles — scroll-fix.js (root-cause safe fix)
   Purpose: remove stale scroll locks left by previous drawer/modal code.
   No MutationObserver. No setInterval. No permanent loop.
   ================================================================= */
(function () {
  'use strict';

  function hasVisibleOverlay() {
    return !!document.querySelector(
      '#productModalOverlay:not(.hidden), #cartDrawer.open, #quizModal.open, .quiz-modal.open, .lightbox.open, #imageLightbox.open, .delivery-location-modal:not(.hidden)'
    );
  }

  function unlockScroll(force) {
    if (!force && hasVisibleOverlay()) return;
    var html = document.documentElement;
    var body = document.body;
    if (!body || !html) return;

    html.style.overflow = '';
    html.style.overflowY = '';
    html.style.height = '';
    html.style.position = '';

    body.style.overflow = '';
    body.style.overflowY = '';
    body.style.height = '';
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.classList.remove('drawer-open', 'modal-open', 'no-scroll', 'lock-scroll');
  }

  window.__alzahraaUnlockScroll = function () { unlockScroll(false); };
  window.__alzahraaForceUnlockScroll = function () { unlockScroll(true); };

  function scheduleUnlock() {
    unlockScroll(true);
    requestAnimationFrame(function () { unlockScroll(true); });
    setTimeout(function () { unlockScroll(true); }, 120);
    setTimeout(function () { unlockScroll(true); }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleUnlock, { once: true });
  } else {
    scheduleUnlock();
  }
  window.addEventListener('load', scheduleUnlock, { once: true });
  window.addEventListener('pageshow', scheduleUnlock);
  window.addEventListener('popstate', scheduleUnlock);
  window.addEventListener('hashchange', function () { setTimeout(scheduleUnlock, 0); });
})();
