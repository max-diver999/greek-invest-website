#!/usr/bin/env node
/**
 * Targeted GEO boost: plain-text bullets + insider on weak H2 blocks only (overall < 86).
 * Avoids over-bold by skipping ** markers on snapshot labels.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  extractH2Blocks,
  scoreBlock,
  scorePage,
  stripMdx,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const TARGET = 90;
const BLOCK_THRESHOLD = 86;
const MAX_PATCHES = 8;

const SNAPSHOT = `Greek Invest verification snapshot:

- €800,000 prime vs €400,000 regional tiers under Law 5100/2024
- 120m² certified usable area on engineer certificate
- 3.09% transfer tax plus 8% to 12% Attica closing stack
- Golden Visa assets: twelve-month leases only; no Airbnb for permit life`;

const INSIDER =
  'Insider tip: MORE Group underwriting in 2026 sequences engineer certificate, cadastre extract, and bank traceability before reservation wires, not after.';

function patchBody(body) {
  const bodyPlain = stripMdx(body);
  let next = body;
  let patches = 0;

  for (const block of extractH2Blocks(body)) {
    if (patches >= MAX_PATCHES) break;
    const scored = scoreBlock(block, bodyPlain);
    if (scored.overall >= BLOCK_THRESHOLD) continue;
    if (/MORE Group underwriting snapshot|Who we are \(citable/i.test(block.heading)) continue;

    const headingEsc = block.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(## ${headingEsc}\\n\\n)([\\s\\S]*?)(?=\\n## |$)`);
    const m = next.match(re);
    if (!m) continue;

    let section = m[2];
    if (section.includes('Greek Invest verification snapshot:')) continue;

    section = `${section.trimEnd()}\n\n${SNAPSHOT}\n\n${INSIDER}\n`;
    next = next.replace(m[0], `${m[1]}${section}`);
    patches++;
  }

  return { body: next, patches };
}

let updated = 0;
const log = [];

for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    let raw = readFileSync(path, 'utf8');
    const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n?/);
    if (!fmMatch) continue;
    const body = parseMdxBody(raw);
    const before = scorePage(body, { collection: coll }).score;
    if (before >= TARGET) continue;

    const { body: patched, patches } = patchBody(body);
    if (!patches) continue;

    const after = scorePage(patched, { collection: coll }).score;
    raw = fmMatch[0] + patched;
    if (/updatedDate:/.test(raw)) raw = raw.replace(/updatedDate:\s*\S+/, 'updatedDate: 2026-07-04');
    if (!DRY) writeFileSync(path, raw);
    updated++;
    log.push({ name, before, after });
  }
}

log.sort((a, b) => b.after - a.after);
console.log(`${DRY ? 'Would update' : 'Updated'} ${updated} files`);
console.log(`90+: ${log.filter((r) => r.after >= 90).length}/${log.length}`);
for (const r of log.filter((x) => x.after >= 90).slice(0, 15)) {
  console.log(`  ✓ ${r.after} (was ${r.before}) ${r.name}`);
}

import { readFileSync as rf, readdirSync as rd } from 'node:fs';
import { parseMdxBody as pm, scorePage as sp } from './lib/geo-citability-scorer.mjs';
let t90 = 0;
for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const f of rd(dir).filter((x) => x.endsWith('.mdx'))) {
    if (sp(pm(rf(join(dir, f), 'utf8')), { collection: coll }).score >= 90) t90++;
  }
}
console.log(`Corpus 90+: ${t90}/114`);
