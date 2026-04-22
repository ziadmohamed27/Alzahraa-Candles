const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const template = fs.readFileSync(path.join(root, 'site-config.template.js'), 'utf8');
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[build] Missing SUPABASE_URL or SUPABASE_ANON_KEY. site-config.js will be generated with empty values.');
}
const output = template
  .replace(/__SUPABASE_URL__/g, JSON.stringify(supabaseUrl).slice(1, -1))
  .replace(/__SUPABASE_ANON_KEY__/g, JSON.stringify(supabaseAnonKey).slice(1, -1));
fs.writeFileSync(path.join(root, 'site-config.js'), output, 'utf8');
console.log('[build] Generated site-config.js');
