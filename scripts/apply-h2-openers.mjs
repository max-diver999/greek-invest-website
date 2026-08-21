#!/usr/bin/env node
/**
 * Insert a written direct-answer paragraph under a named H2.
 *
 * After the generated boilerplate was stripped, many sections opened with a
 * short lead-in ("The practical impact for UK property owners in Greece:")
 * rather than an extractable answer. Answer engines and featured snippets read
 * the first paragraph under a heading, so each of those needs a real opener.
 *
 * The new paragraph is INSERTED before the existing lead-in rather than
 * replacing it, so lists and tables keep the sentence that introduces them.
 *
 * Input: a JSON array of { file, heading, opener } on stdin or via --from.
 * Usage:
 *   node scripts/apply-h2-openers.mjs --from openers.json [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const fromIdx = args.indexOf('--from');
if (fromIdx === -1) {
  console.error('--from <file.json> required');
  process.exit(1);
}

const items = JSON.parse(readFileSync(args[fromIdx + 1], 'utf8'));
let applied = 0;
const misses = [];

for (const { file, heading, opener } of items) {
  const path = join(ROOT, 'src/content', `${file}.mdx`);
  let s = readFileSync(path, 'utf8');

  // Locate the exact heading line.
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^(#{2,3}\\s+${escaped})\\s*$`, 'm');
  const m = s.match(re);
  if (!m) {
    misses.push(`${file} :: ${heading}`);
    continue;
  }

  const insertAt = m.index + m[0].length;
  const after = s.slice(insertAt);

  // Guard: never insert the same opener twice.
  if (after.slice(0, opener.length + 400).includes(opener.slice(0, 60))) {
    misses.push(`${file} :: ${heading} (already present)`);
    continue;
  }

  s = s.slice(0, insertAt) + '\n\n' + opener.trim() + after;
  if (!DRY) writeFileSync(path, s);
  applied += 1;
}

console.log(`${DRY ? '[dry-run] ' : ''}openers applied: ${applied}/${items.length}`);
if (misses.length) {
  console.log(`\nNOT APPLIED (${misses.length}):`);
  for (const x of misses) console.log(`  ${x}`);
}
