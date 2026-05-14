-- Alzahraa Candles RLS policies - matched to the current database.
-- For your live database, run existing-database-migration.sql first because it includes these policies.

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own_customer" ON public.profiles;
CREATE POLICY "profiles_insert_own_customer" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid() AND role = 'customer');

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (public.is_admin() OR (id = auth.uid() AND role = 'customer'));

-- PRODUCTS
DROP POLICY IF EXISTS "products_public_read_active" ON public.products;
CREATE POLICY "products_public_read_active" ON public.products
FOR SELECT TO anon, authenticated
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write" ON public.products
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- PRODUCT VARIANTS
DROP POLICY IF EXISTS "product_variants_public_read_active" ON public.product_variants;
CREATE POLICY "product_variants_public_read_active" ON public.product_variants
FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and p.is_active = true
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "product_variants_admin_write" ON public.product_variants;
CREATE POLICY "product_variants_admin_write" ON public.product_variants
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "product_images_public_read_active" ON public.product_images;
CREATE POLICY "product_images_public_read_active" ON public.product_images
FOR SELECT TO anon, authenticated
USING (
  is_active = true
  AND exists (
    select 1 from public.products p
    where p.id = product_images.product_id
      and p.is_active = true
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "product_images_admin_write" ON public.product_images;
CREATE POLICY "product_images_admin_write" ON public.product_images
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ORDERS
DROP POLICY IF EXISTS "orders_insert_anon_or_owner" ON public.orders;
CREATE POLICY "orders_insert_anon_or_owner" ON public.orders
FOR INSERT TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "orders_select_owner_or_admin" ON public.orders;
CREATE POLICY "orders_select_owner_or_admin" ON public.orders
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "orders_update_admin_only" ON public.orders;
CREATE POLICY "orders_update_admin_only" ON public.orders
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin_only" ON public.orders;
CREATE POLICY "orders_delete_admin_only" ON public.orders
FOR DELETE TO authenticated
USING (public.is_admin());

-- GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.orders_dashboard TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
