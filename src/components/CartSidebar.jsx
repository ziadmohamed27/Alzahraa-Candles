import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

function TrashIcon() {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const formatPrice = (price) => `${Number(price).toFixed(2)} ج.م`;

export default function CartSidebar() {
  const {
    items,
    removeItem,
    updateQty,
    totalItems,
    totalPrice,
    isOpen,
    setIsOpen,
  } = useCart();
  const [showCheckoutHint, setShowCheckoutHint] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const shippingText = "مجاني";
  const finalTotal = Number(totalPrice);

  const handleWhatsAppCheckout = () => {
    if (!items.length) return;

    setShowCheckoutHint(true);

    const orderLines = items
      .map((item, index) => {
        const itemTotal = Number(item.price) * item.qty;
        return `${index + 1}. ${item.name}\nالكمية: ${item.qty}\nالسعر: ${formatPrice(itemTotal)}`;
      })
      .join("\n\n");

    const message = `مرحبًا، أريد إتمام طلب المنتجات التالية:\n\n${orderLines}\n\nالمجموع الفرعي: ${formatPrice(totalPrice)}\nالشحن: ${shippingText}\nالإجمالي: ${formatPrice(finalTotal)}`;

    const whatsappUrl = `https://wa.me/201095314011?text=${encodeURIComponent(message)}`;

    window.setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 450);
  };

  return (
    <div
      className={`fixed inset-0 z-[70] transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-charcoal-900/40 modal-backdrop transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        role="complementary"
        aria-label="سلة التسوق"
        className={`absolute top-0 left-0 h-full w-full max-w-sm bg-ivory-100 shadow-modal flex flex-col transition-transform duration-300 ease-spring ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ivory-300">
          <button
            aria-label="إغلاق السلة"
            onClick={() => setIsOpen(false)}
            className="nav-icon-btn"
          >
            <CloseIcon />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-charcoal-800">سلة التسوق</h2>
            {totalItems > 0 && (
              <span className="w-5 h-5 bg-price text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <div className="w-16 h-16 bg-ivory-200 rounded-full flex items-center justify-center">
                <span className="text-3xl" aria-hidden="true">🛒</span>
              </div>
              <p className="font-display text-lg text-charcoal-600">السلة فارغة</p>
              <p className="font-arabic text-sm text-charcoal-400 text-center">
                أضف بعض منتجاتنا الطبيعية الرائعة
              </p>
              <button onClick={() => setIsOpen(false)} className="btn-primary mt-2">
                تسوق الآن
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 bg-white rounded-xl2 p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = item.imageFallback;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold text-charcoal-800 truncate">{item.name}</p>
                    <p className="font-arabic text-xs text-charcoal-400 mb-2">{item.weight}</p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 border border-ivory-300 rounded-lg overflow-hidden">
                        <button
                          aria-label="تقليل"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="px-2 py-0.5 text-charcoal-600 hover:bg-ivory-200 text-sm"
                        >
                          −
                        </button>

                        <span className="px-2 font-arabic text-xs font-medium text-charcoal-800">{item.qty}</span>

                        <button
                          aria-label="زيادة"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="px-2 py-0.5 text-charcoal-600 hover:bg-ivory-200 text-sm"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-display text-sm font-bold text-price">
                        {formatPrice(Number(item.price) * item.qty)}
                      </span>
                    </div>
                  </div>

                  <button
                    aria-label={`حذف ${item.name}`}
                    onClick={() => removeItem(item.id)}
                    className="self-start text-charcoal-400 hover:text-red-500 transition-colors p-1"
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-ivory-300 bg-white">
            <div className="rounded-2xl bg-olive-50 border border-olive-100 p-3.5 mb-4">
              <div className="flex items-start gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center flex-shrink-0">
                  <WhatsAppIcon />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-charcoal-800 mb-1">
                    إتمام الطلب يتم عبر واتساب
                  </p>
                  <p className="font-arabic text-xs text-charcoal-500 leading-relaxed">
                    عند الضغط على الزر بالأسفل سنجهز رسالة جاهزة بكل تفاصيل السلة ثم يتم تحويلك إلى واتساب لإرسال الطلب مباشرة.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-1">
              <span className="font-arabic text-sm text-charcoal-500">المجموع الفرعي</span>
              <span className="font-arabic text-sm font-medium text-charcoal-700">{formatPrice(totalPrice)}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="font-arabic text-sm text-charcoal-500">الشحن</span>
              <span className="font-arabic text-sm font-medium text-olive-600">مجاني 🎉</span>
            </div>

            <div className="flex items-center justify-between mb-4 pt-3 border-t border-ivory-300">
              <span className="font-display text-base font-semibold text-charcoal-800">الإجمالي</span>
              <span className="font-display text-lg font-bold text-price">{formatPrice(finalTotal)}</span>
            </div>

            {showCheckoutHint && (
              <p className="font-arabic text-xs text-olive-700 bg-olive-50 border border-olive-100 rounded-xl px-3 py-2 mb-3 text-center">
                يتم الآن تجهيز رسالتك وتحويلك إلى واتساب لإكمال الطلب.
              </p>
            )}

            <button onClick={handleWhatsAppCheckout} className="btn-primary w-full py-3.5 text-base">
              إتمام الطلب عبر واتساب
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center mt-3 font-arabic text-sm text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              مواصلة التسوق
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
