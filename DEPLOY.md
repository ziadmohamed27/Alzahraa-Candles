# دليل النشر — Alzahraa Candles على Netlify

## المتطلبات قبل النشر

- حساب على [Netlify](https://netlify.com)
- مشروع Supabase مُهيأ مع:
  - جدول `products` يحتوي: `id, name, price, weight, image, category, badge, description`
  - جدول `orders` يحتوي: `id, order_number, user_id, status, total, city, items_json, created_at`
  - جدول `profiles` يحتوي: `id, full_name, email, phone, governorate, address`
  - Storage Bucket اسمه `products` لصور المنتجات (Public)

---

## خطوات النشر على Netlify

### 1. رفع المشروع
```
اسحب الملفات إلى Netlify Drop
أو اربط مستودع GitHub وسيُنشر تلقائيًا
```

### 2. إضافة متغيرات البيئة
في **Site Settings → Environment Variables** أضف:

| المتغير | القيمة |
|---|---|
| `SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` (مفتاح anon العام) |
| `SITE_URL` | `https://alzahraa-candles.netlify.app` (اختياري) |

### 3. Build Command
```
node scripts/generate-site-config.js
```
هذا الأمر موجود بالفعل في `netlify.toml` — سيُنفَّذ تلقائيًا.

### 4. Publish Directory
```
.
```
(المجلد الجذر — مُعيَّن بالفعل في `netlify.toml`)

---

## بعد النشر — تحقق من هذه النقاط

```
✅ الرئيسية تُحمّل المنتجات من Supabase
✅ السلة تعمل (إضافة / حذف / تعديل كمية)
✅ إرسال الطلب يفتح واتساب بتفاصيل صحيحة
✅ تسجيل الدخول والتسجيل يعملان
✅ صفحة "طلباتي" تعرض الطلبات المسجَّلة
✅ لوحة الإدارة تعمل على /admin-login.html
✅ 404 مخصصة تظهر عند الرابط الخاطئ
✅ الموقع قابل للتثبيت كـ App على الجوال (PWA)
✅ Service Worker يعمل (يظهر في DevTools → Application)
```

---

## Supabase RLS (Row Level Security)

```sql
-- أوامر أساسية مقترحة

-- المنتجات — عرض عام للجميع
create policy "products_public_read"
  on products for select
  using (true);

-- الطلبات — كل مستخدم يرى طلباته فقط
create policy "orders_user_read"
  on orders for select
  using (auth.uid() = user_id);

-- الملفات الشخصية — كل مستخدم يعدّل ملفه فقط
create policy "profiles_user_update"
  on profiles for update
  using (auth.uid() = id);
```

---

## ملاحظات مهمة

- **لا تُرفع `site-config.js` على GitHub** — يحتوي على مفاتيح، أضفه لـ `.gitignore`
- **مفتاح `SUPABASE_ANON_KEY`** آمن للعرض العام لكن لا تشاركه غير ضروري
- **لوحة الإدارة** محمية بـ Supabase auth — يجب أن يكون للمستخدم دور admin
- **صور المنتجات** يجب أن يكون Bucket فيها `public` في إعدادات Supabase

---

## تحديث الموقع بعد تغيير CSS أو HTML

بعد أي تعديل على الملفات:
1. ارفع الملفات المحدَّثة على Netlify (drag & drop أو git push)
2. انتظر الـ deploy (عادةً 30–60 ثانية)
3. امسح cache المتصفح أو استخدم Ctrl+Shift+R

---

## دعم فني
للاستفسار: [wa.me/201095314011](https://wa.me/201095314011)
