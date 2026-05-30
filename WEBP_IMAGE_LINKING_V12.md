# V12 WebP image linking

This version rewrites the six uploaded Supabase product images from JPG/PNG to WebP at runtime:

- candles/amber-oud.webp
- candles/coffee-shake.webp
- candles/fresh-linen.webp
- candles/lavender.webp
- candles/rose-bloom.webp
- candles/vanilla.webp

Updated files:

- assets/js/script.js
- assets/js/cart.js

Also added optional SQL helper:

- supabase/update-product-images-webp.sql

Run the SQL only if you want Supabase database records to permanently point to the new WebP filenames. The frontend will work without running it.
