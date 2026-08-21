#!/usr/bin/env node
/**
 * Insert a written section into an MDX file immediately before the FAQ block.
 *
 * Used to add genuine "Risks and red flags" sections to pages that had none.
 * Those pages only satisfied the content gate because the removed
 * "Who we are (citable snapshot)" boilerplate happened to contain the word
 * "checklist" — the gate was right, the pages really do need a risks section.
 *
 * Input: JSON array of { file, markdown }.
 * Usage: node scripts/insert-section.mjs --from sections.json [--dry]
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

for (const { file, markdown } of items) {
  const path = join(ROOT, 'src/content', `${file}.mdx`);
  const s = readFileSync(path, 'utf8');

  const anchor = s.lastIndexOf('<FaqBlock');
  if (anchor === -1) {
    misses.push(`${file} (no FaqBlock)`);
    continue;
  }
  const firstLine = markdown.trim().split('\n')[0];
  if (s.includes(firstLine)) {
    misses.push(`${file} (section already present)`);
    continue;
  }

  const next = s.slice(0, anchor) + markdown.trim() + '\n\n' + s.slice(anchor);
  if (!DRY) writeFileSync(path, next);
  applied += 1;
}

console.log(`${DRY ? '[dry-run] ' : ''}sections inserted: ${applied}/${items.length}`);
for (const m of misses) console.log(`  SKIP ${m}`);
