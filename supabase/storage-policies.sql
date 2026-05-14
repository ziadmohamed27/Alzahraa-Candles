-- Optional: Supabase Storage policies for the public product image bucket.
-- The bucket should be named: products

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'products');

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'products' and public.is_admin())
with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'products' and public.is_admin());
