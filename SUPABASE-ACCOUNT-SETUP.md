# Supabase account / orders setup

لو كنت تريد تفعيل صفحات الحساب وطلباتي بالكامل، تأكد من سياسات `orders` المناسبة للمستخدم المسجل.

## المطلوب عادة

### السماح للمستخدم المسجل بإضافة طلبه
```sql
create policy "Authenticated users can insert own orders"
on public.orders
for insert
to authenticated
with check (
  user_id = auth.uid() or user_id is null
);
```

### السماح للمستخدم المسجل بقراءة طلباته فقط
```sql
create policy "Users can view own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid());
```

### إذا كان عندك policy حالية للضيف لإدخال الطلبات
اتركها كما هي حتى يستمر مسار الضيف الحالي.

> ملاحظة: الصياغة النهائية تعتمد على السياسات الموجودة عندك حاليًا. لو عندك سياسات قديمة على `orders`، راجعها قبل الإضافة حتى لا يحدث تعارض.
