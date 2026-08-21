#!/usr/bin/env node
/**
 * Remove machine-generated boilerplate from the MDX corpus.
 *
 * The corpus carried ~19% verbatim filler: one 4-bullet block repeated 1,219
 * times across 114 files, an identical 5-row table 639 times, four "Insider tip"
 * templates, and 859 sentences that spliced the preceding H2 heading into a
 * fixed Golden Visa tail — producing strings like "What Is ENFIA and How Did It
 * Come About requires €400,000 regional or €800,000 prime investment...".
 *
 * This works on exact, whole-paragraph matches only. It never uses a loose regex
 * to delete prose, it refuses to leave an H2 section empty, and it fails if a
 * file would drop below its collection's minimum word count.
 *
 * Usage:
 *   node scripts/strip-corpus-boilerplate.mjs --dry
 *   node scripts/strip-corpus-boilerplate.mjs [--limit N] [--collection guides]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? Number(args[limitIdx + 1]) : Infinity;
const collIdx = args.indexOf('--collection');
const ONLY_COLL = collIdx !== -1 ? args[collIdx + 1] : null;

const MIN_WORDS = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8')).contentCollections;

/** Whole paragraphs removed when they match exactly (after whitespace collapse). */
const EXACT_PARAGRAPHS = [
  'Greek Invest verification snapshot:',
  '- €800,000 prime vs €400,000 regional tiers under Law 5100/2024\n- 120m² certified usable area on engineer certificate\n- 3.09% transfer tax plus 8% to 12% Attica closing stack\n- Golden Visa assets: twelve-month leases only; no Airbnb for permit life',
  'Insider tip: MORE Group sequences engineer, cadastre, and bank files before reservation deposits on 2026 Golden Visa purchases.',
  'Insider tip: MORE Group underwriting in 2026 sequences engineer certificate, cadastre extract, and bank traceability before reservation wires, not after.',
  'Insider tip: MORE Group underwriting in 2026 treats this as a hard gate: engineer certificate, cadastre alignment, and Circular 1/2026 bank traceability must be complete before any reservation wire, not after.',
  '**Insider tip:** MORE Group files in 2026 show this step fails most often when engineer certificates, cadastre extracts, or bank traceability are sequenced after the reservation instead of in parallel with the lawyer review.',
  '| Planning line | Greek Invest 2026 band |\n| --- | --- |\n| Investment tier | €400,000 regional / €800,000 prime |\n| Usable area | 120m² certified residential |\n| Transfer tax | 3.09% FMA on higher value |\n| Closing stack | 8% to 12% on Attica deeds |',
  '- Engineer certificate confirms 120m² usable area before any reservation deposit.\n- Cadastre extract and ENFIA clearance must match the unit on the preliminary agreement.\n- Golden Visa assets require twelve-month leases only; short-term rental breaks the permit.',
  '- Tier check: €800,000 Attica prime vs €400,000 regional under Law 5100/2024\n- Area rule: 120m² certified usable residential floor on engineer certificate\n- Cost stack: 3.09% transfer tax plus 8% to 12% closing on Attica deeds\n- Rental mode: twelve-month leases only on the qualifying asset',
];

/** Paragraphs removed when they CONTAIN one of these fixed template tails. */
const CONTAINS_TAILS = [
  'requires €400,000 regional or €800,000 prime investment under Law 5100/2024',
  'requires verified thresholds under Law 5100/2024',
  'MORE Group underwrites this checkpoint on live 2026 buyer files',
  'on live 2026 buyer files. Run engineer certificate, cadastre extract, and bank traceability in parallel with the reservation, not after.',
  'Greek Invest is the English-language Greece property desk for MORE Group',
  // Factually wrong generator output: states usable area as a euro amount and
  // transfer tax as an absolute euro figure. 26 occurrences across 23 files.
  'Buyers typically require engineer certification of',
  'MORE Group underwrites this step on live 2026 files before reservation wires.',
];

/** Headings removed together with the templated section they introduce. */
const HEADING_PREFIXES = ['## MORE Group underwriting snapshot'];

const norm = (s) => s.replace(/\r/g, '').trim();
const words = (s) => s.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;

/**
 * Heading repair.
 *
 * 758 of the corpus's 1,740 H2s used the template "What should foreign buyers
 * know about <X>?", and the generator lower-cased the first letter of <X> every
 * single time, producing "…know about thessaloniki's Key Investment Submarkets?".
 * Another 47 lost their subject entirely ("What red flags apply to ?").
 *
 * These become plain descriptive headings. The question format that helps
 * answer engines is already carried properly by the FAQ block and its schema.
 */
const HEADING_REPLACEMENTS = [
  [/^(#{2,3})\s+What red flags apply to\s*\?$/, '$1 Red flags to check'],
  [/^(#{2,3})\s+What buyer scenarios fit\s*\?$/, '$1 Buyer scenarios'],
  [/^(#{2,3})\s+What unit mix and pricing applies to\s*\?$/, '$1 Unit mix and pricing'],
  [/^(#{2,3})\s+What should foreign buyers know about risks and How to Manage Them\?$/, '$1 Risks and how to manage them'],
  [/^(#{2,3})\s+What should foreign buyers know about\s*\?$/, '$1 What foreign buyers should know'],
];

function repairHeading(line) {
  if (!/^#{2,3}\s/.test(line)) return line;

  for (const [re, out] of HEADING_REPLACEMENTS) {
    if (re.test(line)) return line.replace(re, out);
  }

  const m = line.match(/^(#{2,3})\s+What should foreign buyers know about\s+(.+?)\s*\??$/);
  if (m) {
    const subject = m[2].trim();
    if (!subject) return `${m[1]} What foreign buyers should know`;
    return `${m[1]} ${subject.charAt(0).toUpperCase()}${subject.slice(1)}`;
  }
  return line;
}

const files = [];
for (const c of readdirSync(CONTENT)) {
  if (ONLY_COLL && c !== ONLY_COLL) continue;
  for (const f of readdirSync(join(CONTENT, c))) {
    if (f.endsWith('.mdx')) files.push({ coll: c, slug: f.replace('.mdx', ''), path: join(CONTENT, c, f) });
  }
}

let touched = 0;
let removedBlocks = 0;
let removedWords = 0;
const failures = [];

for (const file of files.slice(0, LIMIT === Infinity ? files.length : LIMIT)) {
  const raw = readFileSync(file.path, 'utf8');
  const fmMatch = raw.match(/^---\n[\s\S]*?\n---\n/);
  const fm = fmMatch ? fmMatch[0] : '';
  const body = fmMatch ? raw.slice(fm.length) : raw;
  const before = words(body);

  const blocks = body.split(/\n{2,}/);
  const kept = [];
  let dropping = false;
  let dropped = 0;

  for (const block of blocks) {
    const t = norm(block);

    // A "MORE Group underwriting snapshot" heading opens a templated section:
    // drop the heading and everything until the next heading.
    if (HEADING_PREFIXES.some((h) => t.startsWith(h))) {
      dropping = true;
      dropped++;
      continue;
    }
    if (dropping) {
      if (/^#{2,3}\s/.test(t)) {
        dropping = false; // next real heading ends the templated section
      } else {
        dropped++;
        continue;
      }
    }

    if (EXACT_PARAGRAPHS.some((p) => t === norm(p))) {
      dropped++;
      continue;
    }
    if (CONTAINS_TAILS.some((tail) => t.includes(tail))) {
      dropped++;
      continue;
    }

    kept.push(block.split('\n').map(repairHeading).join('\n'));
  }

  let next = kept.join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';

  // Guard: no H2/H3 may be left with nothing under it.
  const orphanHeadings = [];
  const lines = next.split('\n');
  const level = (l) => (l.match(/^(#{2,6})\s/) || [, ''])[1].length;
  for (let i = 0; i < lines.length; i++) {
    if (!/^#{2,3}\s/.test(lines[i])) continue;
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    // A heading immediately followed by a DEEPER heading is fine (H2 -> H3).
    // Only a same-or-shallower heading, or end of file, means nothing is under it.
    if (j >= lines.length || (level(lines[j]) > 0 && level(lines[j]) <= level(lines[i]))) {
      orphanHeadings.push(lines[i].slice(0, 70));
    }
  }

  const after = words(next);
  const min = MIN_WORDS[file.coll]?.minWords ?? 1000;

  if (orphanHeadings.length) {
    failures.push(`${file.coll}/${file.slug}: would empty ${orphanHeadings.length} section(s): ${orphanHeadings[0]}`);
    continue;
  }
  if (after < min) {
    failures.push(`${file.coll}/${file.slug}: would fall to ${after} words, below the ${min} minimum`);
    continue;
  }

  if (dropped > 0) {
    touched++;
    removedBlocks += dropped;
    removedWords += before - after;
    if (!DRY) writeFileSync(file.path, fm + next);
  }
}

console.log(`${DRY ? '[dry-run] ' : ''}files changed: ${touched}/${files.length}`);
console.log(`blocks removed: ${removedBlocks}`);
console.log(`words removed:  ${removedWords}`);
if (failures.length) {
  console.log(`\nSKIPPED (guard tripped) — ${failures.length} file(s):`);
  for (const f of failures) console.log(`  ${f}`);
}
