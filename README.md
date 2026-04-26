# Alzahraa Candles — Luxury Redesign

واجهة متجر عربية RTL لبيع الشموع اليدوية، مبنية بـ HTML + CSS + JavaScript، وتعتمد على Supabase للمنتجات والطلبات ولوحة الإدارة.

---

## التصميم الجديد — نظرة عامة

أُعيد تصميم الواجهة بالكامل بنهج **Luxury · Warm · Minimal** مع الحفاظ على كامل المنطق البرمجي والربط بـ Supabase.

### الـ Palette
| المتغير | اللون | الاستخدام |
|---|---|---|
| `--cream` | `#FAF5EE` | خلفية الموقع |
| `--text` | `#2C1810` | النصوص الرئيسية |
| `--gold` | `#C9A46A` | الـ accent الذهبي |
| `--gold-dark` | `#A07840` | أزرار وعناوين |
| `--muted` | `#8C7B6E` | النصوص الثانوية |

### الخطوط
- **Cormorant Garamond** — Display headings وبراند اسم
- **El Messiri** — العناوين العربية
- **Tajawal** — النصوص العادية

---

## الملفات المُعدَّلة في الـ Redesign

| الملف | الحالة |
|---|---|
| `style.css` | ✅ إعادة كتابة كاملة (3360+ سطر) |
| `index.html` | ✅ تصميم جديد بالكامل |
| `cart.html` | ✅ إعادة تصميم |
| `login.html` | ✅ إعادة تصميم |
| `signup.html` | ✅ إعادة تصميم |
| `account.html` | ✅ إعادة تصميم |
| `my-orders.html` | ✅ تصميم جديد كليًا |
| `admin-orders.html` | ✅ محسَّن |
| `admin-login.html` | ✅ إعادة تصميم |
| `favicon.svg` | ✅ شمعة ذهبية جديدة |
| `candle-hero-1/2/3.svg` | ✅ رسومات luxury جديدة |
| `script.js` / `cart.js` / `auth-config.js` | ✅ **بدون أي تغيير** |

---

## الملفات الأساسية

- `index.html` + `script.js` — الصفحة الرئيسية وعرض المنتجات
- `cart.html` + `cart.js` — السلة وإرسال الطلب
- `admin-login.html` + `admin-orders.html` + `admin-orders.js` — لوحة الإدارة
- `account.html` / `login.html` / `signup.html` / `my-orders.html` — حسابات العملاء
- `style.css` — التنسيقات الكاملة الموحّدة
- `site-config.template.js` + `scripts/generate-site-config.js` — إعدادات البيئة

---

## متغيرات البيئة في Netlify

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SITE_URL=https://alzahraa-candles.netlify.app  (اختياري)
```

يُنفَّذ توليد `site-config.js` أثناء الـ build عبر:
```
node scripts/generate-site-config.js
```

---

## ملاحظات تقنية

- السلة: `localStorage` بالمفتاح `candles-cart`
- بيانات العميل: `candles-customer-info`
- الـ Scroll Reveal: `IntersectionObserver` على عناصر `[data-reveal]`
- الـ FAQ: toggle عبر `.faq-item.open` class
- الـ Lifestyle Gallery: drag-to-scroll أفقي
- تصميم RTL كامل مع دعم `dir="rtl"` على الـ `<html>`
