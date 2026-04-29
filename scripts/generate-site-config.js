const fs   = require('fs');
const path = require('path');

const root       = process.cwd();
const outputPath = path.join(root, 'site-config.js');

// Hardcoded fallbacks — these are the production values.
// Override via Netlify env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL
const supabaseUrl    = process.env.SUPABASE_URL
  || 'https://wihhfwdaysupjpfzshfq.supabase.co';

const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGhmd2RheXN1cGpwZnpzaGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTI4MjAsImV4cCI6MjA4ODkyODgyMH0.Eem_ytvdtd7UnkWaguief7WeaZFbP4vU16gfl4gefls';

const siteUrl = process.env.SITE_URL
  || 'https://alzahraa-candles.netlify.app';

const output = `window.__SITE_CONFIG__ = {
  supabaseUrl: "${supabaseUrl}",
  supabaseAnonKey: "${supabaseAnonKey}",
  siteNameAr: "الزهراء كاندلز",
  siteNameEn: "Alzahraa Candles",
  siteUrl: "${siteUrl}"
};
`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log('[build] site-config.js written to:', outputPath);
console.log('[build] supabaseUrl:', supabaseUrl);
console.log('[build] anonKey present:', supabaseAnonKey.length > 0 ? 'YES' : 'NO — MISSING ENV VAR');
