const values = [
  {
    icon: "🌿",
    title: "مكونات واضحة ومختارة",
    desc: "نختار مكونات معروفة وبسيطة حتى تكون تجربة العناية أوضح وأقرب للطبيعة.",
  },
  {
    icon: "🤲",
    title: "صناعة يدوية بعناية",
    desc: "كل قطعة تُحضّر باهتمام بالتفاصيل لتصلك بشكل مرتب وجودة ثابتة قدر الإمكان.",
  },
  {
    icon: "💧",
    title: "عناية يومية لطيفة",
    desc: "تركيبات مناسبة لمن تريد تنظيفًا مريحًا ونعومة يومية بدون إحساس قاسٍ على البشرة.",
  },
  {
    icon: "💬",
    title: "مساعدة في الاختيار",
    desc: "يمكنك مراسلتنا مباشرة وسنرشح لك النوع الأنسب حسب بشرتك واحتياجك اليومي.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-16 px-4 bg-white relative overflow-hidden" aria-labelledby="about-heading">
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(200,217,160,0.3) 0%, transparent 70%)" }} aria-hidden="true" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(253,214,138,0.25) 0%, transparent 70%)" }} aria-hidden="true" />

      <div className="max-w-lg mx-auto md:max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <span className="badge-natural mb-3 inline-block">ثقة وجودة</span>
          <h2 id="about-heading" className="section-title mb-3">
            لماذا تختارين منتجاتنا الطبيعية؟
          </h2>
          <p className="font-arabic text-sm text-charcoal-500 max-w-md mx-auto leading-relaxed">
            لأننا نركّز على تجربة بسيطة وواضحة: مكونات مختارة، عناية يومية لطيفة، ومساعدة مباشرة لتختاري ما يناسب بشرتك بسهولة.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <div key={v.title} className="flex flex-col items-center text-center p-5 bg-ivory-50 rounded-xl3 border border-ivory-200 hover:border-olive-200 hover:bg-olive-50/50 transition-all duration-300 group opacity-0 animate-fade-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}>
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300" role="img" aria-label={v.title}>{v.icon}</span>
              <h3 className="font-display text-sm font-semibold text-charcoal-800 mb-1.5">{v.title}</h3>
              <p className="font-arabic text-xs text-charcoal-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { num: "4", label: "أنواع رئيسية", sub: "لتناسب احتياجات مختلفة" },
            { num: "100%", label: "عناية طبيعية", sub: "بأسلوب بسيط وواضح" },
            { num: "واتساب", label: "طلب سريع", sub: "واستفسار مباشر قبل الشراء" },
          ].map(({ num, label, sub }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-olive-600 mb-0.5">{num}</div>
              <div className="font-arabic text-xs font-semibold text-charcoal-700">{label}</div>
              <div className="font-arabic text-[10px] text-charcoal-400 mt-0.5 hidden sm:block">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
