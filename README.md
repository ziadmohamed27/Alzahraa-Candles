# Alzahraa Candles

واجهة متجر عربية RTL لبيع الشموع اليدوية، مبنية بـ HTML + CSS + JavaScript، وتعتمد على Supabase للمنتجات والطلبات ولوحة الإدارة.

## الملفات الأساسية
- `index.html` + `script.js`: الصفحة الرئيسية وعرض المنتجات
- `cart.html` + `cart.js`: السلة وإرسال الطلب
- `admin-login.html` + `admin-orders.html` + `admin-orders.js`: تسجيل دخول الإدارة ولوحة الطلبات
- `account.html` / `login.html` / `signup.html` / `my-orders.html`: حسابات العملاء
- `style.css`: التنسيقات المشتركة
- `site-config.template.js` + `scripts/generate-site-config.js`: توليد إعدادات الواجهة من Netlify Environment Variables

## متغيرات البيئة في Netlify
أضف المتغيرات التالية:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SITE_URL` اختياري

ويتم توليد `site-config.js` أثناء الـ build عبر:
`node scripts/generate-site-config.js`

## ملاحظات
- السلة تُحفظ في `localStorage` بالمفتاح `candles-cart`
- بيانات العميل تُحفظ بالمفتاح `candles-customer-info`
- المشروع مهيأ بالكامل لهوية **Alzahraa Candles**
