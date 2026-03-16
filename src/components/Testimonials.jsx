const testimonials = [
  {
    name: "سارة أحمد",
    location: "القاهرة",
    initials: "س",
    product: "صابون العسل",
    productColor: "#d97706",
    productBg: "#fffbeb",
    rating: 5,
    text: "أحببت صابون العسل لأنه ترك بشرتي أنعم بعد الغسيل بدون إحساس مزعج بالجفاف، وأصبح من المنتجات التي أستخدمها باستمرار.",
    verified: true,
  },
  {
    name: "محمد علي",
    location: "الإسكندرية",
    initials: "م",
    product: "صابون الفحم النشط",
    productColor: "#282828",
    productBg: "#f5f5f5",
    rating: 5,
    text: "جربت صابون الفحم لأن بشرتي مختلطة، وأكثر شيء لاحظته هو الإحساس بالنظافة والانتعاش وأنه مناسب للاستخدام المنتظم.",
    verified: true,
  },
  {
    name: "نور الهدى",
    location: "الجيزة",
    initials: "ن",
    product: "صابون زيت الزيتون",
    productColor: "#6b9228",
    productBg: "#f4f7ee",
    rating: 5,
    text: "بدأت بصابون زيت الزيتون لأنه ألطف خيار عندهم، وكان مناسبًا جدًا كبداية لبشرتي الحساسة واستعملته براحة.",
    verified: true,
  },
];

function StarsFilled({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} نجوم`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="#f59e0b" className="w-4 h-4" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 px-4 bg-ivory-100 relative overflow-hidden" aria-labelledby="testimonials-heading">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(200,217,160,0.18) 0%, transparent 70%)" }} aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(253,214,138,0.15) 0%, transparent 70%)" }} aria-hidden="true" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="badge-natural mb-3 inline-block">آراء العملاء</span>
          <h2 id="testimonials-heading" className="section-title mb-3">
            انطباعات حقيقية بعد الاستخدام
          </h2>
          <p className="font-arabic text-sm text-charcoal-500 max-w-sm mx-auto leading-relaxed">
            أمثلة مختصرة لطريقة حديث العملاء عن الإحساس بالمنتج واستخدامه اليومي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <article key={t.name} className="relative bg-white rounded-xl3 p-6 shadow-card border border-ivory-300 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fade-up" style={{ animationDelay: `${i * 120}ms`, animationFillMode: "forwards" }}>
              <div className="absolute top-4 left-5 text-4xl font-display text-charcoal-100 leading-none select-none" aria-hidden="true">"</div>

              <div className="mb-3">
                <StarsFilled count={t.rating} />
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-arabic font-medium px-2.5 py-1 rounded-full mb-3" style={{ backgroundColor: t.productBg, color: t.productColor }}>
                🧼 {t.product}
              </span>

              <p className="font-arabic text-sm text-charcoal-600 leading-relaxed mb-5">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-ivory-200">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: t.productColor }} aria-hidden="true">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold text-charcoal-800">{t.name}</p>
                  <p className="font-arabic text-[10px] text-charcoal-400">{t.location}</p>
                </div>
                {t.verified && (
                  <span className="text-[9px] font-arabic text-olive-600 bg-olive-50 px-2 py-0.5 rounded-full border border-olive-100 whitespace-nowrap flex-shrink-0">
                    ✓ تجربة موثّقة
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center flex-wrap gap-8">
          {[
            { num: "4", label: "أنواع أساسية", icon: "🧼" },
            { num: "واتساب", label: "طلب مباشر", icon: "💬" },
            { num: "يومي", label: "استخدام مريح", icon: "🌿" },
          ].map(({ num, label, icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-xl" aria-hidden="true">{icon}</span>
                <span className="font-display text-2xl font-bold text-olive-600">{num}</span>
              </div>
              <p className="font-arabic text-xs text-charcoal-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
