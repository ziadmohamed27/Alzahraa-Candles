const fs = require('fs');
const path = require('path');

const root = process.cwd();
const templatePath = path.join(root, 'site-config.template.js');
const outputPath = path.join(root, 'site-config.js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://wihhfwdaysupjpfzshfq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const siteUrl = process.env.SITE_URL || 'https://alzahraa-candles.netlify.app';

if (!fs.existsSync(templatePath)) {
  throw new Error('site-config.template.js not found');
}

const template = fs.readFileSync(templatePath, 'utf8');
const output = template
  .replace(/__SUPABASE_URL__/g, supabaseUrl)
  .replace(/__SUPABASE_ANON_KEY__/g, supabaseAnonKey)
  .replace(/__SITE_URL__/g, siteUrl);

fs.writeFileSync(outputPath, output);
console.log('[build] generated site-config.js');
