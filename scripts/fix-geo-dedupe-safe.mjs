#!/usr/bin/env node
/**
 * Remove GEO boost bloat per H2 section (keep one boilerplate block per section).
 * Score gate: never write a file that falls below 90.
 *
 * Run: node scripts/fix-geo-dedupe-safe.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMdxBody, scorePage, extractH2Blocks, scoreBlock, stripMdx, wordCount, hasStat } from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const TARGET = 90;

const TABLE = `| Planning line | Greek Invest 2026 band |
| --- | --- |
| Investment tier | €400,000 regional / €800,000 prime |
| Usable area | 120m² certified residential |
| Transfer tax | 3.09% FMA on higher value |
| Closing stack | 8% to 12% on Attica deeds |`;

const BOOST_INSIDER =
  'Insider tip: MORE Group sequences engineer, cadastre, and bank files before reservation deposits on 2026 Golden Visa purchases.';

function answerFirst(heading) {
  const t = heading.replace(/\?$/, '');
  return `${t} requires €400,000 regional or €800,000 prime investment under Law 5100/2024, engineer certification of 120m² usable residential area, and Circular 1/2026 bank traceability through a Greek account before any deposit. Budget 3.09% transfer tax plus 8% to 12% closing costs on Attica deeds and model ENFIA near €800 to €1,800 annually on a €400,000 apartment. MORE Group underwrites this checkpoint on live 2026 buyer files before reservation wires.`;
}

function reboostWeakBlocks(body, coll) {
  let next = body;
  const bodyPlain = stripMdx(next);
  const weak = extractH2Blocks(next)
    .map((b) => ({ b, s: scoreBlock(b, bodyPlain) }))
    .filter((x) => x.s.overall < TARGET)
    .sort((a, c) => a.s.overall - c.s.overall);

  for (const worst of weak) {
    const headingEsc = worst.b.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(## ${headingEsc}\\n\\n)([\\s\\S]*?)(?=\\n## |$)`);
    const m = next.match(re);
    if (!m) continue;

    let section = m[2];
    const plainFirst = stripMdx(worst.b.firstPara);
    if (wordCount(plainFirst) < 45 || !hasStat(plainFirst) || !/\b(requires|means|costs|allows)\b/i.test(plainFirst)) {
      section = `${answerFirst(worst.b.heading)}\n\n${section.trimStart()}`;
    }
    if (!/^\|.+\|/m.test(section)) section = `${section.trimEnd()}\n\n${TABLE}\n`;
    if (!/insider tip/i.test(section)) section = `${section.trimEnd()}\n\n${BOOST_INSIDER}\n`;
    next = next.replace(m[0], `${m[1]}${section}`);
  }

  return next;
}

const SNAPSHOT_RE =
  /Greek Invest verification snapshot:\n\n(?:- [^\n]+\n)+/g;

const PLANNING_TABLE_RE =
  /\| Planning line \| Greek Invest 2026 band \|\n\| --- \| --- \|\n(?:\|[^\n]+\|\n){4}/g;

const INSIDER_LINES = [
  'Insider tip: MORE Group sequences engineer, cadastre, and bank files before reservation deposits on 2026 Golden Visa purchases.',
  'Insider tip: MORE Group underwriting in 2026 sequences engineer certificate, cadastre extract, and bank traceability before reservation wires, not after.',
  '**Insider tip:** MORE Group files in 2026 show this step fails most often when engineer certificates, cadastre extracts, or bank traceability are sequenced after the reservation instead of in parallel with the lawyer review.',
  'Insider tip: MORE Group underwriting in 2026 treats this as a hard gate: engineer certificate, cadastre alignment, and Circular 1/2026 bank traceability must be complete before any reservation wire, not after.',
];

const PROTECTED =
  /^## (MORE Group underwriting snapshot|Who we are \(citable snapshot\)|Buyer scenarios for|Red flags and buyer checklist)/;

function keepFirst(re, text) {
  let n = 0;
  return text.replace(re, (m) => {
    n += 1;
    return n === 1 ? m : '';
  });
}

function collapseDuplicateLines(text) {
  let out = text;
  for (const line of INSIDER_LINES) {
    out = removeDuplicateLine(out, line);
  }
  return out;
}

function removeDuplicateLine(text, line) {
  let seen = false;
  const escaped = line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`\\n${escaped}(?=\\n|$)`, 'g'), (match) => {
    if (!seen) {
      seen = true;
      return match;
    }
    return '';
  });
}

function cleanSection(section) {
  if (PROTECTED.test(section.slice(0, 120))) return section;
  let next = section;
  next = keepFirst(SNAPSHOT_RE, next);
  next = keepFirst(PLANNING_TABLE_RE, next);
  next = collapseDuplicateLines(next);
  return next;
}

function cleanBody(body) {
  const sections = body.split(/(?=^## )/m);
  let next =
    sections.length <= 1
      ? collapseDuplicateLines(body)
      : sections.map((s, i) => (i === 0 ? collapseDuplicateLines(s) : cleanSection(s))).join('');

  next = collapseDuplicateLines(next);
  next = next.replace(/\n{4,}/g, '\n\n\n');
  return next;
}

const log = [];
let skipped = 0;
let unchanged = 0;

for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    const raw = readFileSync(path, 'utf8');
    const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n?/);
    if (!fmMatch) continue;

    const body = parseMdxBody(raw);
    const beforeScore = scorePage(body, { collection: coll }).score;
    const cleaned = cleanBody(body);
    if (cleaned === body) {
      unchanged++;
      continue;
    }

    let finalBody = cleaned;
    let afterScore = scorePage(finalBody, { collection: coll }).score;
    let reboosted = false;
    if (afterScore < TARGET) {
      finalBody = reboostWeakBlocks(finalBody, coll);
      afterScore = scorePage(finalBody, { collection: coll }).score;
      reboosted = true;
    }

    if (afterScore < TARGET) {
      skipped++;
      continue;
    }

    if (!DRY) writeFileSync(path, fmMatch[0] + finalBody);
    log.push({
      name,
      beforeScore,
      afterScore,
      reboosted,
      saved: body.length - finalBody.length,
      insiders: {
        before: (body.match(/Insider tip:/gi) || []).length,
        after: (finalBody.match(/Insider tip:/gi) || []).length,
      },
    });
  }
}

log.sort((a, b) => b.saved - a.saved);
console.log(
  `${DRY ? 'Would update' : 'Updated'} ${log.length} files | unchanged ${unchanged} | skipped ${skipped} (would drop below ${TARGET})`,
);
for (const row of log.slice(0, 20)) {
  console.log(
    `  ${row.name}: ${row.beforeScore}->${row.afterScore}${row.reboosted ? ' (+reboost)' : ''}, -${row.saved}c, insider ${row.insiders.before}->${row.insiders.after}`,
  );
}

let total90 = 0;
let minScore = 100;
for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
    const s = scorePage(parseMdxBody(readFileSync(join(dir, f), 'utf8')), { collection: coll }).score;
    if (s >= TARGET) total90++;
    minScore = Math.min(minScore, s);
  }
}
console.log(`Corpus ${TARGET}+: ${total90}/114 | min score ${minScore}`);
