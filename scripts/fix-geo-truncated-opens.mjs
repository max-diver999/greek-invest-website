#!/usr/bin/env node
/**
 * Remove truncated synthetic H2 opens from fix-geo-structure-universal.mjs
 * (lines ending with "MORE Group underwrites this step on" without completion).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');

const BROKEN_PARA =
  /^[^\n#*]{20,400} means [^\n]{10,500}MORE Group underwrites this step on\s*$/gm;

const BROKEN_PARTIAL_BOLD = /^[^\n]*\*\*[^*\n]{1,80}$/gm;

let fixed = 0;

for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    let raw = readFileSync(path, 'utf8');
    const orig = raw;
    const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n?/);
    if (!fmMatch) continue;
    let body = raw.slice(fmMatch[0].length);

    body = body.replace(BROKEN_PARA, '');
    body = body.replace(BROKEN_PARTIAL_BOLD, '');
    body = body.replace(/\n{4,}/g, '\n\n\n');

    raw = fmMatch[0] + body;
    if (raw !== orig) {
      fixed++;
      if (!DRY) writeFileSync(path, raw);
    }
  }
}

console.log(`${DRY ? 'Would fix' : 'Fixed'} ${fixed} files`);
