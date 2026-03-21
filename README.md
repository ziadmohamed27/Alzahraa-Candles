# الزّهراء — Natural Soap Store

> Bilingual README · English first · العربية أدناه

---

# 🇬🇧 English

## Project Title

**الزّهراء** (Al-Zhraa) — Natural Handmade Soap Store

---

## Short Description

A fully Arabic RTL e-commerce website for a natural handmade soap brand. Products are loaded live from a Supabase database. Customers browse products, add them to a persistent cart, fill in their order details on a dedicated cart page, and complete their order via a pre-filled WhatsApp message. Every order is saved automatically to Supabase before WhatsApp opens.

---

## Overview

The site is a zero-build-step static frontend — no framework, no bundler, no npm runtime. It consists of two HTML pages, two JavaScript files, and one shared CSS file, deployed directly to Netlify. Supabase provides both the product catalogue and order storage. The checkout flow is WhatsApp-first: the store owner receives a structured Arabic order message and then confirms delivery with the customer.

---

## Features

- **Live product catalogue** — products are fetched from Supabase on every page load; no static fallback keeps stale data
- **Loading and error states** — spinning indicator while products load; friendly Arabic error message if the fetch fails
- **Product filtering** — filter by skin type: All · Dry skin · Oily skin · Exfoliating
- **Product detail modal** — inline modal showing full description, highlights, benefits, ingredients, and usage instructions
- **Persistent cart** — cart contents are saved to `localStorage` and survive page refreshes and navigation between `index.html` and `cart.html`
- **Dedicated cart page** (`cart.html`) — review cart items, adjust quantities, remove items, and clear the cart
- **Order form** — collects customer name, Egyptian mobile number, city, and optional notes; form data is also persisted to `localStorage` so the customer does not lose it on refresh
- **Egyptian phone validation** — validates the format `01[0,1,2,5]XXXXXXXX` before allowing checkout
- **WhatsApp checkout** — generates a structured Arabic pre-filled message including all cart items, quantities, prices, and customer details, then opens `wa.me/201095314011`
- **Supabase order save** — inserts a full order record into the `orders` table before opening WhatsApp; returns an `order_number` shown to the customer
- **Order success screen** — displays the order number with a one-click copy button after successful checkout
- **Customer info persistence** — form values (name, phone, city, notes) are saved to `localStorage` key `soap-customer-info` and restored on the next visit
- **Hero video section** — three autoplay, muted, looping MP4 videos with image poster fallbacks if video fails to load
- **Floating WhatsApp button** — always-visible button that opens WhatsApp directly
- **Mobile hamburger menu** — full responsive navigation with a slide-down mobile menu
- **FAQ accordion** — expandable questions and answers about products and ordering
- **Shipping info panel** — delivery timeframe, coverage, and ordering method clearly explained
- **XSS protection** — `escHtml()` function escapes all dynamic content before insertion into the DOM
- **Fully Arabic RTL** — `lang="ar" dir="rtl"` applied to both pages; Arabic fonts (El Messiri + Tajawal) loaded from Google Fonts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (two pages: `index.html`, `cart.html`) |
| Styling | Plain CSS (`style.css`) with CSS custom properties |
| Scripting | Vanilla JavaScript ES2020+ (no framework) |
| Database + API | [Supabase](https://supabase.com) (JS SDK v2, loaded via CDN) |
| Fonts | Google Fonts — El Messiri (headings), Tajawal (body) |
| Hosting | Netlify (static site, no build step) |
| Checkout | WhatsApp deep link (`wa.me`) |

No npm, no bundler, no React, no Vue, no TypeScript, no build pipeline.

---

## Project Structure

```
.
├── index.html          # Main storefront page (hero, products, about, FAQ, footer)
├── cart.html           # Dedicated cart and checkout page
├── script.js           # Main page logic: Supabase product fetch, filters, modal, cart badge
├── cart.js             # Cart page logic: cart management, order form, Supabase order insert, WhatsApp
├── style.css           # All styles for both pages (shared single file)
├── favicon.svg         # SVG favicon
├── netlify.toml        # Netlify deployment configuration
├── script.js.bak       # Old backup file (not loaded, not used by the site)
├── images/
│   ├── olive.jpg       # Static product image — used as video poster fallback
│   ├── honey.jpg
│   ├── charcoal.jpg
│   └── coffee.jpg
└── videos/
    ├── olive-video.mp4     # Hero section autoplay video
    ├── honey-video.mp4
    ├── coffee-video.mp4
    └── charcoal-video.mp4
```

---

## How It Works

### Page Load — `index.html` + `script.js`

1. On `DOMContentLoaded`, `init()` runs.
2. Static sections (features, steps, shipping info, FAQ) are rendered immediately from in-memory data arrays.
3. A loading spinner appears in the product grid while Supabase is queried.
4. `loadProducts()` calls `supabase.from('products').select('*').order('id')`.
5. On success, product cards are rendered via `renderProducts()`.
6. On failure, an Arabic error message replaces the spinner.
7. Cart item count is read from `localStorage` and shown in the nav badge.

### Product Interaction

- Clicking a product card image or "عرض التفاصيل" opens an inline modal.
- Clicking "أضف إلى السلة" pushes the product into `state.cart`, saves to `localStorage`, and shows a toast notification.
- Clicking the cart icon (🛍️) navigates to `cart.html`.

### Cart Page — `cart.html` + `cart.js`

1. On `DOMContentLoaded`, `init()` reads the cart from `localStorage` and renders it.
2. Customer form data is restored from `localStorage` key `soap-customer-info`.
3. The customer adjusts quantities or removes items; changes persist to `localStorage` immediately.
4. Clicking "إرسال الطلب عبر واتساب" triggers `checkout()`:
   - Validates that name, phone, and city are filled in.
   - Validates that the phone matches the Egyptian mobile format.
   - Calls `saveOrderToSupabase()` — inserts a record into `orders` and returns `order_number`.
   - Opens WhatsApp with the full pre-filled Arabic order message.
   - Clears the cart and form from `localStorage`.
   - Shows the order success box with the order number and a copy button.

### WhatsApp Message Format

```
مرحبًا، أريد إتمام الطلب:

الاسم: [name]
الموبايل: [phone]
المدينة: [city]
ملاحظات: [notes]

المنتجات:

1. [product name]
الكمية: [qty]
السعر: [price] ج.م

...

الإجمالي: [total] ج.م
الشحن: يتم تأكيده حسب المنطقة
```

---

## Supabase Setup / Integration

### How Supabase is loaded

The Supabase JS SDK v2 is loaded via CDN in both HTML files:

```html
<script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

The client is initialised in `script.js` and `cart.js`:

```js
supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Tables used

The project reads from and writes to two Supabase tables:

| Table | Operation | File |
|---|---|---|
| `products` | `SELECT *` ordered by `id` | `script.js` |
| `orders` | `INSERT` + `.select().single()` | `cart.js` |

---

## Environment / Configuration

All configuration lives directly in `script.js` (lines 1–2) and `cart.js` (lines 1–2):

```js
const SUPABASE_URL      = 'https://<your-project-ref>.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

There are no `.env` files, no build-time variable injection, and no server-side configuration. The `anon` (public) key is safe to expose in client-side code — it is rate-limited and governed by Row Level Security policies in Supabase.

The WhatsApp number is hardcoded as `201095314011` in both HTML anchor tags and in the JavaScript checkout message URL.

---

## Database Schema Summary

### Table: `products`

| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key, auto-increment |
| `name` | text | Product display name (Arabic) |
| `price` | numeric | Price in Egyptian Pounds (ج.م) |
| `weight` | text | e.g. `120 جرام` |
| `badge` | text | Skin-type label (e.g. للبشرة الجافة) |
| `tag` | text | Short promotional tag |
| `best_for` | text | Recommended use case |
| `category` | text | Filter value: `dry`, `oily`, `scrub`, or `all` |
| `description` | text | Short card description |
| `long_description` | text | Full modal description |
| `highlights` | jsonb | Array of short feature strings |
| `benefits` | jsonb | Array of benefit strings |
| `usage` | text | Usage instructions |
| `ingredients` | jsonb | Array of ingredient strings |
| `image` | text | Full URL to product image |

> `highlights`, `benefits`, and `ingredients` are handled by `toArray()` in `script.js`, which accepts a JSON array, a JSON string, or a comma-separated string.

### Table: `orders`

| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key, auto-increment |
| `order_number` | text | Returned after insert, shown to customer |
| `customer_name` | text | From order form |
| `phone` | text | Egyptian mobile number |
| `city` | text | Customer city / governorate |
| `notes` | text | Optional delivery notes |
| `items_json` | jsonb | Full cart array snapshot |
| `total` | numeric | Cart total in ج.م |
| `status` | text | Set to `'pending'` on insert |
| `source` | text | Set to `'website'` on insert |

### Required Row Level Security Policies

For the site to function correctly, the following RLS policies must be active in the Supabase dashboard:

- **`products`** — `SELECT` allowed for role `anon`
- **`orders`** — `INSERT` allowed for role `anon`; `SELECT` allowed for role `anon` (needed for `.select().single()` after insert)

---

## Running Locally

No installation or build step is required. Because the Supabase SDK is loaded from a CDN, the site must be served over HTTP (not opened as a `file://` URL) for CORS and the CDN script to work correctly.

**Option 1 — VS Code Live Server**

Install the Live Server extension in VS Code, right-click `index.html`, and choose "Open with Live Server".

**Option 2 — Python HTTP server**

```bash
cd path/to/project
python3 -m http.server 8080
# Open http://localhost:8080
```

**Option 3 — Node.js `serve`**

```bash
npx serve .
```

---

## Deployment Notes

The project is configured for Netlify via `netlify.toml`:

```toml
[build]
  command = "echo 'Static site - no build needed'"
  publish = "."

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

- The publish directory is the project root (`.`).
- The catch-all redirect ensures direct navigation to `/cart` does not produce a 404.
- No environment variables need to be set in the Netlify dashboard — all configuration is in the JS files.
- To deploy: drag the project folder into the Netlify dashboard, or connect the Git repository and set the publish directory to `.`.

---

## Future Improvements

- Move `SUPABASE_URL` and `SUPABASE_ANON_KEY` to Netlify environment variables injected at build time, removing them from the committed source
- Add product image hosting via Supabase Storage instead of external URLs
- Add an order management view (admin-only, protected by Supabase RLS + auth)
- Add Arabic order confirmation SMS or email via a Supabase Edge Function or webhook
- Implement stock / quantity tracking in the `products` table
- Add `og:image` meta tags per product for richer WhatsApp and social media link previews
- Add a product search input field
- Remove `script.js.bak` from the repository

---

## Credits

- **Brand:** الزّهراء (Al-Zhraa)
- **Contact:** [hello@itralnatura.com](mailto:hello@itralnatura.com) · WhatsApp: +20 109 531 4011 · [@itralnatura](https://instagram.com/itralnatura)
- **Fonts:** [El Messiri](https://fonts.google.com/specimen/El+Messiri) and [Tajawal](https://fonts.google.com/specimen/Tajawal) via Google Fonts
- **Backend:** [Supabase](https://supabase.com) (open-source Firebase alternative)
- **Hosting:** [Netlify](https://netlify.com)

---
---

# 🇸🇦 العربية

## عنوان المشروع

**الزّهراء** — متجر صابون طبيعي مصنوع يدويًا

---

## وصف مختصر

موقع تجارة إلكترونية عربي RTL بالكامل لعلامة تجارية للصابون الطبيعي اليدوي. تُحمَّل المنتجات مباشرةً من قاعدة بيانات Supabase. يتصفح العميل المنتجات، يضيفها إلى سلة تسوق مستمرة، ثم يملأ بيانات طلبه في صفحة السلة المخصصة، وينهي الطلب عبر رسالة واتساب جاهزة تُملأ تلقائياً. يُسجَّل كل طلب في Supabase قبل فتح واتساب.

---

## نظرة عامة

الموقع عبارة عن واجهة أمامية ثابتة لا تحتاج إلى خطوة بناء — لا إطار عمل، لا حزم، لا npm وقت التشغيل. يتكوّن من صفحتَي HTML، وملفَّي JavaScript، وملف CSS مشترك واحد، تُنشر مباشرةً على Netlify. يوفر Supabase كلًا من قاعدة بيانات المنتجات وتخزين الطلبات. تعتمد عملية الدفع على واتساب أولاً: يستلم صاحب المتجر رسالة طلب عربية منظّمة ثم يؤكد التوصيل مع العميل مباشرةً.

---

## المميزات

- **قائمة منتجات حية** — تُجلب المنتجات من Supabase عند كل تحميل للصفحة؛ لا توجد بيانات ثابتة قد تصبح قديمة
- **حالات التحميل والخطأ** — مؤشر دوران أثناء تحميل المنتجات، ورسالة خطأ عربية ودودة إذا فشل الجلب
- **تصفية المنتجات** — تصفية حسب نوع البشرة: الكل · الجافة · الدهنية · تقشير
- **نافذة تفاصيل المنتج** — نافذة منبثقة داخلية تعرض الوصف الكامل، النقاط البارزة، الفوائد، المكونات، وطريقة الاستخدام
- **سلة مستمرة** — تُحفظ محتويات السلة في `localStorage` وتبقى بعد تحديث الصفحة والانتقال بين `index.html` و `cart.html`
- **صفحة سلة مخصصة** (`cart.html`) — مراجعة المنتجات، تعديل الكميات، حذف منتجات، أو تفريغ السلة بالكامل
- **نموذج الطلب** — يجمع الاسم ورقم الموبايل المصري والمدينة وملاحظات اختيارية؛ تُحفظ بيانات النموذج في `localStorage` حتى لا يفقدها العميل عند التحديث
- **التحقق من رقم الموبايل المصري** — يتحقق من الصيغة `01[0,1,2,5]XXXXXXXX` قبل السماح بإتمام الطلب
- **الدفع عبر واتساب** — يُنشئ رسالة عربية منظمة تُملأ مسبقاً بجميع منتجات السلة والكميات والأسعار وبيانات العميل، ثم تفتح `wa.me/201095314011`
- **حفظ الطلب في Supabase** — يُدرج سجل طلب كامل في جدول `orders` قبل فتح واتساب؛ يُعاد رقم الطلب `order_number` ويُعرض للعميل
- **شاشة نجاح الطلب** — تعرض رقم الطلب مع زر نسخ بنقرة واحدة بعد إتمام الطلب بنجاح
- **استمرارية بيانات العميل** — تُحفظ قيم النموذج في مفتاح `localStorage` باسم `soap-customer-info` وتُستعاد في الزيارة التالية
- **مقاطع فيديو في قسم الهيرو** — ثلاثة مقاطع MP4 تعمل تلقائياً بدون صوت وبشكل حلقي، مع صور احتياطية إذا فشل تشغيل الفيديو
- **زر واتساب العائم** — زر دائم الظهور يفتح واتساب مباشرةً
- **قائمة الهامبرغر للموبايل** — قائمة تنقل استجابية تنزلق لتظهر على الشاشات الصغيرة
- **أكورديون الأسئلة الشائعة** — أسئلة وأجوبة قابلة للتوسيع حول المنتجات والطلب
- **لوحة معلومات الشحن** — مدة التوصيل والتغطية وطريقة الطلب موضّحة بوضوح
- **حماية من XSS** — دالة `escHtml()` تُهرّب كل المحتوى الديناميكي قبل إدراجه في DOM
- **عربي RTL بالكامل** — `lang="ar" dir="rtl"` مطبّق على الصفحتين؛ خطوط عربية (El Messiri + Tajawal) محمّلة من Google Fonts

---

## التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| HTML | HTML5 (صفحتان: `index.html`، `cart.html`) |
| CSS | CSS عادي (`style.css`) مع متغيرات CSS |
| JavaScript | JavaScript ES2020+ بدون إطار عمل |
| قاعدة البيانات والـ API | [Supabase](https://supabase.com) (SDK v2 عبر CDN) |
| الخطوط | Google Fonts — El Messiri (العناوين)، Tajawal (النص) |
| الاستضافة | Netlify (موقع ثابت، بدون خطوة بناء) |
| الدفع | رابط واتساب العميق (`wa.me`) |

لا npm، لا bundler، لا React، لا Vue، لا TypeScript، لا pipeline بناء.

---

## هيكل المشروع

```
.
├── index.html          # الصفحة الرئيسية (هيرو، منتجات، لماذا نحن، أسئلة شائعة، فوتر)
├── cart.html           # صفحة السلة والدفع المخصصة
├── script.js           # منطق الصفحة الرئيسية: جلب المنتجات، الفلاتر، النافذة، شارة السلة
├── cart.js             # منطق صفحة السلة: إدارة السلة، نموذج الطلب، حفظ الطلب، واتساب
├── style.css           # جميع الأنماط للصفحتين (ملف مشترك واحد)
├── favicon.svg         # أيقونة الموقع بصيغة SVG
├── netlify.toml        # إعدادات نشر Netlify
├── script.js.bak       # ملف نسخة احتياطية قديم (غير محمّل ولا يُستخدم)
├── images/
│   ├── olive.jpg       # صورة ثابتة — تُستخدم كصورة احتياطية للفيديو
│   ├── honey.jpg
│   ├── charcoal.jpg
│   └── coffee.jpg
└── videos/
    ├── olive-video.mp4     # فيديو قسم الهيرو
    ├── honey-video.mp4
    ├── coffee-video.mp4
    └── charcoal-video.mp4
```

---

## طريقة العمل

### تحميل الصفحة — `index.html` + `script.js`

1. عند `DOMContentLoaded`، تعمل دالة `init()`.
2. تُرسم الأقسام الثابتة (المميزات، الخطوات، معلومات الشحن، الأسئلة الشائعة) فوراً من مصفوفات بيانات في الذاكرة.
3. يظهر مؤشر التحميل في شبكة المنتجات ريثما تُستعلم Supabase.
4. تستدعي `loadProducts()` الأمر: `supabase.from('products').select('*').order('id')`.
5. عند النجاح، تُرسم بطاقات المنتجات عبر `renderProducts()`.
6. عند الفشل، تحلّ رسالة خطأ عربية محلّ مؤشر التحميل.
7. تُقرأ عدد العناصر في السلة من `localStorage` وتظهر في شارة شريط التنقل.

### التفاعل مع المنتج

- النقر على صورة المنتج أو "عرض التفاصيل" يفتح النافذة المنبثقة الداخلية.
- النقر على "أضف إلى السلة" يضيف المنتج إلى `state.cart`، يحفظه في `localStorage`، ويعرض إشعاراً.
- النقر على أيقونة السلة (🛍️) ينقل المستخدم إلى `cart.html`.

### صفحة السلة — `cart.html` + `cart.js`

1. عند `DOMContentLoaded`، تقرأ `init()` السلة من `localStorage` وترسمها.
2. تُستعاد بيانات نموذج العميل من مفتاح `localStorage` باسم `soap-customer-info`.
3. يعدّل العميل الكميات أو يحذف منتجات؛ تُحفظ التغييرات في `localStorage` فوراً.
4. النقر على "إرسال الطلب عبر واتساب" يشغّل `checkout()`:
   - يتحقق من ملء الاسم والهاتف والمدينة.
   - يتحقق من مطابقة الهاتف لصيغة الموبايل المصري.
   - يستدعي `saveOrderToSupabase()` — يُدرج سجلاً في `orders` ويُعيد `order_number`.
   - يفتح واتساب برسالة الطلب العربية الكاملة.
   - يمسح السلة والنموذج من `localStorage`.
   - يعرض صندوق نجاح الطلب مع رقم الطلب وزر النسخ.

### صيغة رسالة واتساب

```
مرحبًا، أريد إتمام الطلب:

الاسم: [الاسم]
الموبايل: [رقم الهاتف]
المدينة: [المدينة]
ملاحظات: [الملاحظات]

المنتجات:

1. [اسم المنتج]
الكمية: [الكمية]
السعر: [السعر] ج.م

...

الإجمالي: [الإجمالي] ج.م
الشحن: يتم تأكيده حسب المنطقة
```

---

## تكامل Supabase

### طريقة تحميل Supabase

يُحمَّل Supabase JS SDK v2 عبر CDN في كلتا صفحتَي HTML:

```html
<script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

يُهيَّأ الـ client في `script.js` و `cart.js`:

```js
supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### الجداول المستخدمة

| الجدول | العملية | الملف |
|---|---|---|
| `products` | `SELECT *` مرتبة حسب `id` | `script.js` |
| `orders` | `INSERT` + `.select().single()` | `cart.js` |

---

## الإعدادات والمتغيرات

جميع الإعدادات موجودة مباشرةً في `script.js` (السطران 1–2) و`cart.js` (السطران 1–2):

```js
const SUPABASE_URL      = 'https://<معرّف-مشروعك>.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

لا توجد ملفات `.env`، ولا حقن متغيرات وقت البناء، ولا إعدادات خادم. مفتاح `anon` العام آمن للكشف عنه في كود الواجهة الأمامية — إذ يخضع لحدود معدّل الاستخدام وسياسات Row Level Security في Supabase.

رقم واتساب `201095314011` مُضمَّن بشكل ثابت في وسوم HTML الارتباطية وفي رابط رسالة الدفع بـ JavaScript.

---

## ملخص قاعدة البيانات

### جدول `products`

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | integer | مفتاح أساسي، زيادة تلقائية |
| `name` | text | اسم المنتج (عربي) |
| `price` | numeric | السعر بالجنيه المصري (ج.م) |
| `weight` | text | مثال: `120 جرام` |
| `badge` | text | تسمية نوع البشرة (مثال: للبشرة الجافة) |
| `tag` | text | وسم ترويجي قصير |
| `best_for` | text | حالة الاستخدام الموصى بها |
| `category` | text | قيمة الفلتر: `dry`، `oily`، `scrub`، أو `all` |
| `description` | text | وصف قصير على البطاقة |
| `long_description` | text | الوصف الكامل في النافذة المنبثقة |
| `highlights` | jsonb | مصفوفة من نصوص الميزات القصيرة |
| `benefits` | jsonb | مصفوفة من نصوص الفوائد |
| `usage` | text | تعليمات الاستخدام |
| `ingredients` | jsonb | مصفوفة من نصوص المكونات |
| `image` | text | رابط كامل لصورة المنتج |

> الحقول `highlights` و `benefits` و `ingredients` تعالجها دالة `toArray()` في `script.js`، التي تقبل مصفوفة JSON أو نصاً JSON أو نصاً مفصولاً بفاصلات.

### جدول `orders`

| العمود | النوع | ملاحظات |
|---|---|---|
| `id` | integer | مفتاح أساسي، زيادة تلقائية |
| `order_number` | text | يُعاد بعد الإدراج ويُعرض للعميل |
| `customer_name` | text | من نموذج الطلب |
| `phone` | text | رقم الموبايل المصري |
| `city` | text | مدينة العميل / المحافظة |
| `notes` | text | ملاحظات التوصيل الاختيارية |
| `items_json` | jsonb | لقطة كاملة من مصفوفة السلة |
| `total` | numeric | إجمالي السلة بالجنيه المصري |
| `status` | text | تُضبط على `'pending'` عند الإدراج |
| `source` | text | تُضبط على `'website'` عند الإدراج |

### سياسات Row Level Security المطلوبة

لكي يعمل الموقع بشكل صحيح، يجب تفعيل سياسات RLS التالية في لوحة تحكم Supabase:

- **`products`** — السماح بـ `SELECT` للدور `anon`
- **`orders`** — السماح بـ `INSERT` للدور `anon`؛ والسماح بـ `SELECT` للدور `anon` (مطلوب لـ `.select().single()` بعد الإدراج)

---

## التشغيل محليًا

لا يلزم أي تثبيت أو خطوة بناء. بما أن Supabase SDK يُحمَّل من CDN، يجب تشغيل الموقع عبر HTTP (وليس كملف `file://`) لكي تعمل CORS ومكتبة CDN بشكل صحيح.

**الخيار الأول — VS Code Live Server**

ثبّت إضافة Live Server في VS Code، انقر بزر الماوس الأيمن على `index.html`، واختر "Open with Live Server".

**الخيار الثاني — خادم Python**

```bash
cd مسار/المشروع
python3 -m http.server 8080
# افتح http://localhost:8080
```

**الخيار الثالث — serve عبر Node.js**

```bash
npx serve .
```

---

## ملاحظات النشر

تم إعداد المشروع للنشر على Netlify عبر `netlify.toml`:

```toml
[build]
  command = "echo 'Static site - no build needed'"
  publish = "."

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

- مجلد النشر هو جذر المشروع (`.`).
- إعادة التوجيه الشاملة تضمن عدم ظهور خطأ 404 عند الانتقال المباشر إلى `/cart`.
- لا يلزم ضبط متغيرات بيئة في لوحة تحكم Netlify — كل الإعدادات موجودة في ملفات JS.
- للنشر: اسحب مجلد المشروع إلى لوحة تحكم Netlify، أو اربط مستودع Git واضبط مجلد النشر على `.`.

---

## التطويرات المستقبلية

- نقل `SUPABASE_URL` و`SUPABASE_ANON_KEY` إلى متغيرات بيئة Netlify تُحقن وقت البناء، لإزالتهما من الكود المصدري المُتسنَد
- استضافة صور المنتجات عبر Supabase Storage بدلاً من روابط خارجية
- إضافة واجهة إدارة الطلبات (محمية بـ Supabase RLS + المصادقة)
- إضافة تأكيد طلب عربي عبر SMS أو بريد إلكتروني باستخدام Supabase Edge Function أو Webhook
- تنفيذ تتبع المخزون والكميات في جدول `products`
- إضافة وسوم `og:image` لكل منتج لمعاينات أغنى عند المشاركة على واتساب ووسائل التواصل الاجتماعي
- إضافة حقل بحث عن المنتجات
- حذف ملف `script.js.bak` من المستودع

---

## الحقوق / صاحب المشروع

- **العلامة التجارية:** الزّهراء (Al-Zhraa)
- **التواصل:** [hello@itralnatura.com](mailto:hello@itralnatura.com) · واتساب: +20 109 531 4011 · [@itralnatura](https://instagram.com/itralnatura)
- **الخطوط:** [El Messiri](https://fonts.google.com/specimen/El+Messiri) و[Tajawal](https://fonts.google.com/specimen/Tajawal) عبر Google Fonts
- **الخلفية:** [Supabase](https://supabase.com) (بديل مفتوح المصدر لـ Firebase)
- **الاستضافة:** [Netlify](https://netlify.com)
