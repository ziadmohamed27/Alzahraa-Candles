[build]
  command = "node scripts/generate-site-config.js"
  publish = "."

# Keep site-config fresh because it contains runtime Supabase configuration.
[[headers]]
  for = "/site-config.js"
  [headers.values]
    Cache-Control = "no-store, no-cache, must-revalidate, max-age=0"
    Pragma = "no-cache"

# HTML pages should be revalidated after each deploy.
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(self)"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://wa.me; frame-ancestors 'none';"

# JS/CSS are revalidated to avoid stale frontend code during active development.
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

# Images can be cached briefly.
[[headers]]
  for = "/*.svg"
  [headers.values]
    Cache-Control = "public, max-age=604800, stale-while-revalidate=86400"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=604800, stale-while-revalidate=86400"
