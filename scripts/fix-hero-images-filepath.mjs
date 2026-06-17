#!/usr/bin/env node
/**
 * Normalize Commons Special:FilePath hero/inline image URLs and verify HTTP 200.
 * Replaces broken filenames with verified fallbacks.
 *
 * Usage: node scripts/fix-hero-images-filepath.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = join(import.meta.dirname, '..', 'src', 'content');
const dryRun = process.argv.includes('--dry-run');

/** Verified 200 OK on Commons FilePath (2026-06-17) */
const VERIFIED = [
  'Singapore city skyline.jpg',
  'Singapore skyline at night.jpg',
  'Singapore at night.jpg',
  'Orchard Road, Singapore.jpg',
  'Tampines, Singapore.jpg',
  'Beach at East Coast Park, Singapore - 20050809-01.jpg',
  'Northern to middle part of Jurong Lake, Singapore.jpg',
  'Queenstown hdb.jpg',
  'Marina_Bay_Sands,_Singapore.jpg',
  'Marina_Bay_Sands_in_the_evening_-_20101120.jpg',
];

const verifiedUrls = new Map(
  VERIFIED.map((name) => [name, toFilePath(name)]),
);

function toFilePath(filename) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1280`;
}

function check200(url) {
  try {
    const code = execSync(
      `curl -s -o /dev/null -w "%{http_code}" -L -A "Mozilla/5.0" "${url.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 15000 },
    ).trim();
    return code === '200';
  } catch {
    return false;
  }
}

function filenameFromFilePath(url) {
  const m = url.match(/Special:FilePath\/([^?]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

function filenameFromThumb(url) {
  const m = url.match(/\/thumb\/[^/]+\/[^/]+\/(.+?)\/\d+px-/);
  if (!m) return null;
  return decodeURIComponent(m[1]);
}

function resolveUrl(filename, seed = 0) {
  const candidate = toFilePath(filename);
  if (check200(candidate)) return candidate;
  const fallbackName = VERIFIED[seed % VERIFIED.length];
  return verifiedUrls.get(fallbackName);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const urlRe =
  /https:\/\/(?:upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/[^)\s"]+|commons\.wikimedia\.org\/wiki\/Special:FilePath\/[^)\s"?]+(?:\?width=1280)?)/g;

let updated = 0;
let fixed = 0;
const files = walk(ROOT);

for (let fi = 0; fi < files.length; fi++) {
  const file = files[fi];
  let raw = readFileSync(file, 'utf8');
  let changed = false;
  let seed = fi;

  raw = raw.replace(urlRe, (oldUrl) => {
    const fn =
      filenameFromThumb(oldUrl) ||
      filenameFromFilePath(oldUrl) ||
      VERIFIED[seed % VERIFIED.length];
    const newUrl = resolveUrl(fn, seed++);
    if (newUrl !== oldUrl) {
      changed = true;
      fixed++;
    }
    return newUrl;
  });

  if (changed) {
    if (!dryRun) writeFileSync(file, raw);
    updated++;
    console.log(relative(join(import.meta.dirname, '..'), file));
  }
}

console.log(`\n${dryRun ? '[dry-run] ' : ''}Updated ${updated} files, ${fixed} URL(s) normalized`);
