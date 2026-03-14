import React, { useRef, useEffect } from "react";
import { storeInfo } from "../data/products";

/* ── Decorative bubbles — hidden on mobile ─────────────────────────── */
const floatingBubbles = [
  { size: 200, top: "6%", right: "-6%", delay: "0s", opacity: 0.28, color: "#c8d9a0" },
  { size: 130, top: "58%", right: "3%", delay: "1.3s", opacity: 0.2, color: "#fde68a" },
  { size: 95, top: "28%", left: "-3%", delay: "0.7s", opacity: 0.16, color: "#f0d4b8" },
  { size: 55, top: "72%", left: "9%", delay: "1.9s", opacity: 0.14, color: "#c8d9a0" },
];

function Bubble({ size, top, right, left, delay, opacity, color }) {
  return (
    <div
      aria-hidden="true"
      className="absolute rounded-full pointer-events-none hidden sm:block"
      style={{
        width: size,
        height: size,
        top,
        right,
        left,
        background: `radial-gradient(circle at 35% 35%, ${color}bb, ${color}22)`,
        opacity,
        animation: `bubble-drift 9s ease-in-out ${delay} infinite alternate`,
      }}
    />
  );
}

/* ── WhatsApp icon ──────────────────────────────────────────────────── */
function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-[18px] h-[18px] flex-shrink-0"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ── Hero video cards data ──────────────────────────────────────────── */
const heroVideos = [
  {
    src: "/videos/olive-video.mp4",
    label: "صابون زيت الزيتون",
    rotate: "-3deg",
    size: "w-24 h-32 sm:w-32 sm:h-40",
  },
  {
    src: "/videos/honey-video.mp4",
    label: "صابون العسل",
    rotate: "0deg",
    size: "w-28 h-36 sm:w-40 sm:h-48",
  },
  {
    src: "/videos/coffee-video.mp4",
    label: "صابون القهوة",
    rotate: "3deg",
    size: "w-24 h-32 sm:w-32 sm:h-40",
  },
];

/* ── Hero video card ────────────────────────────────────────────────── */
function HeroVideo({ src, label, rotate, size }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`rounded-xl3 overflow-hidden shadow-card flex-shrink-0 ${size}`}
      style={{ transform: `rotate(${rotate})` }}
      aria-label={label}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

/* ── Hero section ───────────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center overflow-hidden bg-ivory-100 pt-[60px] pb-10"
      style={{ minHeight: "90svh" }}
      aria-label="قسم الترحيب"
    >
      {floatingBubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}

      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-olive-400 via-honey-300 to-coffee-400"
      />

      <div className="relative z-10 text-center px-5 w-full max-w-md mx-auto">
        <div
          className="inline-flex items-center gap-2 bg-white/80 border border-olive-200 rounded-full px-4 py-1.5 mb-5 shadow-sm opacity-0 animate-fade-up"
          style={{ animationFillMode: "forwards" }}
        >
          <span className="w-2 h-2 rounded-full bg-olive-500 flex-shrink-0" aria-hidden="true" />
          <span className="font-arabic text-xs text-olive-700 font-medium">
            ١٠٠٪ طبيعي · مصنوع يدويًا بعناية
          </span>
        </div>

        <h1
          className="font-display text-[2.35rem] sm:text-5xl font-bold text-charcoal-800 leading-[1.2] mb-4 opacity-0 animate-fade-up animation-delay-100"
          style={{ animationFillMode: "forwards" }}
        >
          اكتشف{" "}
          <span className="text-olive-600 relative inline-block">
            سحر الطبيعة
            <svg
              aria-hidden="true"
              viewBox="0 0 200 12"
              className="absolute -bottom-1 right-0 left-0 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0,8 Q50,2 100,8 T200,8"
                fill="none"
                stroke="#8aad44"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <br />
          على بشرتك
        </h1>

        <p
          className="font-arabic text-base sm:text-lg text-charcoal-500 leading-relaxed mb-7 opacity-0 animate-fade-up animation-delay-200"
          style={{ animationFillMode: "forwards" }}
        >
          {storeInfo.description} — صابون يدوي فاخر بمكونات طبيعية خالصة تعتني ببشرتك كل يوم
        </p>

        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 opacity-0 animate-fade-up animation-delay-300"
          style={{ animationFillMode: "forwards" }}
        >
          <a href="#products" className="btn-primary py-3 px-8 text-base text-center">
            تسوق الآن
          </a>

          <a
            href={`https://wa.me/${storeInfo.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل معنا عبر واتساب"
            className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl2 text-base font-arabic font-semibold bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.38)] transition-all duration-300 hover:bg-[#1ebe5d] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(37,211,102,0.42)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
          >
            <WhatsAppIcon />
            تواصل واتساب
          </a>
        </div>

        <div
          className="flex items-center justify-center gap-5 sm:gap-7 mt-8 opacity-0 animate-fade-up animation-delay-400"
          style={{ animationFillMode: "forwards" }}
        >
          {[
            { icon: "🌿", label: "خالٍ من الكيماويات" },
            { icon: "🫧", label: "مرطّب ومغذّي" },
            { icon: "💚", label: "صديق للبيئة" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-xl sm:text-2xl" role="img" aria-label={label}>
                {icon}
              </span>
              <span className="font-arabic text-[9px] sm:text-[10px] text-charcoal-400 whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Video triptych ───────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-sm mx-auto px-4 mt-10 opacity-0 animate-fade-up animation-delay-500"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="flex gap-3 justify-center items-end overflow-x-auto no-scrollbar">
          {heroVideos.map(({ src, label, rotate, size }, i) => (
            <HeroVideo
              key={i}
              src={src}
              label={label}
              rotate={rotate}
              size={size}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ivory-100 to-transparent pointer-events-none" />
      </div>

      <a
        href="#products"
        className="mt-8 flex flex-col items-center gap-1.5 opacity-0 animate-fade-up animation-delay-600"
        style={{ animationFillMode: "forwards" }}
        aria-label="انتقل إلى المنتجات"
      >
        <span className="font-arabic text-[11px] text-charcoal-400">المنتجات</span>
        <div className="w-5 h-8 border-2 border-charcoal-300 rounded-full flex items-start justify-center pt-1.5">
          <div
            className="w-1 h-2 bg-olive-500 rounded-full"
            style={{ animation: "scroll-dot 1.5s ease-in-out infinite" }}
          />
        </div>
      </a>

      <style>{`
        @keyframes scroll-dot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.4; }
        }
        @keyframes bubble-drift {
          from { transform: translateY(0) rotate(0deg) scale(1); }
          to { transform: translateY(-22px) rotate(6deg) scale(1.04); }
        }
      `}</style>
    </section>
  );
}
