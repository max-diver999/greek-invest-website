#!/usr/bin/env node
/**
 * Append a written paragraph to the end of a named H2/H3 section.
 *
 * Used to give pages a self-contained, statistic-bearing passage that an
 * answer engine can quote whole. The paragraph goes at the end of the section
 * it belongs to rather than into a new boilerplate block appended to every page.
 *
 * Input: JSON array of { file, heading, para }.
 * Usage: node scripts/append-para.mjs --from paras.json [--dry]
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

for (const { file, heading, para } of items) {
  const path = join(ROOT, 'src/content', `${file}.mdx`);
  const s = readFileSync(path, 'utf8');

  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const start = s.match(new RegExp(`^#{2,3}\\s+${escaped}\\s*$`, 'm'));
  if (!start) {
    misses.push(`${file} :: ${heading}`);
    continue;
  }
  const from = start.index + start[0].length;
  // End of section: the next heading of any level, or the FAQ block, or EOF.
  const rest = s.slice(from);
  const nextHeading = rest.search(/^#{1,3}\s+\S/m);
  const nextFaq = rest.indexOf('<FaqBlock');
  const candidates = [nextHeading, nextFaq].filter((n) => n !== -1 && n !== undefined);
  const end = candidates.length ? from + Math.min(...candidates) : s.length;

  if (s.slice(from, end).includes(para.trim().slice(0, 50))) {
    misses.push(`${file} :: ${heading} (already present)`);
    continue;
  }

  const next = `${s.slice(0, end).trimEnd()}\n\n${para.trim()}\n\n${s.slice(end)}`;
  if (!DRY) writeFileSync(path, next);
  applied += 1;
}

console.log(`${DRY ? '[dry-run] ' : ''}paragraphs appended: ${applied}/${items.length}`);
for (const m of misses) console.log(`  SKIP ${m}`);
