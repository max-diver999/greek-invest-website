#!/usr/bin/env node
/**
 * Remove truncated duplicate answer-first prepends from fix-geo-answer-first-boost.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry');

const TRUNCATED =
  /^[^\n]{20,200} means confirming .+ Treat broker summaries as planning bands until a licensed Greek lawyer confirms each line\n\n/m;

const GENERIC_PREPEND =
  /^[^\n#]{20,220} requires verified thresholds under Law 5100\/2024:.+\n\n/m;

const DUPLICATE_TABLE = /\n\| Planning line \| Greek Invest 2026 band \|\n\| --- \| --- \|\n(?:\|[^\n]+\|\n){4,}/g;

let fixed = 0;

for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(CONTENT, coll);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    let raw = readFileSync(path, 'utf8');
    const orig = raw;
    raw = raw.replace(TRUNCATED, '');
    raw = raw.replace(GENERIC_PREPEND, '');
    // Keep first planning table per section; dedupe consecutive identical tables
    raw = raw.replace(DUPLICATE_TABLE, (m, offset, s) => {
      const before = s.slice(Math.max(0, offset - 200), offset);
      if (before.includes('Planning line | Greek Invest')) return '';
      return m;
    });
    raw = raw.replace(/\n{4,}/g, '\n\n\n');
    if (raw !== orig) {
      fixed++;
      if (!DRY) writeFileSync(path, raw);
    }
  }
}

console.log(`${DRY ? 'Would clean' : 'Cleaned'} ${fixed} files`);
