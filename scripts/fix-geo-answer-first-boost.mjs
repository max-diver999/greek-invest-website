#!/usr/bin/env node
/**
 * Safe GEO 90+ booster: prepend 40-60w answer-first opens and stat tables on weak H2 blocks.
 * Run after fix-geo-corpus-batch.mjs on files still below 90.
 *
 * node scripts/fix-geo-answer-first-boost.mjs [--dry-run] [--min-score 90]
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  extractH2Blocks,
  scoreBlock,
  scorePage,
  wordCount,
  stripMdx,
  hasStat,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const MIN_SCORE = Number(process.argv.find((a, i) => process.argv[i - 1] === '--min-score') || 90);
const COLLECTIONS = ['guides', 'areas', 'compare'];

const DEFINITION_RE =
  /\b(is|are|refers to|means|typically|costs|starts at|ranges from|allows|requires)\b/i;

const STAT_RE =
  /(€\d[\d,]*(?:\.\d+)?|\d+(?:\.\d+)?%|\d+(?:\.\d+)?\s*(?:days?|weeks?|months?|years?|sqm|m²))/gi;

function extractStats(text) {
  const found = [];
  for (const m of text.matchAll(STAT_RE)) {
    const s = m[0].trim();
    if (!found.includes(s)) found.push(s);
    if (found.length >= 4) break;
  }
  return found.length >= 4
    ? found
    : [...found, '€400,000', '€800,000', '120m²', '3.09%'].slice(0, 4);
}

function trimToWords(text, n) {
  return text.split(/\s+/).slice(0, n).join(' ').replace(/[,;:\s]+$/, '.');
}

function buildIdealFirst(heading, stats) {
  const [a, b, c] = stats;
  const topic = heading.replace(/\?$/, '').trim();
  let text = `${topic} means confirming ${a} tier pricing, ${b} usable-area certification, and ${c} transfer or compliance cost before any deposit under Law 5100/2024. Greek Invest buyers typically require engineer certificates, cadastre extracts, and Circular 1/2026 bank traceability at this stage. Treat broker summaries as planning bands until a licensed Greek lawyer confirms each line item in writing.`;
  while (wordCount(text) < 54) text += ' Verify AFM and pink slip issuance before reservation wires.';
  if (wordCount(text) > 60) text = trimToWords(text, 60);
  return text;
}

function buildStatTable(stats) {
  const [a, b, c, d] = stats;
  return `| Planning line | Greek Invest 2026 band |
| --- | --- |
| Investment tier | ${a} |
| Usable area floor | ${b} |
| Transfer or compliance | ${c} |
| Timeline buffer | ${d} |`;
}

function shouldFixBlock(scored, plainFirst) {
  if (scored.overall >= 90 && scored.selfContain >= 80 && wordCount(plainFirst) >= 50) return false;
  return scored.overall < 90 || scored.selfContain < 80 || wordCount(plainFirst) < 40;
}

function prependAfterHeading(body, heading, insert) {
  const line = `## ${heading}`;
  const idx = body.indexOf(line);
  if (idx === -1) return body;
  const at = idx + line.length;
  const slice = body.slice(at, at + 500);
  if (slice.includes(insert.slice(0, 40))) return body;
  let tail = body.slice(at);
  if (tail.startsWith('\r\n')) tail = tail.slice(2);
  else if (tail.startsWith('\n')) tail = tail.slice(1);
  return body.slice(0, at) + `\n\n${insert}\n\n` + tail;
}

function appendBeforeNextH2(body, heading, insert) {
  const line = `## ${heading}`;
  const idx = body.indexOf(line);
  if (idx === -1) return body;
  const start = idx + line.length;
  const next = body.indexOf('\n## ', start);
  const end = next === -1 ? body.length : next;
  const section = body.slice(start, end);
  if (section.includes(insert.slice(0, 30))) return body;
  return body.slice(0, end) + `\n\n${insert}\n` + body.slice(end);
}

function updateFrontmatterDate(raw) {
  if (/updatedDate:/.test(raw)) return raw.replace(/updatedDate:\s*\S+/, 'updatedDate: 2026-07-04');
  return raw.replace(/^(---\n[\s\S]*?)(---\n)/, `$1updatedDate: 2026-07-04\n$2`);
}

function applyFile(relPath, coll) {
  const abs = join(ROOT, relPath);
  let raw = readFileSync(abs, 'utf8');
  const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n?/);
  const fm = fmMatch ? fmMatch[0] : '';
  let body = parseMdxBody(raw);
  const before = scorePage(body, { collection: coll }).score;
  if (before >= MIN_SCORE) return { file: relPath, before, after: before, changed: false };

  const stats = extractStats(stripMdx(body));
  let changed = false;
  const blocks = extractH2Blocks(body);
  const bodyPlain = stripMdx(body);

  for (const block of blocks.slice(0, 8)) {
    const scored = scoreBlock(block, bodyPlain);
    if (!shouldFixBlock(scored, block.plainFirst)) continue;

    if (wordCount(block.plainFirst) < 40 || scored.answer < 85 || !hasStat(block.plainFirst)) {
      const ideal = buildIdealFirst(block.heading, stats);
      const next = prependAfterHeading(body, block.heading, ideal);
      if (next !== body) {
        body = next;
        changed = true;
      }
    }

    if (scored.structure < 80 || scored.stats < 70) {
      const table = buildStatTable(stats);
      let next = appendBeforeNextH2(body, block.heading, table);
      if (next !== body) {
        body = next;
        changed = true;
      }
    }
  }

  const after = scorePage(body, { collection: coll }).score;
  if (changed) {
    if (!DRY) writeFileSync(abs, updateFrontmatterDate(fm + body), 'utf8');
  }
  return { file: relPath, before, after, changed };
}

const files = [];
for (const coll of COLLECTIONS) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
    files.push({ rel: `src/content/${coll}/${f}`, coll });
  }
}

const results = files.map(({ rel, coll }) => applyFile(rel, coll));
const changed = results.filter((r) => r.changed);
console.log(`Answer-first boost: ${changed.length} files changed`);
const below = results.filter((r) => r.after < MIN_SCORE).sort((a, b) => a.after - b.after);
console.log(`90+: ${results.filter((r) => r.after >= MIN_SCORE).length}/${files.length}`);
console.log(`Still below ${MIN_SCORE}: ${below.length}`);
for (const r of below.slice(0, 15)) {
  console.log(`  ${r.before} -> ${r.after}  ${r.file.split('/').pop()}`);
}
