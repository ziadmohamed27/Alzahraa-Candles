# SIRAJ Performance Optimization

تم تنفيذ تحسينات PageSpeed الأساسية:

- إزالة `user-scalable=no` و `maximum-scale=1` من viewport لتحسين Accessibility.
- إضافة Critical CSS للـ header والـ hero لتقليل Render Blocking.
- تحميل ملفات CSS غير الحرجة بطريقة preload/onload.
- تحويل لوجوهات الواجهة الثقيلة إلى WebP بأحجام مناسبة.
- إضافة `width` و `height` و `decoding` و `loading` للصور المهمة.
- ضغط ملفات CSS و JavaScript محليًا.
- تخفيف animations والـ glow على الموبايل وإضافة احترام `prefers-reduced-motion`.
- تحسين contrast لبعض النصوص الفاتحة.
- إصلاح ترتيب بعض العناوين داخل الصفحة.
- إضافة Cache-Control طويل لملفات `/assets/*` على Netlify.

بعد الرفع على Netlify، امسح الكاش أو اعمل deploy جديد ثم اختبر Mobile PageSpeed مرة ثانية.
