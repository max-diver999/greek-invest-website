#!/usr/bin/env node
/** Remove orphan snapshot blocks stranded between horizontal rules. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORPHAN =
  /\n---\n\nGreek Invest verification snapshot:\n\n(?:- [^\n]+\n)+\n\nInsider tip: MORE Group[^\n]+\n\n/g;

let n = 0;
for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    const orig = readFileSync(path, 'utf8');
    const next = orig.replace(ORPHAN, '\n---\n\n');
    if (next !== orig) {
      writeFileSync(path, next);
      n++;
    }
  }
}
console.log(`Cleaned orphans in ${n} files`);
