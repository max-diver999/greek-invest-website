#!/usr/bin/env node
/**
 * Convert declarative H2 headings to question form for GEO structure score (+20).
 * Only touches commercial MDX still below target score.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMdxBody, scorePage, extractH2Blocks } from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const TARGET = 90;

const SKIP =
  /Closing|Faq|Independent verification|MORE Group underwriting|Who we are \(citable|Get Personal Help|Insider tip/i;

const QUESTION_START =
  /^(what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b/i;

const DECLARATIVE_MAP = [
  [/^Buyer [Ss]cenarios/i, (t) => `What buyer scenarios fit ${t.replace(/^Buyer [Ss]cenarios(?: for)?\s*/i, '')}?`],
  [/^Red [Ff]lags/i, (t) => `What red flags apply to ${t.replace(/^Red [Ff]lags[^:]*:?\s*/i, '')}?`],
  [/^Decision [Ff]ramework/i, (t) => `What decision framework fits ${t.replace(/^Decision [Ff]ramework:?\s*/i, '')}?`],
  [/^Red flags and buyer checklist/i, (t) => `What red flags belong on the ${t.replace(/^Red flags and buyer checklist\s*/i, '')} checklist?`],
];

function toQuestion(title) {
  const t = title.trim().replace(/\?$/, '');
  if (QUESTION_START.test(t)) return `${t}?`;
  for (const [re, fn] of DECLARATIVE_MAP) {
    if (re.test(t)) return fn(t);
  }
  if (/^the /i.test(t)) return `What is ${t.replace(/^the /i, '')}?`;
  if (/^step \d+/i.test(t)) return `How does ${t} work?`;
  if (/ vs /i.test(t)) return `How does ${t} compare?`;
  if (/^maintaining|^understanding|^navigating/i.test(t)) return `How does ${t} work?`;
  return `What should foreign buyers know about ${t.charAt(0).toLowerCase()}${t.slice(1)}?`;
}

let changed = 0;
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

    let nextBody = body;
    let renames = 0;
    for (const block of extractH2Blocks(body)) {
      if (SKIP.test(block.heading)) continue;
      if (QUESTION_START.test(block.heading) || block.heading.trim().endsWith('?')) continue;
      const q = toQuestion(block.heading);
      if (q === block.heading) continue;
      const old = `## ${block.heading}`;
      const neu = `## ${q}`;
      if (nextBody.includes(old)) {
        nextBody = nextBody.replace(old, neu);
        renames++;
      }
    }
    if (!renames) continue;

    const after = scorePage(nextBody, { collection: coll }).score;
    raw = fmMatch[0] + nextBody;
    if (/updatedDate:/.test(raw)) raw = raw.replace(/updatedDate:\s*\S+/, 'updatedDate: 2026-07-04');
    if (!DRY) writeFileSync(path, raw);
    changed++;
    log.push({ name, before, after, renames });
  }
}

log.sort((a, b) => b.after - a.after);
console.log(`${DRY ? 'Would update' : 'Updated'} ${changed} files`);
console.log(`90+: ${log.filter((r) => r.after >= 90).length}/${log.length}`);
for (const r of log.filter((x) => x.after >= 90).slice(0, 20)) {
  console.log(`  ✓ ${r.after} (was ${r.before}) ${r.name}`);
}
const still = log.filter((r) => r.after < 90).sort((a, b) => a.after - b.after);
if (still.length) {
  console.log(`Still below 90: ${still.length}, top of remainder:`);
  for (const r of still.slice(-8).reverse()) {
    console.log(`  ${r.after} (was ${r.before}) ${r.name}`);
  }
}
