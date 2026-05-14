# Security and project changes

## What changed

1. Added `assets/js/app-config.js` as the shared place for Supabase runtime config, safe redirect checks, and admin role verification.
2. Removed repeated hardcoded Supabase config usage from the main JS files and moved them toward the single `site-config.js` source.
3. Added frontend admin checks in `admin-login.html` and `assets/js/admin-orders.js`.
4. Removed unsafe fallback from `orders_dashboard` to direct `orders` reads in the admin page.
5. Added safe redirect handling in `login.html` and `signup.html`.
6. Added WhatsApp fallback handling after checkout so the order is still recoverable if the browser blocks the WhatsApp popup.
7. Added Supabase SQL files matched to the current database schema you shared.

## Important live database step

Your current `profiles` table does not include `role`, while the new admin protection depends on it.
Run this file in Supabase SQL Editor before testing admin login:

```text
supabase/existing-database-migration.sql
```

Then promote the admin account:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

## Why this matters

The frontend can hide admin pages, but real protection must happen in Supabase RLS. The migration enables RLS and adds policies so:

- anonymous users can create orders only;
- customers can read their own orders only;
- admins can read and update all orders;
- only admins can write catalog data;
- public users can read active products, variants, and images.

## Still worth checking manually

After running the SQL, test these flows:

1. Guest checkout creates an order.
2. Logged-in customer can see only their orders.
3. Non-admin account cannot open `/admin-orders.html`.
4. Admin account can open `/admin-orders.html` and change order status.
5. Products still appear on the homepage.
6. Product images still load from the `products` Storage bucket.
