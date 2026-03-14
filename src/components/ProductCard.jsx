import { useState } from "react";
import { useCart } from "../context/CartContext";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ProductCard({ product, onViewDetails, index = 0 }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article
      className="product-card group cursor-pointer relative flex flex-col opacity-0 animate-fade-up"
      style={{
        animationDelay: `${index * 100 + 100}ms`,
        animationFillMode: "forwards",
      }}
      onClick={() => onViewDetails(product)}
      aria-label={`منتج: ${product.name}`}
    >
      <button
        aria-label={`عرض تفاصيل ${product.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(product);
        }}
        className="absolute top-3 left-3 z-10
          w-8 h-8 bg-white/85 backdrop-blur-sm rounded-xl
          flex items-center justify-center
          text-charcoal-600 hover:text-olive-600
          shadow-sm
          opacity-0 scale-90
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-200"
      >
        <EyeIcon />
      </button>

      <div className="w-full overflow-hidden rounded-t-xl3" style={{ aspectRatio: "4/3" }}>
        <img
          src={imgError ? product.imageFallback : product.image}
          alt={`صورة ${product.name}`}
          loading="lazy"
          decoding="async"
          className="product-img w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        {product.badge && (
          <span
            className="inline-flex items-center self-start rounded-full px-2.5 py-1 mb-2
              font-arabic text-[11px] font-medium"
            style={{
              color: product.accentColor,
              backgroundColor: product.accentBg,
            }}
          >
            {product.badge}
          </span>
        )}

        <h2 className="font-display text-[1.05rem] font-semibold text-charcoal-800 mb-1.5 leading-snug">
          {product.name}
        </h2>

        <p className="font-arabic text-sm font-medium text-charcoal-700 mb-1.5">
          {product.tag}
        </p>

        <p className="font-arabic text-sm text-charcoal-500 leading-relaxed line-clamp-2 mb-2.5 flex-1">
          {product.description}
        </p>

        <p className="font-arabic text-[11px] text-charcoal-400 mb-4">
          الوزن: {product.weight}
        </p>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="price-tag">{product.price}</span>
          <span className="font-arabic text-sm font-medium text-price/80">
            {product.currency}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <button
            aria-label={added ? `تمت إضافة ${product.name} للسلة` : `أضف ${product.name} إلى السلة`}
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2
              py-2.5 rounded-xl2 text-sm font-arabic font-semibold
              transition-all duration-300
              ${
                added
                  ? "bg-olive-500 text-white scale-[0.98]"
                  : "bg-price text-white hover:bg-price-light hover:-translate-y-0.5 shadow-btn active:scale-95"
              }`}
          >
            {added ? <CheckIcon /> : <CartIcon />}
            {added ? "تمت الإضافة ✓" : "أضف إلى السلة الآن"}
          </button>

          <button
            aria-label={`عرض تفاصيل ${product.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="w-full flex items-center justify-center gap-1.5
              py-2.5 rounded-xl2 text-sm font-arabic font-medium
              border border-olive-300 text-olive-700 bg-transparent
              hover:bg-olive-50 hover:border-olive-500
              transition-all duration-200 active:scale-95"
          >
            عرض التفاصيل
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-xl3
          scale-x-0 group-hover:scale-x-100
          transition-transform duration-300 origin-right"
        style={{ backgroundColor: product.accentColor }}
        aria-hidden="true"
      />
    </article>
  );
}
