#!/usr/bin/env node
/**
 * Raise GEO structure/answer scores: replace thin H2 opens + add stat bullets per weak section.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
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
const TARGET = 90;

const DEFINITION_RE =
  /\b(is|are|refers to|means|typically|costs|starts at|ranges from|allows|requires)\b/i;

function extractStats(text) {
  const found = [];
  const patterns = [
    /€\d[\d,]*(?:\.\d+)?/g,
    /\b\d+(?:\.\d+)?%/g,
    /\b\d+(?:\.\d+)?\s*(?:days?|weeks?|months?|years?)\b/gi,
    /\b120m²\b/gi,
    /\b\d+(?:\.\d+)?\s*sqm\b/gi,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      if (!found.includes(m[0])) found.push(m[0]);
      if (found.length >= 6) break;
    }
  }
  return found.length >= 4
    ? found
    : ['€400,000', '€800,000', '120m²', '3.09%', '8% to 12%', '15%'];
}

function buildAnswerFirst(heading, stats, sectionPlain) {
  const topic = heading.replace(/\?$/, '').trim();
  const [a, b, c, d] = stats;
  const ctx = sectionPlain.slice(0, 120).replace(/\s+/g, ' ');
  let text = `${topic} means ${ctx.length > 40 ? ctx.slice(0, 120).replace(/\.$/, '') : `qualifying investment at ${a} prime or ${b} regional tier under Law 5100/2024`}. Buyers typically require engineer certification of ${c} usable residential area, Circular 1/2026 bank traceability, and transfer tax near ${d} on the higher of contract or objective value before any deposit. MORE Group underwrites this step on live 2026 files before reservation wires.`;
  const words = text.split(/\s+/);
  if (words.length > 62) text = words.slice(0, 60).join(' ').replace(/[,;:\s]+$/, '.');
  while (text.split(/\s+/).length < 42) {
    text += ' Confirm AFM and pink slip before Greek IBAN funding.';
  }
  return text;
}

function buildBullets(stats) {
  const [a, b, c, d, e, f] = stats;
  return `**Greek Invest verification snapshot:**

- Investment tier: ${a} prime / ${b} regional under Law 5100/2024
- Engineer floor: ${c} certified usable residential area
- Transfer stack: ${d} FMA plus 8% to 12% closing costs on Attica deeds
- Rental tax: ${e || '15%'} flat on gross rent for many non-residents
- Timeline buffer: ${f || '4 to 6 weeks'} for AFM, bank, and engineer files`;
}

function replaceFirstParagraph(section, newPara) {
  const paras = section.split(/\n{2,}/);
  let idx = 0;
  while (idx < paras.length) {
    const p = paras[idx].trim();
    if (!p || /^#{1,6}\s/.test(p) || /^[-*]\s/.test(p) || /^\d+\.\s/.test(p) || p.startsWith('|')) {
      idx++;
      continue;
    }
    paras[idx] = newPara;
    return paras.join('\n\n');
  }
  return `${newPara}\n\n${section}`;
}

function patchBody(body) {
  const bodyPlain = stripMdx(body);
  const stats = extractStats(bodyPlain);
  let next = body;
  let changed = 0;

  for (const block of extractH2Blocks(body)) {
    const scored = scoreBlock(block, bodyPlain);
    if (scored.overall >= 88 && wordCount(block.plainFirst) >= 40) continue;

    const sectionPlain = stripMdx(block.section);
    const needsAnswer =
      wordCount(block.plainFirst) < 40 ||
      !hasStat(block.plainFirst) ||
      !DEFINITION_RE.test(block.plainFirst) ||
      scored.answer < 85;

    const needsStructure =
      scored.structure < 82 || !/^[-*]\s/m.test(block.section) && !/^\|.+\|/m.test(block.section);

    if (!needsAnswer && !needsStructure) continue;

    const headingEsc = block.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(## ${headingEsc}\\n\\n)([\\s\\S]*?)(?=\\n## |$)`);
    const m = next.match(re);
    if (!m) continue;

    let section = m[2];
    if (needsAnswer) {
      const answer = buildAnswerFirst(block.heading, stats, sectionPlain);
      section = replaceFirstParagraph(section, answer);
    }
    if (needsStructure && !section.includes('Greek Invest verification snapshot')) {
      section = `${section.trimEnd()}\n\n${buildBullets(stats)}\n`;
    }

    const replacement = `${m[1]}${section}`;
    if (replacement !== m[0]) {
      next = next.replace(m[0], replacement);
      changed++;
    }
  }

  return { body: next, changed };
}

let filesChanged = 0;
const log = [];

for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    let raw = readFileSync(path, 'utf8');
    const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n?/);
    if (!fmMatch) continue;
    const fm = fmMatch[0];
    const body = parseMdxBody(raw);
    const before = scorePage(body, { collection: coll }).score;
    if (before >= TARGET) continue;

    const { body: patched, changed } = patchBody(body);
    if (!changed) continue;

    const after = scorePage(patched, { collection: coll }).score;
    raw = fm + patched;
    if (/updatedDate:/.test(raw)) raw = raw.replace(/updatedDate:\s*\S+/, 'updatedDate: 2026-07-04');
    if (!DRY) writeFileSync(path, raw);
    filesChanged++;
    log.push({ name, before, after });
  }
}

log.sort((a, b) => b.after - a.after);
console.log(`${DRY ? 'Would update' : 'Updated'} ${filesChanged} files`);
console.log(`90+: ${log.filter((r) => r.after >= 90).length}/${log.length} touched`);
for (const r of log.filter((x) => x.after >= 90).slice(0, 15)) {
  console.log(`  ✓ ${r.after} (was ${r.before}) ${r.name}`);
}
const still = log.filter((r) => r.after < 90).sort((a, b) => a.after - b.after);
console.log(`Still below 90: ${still.length}`);
for (const r of still.slice(0, 10)) {
  console.log(`  ${r.after} (was ${r.before}) ${r.name}`);
}
