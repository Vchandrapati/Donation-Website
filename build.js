// build.js — runs on Vercel at deploy time, and locally via: node build.js
// Reads SUPABASE_URL and SUPABASE_KEY from .env (local) or Vercel env vars (production)
// Replaces __SUPABASE_URL__ and __SUPABASE_KEY__ placeholders in HTML files
// Outputs built files to /dist

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_KEY;

if (!SB_URL || !SB_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_KEY — check your .env file or Vercel environment variables.');
  process.exit(1);
}

const SRC  = path.join(__dirname, 'public');
const DIST = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const src  = path.join(SRC, file);
  const dest = path.join(DIST, file);

  let content = fs.readFileSync(src, 'utf8');
  content = content
    .replaceAll('__SUPABASE_URL__', SB_URL)
    .replaceAll('__SUPABASE_KEY__', SB_KEY);

  fs.writeFileSync(dest, content, 'utf8');
  console.log(`✓  Built ${file}`);
});

console.log(`\n✅  Done — ${files.length} file(s) written to /dist`);
