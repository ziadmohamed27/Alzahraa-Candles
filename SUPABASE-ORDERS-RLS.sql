-- Keep your existing guest insert policy if guest checkout is already working.
-- Add these policies for logged-in customers using direct website ordering.

-- 1) Logged-in customers can view only their own orders
create policy "customers can view own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

-- 2) Logged-in customers can insert only their own orders
create policy "customers can insert own orders"
on public.orders
for insert
to authenticated
with check (
  auth.uid() = user_id
  and customer_email = auth.email()
);
