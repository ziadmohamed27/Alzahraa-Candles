import { useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "dry", label: "للبشرة الجافة", ids: [1, 3] },
  { id: "oily", label: "للبشرة الدهنية", ids: [2] },
  { id: "exfoliate", label: "تقشير", ids: [4] },
];

export default function ProductGrid({ onViewDetails }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? products
      : products.filter((p) => {
          const f = FILTERS.find((f) => f.id === activeFilter);
          return f?.ids?.includes(p.id);
        });

  return (
    <section
      id="products"
      className="py-16 px-4 mx-auto w-full max-w-screen-sm md:max-w-3xl lg:max-w-6xl xl:max-w-7xl"
      aria-labelledby="products-heading"
    >
      <div className="text-center mb-8">
        <span className="badge-natural mb-3 inline-block">مجموعتنا</span>

        <h2 id="products-heading" className="section-title mb-3">
          اختاري الصابون الطبيعي المناسب لبشرتك
        </h2>

        <p className="font-arabic text-sm text-charcoal-500 max-w-md mx-auto leading-relaxed mb-3">
          تركيبات طبيعية مصنوعة بعناية لتمنح بشرتك تنظيفًا لطيفًا، ترطيبًا يوميًا،
          ولمسة انتعاش تحبينها من أول استخدام.
        </p>

        <p className="font-arabic text-xs text-charcoal-400 max-w-sm mx-auto">
          تصفحي المنتجات واختاري النوع الأنسب لاحتياج بشرتك
        </p>
      </div>

      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-8 justify-center"
        role="tablist"
        aria-label="تصفية المنتجات"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={activeFilter === f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-arabic font-medium
              transition-all duration-200 ease-spring
              ${
                activeFilter === f.id
                  ? "bg-olive-600 text-white shadow-sm scale-105"
                  : "bg-white text-charcoal-600 border border-ivory-300 hover:border-olive-300 hover:text-olive-600"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onViewDetails}
            index={i}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl">🌿</span>
          <p className="font-arabic text-charcoal-500 mt-3">
            لا توجد منتجات في هذا التصنيف
          </p>
        </div>
      )}

      <p className="text-center font-arabic text-xs text-charcoal-400 mt-6">
        عرض {filtered.length} من {products.length} منتجات
      </p>
    </section>
  );
}
