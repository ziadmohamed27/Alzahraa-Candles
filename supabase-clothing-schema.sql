-- ================================================================
-- الزّهراء | تجهيز Supabase لمتجر الملابس الإسلامية النسائية
-- ================================================================
-- نفّذ هذا الملف في Supabase SQL Editor.
-- الهدف:
-- 1) توسيع جدول products الحالي بدل تكسيره
-- 2) إنشاء product_variants و product_images
-- 3) إبقاء orders ولوحة الإدارة الحالية تعمل كما هي
-- 4) جعل الواجهة تقرأ كل شيء من قاعدة البيانات مباشرة
--
-- ملاحظة مهمة:
-- السطر الذي يعطّل كل المنتجات الحالية مقصود، حتى يبدأ المتجر فارغًا
-- إلى أن تضيفي منتجات الملابس الجديدة بنفسك من Supabase.
-- إذا كنت تريدين إبقاء بعض المنتجات القديمة ظاهرة، علّقي هذا السطر يدويًا.
-- ================================================================

begin;

-- ----------------------------------------------------------------
-- 0) Bucket الصور (اختياري لكنه موصى به)
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- سياسة قراءة عامة لصور bucket المنتجات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'products bucket public read'
  ) THEN
    CREATE POLICY "products bucket public read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'products');
  END IF;
END $$;

-- ----------------------------------------------------------------
-- 1) توسيع جدول products الحالي
-- ----------------------------------------------------------------
alter table public.products
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists fabric text,
  add column if not exists care_note text,
  add column if not exists size_guide text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true;

create unique index if not exists products_slug_unique_idx
  on public.products (lower(slug))
  where slug is not null;

create index if not exists products_active_sort_idx
  on public.products (is_active, sort_order, id);

-- ابدأي بواجهة نظيفة: أخفي المنتجات الحالية إلى أن تضيفي منتجات الملابس الجديدة
update public.products
set is_active = false
where is_active is distinct from false;

-- ----------------------------------------------------------------
-- 2) جدول الـ variants
-- ----------------------------------------------------------------
create table if not exists public.product_variants (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  size_label text not null,
  color_name text not null,
  color_hex text,
  price numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_variants_unique_option_idx
  on public.product_variants (product_id, lower(color_name), lower(size_label));

create index if not exists product_variants_product_active_idx
  on public.product_variants (product_id, is_active, sort_order, id);

-- ----------------------------------------------------------------
-- 3) جدول صور المنتج
-- ----------------------------------------------------------------
create table if not exists public.product_images (
  id bigserial primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  color_name text,
  image_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_images_product_color_idx
  on public.product_images (product_id, color_name, is_active, sort_order, id);

-- ----------------------------------------------------------------
-- 4) Triggers لتحديث updated_at
-- ----------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_products_updated_at'
  ) THEN
    CREATE TRIGGER set_products_updated_at
      BEFORE UPDATE ON public.products
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_product_variants_updated_at'
  ) THEN
    CREATE TRIGGER set_product_variants_updated_at
      BEFORE UPDATE ON public.product_variants
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_product_images_updated_at'
  ) THEN
    CREATE TRIGGER set_product_images_updated_at
      BEFORE UPDATE ON public.product_images
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ----------------------------------------------------------------
-- 5) RLS + Policies
-- ----------------------------------------------------------------
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

-- products: قراءة عامة للمنتجات المفعلة فقط
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'products'
      AND policyname = 'products public read active only'
  ) THEN
    CREATE POLICY "products public read active only"
      ON public.products FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- product_variants: قراءة عامة للخيارات المفعلة فقط
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_variants'
      AND policyname = 'product_variants public read active only'
  ) THEN
    CREATE POLICY "product_variants public read active only"
      ON public.product_variants FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- product_images: قراءة عامة للصور المفعلة فقط
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'product_images'
      AND policyname = 'product_images public read active only'
  ) THEN
    CREATE POLICY "product_images public read active only"
      ON public.product_images FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- السماح للواجهة بالقراءة
grant select on public.products to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select on public.product_images to anon, authenticated;

-- ----------------------------------------------------------------
-- 6) مثال عملي لإضافة منتج جديد
-- ----------------------------------------------------------------
-- ملاحظة: الصور لا تُكتب في الكود.
-- ضعي المسار هنا فقط، والواجهة ستسحب الصورة تلقائيًا.
-- أمثلة صحيحة لـ image_path:
--   khimar/black-1.jpg
--   products/khimar/black-1.jpg
--   https://....../image.jpg
--
-- مثال (انسخيه وعدليه حسب احتياجك):
--
-- insert into public.products (
--   name,
--   slug,
--   category,
--   short_description,
--   description,
--   long_description,
--   fabric,
--   care_note,
--   size_guide,
--   sort_order,
--   is_active
-- ) values (
--   'خمار كريب سادة',
--   'khimar-crepe-basic',
--   'خمارات',
--   'خمار يومي عملي بألوان أساسية.',
--   'خمار مناسب للاستخدام اليومي بخامة كريب شيفون ثابتة نسبيًا.',
--   'خمار يومي مناسب للاستخدام العملي، مع عرض أوضح للون والمقاس داخل صفحة المنتج.',
--   'كريب شيفون',
--   'غسيل يدوي أو دورة خفيفة، ويفضل الكي بدرجة منخفضة.',
--   'المقاسات تكتب كما تريدين: قصير / متوسط / طويل أو 1 / 2 / 3.',
--   10,
--   true
-- );
--
-- بعد إنشاء المنتج خذي الـ id الناتج، ثم أضيفي الـ variants مثلًا:
--
-- insert into public.product_variants (
--   product_id,
--   size_label,
--   color_name,
--   color_hex,
--   price,
--   compare_price,
--   stock_quantity,
--   sku,
--   sort_order,
--   is_active
-- ) values
--   (1, '1', 'أسود', '#111111', 285, 0, 8, 'KH-BLK-1', 10, true),
--   (1, '2', 'أسود', '#111111', 295, 0, 6, 'KH-BLK-2', 20, true),
--   (1, '1', 'بيج',  '#d8c7ad', 285, 0, 5, 'KH-BEIGE-1', 30, true),
--   (1, '2', 'بيج',  '#d8c7ad', 295, 0, 4, 'KH-BEIGE-2', 40, true);
--
-- ثم الصور المرتبطة باللون:
--
-- insert into public.product_images (
--   product_id,
--   color_name,
--   image_path,
--   alt_text,
--   sort_order,
--   is_active
-- ) values
--   (1, 'أسود', 'khimar/black-1.jpg', 'خمار كريب سادة - أسود', 10, true),
--   (1, 'أسود', 'khimar/black-2.jpg', 'خمار كريب سادة - أسود', 20, true),
--   (1, 'بيج',  'khimar/beige-1.jpg', 'خمار كريب سادة - بيج', 30, true),
--   (1, 'بيج',  'khimar/beige-2.jpg', 'خمار كريب سادة - بيج', 40, true);

commit;
