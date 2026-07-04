#!/usr/bin/env node
/**
 * Mass typographic dash cleanup (— and –) across greek-invest src/.
 * Usage: node scripts/fix-corpus-dashes-zero.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeMdxFile, normalizeTypographicDashes } from './lib/normalize-typographic-dashes.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

const SCAN_ROOTS = [
  path.join(ROOT, 'src/content'),
  path.join(ROOT, 'src/pages'),
  path.join(ROOT, 'src/components'),
  path.join(ROOT, 'src/layouts'),
  path.join(ROOT, 'src/data'),
];

const EXT = new Set(['.mdx', '.astro', '.ts', '.tsx', '.json']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(path.extname(name))) out.push(p);
  }
  return out;
}

function transform(abs, raw) {
  if (abs.endsWith('.mdx')) return normalizeMdxFile(raw);
  if (abs.endsWith('.json') && abs.includes(`${path.sep}src${path.sep}data${path.sep}`)) {
    return normalizeTypographicDashes(raw);
  }
  return normalizeTypographicDashes(raw);
}

let touched = 0;
let removed = 0;

for (const root of SCAN_ROOTS) {
  for (const abs of walk(root)) {
    const raw = fs.readFileSync(abs, 'utf8');
    const before = (raw.match(/[—–]/g) || []).length;
    if (!before) continue;
    const next = transform(abs, raw);
    const after = (next.match(/[—–]/g) || []).length;
    if (next === raw) continue;
    touched++;
    removed += before - after;
    const rel = path.relative(ROOT, abs);
    if (after > 0) console.log(`remaining ${after} | ${rel}`);
    if (!dryRun) fs.writeFileSync(abs, next);
  }
}

const remaining = SCAN_ROOTS.flatMap((r) => walk(r)).reduce((n, abs) => {
  const raw = fs.readFileSync(abs, 'utf8');
  return n + (raw.match(/[—–]/g) || []).length;
}, 0);

console.log(
  `\n${dryRun ? '[dry-run] ' : ''}Updated ${touched} files, removed ~${removed} dashes, remaining in src/: ${remaining}`,
);
process.exit(remaining ? 1 : 0);
