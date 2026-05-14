const fs   = require('fs');
const path = require('path');

const root       = process.cwd();
const outputPath = path.join(root, 'site-config.js');

// Runtime configuration is generated from Netlify environment variables.
// Required: SUPABASE_URL, SUPABASE_ANON_KEY. Optional: SITE_URL.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const siteUrl = process.env.SITE_URL || 'https://alzahraa-candles.netlify.app';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[build] WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is missing. The frontend will show a runtime config error until env vars are set.');
}

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
console.log('[build] anonKey present:', supabaseAnonKey.length > 0 ? 'YES' : 'NO - MISSING ENV VAR');
