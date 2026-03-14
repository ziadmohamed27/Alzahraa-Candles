import { storeInfo } from "../data/products";

const WA_LINK = `https://wa.me/${storeInfo.whatsapp}`;

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIconSolid() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

const quickLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "المنتجات", href: "#products" },
  { label: "عن المتجر", href: "#about" },
  { label: "تواصل معنا", href: "#footer" },
];

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-charcoal-800 text-ivory-200"
      role="contentinfo"
      aria-label="تذييل الصفحة"
    >
      <div className="bg-[#1a3a1a] border-b border-[#25D366]/20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <p className="font-display text-base font-semibold text-white">
              هل لديك استفسار أو تحتاج ترشيحًا مناسبًا لبشرتك؟
            </p>
            <p className="font-arabic text-sm text-ivory-200/70 mt-0.5 leading-relaxed">
              راسلنا مباشرة عبر واتساب وسنساعدك في اختيار النوع الأنسب بكل سهولة
            </p>
          </div>

          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل معنا عبر واتساب"
            className="flex-shrink-0 inline-flex items-center gap-2.5
              px-7 py-3 rounded-xl2 font-arabic font-bold text-sm
              bg-[#25D366] text-white
              shadow-[0_4px_16px_rgba(37,211,102,0.35)]
              transition-all duration-300
              hover:bg-[#1ebe5d] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)]
              active:scale-95 whitespace-nowrap"
          >
            <WhatsAppIconSolid />
            تواصل واتساب الآن
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-10">
          <div>
            <div className="mb-4">
              <h3 className="font-display text-2xl font-bold text-white">
                {storeInfo.name}
              </h3>
              <p className="font-arabic text-[10px] text-ivory-200/50 tracking-widest mt-0.5 uppercase">
                Natural Handmade Soap
              </p>
            </div>

            <p className="font-arabic text-sm text-ivory-200/65 leading-relaxed mb-5">
              صابون طبيعي مصنوع يدويًا بمكونات مختارة بعناية ليمنح بشرتك تنظيفًا
              لطيفًا، نعومة يومية، وتجربة أقرب للطبيعة.
            </p>

            <div className="flex items-center gap-3">
              <a
                href={storeInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام"
                className="w-9 h-9 rounded-xl bg-charcoal-700 flex items-center justify-center
                  text-ivory-200/60 hover:text-white hover:bg-[#E1306C]
                  transition-all duration-200"
              >
                <InstagramIcon />
              </a>

              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="واتساب"
                className="w-9 h-9 rounded-xl bg-charcoal-700 flex items-center justify-center
                  text-ivory-200/60 hover:text-white hover:bg-[#25D366]
                  transition-all duration-200"
              >
                <WhatsAppIconSolid />
              </a>

              <a
                href={`mailto:${storeInfo.email}`}
                aria-label="البريد الإلكتروني"
                className="w-9 h-9 rounded-xl bg-charcoal-700 flex items-center justify-center
                  text-ivory-200/60 hover:text-white hover:bg-olive-700
                  transition-all duration-200"
              >
                <EmailIcon />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white mb-5">
              روابط سريعة
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="font-arabic text-sm text-ivory-200/55 hover:text-white
                      transition-colors duration-200 flex items-center gap-2 group/link"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-olive-500 flex-shrink-0
                        opacity-0 group-hover/link:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-white mb-5">
              تواصل معنا
            </h4>
            <ul className="flex flex-col gap-3.5">
              <li>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-arabic text-sm text-[#4ade80]
                    hover:text-[#86efac] transition-colors group/wa"
                  aria-label="تواصل عبر واتساب"
                >
                  <span
                    className="w-7 h-7 rounded-lg bg-[#25D366]/20 flex items-center justify-center
                    group-hover/wa:bg-[#25D366]/30 transition-colors flex-shrink-0"
                  >
                    <WhatsAppIconSolid />
                  </span>
                  واتساب: {storeInfo.whatsapp}
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${storeInfo.email}`}
                  className="flex items-center gap-2.5 font-arabic text-sm text-ivory-200/55
                    hover:text-white transition-colors"
                  aria-label={`البريد: ${storeInfo.email}`}
                >
                  <span aria-hidden="true" className="text-base">
                    ✉️
                  </span>
                  {storeInfo.email}
                </a>
              </li>

              <li>
                <a
                  href={storeInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-arabic text-sm text-ivory-200/55
                    hover:text-white transition-colors"
                  aria-label="إنستغرام"
                >
                  <span aria-hidden="true" className="text-base">
                    📸
                  </span>
                  {storeInfo.instagramHandle}
                </a>
              </li>

              <li>
                <span className="flex items-center gap-2.5 font-arabic text-sm text-ivory-200/45">
                  <span aria-hidden="true" className="text-base">
                    📍
                  </span>
                  جمهورية مصر العربية
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-charcoal-700 mb-6" aria-hidden="true" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-arabic text-xs text-ivory-200/35">
            © {new Date().getFullYear()} {storeInfo.name} — جميع الحقوق محفوظة
          </p>
          <p className="font-arabic text-xs text-ivory-200/35">
            صُنع بـ 💚 بعناية مستوحاة من الطبيعة
          </p>
        </div>
      </div>
    </footer>
  );
}
