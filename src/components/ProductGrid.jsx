import { useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

const FILTERS = [
  { id: "all", label: "الكل", emoji: "🌿" },
  { id: "popular", label: "الأكثر طلبًا", emoji: "⭐", ids: [3, 1] },
  { id: "dry", label: "بشرة جافة", emoji: "💧", ids: [1, 3] },
  { id: "oily", label: "بشرة دهنية", emoji: "✨", ids: [2] },
  { id: "exfoliate", label: "تقشير", emoji: "☕", ids: [4] },
];

const starterGuides = [
  {
    title: "لو بشرتك حساسة أو جافة",
    pick: "ابدئي بزيت الزيتون",
    desc: "ألطف اختيار كبداية لمن لا تريد تجربة قوية على البشرة.",
    filterId: "dry",
  },
  {
    title: "لو تريدين نعومة يومية",
    pick: "اختاري صابون العسل",
    desc: "مناسب للاستخدام اليومي ويعطي إحساسًا مريحًا بعد الغسيل.",
    filterId: "popular",
  },
  {
    title: "لو عندك لمعة أو دهون",
    pick: "جرّبي الفحم النشط",
    desc: "أنسب اختيار للبشرة الدهنية والمختلطة مع إحساس أنظف بعد الاستخدام.",
    filterId: "oily",
  },
];

export default function ProductGrid({ onViewDetails }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p) => {
          const f = FILTERS.find((item) => item.id === activeFilter);
          return f?.ids?.includes(p.id);
        });

  return (
    <section id="products" className="py-16 px-4 mx-auto w-full max-w-screen-sm md:max-w-3xl lg:max-w-6xl xl:max-w-7xl" aria-labelledby="products-heading">
      <div className="text-center mb-8">
        <span className="badge-natural mb-3 inline-block">مجموعتنا الطبيعية</span>
        <h2 id="products-heading" className="section-title mb-3">
          اختاري الصابون الأنسب لبشرتك
        </h2>
        <p className="font-arabic text-sm text-charcoal-500 max-w-xl mx-auto leading-relaxed">
          لا تحتاري كثيرًا: اختاري حسب نوع بشرتك أو النتيجة التي تريدينها، ثم أكملي الطلب بسهولة عبر واتساب.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {starterGuides.map((guide) => (
          <button
            key={guide.title}
            type="button"
            onClick={() => setActiveFilter(guide.filterId)}
            className="text-right bg-white border border-ivory-300 rounded-xl3 p-4 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
          >
            <p className="font-arabic text-xs text-charcoal-500 mb-1">{guide.title}</p>
            <p className="font-display text-lg text-charcoal-800 font-semibold mb-1">{guide.pick}</p>
            <p className="font-arabic text-sm text-charcoal-500 leading-relaxed">{guide.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center flex-wrap gap-3 mb-8">
        {[
          { icon: "🌿", text: "مكونات مختارة بعناية" },
          { icon: "🤲", text: "صناعة يدوية" },
          { icon: "💬", text: "طلب مباشر عبر واتساب" },
          { icon: "🚚", text: "شحن داخل مصر" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 bg-white border border-ivory-300 px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-sm" aria-hidden="true">{icon}</span>
            <span className="font-arabic text-[11px] text-charcoal-600 font-medium">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-8 justify-center" role="tablist" aria-label="تصفية المنتجات">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={activeFilter === f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-arabic font-medium transition-all duration-200 ease-spring ${
              activeFilter === f.id
                ? "bg-olive-600 text-white shadow-sm scale-105"
                : "bg-white text-charcoal-600 border border-ivory-300 hover:border-olive-300 hover:text-olive-600"
            }`}
          >
            <span aria-hidden="true">{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl">🌿</span>
          <p className="font-arabic text-charcoal-500 mt-3">لا توجد منتجات في هذا التصنيف</p>
        </div>
      )}

      <p className="text-center font-arabic text-xs text-charcoal-400 mt-6">عرض {filtered.length} من {products.length} منتجات</p>
    </section>
  );
}
