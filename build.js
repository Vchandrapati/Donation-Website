// build.js — runs on Vercel at deploy time, and locally via: node build.js
// Reads SUPABASE_URL and SUPABASE_KEY from .env (local) or Vercel env vars (production)
// Replaces __SUPABASE_URL__ and __SUPABASE_KEY__ placeholders in HTML files
// Outputs built files to /dist

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const SB_URL   = process.env.SUPABASE_URL;
const SB_KEY   = process.env.SUPABASE_KEY;
const SITE_PIN = process.env.SITE_PIN;

if (!SB_URL || !SB_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_KEY — check your .env file or Vercel environment variables.');
  process.exit(1);
}
if (!SITE_PIN) {
  console.error('❌  Missing SITE_PIN — add it to your .env file or Vercel environment variables.');
  process.exit(1);
}

// Embed Aeromove font as a base64 data URI
const fontB64    = fs.readFileSync(path.join(__dirname, 'resources', 'aeromovedemo.regular.ttf')).toString('base64');
const fontDataURI = `data:font/ttf;base64,${fontB64}`;

// Parse Schedule.csv into a JSON array for injection
const csvPath = path.join(__dirname, 'resources', 'Schedule.csv');
const scheduleData = fs.readFileSync(csvPath, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.toLowerCase().startsWith('time,'))
  .map(line => {
    const cols  = line.split(',');
    const time  = (cols[0] || '').trim();
    const event = (cols[1] || '').trim();
    return time && event ? { time, event } : null;
  })
  .filter(Boolean);

const SRC  = path.join(__dirname, 'public');
const DIST = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const src  = path.join(SRC, file);
  const dest = path.join(DIST, file);

  let content = fs.readFileSync(src, 'utf8');
  content = content
    .replaceAll('__SUPABASE_URL__',  SB_URL)
    .replaceAll('__SUPABASE_KEY__',  SB_KEY)
    .replaceAll('__SITE_PIN__',      SITE_PIN)
    .replaceAll('__SCHEDULE_DATA__', JSON.stringify(scheduleData))
    .replaceAll('__AEROMOVE_FONT__', fontDataURI);

  fs.writeFileSync(dest, content, 'utf8');
  console.log(`✓  Built ${file}`);
});

console.log(`\n✅  Done — ${files.length} file(s) written to /dist`);
