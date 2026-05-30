/**
 * SIRAJ · Cinematic Hero Animations
 * Place at: /assets/js/hero-cinematic.js
 *
 * Responsibilities:
 *  1. Trigger entrance animations after DOMContentLoaded
 *  2. Smooth scroll on scroll-indicator click
 *  3. Video fallback if the video fails to load
 *  4. Respect prefers-reduced-motion
 *  5. Zero interference with cart, Supabase, or any other JS
 */

(function () {
  'use strict';

  /* ── Guard against duplicate init ── */
  if (window.__sirajHeroInit) return;
  window.__sirajHeroInit = true;

  const HERO_ID   = 'hero-section';
  const READY_CLS = 'sh-ready';
  const REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Entrance animation trigger ── */
  function initEntranceAnimations() {
    const hero = document.getElementById(HERO_ID);
    if (!hero) return;

    if (REDUCED) {
      // Immediately reveal all elements — no animation
      hero.querySelectorAll('.sh-anim-fade, .sh-anim-slide').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      hero.classList.add(READY_CLS);
      return;
    }

    // Small delay so the browser has painted the video background first
    requestAnimationFrame(() => {
      setTimeout(() => {
        hero.classList.add(READY_CLS);
      }, 80);
    });
  }

  /* ── 2. Scroll indicator smooth-scroll ── */
  function initScrollIndicator() {
    const scrollBtn = document.querySelector('.sh-scroll');
    if (!scrollBtn) return;

    function scrollToNextSection() {
      // Scroll to the next section (trust strip or products)
      const nextSection =
        document.getElementById('trust') ||
        document.getElementById('products');

      if (nextSection) {
        nextSection.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
      }
    }

    scrollBtn.addEventListener('click', scrollToNextSection);
    scrollBtn.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        scrollToNextSection();
      }
    });

    // Also hide scroll indicator once user scrolls past hero
    const heroEl = document.getElementById(HERO_ID);
    if (!heroEl) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        scrollBtn.style.opacity = entry.isIntersecting ? '' : '0';
        scrollBtn.style.pointerEvents = entry.isIntersecting ? '' : 'none';
      },
      { threshold: 0.15 }
    );
    obs.observe(heroEl);
  }

  /* ── 3. Video fallback ── */
  function initVideoFallback() {
    const video = document.querySelector('.sh-video');
    if (!video) return;

    // If video can't play (network error, unsupported format, etc.),
    // fall back to an atmospheric dark gradient — no broken element shown.
    video.addEventListener('error', function () {
      const wrap = video.closest('.sh-video-wrap');
      if (wrap) {
        video.remove();
        wrap.style.background =
          'radial-gradient(ellipse 80% 70% at 30% 100%, rgba(160,100,40,0.25), transparent 60%),' +
          'linear-gradient(160deg, #0d0804 0%, #1a0e06 50%, #0d0804 100%)';
      }
    });

    // Auto-play might be blocked on some browsers; just fail gracefully
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Blocked — video stays as poster image, overlay looks fine
      });
    }
  }

  /* ── 4. Subtle parallax on mouse-move (desktop only) ── */
  function initMouseParallax() {
    if (REDUCED) return;
    if (window.matchMedia('(hover: none)').matches) return; // skip touch devices

    const hero = document.getElementById(HERO_ID);
    if (!hero) return;

    const video = hero.querySelector('.sh-video');
    const content = hero.querySelector('.sh-content');
    let rafId = null;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    hero.addEventListener('mousemove', function (e) {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
      targetY = ((e.clientY - rect.top)  / rect.height - 0.5) *  8;
    });

    hero.addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
    });

    function tick() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      if (video) {
        video.style.transform =
          `scale(1.07) translate(${currentX * 0.25}px, ${currentY * 0.25}px)`;
      }
      if (content) {
        content.style.transform =
          `translate(${-currentX * 0.3}px, ${-currentY * 0.3}px)`;
      }

      rafId = requestAnimationFrame(tick);
    }

    // Only run when hero is in view
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          rafId = requestAnimationFrame(tick);
        } else {
          if (rafId) cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(hero);
  }

  /* ── Boot ── */
  function boot() {
    initEntranceAnimations();
    initScrollIndicator();
    initVideoFallback();
    initMouseParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
