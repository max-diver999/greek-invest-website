#!/usr/bin/env node
/**
 * HTTP 200 gate for EVERY image URL in src/ (MDX body, Astro pages, data, featured.ts).
 * NOT limited to heroImage frontmatter — inline ![](...) and homepage heroes included.
 *
 * Usage: node scripts/audit-all-images.mjs [--fail]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isImageUrl } from './lib/image-url-detect.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const URL_RE = /https?:\/\/[^\s"'`)>\]]+/g;
const FAIL = process.argv.includes('--fail');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'node_modules') continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(astro|mdx|ts|tsx|css|json)$/.test(name)) out.push(p);
  }
  return out;
}

const map = new Map();
for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(URL_RE)) {
    const url = m[0].replace(/[.,;]+$/, '');
    if (!isImageUrl(url)) continue;
    if (!map.has(url)) map.set(url, new Set());
    map.get(url).add(file.replace(ROOT + '/', ''));
  }
}

const urls = [...map.keys()];
const bad = [];
const BATCH = 8;
const RETRIES = 3;

async function checkImageUrl(url) {
  const headers = { 'User-Agent': 'MORE-Group-image-audit/1.0' };
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      let r = await fetch(url, { method: 'HEAD', redirect: 'follow', headers, signal: AbortSignal.timeout(20000) });
      if (r.status === 405 || r.status === 403) {
        r = await fetch(url, { method: 'GET', redirect: 'follow', headers, signal: AbortSignal.timeout(20000) });
      }
      if (r.status === 200) return null;
      if (attempt === RETRIES) return { url, status: r.status, files: [...map.get(url)] };
    } catch (err) {
      if (attempt === RETRIES) return { url, status: 'ERR', files: [...map.get(url)], detail: String(err.cause || err.message || err) };
    }
    await new Promise((r) => setTimeout(r, 500 * attempt));
  }
  return null;
}

for (let i = 0; i < urls.length; i += BATCH) {
  const chunk = urls.slice(i, i + BATCH);
  const results = await Promise.all(chunk.map((url) => checkImageUrl(url)));
  for (const row of results) if (row) bad.push(row);
}

console.log('=== IMAGE URL AUDIT ===');
console.log(`URLs checked: ${urls.length}`);
console.log(`Broken: ${bad.length}`);

if (bad.length) {
  for (const b of bad.slice(0, 30)) {
    console.log(`\n[${b.status}] ${b.url.slice(0, 100)}`);
    for (const f of b.files.slice(0, 2)) console.log(`  ${f}`);
  }
  if (bad.length > 30) console.log(`\n... +${bad.length - 30} more`);
  if (FAIL) process.exit(1);
} else {
  console.log('✅ All image URLs return HTTP 200');
}
