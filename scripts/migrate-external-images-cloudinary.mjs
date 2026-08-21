/**
 * Re-host hot-linked third-party images on Cloudinary and rewrite the MDX references.
 *
 * Cloudinary fetches the source itself (server-side), so this works even where the
 * developer origins are unreachable from the build machine.
 *
 * Usage:
 *   node scripts/migrate-external-images-cloudinary.mjs --dry
 *   node scripts/migrate-external-images-cloudinary.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import crypto from 'node:crypto';

const DRY = process.argv.includes('--dry');
const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content');
const FOLDER = 'more-group/greece/developer-assets';
const DELIVERY = 'w_1200,q_85,f_webp';

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
if (!cloud || !key || !secret) {
  console.error('Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET');
  process.exit(1);
}

const IMAGE_URL_RE = /https?:\/\/[^\s"'`)<>]+\.(?:jpe?g|png|webp|avif|gif)(?:\?[^\s"'`)<>]*)?/gi;

/** Stable, readable public id derived from host + filename. */
function publicIdFor(url) {
  const u = new URL(url);
  const base = decodeURIComponent(u.pathname.split('/').pop() || 'asset')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    // transliterate away non-latin (Greek/Chinese) filenames
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const host = u.host.replace(/^www\./, '').replace(/\./g, '-');
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8);
  return `${host}-${base || 'asset'}-${hash}`;
}

async function uploadByUrl(url) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const public_id = publicIdFor(url);
  const params = { folder: FOLDER, overwrite: 'false', public_id, timestamp };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  const signature = crypto.createHash('sha1').update(toSign + secret).digest('hex');
  const body = new URLSearchParams({ ...params, api_key: key, signature, file: url });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body });
  const json = await res.json();
  if (!json.secure_url) throw new Error(json.error?.message || 'upload failed');
  return `https://res.cloudinary.com/${cloud}/image/upload/${DELIVERY}/${json.public_id}`;
}

const files = [];
for (const c of readdirSync(CONTENT)) {
  for (const f of readdirSync(join(CONTENT, c))) {
    if (f.endsWith('.mdx')) files.push(join(CONTENT, c, f));
  }
}

const external = new Map();
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(IMAGE_URL_RE)) {
    if (m[0].includes('res.cloudinary.com')) continue;
    if (!external.has(m[0])) external.set(m[0], []);
    if (!external.get(m[0]).includes(f)) external.get(m[0]).push(f);
  }
}

console.log(`External images: ${external.size} across ${new Set([...external.values()].flat()).size} files`);
if (external.size === 0) process.exit(0);

const mapping = new Map();
for (const [url, usedIn] of external) {
  if (DRY) {
    console.log(`  [dry] ${url}\n        -> ${FOLDER}/${publicIdFor(url)}  (${usedIn.length} file(s))`);
    continue;
  }
  try {
    const newUrl = await uploadByUrl(url);
    mapping.set(url, newUrl);
    console.log(`  ok  ${url.slice(0, 70)}\n      -> ${newUrl}`);
  } catch (e) {
    console.error(`  FAIL ${url} — ${e.message}`);
  }
}
if (DRY) process.exit(0);

let changed = 0;
for (const f of files) {
  let text = readFileSync(f, 'utf8');
  const before = text;
  for (const [oldUrl, newUrl] of mapping) text = text.split(oldUrl).join(newUrl);
  if (text !== before) {
    writeFileSync(f, text);
    changed++;
  }
}
console.log(`Rewrote ${changed} MDX file(s); ${mapping.size}/${external.size} images migrated.`);
if (mapping.size !== external.size) process.exit(1);
