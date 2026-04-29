/* Alzahraa Candles — legacy cache cleanup
   Removes old service workers/caches that could keep stale JS or 404 responses. */
(function () {
  'use strict';
  if (window.__alzahraaCacheCleanupDone) return;
  window.__alzahraaCacheCleanupDone = true;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
      .catch(() => {});
  }

  if ('caches' in window) {
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => /alzahraa|candle|static|dynamic/i.test(key))
          .map((key) => caches.delete(key))
      ))
      .catch(() => {});
  }
})();
