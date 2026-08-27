#!/usr/bin/env node
/**
 * Pages that are largely the same page.
 *
 * The duplication penalty in the scorer tells an author that a file shares text
 * with the corpus; it does not tell them WHICH file, and the fix for a cannibal
 * pair is editorial — decide what each page is for — rather than per-file. So
 * this prints the pairs, ranked by how many nine-word sequences they share.
 *
 * Shared sequences are counted after boilerplate and the citation trailer are
 * removed, exactly as the scorer counts them, so the numbers here and the
 * duplicated-volume penalty are the same measurement.
 *
 *   node scripts/geo-cannibals.mjs            top pairs
 *   node scripts/geo-cannibals.mjs --min 60   only pairs sharing 60+ sequences
 *   node scripts/geo-cannibals.mjs --json
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildCorpusIndex } from './lib/geo/corpus-signals.mjs';

const CONTENT_ROOT = 'src/content';
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const minIdx = args.indexOf('--min');
const MIN_SHARED = minIdx !== -1 ? Number(args[minIdx + 1]) : 25;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (full.endsWith('.mdx')) files.push(full);
  }
})(CONTENT_ROOT);
files.sort();

const byId = new Map(files.map((f) => [path.basename(f), f]));
const index = buildCorpusIndex(files.map((f) => ({ id: path.basename(f), raw: fs.readFileSync(f, 'utf8') })));

// Count shared shingles per unordered pair. A sequence owned by many files is
// corpus-wide filler rather than a two-page collision, so a shingle held by
// more than four files is not attributed to any pair: it would otherwise put
// every page in the corpus at the top of this list and hide the real ones.
const MAX_OWNERS = 4;
const pairs = new Map();
for (const owners of index.shingleOwners.values()) {
  if (owners.size < 2 || owners.size > MAX_OWNERS) continue;
  const ids = [...owners].sort();
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const k = `${ids[i]}\t${ids[j]}`;
      pairs.set(k, (pairs.get(k) || 0) + 1);
    }
  }
}

const size = new Map(index.prepared.map((d) => [d.id, d.shingles.size]));
const rows = [...pairs.entries()]
  .map(([k, shared]) => {
    const [a, b] = k.split('\t');
    const smaller = Math.min(size.get(a) || 1, size.get(b) || 1);
    return { a, b, shared, share: shared / smaller, aSize: size.get(a), bSize: size.get(b) };
  })
  .filter((r) => r.shared >= MIN_SHARED)
  .sort((x, y) => y.shared - x.shared);

if (asJson) {
  console.log(JSON.stringify(rows, null, 1));
} else {
  console.log(`=== cannibal pairs (9-word sequences shared, ${files.length} files) ===`);
  console.log(`pairs sharing ${MIN_SHARED}+ sequences: ${rows.length}`);
  console.log('');
  for (const r of rows.slice(0, 40)) {
    const pct = (r.share * 100).toFixed(0);
    console.log(`${String(r.shared).padStart(5)} seq  ${pct.padStart(3)}% of the smaller page`);
    console.log(`         ${byId.get(r.a).replace('src/content/', '')}  (${r.aSize})`);
    console.log(`         ${byId.get(r.b).replace('src/content/', '')}  (${r.bSize})`);
  }
}
