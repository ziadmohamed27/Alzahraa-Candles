const values = [
  {
    icon: "🌿",
    title: "مكونات طبيعية خالصة",
    desc: "نختار بعناية كل مكوّن طبيعي خالٍ من المواد الكيميائية الضارة.",
  },
  {
    icon: "🤲",
    title: "صناعة يدوية بمحبة",
    desc: "تُصنع كل قطعة صابون بأيدي متخصصة وبقلب يحب ما يفعل.",
  },
  {
    icon: "💧",
    title: "ترطيب عميق دائم",
    desc: "تركيبات مدروسة لمنح بشرتك رطوبة تدوم طوال اليوم.",
  },
  {
    icon: "🌍",
    title: "صديق للبيئة",
    desc: "تغليف قابل للتحلل وممارسات إنتاجية مستدامة.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-16 px-4 bg-white relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200,217,160,0.3) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(253,214,138,0.25) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-lg mx-auto md:max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="badge-natural mb-3 inline-block">قصتنا</span>
          <h2 id="about-heading" className="section-title mb-3">
            لماذا نختار الطبيعي؟
          </h2>
          <p className="font-arabic text-sm text-charcoal-500 max-w-sm mx-auto leading-relaxed">
            في عطر الطبيعة، نؤمن أن الجمال الحقيقي يبدأ بمكونات حقيقية. كل ما نصنعه هو امتداد لحبنا للطبيعة
            وإيماننا العميق بقوتها على تجديد الحياة.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="flex flex-col items-center text-center p-5
                bg-ivory-50 rounded-xl3 border border-ivory-200
                hover:border-olive-200 hover:bg-olive-50/50
                transition-all duration-300 group
                opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
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

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { num: "٥٠٠+", label: "عميل سعيد" },
            { num: "١٠٠٪", label: "مكونات طبيعية" },
            { num: "٤", label: "منتجات مميزة" },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-olive-600 mb-1">
                {num}
              </div>
              <div className="font-arabic text-xs text-charcoal-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
