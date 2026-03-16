import { useState } from "react";

const faqs = [
  {
    q: "أي نوع أختار إذا كانت هذه أول تجربة لي؟",
    a: "إذا كانت بشرتك حساسة أو جافة فغالبًا تكون البداية المناسبة مع صابون زيت الزيتون. وإذا كنت تريدين نعومة يومية واضحة فصابون العسل اختيار مريح أيضًا.",
  },
  {
    q: "هل الصابون مناسب للاستخدام اليومي؟",
    a: "نعم، خصوصًا زيت الزيتون والعسل للاستخدام اليومي. أمّا صابون القهوة فيُفضّل استخدامه عدة مرات أسبوعيًا لأنه مخصص أكثر للتقشير اللطيف.",
  },
  {
    q: "كيف أعرف النوع الأنسب لبشرتي؟",
    a: "يمكنك الاختيار من التصنيفات داخل قسم المنتجات، أو مراسلتنا عبر واتساب مع نوع بشرتك والنتيجة التي تبحثين عنها وسنرشح لك الأنسب.",
  },
  {
    q: "كيف أطلب؟",
    a: "أضيفي المنتجات إلى السلة، ثم أرسلي الطلب عبر واتساب. ستصلنا تفاصيل المنتجات مباشرة ونتابع معك لتأكيد الطلب وبيانات التوصيل.",
  },
  {
    q: "هل يوجد شحن داخل مصر؟",
    a: "نعم، الشحن متاح لمعظم المحافظات داخل مصر، وعادة تكون مدة التوصيل من ٢ إلى ٥ أيام عمل حسب المنطقة.",
  },
  {
    q: "هل تكلفة الشحن ثابتة؟",
    a: "تفاصيل الشحن والتكلفة يتم تأكيدها معك أثناء تأكيد الطلب على واتساب حسب المكان والكمية، حتى تكون الصورة أوضح قبل إتمام الطلب.",
  },
  {
    q: "هل يمكنني الاستفسار قبل الشراء؟",
    a: "بالتأكيد، يمكنك السؤال أولًا عن نوع البشرة أو الاستخدام أو أفضل اختيار للبداية، وسنساعدك بسرعة عبر واتساب.",
  },
];

function ChevronDownIcon({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section id="faq" className="py-16 px-4 bg-white" aria-labelledby="faq-heading">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="badge-natural mb-3 inline-block">الأسئلة الشائعة</span>
          <h2 id="faq-heading" className="section-title mb-3">
            أسئلة تساعدك قبل الشراء
          </h2>
          <p className="font-arabic text-sm text-charcoal-500 max-w-xs mx-auto leading-relaxed">
            لم تجدي إجابتك؟ راسلينا على واتساب وسنساعدك بسرعة.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`bg-ivory-50 rounded-xl2 border overflow-hidden transition-all duration-300 ${isOpen ? "border-olive-300 shadow-card" : "border-ivory-300 hover:border-olive-200"}`}>
                <button onClick={() => toggle(i)} aria-expanded={isOpen} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right">
                  <span className="font-arabic text-sm font-semibold text-charcoal-800 text-right leading-relaxed">
                    {faq.q}
                  </span>
                  <span className={`transition-colors duration-300 ${isOpen ? "text-olive-600" : "text-charcoal-400"}`}>
                    <ChevronDownIcon open={isOpen} />
                  </span>
                </button>

                <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? "300px" : "0px" }}>
                  <div className="px-5 pb-5 pt-0 border-t border-ivory-200">
                    <p className="font-arabic text-sm text-charcoal-600 leading-relaxed mt-3">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-5 bg-olive-50 rounded-xl3 border border-olive-100 text-center">
          <p className="font-display text-sm font-semibold text-charcoal-800 mb-1">لديكِ سؤال آخر؟ 💬</p>
          <p className="font-arabic text-xs text-charcoal-500 mb-4 leading-relaxed">فريقنا متاح على واتساب للإجابة على استفساراتك قبل الطلب.</p>
          <a href="https://wa.me/201095314011?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%B3%D8%A4%D8%A7%D9%84" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl2 text-sm font-arabic font-semibold bg-[#25D366] text-white transition-all duration-300 hover:bg-[#1ebe5d] hover:-translate-y-0.5 shadow-[0_3px_12px_rgba(37,211,102,0.3)] active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            اسأليني على واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
