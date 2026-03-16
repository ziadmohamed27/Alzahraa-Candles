import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import StarRating from "./StarRating";

const formatPrice = (p) => `${Number(p).toFixed(2)} ج.م`;

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function CartAddIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21c1-1.06 2.5-2 4.29-2 2.21 0 4 1.79 4 4h2c0-3-1.5-5.5-4-7l1-1c2 .5 4 1.5 5.5 4 1 1.9 1.5 4 1.5 4h2c0-7.5-4.8-13-9-15z" />
    </svg>
  );
}

function InfoBlock({ title, color, bg, children }) {
  return (
    <div className="rounded-xl2 p-4 mb-3" style={{ backgroundColor: bg }}>
      <h3 className="font-display text-sm font-semibold mb-2" style={{ color }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ProductModal({ product, onClose }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [tab, setTab] = useState("about"); // "about" | "ingredients"

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    setTab("about");
    setQty(1);
    setAdded(false);
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1600);
  };

  const lineTotal = formatPrice(parseFloat(product.price) * qty);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true" aria-label={`تفاصيل ${product.name}`}>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal-900/50 modal-backdrop animate-fade-in"
        onClick={onClose} aria-hidden="true" />

      {/* Modal panel */}
      <div className="relative z-10 bg-ivory-100 w-full max-w-md
          rounded-t-xl4 sm:rounded-xl4 shadow-modal max-h-[96vh] overflow-y-auto no-scrollbar animate-scale-in">

        {/* Close button */}
        <button aria-label="إغلاق النافذة" onClick={onClose}
          className="absolute top-4 left-4 z-20 w-9 h-9 bg-white/90 rounded-xl
            flex items-center justify-center text-charcoal-600 hover:text-charcoal-900
            shadow-sm transition-all duration-200 hover:scale-105">
          <CloseIcon />
        </button>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 bg-charcoal-300 rounded-full" />
        </div>

        {/* Product image */}
        <div className="w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img src={imgError ? product.imageFallback : product.image}
            alt={`صورة ${product.name}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)} />
        </div>

        {/* Accent bar */}
        <div className="h-1 w-full" aria-hidden="true"
          style={{ background: `linear-gradient(to left, ${product.accentColor}44, ${product.accentColor}, ${product.accentColor}44)` }} />

        <div className="p-5">
          {/* Badge + tag */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {product.badge && (
              <span className="inline-block rounded-full px-2.5 py-0.5 font-arabic text-[10px] font-medium"
                style={{ color: product.accentColor, backgroundColor: product.accentBg }}>
                {product.badge}
              </span>
            )}
            {product.tag && (
              <span className="inline-block rounded-full px-2.5 py-0.5 font-arabic text-[10px] font-bold text-white"
                style={{ backgroundColor: product.accentColor }}>
                {product.tag}
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="font-display text-2xl font-bold text-charcoal-800 mb-1">
            {product.name}
          </h2>

          {/* Rating */}
          <div className="mb-3">
            <StarRating rating={product.rating} reviews={product.reviews} size="md" />
          </div>

          {/* Price — single element, no RTL split */}
          <p className="font-display text-3xl font-bold text-price mb-4">
            {formatPrice(product.price)}
          </p>

          {/* Tab switcher */}
          <div className="flex rounded-xl2 overflow-hidden border border-ivory-300 bg-white mb-4">
            {[
              { id: "about", label: "معلومات المنتج" },
              { id: "ingredients", label: "المكونات" },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 py-2 text-xs font-arabic font-semibold transition-colors duration-200
                  ${tab === id ? "text-white" : "text-charcoal-500 hover:text-charcoal-800"}`}
                style={tab === id ? { backgroundColor: product.accentColor } : {}}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab: about */}
          {tab === "about" && (
            <>
              <p className="font-arabic text-sm text-charcoal-600 leading-relaxed mb-4">
                {product.longDescription}
              </p>

              {/* Benefits */}
              {product.benefits && (
                <InfoBlock title="✨ الفوائد الأساسية" color={product.accentColor} bg={product.accentBg}>
                  <ul className="flex flex-col gap-1.5">
                    {product.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-0.5" style={{ color: product.accentColor }}>
                          <LeafIcon />
                        </span>
                        <span className="font-arabic text-xs text-charcoal-700 leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </InfoBlock>
              )}

              {/* Suitable for */}
              {product.suitableFor && (
                <InfoBlock title="👤 مناسب لمن؟" color={product.accentColor} bg={product.accentBg}>
                  <p className="font-arabic text-xs text-charcoal-700 leading-relaxed">
                    {product.suitableFor}
                  </p>
                </InfoBlock>
              )}

              {/* Usage */}
              {product.usage && (
                <InfoBlock title="💧 طريقة الاستخدام" color={product.accentColor} bg={product.accentBg}>
                  <p className="font-arabic text-xs text-charcoal-700 leading-relaxed">
                    {product.usage}
                  </p>
                </InfoBlock>
              )}

              <div className="flex items-center gap-2">
                <span className="font-arabic text-xs text-charcoal-500">الوزن الصافي:</span>
                <span className="font-arabic text-xs font-semibold text-charcoal-700">{product.weight}</span>
              </div>
            </>
          )}

          {/* Tab: ingredients */}
          {tab === "ingredients" && (
            <>
              <div className="rounded-xl2 p-4 mb-3" style={{ backgroundColor: product.accentBg }}>
                <ul className="flex flex-col gap-2" aria-label="قائمة المكونات">
                  {product.ingredients.map((ing) => (
                    <li key={ing} className="flex items-center gap-2">
                      <span className="flex-shrink-0" style={{ color: product.accentColor }}>
                        <LeafIcon />
                      </span>
                      <span className="font-arabic text-xs text-charcoal-700">{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="font-arabic text-[11px] text-olive-700 bg-olive-50 border border-olive-100
                  rounded-xl px-3 py-2 text-center leading-relaxed">
                🌱 جميع مكوناتنا طبيعية خالصة — خالية من البارابين والسيليكون والعطور الصناعية
              </p>
            </>
          )}

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex items-center rounded-xl2 border border-ivory-300 bg-white overflow-hidden">
              <button aria-label="تقليل الكمية"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 text-charcoal-600 hover:bg-ivory-200 transition-colors text-lg leading-none">−</button>
              <span className="px-3 py-2.5 font-arabic text-sm font-medium text-charcoal-800 min-w-[2.5rem] text-center">
                {qty}
              </span>
              <button aria-label="زيادة الكمية"
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2.5 text-charcoal-600 hover:bg-ivory-200 transition-colors text-lg leading-none">+</button>
            </div>

            <button onClick={handleAddToCart}
              aria-label={added ? "تمت الإضافة" : `أضف ${qty} من ${product.name} إلى السلة`}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl2
                font-arabic font-semibold text-sm transition-all duration-300 ease-spring
                ${added
                  ? "bg-olive-500 text-white scale-95"
                  : "bg-price text-white hover:bg-price-light shadow-btn hover:-translate-y-0.5 active:scale-95"
                }`}>
              {added ? <CheckIcon /> : <CartAddIcon />}
              {/* Show live line total */}
              {added ? "تمت الإضافة!" : `أضف · ${lineTotal}`}
            </button>
          </div>

          {/* Guarantee strip */}
          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-ivory-300">
            {[
              { icon: "🌿", text: "طبيعي ١٠٠٪" },
              { icon: "🚚", text: "توصيل سريع" },
              { icon: "↩️", text: "ضمان الرضا" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1">
                <span className="text-base">{icon}</span>
                <span className="font-arabic text-[9px] text-charcoal-400 whitespace-nowrap">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
