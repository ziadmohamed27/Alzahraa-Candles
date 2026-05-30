# HTML & Accessibility Fixes

تم إصلاح المشاكل التي ظهرت في تقرير فحص HTML/Accessibility:

- حذف قيود منع تكبير الصفحة من viewport.
- إضافة عناوين مخفية للأقسام التي لا تحتوي على heading ظاهر.
- تحويل حقل البحث من label يحتوي input و button إلى form صحيح مع role="search".
- إزالة self-closing slash من input في HTML.
- تعديل أزرار التصنيفات بحيث لا تحتوي على div أو heading داخل button.
- حذف role="contentinfo" غير الضروري من footer.
- ضبط عناوين footer للحفاظ على ترتيب headings أفضل.
