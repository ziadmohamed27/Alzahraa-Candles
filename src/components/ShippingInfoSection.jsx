const orderSteps = [
  {
    title: "اختاري منتجاتك",
    desc: "تصفحي الأنواع المختلفة واختاري الصابون الأنسب لاحتياج بشرتك، ثم أضيفي ما يناسبك إلى السلة بسهولة.",
    icon: "🧼",
  },
  {
    title: "أرسلي الطلب عبر واتساب",
    desc: "بعد تأكيد السلة، سيتم تجهيز رسالة واتساب تلقائيًا تحتوي على تفاصيل طلبك لتكملي الخطوة بسرعة ووضوح.",
    icon: "💬",
  },
  {
    title: "نؤكد الطلب والتوصيل",
    desc: "نتواصل معك مباشرة لتأكيد الطلب وبيانات التوصيل وتحديد الموعد الأنسب للاستلام أو الشحن.",
    icon: "📦",
  },
];

const shippingHighlights = [
  { label: "مدة التوصيل", value: "من ٢ إلى ٥ أيام عمل" },
  { label: "مناطق الشحن", value: "متاح لمعظم المحافظات داخل مصر" },
  { label: "طريقة الطلب", value: "طلب سريع ومباشر عبر واتساب" },
  { label: "خدمة العملاء", value: "مساعدة سريعة لاختيار المنتج الأنسب لبشرتك" },
];

export default function ShippingInfoSection() {
  return (
    <section
      id="shipping-info"
      className="py-16 px-4 bg-ivory-50"
      aria-labelledby="shipping-info-heading"
    >
      <div className="mx-auto w-full max-w-screen-sm md:max-w-3xl lg:max-w-6xl xl:max-w-7xl">
        <div className="text-center mb-10">
          <span className="badge-natural mb-3 inline-block">الطلب والتوصيل</span>
          <h2 id="shipping-info-heading" className="section-title mb-3">
            كيف تطلبين؟ ومتى يصلك المنتج؟
          </h2>
          <p className="font-arabic text-sm text-charcoal-500 max-w-2xl mx-auto leading-relaxed">
            جعلنا تجربة الطلب بسيطة وواضحة: اختاري ما يناسب بشرتك، أرسلي الطلب عبر
            واتساب، وسنتابع معك خطوة بخطوة حتى يصل إليك بسهولة وأمان.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6 items-start">
          <div className="bg-white rounded-xl3 border border-ivory-200 shadow-card p-5 sm:p-6">
            <h3 className="font-display text-xl font-semibold text-charcoal-800 mb-5">
              خطوات الطلب السريعة
            </h3>

            <div className="space-y-4">
              {orderSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 items-start rounded-2xl bg-ivory-50 p-4 border border-ivory-200"
                >
                  <div className="w-12 h-12 rounded-2xl bg-olive-100 text-2xl flex items-center justify-center flex-shrink-0">
                    <span aria-hidden="true">{step.icon}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-full bg-olive-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <h4 className="font-display text-base font-semibold text-charcoal-800">
                        {step.title}
                      </h4>
                    </div>

                    <p className="font-arabic text-sm text-charcoal-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-charcoal-800 text-white rounded-xl3 shadow-card p-5 sm:p-6 overflow-hidden relative">
            <div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-olive-400 via-honey-300 to-coffee-400"
              aria-hidden="true"
            />

            <h3 className="font-display text-xl font-semibold mb-5">
              معلومات مهمة قبل الطلب
            </h3>

            <div className="space-y-3 mb-6">
              {shippingHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/5 border border-white/10 p-4"
                >
                  <p className="font-arabic text-xs text-white/60 mb-1">
                    {item.label}
                  </p>
                  <p className="font-arabic text-sm font-medium text-white/95 leading-relaxed">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#25D366]/12 border border-[#25D366]/25 p-4">
              <p className="font-display text-base font-semibold text-white mb-1.5">
                هل تحتاجين ترشيحًا سريعًا؟
              </p>
              <p className="font-arabic text-sm text-white/70 leading-relaxed">
                ارسلي لنا نوع بشرتك أو النتيجة التي تبحثين عنها، وسنساعدك في اختيار
                الصابون الأنسب مباشرة عبر واتساب.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
