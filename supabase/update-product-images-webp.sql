-- Optional helper: run this in Supabase SQL Editor if you want the database itself
-- to point directly to the new WebP files uploaded under Storage bucket: products/candles.
-- The frontend already rewrites these common JPG/PNG names to WebP, so this SQL is optional.

update public.products
set image = replace(image, 'candles/amber-oud.jpg', 'candles/amber-oud.webp')
where image like '%candles/amber-oud.jpg%';

update public.products
set image = replace(image, 'candles/coffee-shake.jpg', 'candles/coffee-shake.webp')
where image like '%candles/coffee-shake.jpg%';

update public.products
set image = replace(image, 'candles/fresh-linen.jpg', 'candles/fresh-linen.webp')
where image like '%candles/fresh-linen.jpg%';

update public.products
set image = replace(image, 'candles/lavender.jpg', 'candles/lavender.webp')
where image like '%candles/lavender.jpg%';

update public.products
set image = replace(image, 'candles/rose-bloom.jpg', 'candles/rose-bloom.webp')
where image like '%candles/rose-bloom.jpg%';

update public.products
set image = replace(image, 'candles/vanilla.jpg', 'candles/vanilla.webp')
where image like '%candles/vanilla.jpg%';

-- If your image column contains full public URLs, the replace() calls above still work.
