-- SIRAJ - SAFE migration for your CURRENT Supabase database
-- Based on the schema you shared on 2026-05-14.
-- Run this instead of recreating tables. It only adds missing admin/RLS pieces,
-- refreshes the dashboard view, and adds helpful indexes/triggers.

begin;

-- 1) Admin role support on existing profiles table
alter table public.profiles
  add column if not exists role text not null default 'customer';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'admin'));

-- 2) Make sure existing orders have safe defaults/constraints where possible
alter table public.orders
  alter column created_at set default now(),
  alter column status set default 'pending',
  alter column source set default 'website';

-- Keep status flexible enough for the current frontend.
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (
    status is null or status in ('pending', 'confirmed', 'processing', 'delivered', 'cancelled')
  );

-- 3) Helpful indexes for frontend/admin queries
create index if not exists idx_products_active_sort on public.products (is_active, sort_order, id);
create index if not exists idx_product_variants_product_active_sort on public.product_variants (product_id, is_active, sort_order, id);
create index if not exists idx_product_images_product_active_sort on public.product_images (product_id, is_active, sort_order, id);
create index if not exists idx_orders_user_created on public.orders (user_id, created_at desc);
create index if not exists idx_orders_status_created on public.orders (status, created_at desc);
create index if not exists idx_orders_number on public.orders (order_number);

-- 4) updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists trg_product_images_updated_at on public.product_images;
create trigger trg_product_images_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

-- Your current orders table does not have updated_at, so do not create an orders trigger.

-- 5) Admin helper used by policies and the frontend role check
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

-- 6) Dashboard view expected by admin-orders.js
-- Supabase Table Editor lists views next to tables; this replaces the existing view if present.
drop view if exists public.orders_dashboard;

create view public.orders_dashboard
with (security_invoker = true) as
select
  o.id,
  o.order_number,
  o.customer_name,
  o.phone,
  o.city,
  o.notes,
  o.items_json,
  o.total,
  o.status,
  o.source,
  o.created_at,
  o.user_id,
  o.customer_email,
  o.delivery_lat,
  o.delivery_lng,
  o.delivery_maps_link,
  o.delivery_location_source,
  coalesce(jsonb_array_length(o.items_json), 0) as items_count,
  coalesce(jsonb_array_length(o.items_json), 0) as line_items_count
from public.orders o;

-- 7) Auto-create a profile row when a new Supabase Auth user signs up
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- 8) Enable RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;

-- 9) Policies: profiles
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own_customer" ON public.profiles;
CREATE POLICY "profiles_insert_own_customer"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() AND role = 'customer');

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (public.is_admin() OR (id = auth.uid() AND role = 'customer'));

-- 10) Policies: storefront catalog
DROP POLICY IF EXISTS "products_public_read_active" ON public.products;
CREATE POLICY "products_public_read_active"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_variants_public_read_active" ON public.product_variants;
CREATE POLICY "product_variants_public_read_active"
ON public.product_variants
FOR SELECT
TO anon, authenticated
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
CREATE POLICY "product_variants_admin_write"
ON public.product_variants
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_images_public_read_active" ON public.product_images;
CREATE POLICY "product_images_public_read_active"
ON public.product_images
FOR SELECT
TO anon, authenticated
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
CREATE POLICY "product_images_admin_write"
ON public.product_images
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 11) Policies: orders
DROP POLICY IF EXISTS "orders_insert_anon_or_owner" ON public.orders;
CREATE POLICY "orders_insert_anon_or_owner"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "orders_select_owner_or_admin" ON public.orders;
CREATE POLICY "orders_select_owner_or_admin"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "orders_update_admin_only" ON public.orders;
CREATE POLICY "orders_update_admin_only"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin_only" ON public.orders;
CREATE POLICY "orders_delete_admin_only"
ON public.orders
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 12) Grants for Supabase API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.orders_dashboard TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

commit;

-- After running this migration, promote your admin account:
-- update public.profiles set role = 'admin' where email = 'YOUR_ADMIN_EMAIL@example.com';
