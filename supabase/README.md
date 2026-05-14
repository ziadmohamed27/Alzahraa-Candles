# Supabase setup for Alzahraa Candles

## Your current live database

You shared an existing schema with these tables:

- `products`
- `product_variants`
- `product_images`
- `orders`
- `profiles`
- `orders_dashboard` view

For this existing database, do **not** recreate the tables. Run this file first:

```text
supabase/existing-database-migration.sql
```

It safely adds the missing `profiles.role`, refreshes `orders_dashboard`, adds RLS policies, grants, indexes, and triggers without deleting product/order data.

## Make an admin user

After running the migration, promote your own account:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

Then verify:

```sql
select id, email, role
from public.profiles
where email = 'YOUR_ADMIN_EMAIL@example.com';
```

## Fresh project only

For a brand-new Supabase project, apply these in order:

1. `schema.sql`
2. `policies.sql`
3. `storage-policies.sql`

For your current project, `existing-database-migration.sql` is the safer option.

## Storage bucket

The frontend expects a public Storage bucket named:

```text
products
```

Run `storage-policies.sql` only after confirming the bucket exists.

## Netlify environment variables

Set these in Netlify before deploying:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SITE_URL` optional

The generated `site-config.js` reads from these variables at build time.
