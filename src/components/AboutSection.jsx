const values = [
  {
    icon: "🌿",
    title: "مكونات طبيعية مختارة",
    desc: "نختار بعناية زيوتًا ومكونات طبيعية لطيفة على البشرة وخالية من الإضافات القاسية.",
  },
  {
    icon: "🤲",
    title: "صناعة يدوية بعناية",
    desc: "كل قطعة تُحضّر باهتمام بالتفاصيل لتصلك بجودة ثابتة ولمسة طبيعية مميزة.",
  },
  {
    icon: "💧",
    title: "عناية وترطيب يومي",
    desc: "تركيبات تساعد على تنظيف البشرة بلطف مع الحفاظ على نعومتها وترطيبها.",
  },
  {
    icon: "🌍",
    title: "اختيار أنعم للطبيعة",
    desc: "نهتم بتقديم منتج أقرب للطبيعة بتغليف بسيط وممارسات أكثر لطفًا بالبيئة.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-16 px-4 bg-white relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(200,217,160,0.3) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(253,214,138,0.25) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-lg mx-auto md:max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <span className="badge-natural mb-3 inline-block">ثقة وعناية</span>
          <h2 id="about-heading" className="section-title mb-3">
            لماذا تختارين منتجاتنا الطبيعية؟
          </h2>
          <p className="font-arabic text-sm text-charcoal-500 max-w-md mx-auto leading-relaxed">
            لأن العناية اليومية الأفضل تبدأ بمكونات واضحة، ولمسة طبيعية، وصناعة
            تهتم ببشرتك من أول استخدام. نحن نؤمن أن الصابون الطبيعي ليس مجرد
            منتج، بل تجربة أنعم وأقرب لما تستحقه بشرتك كل يوم.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="flex flex-col items-center text-center p-5
                bg-ivory-50 rounded-xl3 border border-ivory-200
                hover:border-olive-200 hover:bg-olive-50/50
                transition-all duration-300 group
                opacity-0 animate-fade-up"
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: "forwards",
              }}
            >
              <span
                className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300"
                role="img"
                aria-label={v.title}
              >
                {v.icon}
              </span>
              <h3 className="font-display text-sm font-semibold text-charcoal-800 mb-1.5">
                {v.title}
              </h3>
              <p className="font-arabic text-xs text-charcoal-500 leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { num: "٥٠٠+", label: "تجربة موثوقة" },
            { num: "١٠٠٪", label: "مكونات طبيعية" },
            { num: "٤", label: "أنواع مميزة" },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-olive-600 mb-1">
                {num}
              </div>
              <div className="font-arabic text-xs text-charcoal-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
