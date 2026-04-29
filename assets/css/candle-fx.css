/* ================================================================
   candle-fx.css — Alzahraa Candles
   Candle-inspired interactions: glow · flicker · warmth · reveal.
   Pure CSS. No logic changes. Loaded after luxury-polish.css.
   ================================================================ */


/* ════════════════════════════════════════════════════════════════
   @KEYFRAMES LIBRARY
   ════════════════════════════════════════════════════════════════ */

/* Warm amber glow pulse — opacity-based for GPU compositing */
@keyframes candleGlow {
  0%, 100% { opacity: 0.85; }
  50%       { opacity: 1.00; }
}

/* Flame flicker — micro-jitter, as if air is moving */
@keyframes flicker {
  0%,  85%, 100% { opacity: 1.00; transform: scaleY(1.000) translateX( 0px); }
  20%             { opacity: 0.90; transform: scaleY(0.970) translateX(-0.4px); }
  45%             { opacity: 0.96; transform: scaleY(1.015) translateX( 0.3px); }
  65%             { opacity: 0.92; transform: scaleY(0.985) translateX(-0.2px); }
}

/* Eyebrow line — flame breath */
@keyframes flameLine {
  0%, 100% { width: 28px; opacity: 0.55; }
  50%       { width: 44px; opacity: 1.00; }
}

/* CTA button warm pulse — subtle scale instead of box-shadow for performance */
@keyframes btnWarmPulse {
  0%, 100% { transform: scale(1.000); }
  50%       { transform: scale(1.012); }
}

/* Icon warm aura */
@keyframes iconAura {
  /* Using opacity instead of filter for better performance on mobile */
  0%, 100% { opacity: 0.75; }
  50%       { opacity: 1.00; }
}

/* Pill shimmer sweep */
@keyframes pillSweep {
  0%   { background-position: 150% 50%; }
  100% { background-position: -50%  50%; }
}

/* WhatsApp ring */
@keyframes waRing {
  0%, 100% { opacity: 0.90; }
  50%       { opacity: 1.00; }
}

/* Card click ripple keyframe */
@keyframes cardRipple {
  0%   { transform: scale(0);   opacity: 0.28; }
  60%  { transform: scale(2.5); opacity: 0.10; }
  100% { transform: scale(3.5); opacity: 0.00; }
}

/* Warm lift for section items */
@keyframes fadeWarmUp {
  from { opacity: 0; transform: translateY(18px) scale(0.994); }
  to   { opacity: 1; transform: translateY(0)     scale(1.000); }
}


/* ════════════════════════════════════════════════════════════════
   HERO — ambient flame atmosphere
   ════════════════════════════════════════════════════════════════ */

/* Eyebrow line breathes like a wick */
.eyebrow-line {
  animation: flameLine 4.5s ease-in-out infinite;
  will-change: width, opacity;
}

/* Hero floating chips — warm glow + gentle float together */
.hero-float-1 {
  animation:
    heroFloat2      12s ease-in-out infinite 1s,
    candleGlow       5s ease-in-out infinite 0.5s;
}
.hero-float-2 {
  animation:
    heroFloat2      10s ease-in-out infinite 4s,
    candleGlow       7s ease-in-out infinite 2.2s;
}

/* The 🕯️ emoji in the chip flickers like a real flame */
.hero-float-2 > span:first-child {
  display: inline-block;
  animation: flicker 3.8s ease-in-out infinite;
  transform-origin: bottom center;
  will-change: transform, opacity;
}

/* Hero badges — subtle warmth on hover */
.hero-badge:hover .hero-badge > span:first-child {
  animation: flicker 2s ease-in-out infinite;
}


/* ════════════════════════════════════════════════════════════════
   PRIMARY CTA BUTTONS — warm breath
   ════════════════════════════════════════════════════════════════ */

/* btnWarmPulse removed — was causing continuous repaints on primary CTAs */
/* Pause on hover — hover has its own richer state */
.hero-actions .btn-primary:hover,
.final-cta-card .btn-primary:hover {
  animation-play-state: paused;
}

/* Shimmer sweep on all primary buttons at hover */
.btn-primary {
  position: relative;
  overflow: hidden;
}
.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -120%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(255,255,255,.13) 50%,
    transparent 100%
  );
  transition: left 0s;
  pointer-events: none;
  z-index: 1;
}
.btn-primary:hover::before {
  left: 160%;
  transition: left 0.52s ease;
}


/* ════════════════════════════════════════════════════════════════
   PRODUCT CARDS — the core click-inviting interaction
   ════════════════════════════════════════════════════════════════ */

/* Warm candle-ring on hover */
@media (hover: hover) {
  .product-card:hover {
    box-shadow:
      0 18px 48px rgba(45,20,5, 0.11),
      0  4px 12px rgba(45,20,5, 0.055),
      0  0   0 1px rgba(191,142,82, 0.22),
      0  0  22px   rgba(191,142,82, 0.09);
  }
}

/* Click ripple — warm amber burst from tap point */
.product-card {
  isolation: isolate;   /* ensures ripple clips correctly */
}
.product-card .card-ripple {
  position: absolute;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-top: -30px;
  margin-left: -30px;
  background: radial-gradient(circle, rgba(191,142,82,0.30) 0%, transparent 70%);
  pointer-events: none;
  z-index: 10;
  animation: cardRipple 0.55s ease-out forwards;
}


/* ════════════════════════════════════════════════════════════════
   SECTION PILLS — warm shimmer sweep
   ════════════════════════════════════════════════════════════════ */

.pill.small {
  background: linear-gradient(
    90deg,
    rgba(191,142,82,.10)  0%,
    rgba(222,192,138,.22) 45%,
    rgba(191,142,82,.10)  90%
  );
  background-size: 220% 100%;
  background-position: 150% 50%;
  animation: pillSweep 5s ease-in-out infinite;
}


/* ════════════════════════════════════════════════════════════════
   TRUST / FEATURE / STEP ICONS — warm aura stagger
   ════════════════════════════════════════════════════════════════ */

/* iconAura removed from always-on to prevent layout thrashing on multiple elements */
.trust-card .icon:hover,
.feature:hover .icon,
.confidence-card:hover .confidence-icon {
  animation: iconAura 2s ease-in-out 1;
}

/* Natural stagger — not all glowing at the same moment */
.trust-card:nth-child(1) .icon  { animation-delay: 0.0s; }
.trust-card:nth-child(2) .icon  { animation-delay: 1.4s; }
.trust-card:nth-child(3) .icon  { animation-delay: 2.8s; }
.trust-card:nth-child(4) .icon  { animation-delay: 4.2s; }
.feature:nth-child(1) .icon     { animation-delay: 0.6s; }
.feature:nth-child(2) .icon     { animation-delay: 2.0s; }
.feature:nth-child(3) .icon     { animation-delay: 3.4s; }
.feature:nth-child(4) .icon     { animation-delay: 4.8s; }


/* ════════════════════════════════════════════════════════════════
   STEP NUMBERS — ambient glow ring
   ════════════════════════════════════════════════════════════════ */

.step-no {
  position: relative;
  isolation: isolate;
}
.step-no::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(191,142,82,.22) 0%, transparent 68%);
  animation: candleGlow 4.5s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}
.step-card:nth-child(1) .step-no::after { animation-delay: 0.0s; }
.step-card:nth-child(2) .step-no::after { animation-delay: 1.5s; }
.step-card:nth-child(3) .step-no::after { animation-delay: 3.0s; }


/* ════════════════════════════════════════════════════════════════
   SCROLL REVEAL — warm rise, like heat from a flame
   ════════════════════════════════════════════════════════════════ */

[data-reveal] {
  opacity: 0;
  transform: translateY(20px) scale(0.995);
  transition:
    opacity   0.70s cubic-bezier(0.16, 1, 0.30, 1),
    transform 0.70s cubic-bezier(0.16, 1, 0.30, 1);
}
[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Product grid cards get a staggered warm entrance */
#productGrid .product-card {
  animation: fadeWarmUp 0.55s cubic-bezier(0.16, 1, 0.30, 1) both;
}
#productGrid .product-card:nth-child(1)   { animation-delay: .04s; }
#productGrid .product-card:nth-child(2)   { animation-delay: .10s; }
#productGrid .product-card:nth-child(3)   { animation-delay: .17s; }
#productGrid .product-card:nth-child(4)   { animation-delay: .24s; }
#productGrid .product-card:nth-child(5)   { animation-delay: .31s; }
#productGrid .product-card:nth-child(6)   { animation-delay: .38s; }
#productGrid .product-card:nth-child(n+7) { animation-delay: .42s; }


/* ════════════════════════════════════════════════════════════════
   FLOATING WHATSAPP — warm ring pulse
   ════════════════════════════════════════════════════════════════ */

.floating-wa {
  animation: waRing 4.5s ease-in-out infinite;
}
.floating-wa:hover {
  animation-play-state: paused;
}


/* ════════════════════════════════════════════════════════════════
   FILTER BUTTONS — subtle warm active state
   ════════════════════════════════════════════════════════════════ */

.filter-btn.active {
  box-shadow:
    0 0 0 1px rgba(191,142,82,.30),
    0 0 14px  rgba(191,142,82,.12);
}


/* ════════════════════════════════════════════════════════════════
   WISHLIST BUTTON — heart flame on activate
   ════════════════════════════════════════════════════════════════ */

.wl-btn.active {
  animation: candleGlow 3.5s ease-in-out infinite;
  --_base-shadow: 0 2px 10px rgba(45,20,5,.08);
}


/* ════════════════════════════════════════════════════════════════
   FOCUS-VISIBLE — warm accessible ring
   ════════════════════════════════════════════════════════════════ */

.btn:focus-visible,
.product-card:focus-visible,
.filter-btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #FAF6EF,
    0 0 0 4px rgba(191,142,82, 0.55);
}


/* ════════════════════════════════════════════════════════════════
   UTILITY — .candle-glow class for any element
   ════════════════════════════════════════════════════════════════ */
.candle-glow {
  animation: candleGlow 5s ease-in-out infinite;
}
.candle-flicker {
  display: inline-block;
  animation: flicker 3.5s ease-in-out infinite;
  transform-origin: bottom center;
}


/* ════════════════════════════════════════════════════════════════
   SCROLLBAR — warm gold thread
   ════════════════════════════════════════════════════════════════ */

::-webkit-scrollbar       { width: 4px; }
::-webkit-scrollbar-track { background: #FBF7F0; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #BF8E52, #96601E);
  border-radius: 999px;
}


/* ════════════════════════════════════════════════════════════════
   PREFERS-REDUCED-MOTION — full off
   ════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .eyebrow-line,
  .hero-float-1,
  .hero-float-2,
  .hero-float-2 > span:first-child,
  .hero-actions .btn-primary,
  .final-cta-card .btn-primary,
  .btn-primary::before,
  .step-no::after,
  .trust-card .icon,
  .feature .icon,
  .confidence-icon,
  .pill.small,
  .floating-wa,
  .wl-btn.active,
  #productGrid .product-card {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}


@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
