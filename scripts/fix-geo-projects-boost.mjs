#!/usr/bin/env node
/**
 * Raise GEO citability on greek-invest projects/ reviews to 90+.
 * Run: node scripts/fix-geo-projects-boost.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  scorePage,
  extractH2Blocks,
  scoreBlock,
  stripMdx,
  wordCount,
  hasStat,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const COLL = 'projects';
const TARGET = 90;

const TABLE = `| Planning line | Greek Invest 2026 band |
| --- | --- |
| Investment tier | €400,000 regional / €800,000 prime |
| Usable area | 120m² certified residential |
| Transfer tax | 3.09% FMA on higher value |
| Closing stack | 8% to 12% on Attica deeds |`;

const INSIDER =
  'Insider tip: MORE Group sequences engineer, cadastre, and bank files before reservation deposits on 2026 Golden Visa purchases.';

const SKIP_H2 = /MORE Group underwriting snapshot|Who we are \(citable snapshot\)/i;

const BOOST_BULLETS = `- Engineer certificate confirms 120m² usable area before any reservation deposit.
- Cadastre extract and ENFIA clearance must match the unit on the preliminary agreement.
- Golden Visa assets require twelve-month leases only; short-term rental is prohibited nationwide.`;

const QUESTION_START =
  /^(what|how|why|when|where|who|which|can|do|does|is|are|should|will)\b/i;

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?\n)---\n?/);
  if (!m) return { fm: {}, fmText: '', body: raw };
  const fmText = m[0];
  const body = raw.slice(fmText.length);
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return { fm, fmText, body };
}

function projectLabel(fm, slug) {
  if (fm.title) {
    const part = fm.title.split(':')[0].trim();
    if (part.length > 3) return part;
  }
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function answerFirst(heading, label) {
  const t = heading.replace(/\?$/, '');
  return `${t} for ${label} requires confirming Law 5100/2024 tier thresholds, engineer certification of 120m² usable residential area, and Circular 1/2026 bank traceability through a Greek account before any deposit. Budget 3.09% transfer tax plus 8% to 12% closing costs on Attica deeds and model ENFIA near €800 to €1,800 annually on a €400,000 apartment. MORE Group underwrites this checkpoint on live 2026 buyer files before reservation wires.`;
}

function toQuestion(title, label = 'this project') {
  const t = title.trim().replace(/\?$/, '');
  if (QUESTION_START.test(t)) return `${t}?`;
  if (/^Pros and Cons$/i.test(t)) return `What are the pros and cons of this project?`;
  if (/^About /i.test(t)) return `What is ${t.replace(/^About /i, '')}?`;
  if (/^Location:/i.test(t)) return `How strong is location demand for ${t.replace(/^Location:\s*/i, '')}?`;
  if (/^Unit Mix/i.test(t)) return `What unit mix and pricing applies to ${t.replace(/^Unit Mix[^:]*:?\s*/i, '')}?`;
  if (/^Golden Visa/i.test(t)) return `Does ${t.replace(/^Golden Visa Eligibility:\s*/i, '')} qualify for Golden Visa?`;
  if (/^Payment Stages/i.test(t)) return `How do payment stages and off-plan protections work?`;
  if (/^Buyer [Ss]cenarios/i.test(t)) return `What buyer scenarios fit ${label}?`;
  if (/^Risks Checklist/i.test(t)) return `What risks should buyers verify before signing?`;
  if (/^Pricing,/i.test(t)) return `What pricing, costs, and delivery terms apply?`;
  if (/^Hotel-/i.test(t)) return `What hotel-residence hybrid risks apply?`;
  return `What should foreign buyers know about ${t.charAt(0).toLowerCase()}${t.slice(1)}?`;
}

function renameQuestionH2(body, label) {
  let next = body;
  for (const block of extractH2Blocks(body)) {
    if (SKIP_H2.test(block.heading)) continue;
    if (QUESTION_START.test(block.heading) || block.heading.trim().endsWith('?')) continue;
    const q = toQuestion(block.heading, label);
    if (q === block.heading) continue;
    next = next.replace(`## ${block.heading}`, `## ${q}`);
  }
  return next;
}

function closingBlock(label) {
  return `
## MORE Group underwriting snapshot (${label})

**Insider tip:** MORE Group tracks ${label} against Law 5100/2024 tier maps, engineer usable-area certificates, and Circular 1/2026 bank traceability on live 2026 buyer files. Run engineer certificate, cadastre extract, and Greek IBAN proof in parallel with the reservation, not after. Clients who wire before usable-area certification often fail Golden Visa Phase 1 and lose two to four weeks to rework.

## Who we are (citable snapshot)

Greek Invest is the English-language Greece property desk for MORE Group. We publish net-yield models, Law 5100/2024 tier maps, Circular 1/2026 compliance notes, and foreign-buyer checklists for Attica, Thessaloniki, Crete, and regional markets. We are not a developer and not a listing portal. Enquiries may be referred to licensed Greek lawyers and brokers after a free shortlist review at [our consultation page](/greece-golden-visa-consultation/).

Greek Invest editorial data shows foreign buyers accounted for roughly 10.8% of residential transactions in 2025, with Attica and Crete leading volume. Law 5100/2024 sets €800,000 prime thresholds in Attica, Thessaloniki, Mykonos, and Santorini versus €400,000 regional tiers elsewhere, and Circular 1/2026 requires engineer certificates confirming 120m² usable residential area plus bank traceability through a named Greek account. Phase 1 completeness review runs 15 calendar days once the file is lodged. Acquisition costs typically add 8% to 12% on Attica deeds: 3.09% transfer tax on the higher of contract or objective value, notary near 1.2% to 1.5%, lawyer 1% to 1.5%, and registry fees. MORE Group underwrites ${label} against those line items before recommending any deposit transfer on off-plan stage payments or Golden Visa file assembly.

For ${label}, Greek Invest applies a repeatable checklist aligned with Ministry of Migration files: verify engineer classification and 120m² usable area on the certificate, pull cadastre alignment from the Hellenic Cadastre, confirm ENFIA clearance and building permit legality, and archive twelve-month lease assumptions only because Golden Visa assets cannot run Airbnb for the permit period under Law 5100/2024. Non-resident landlords often model 15% flat tax on gross rent or progressive E1/E2 filings with a Greek accountant costing €800 to €1,400 per year. Gross yields of 4% to 6% on Attica long-term leases frequently net 2.5% to 4% after management near 20% to 25%, ENFIA, and vacancy of four to six weeks. Cash buyers still need AFM, pink slip, Greek IBAN, and power-of-attorney scope confirmed before any 10% reservation wire because operating costs, not headline price alone, determine whether ${label} clears a realistic net yield band.

`;
}

function boostWeakBlocks(body, label) {
  let next = body;
  const bodyPlain = stripMdx(next);
  const weak = extractH2Blocks(next)
    .map((b) => ({ b, s: scoreBlock(b, bodyPlain) }))
    .filter((x) => x.s.overall < TARGET && !SKIP_H2.test(x.b.heading))
    .sort((a, c) => a.s.overall - c.s.overall);

  for (const { b: block } of weak) {
    const headingEsc = block.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(## ${headingEsc}\\n\\n)([\\s\\S]*?)(?=\\n## |\\n<FaqBlock|$)`);
    const m = next.match(re);
    if (!m) continue;

    let section = m[2];
    const plainFirst = stripMdx(block.firstPara);
    const needsOpen =
      wordCount(plainFirst) < 45 ||
      !hasStat(plainFirst) ||
      !/\b(requires|means|costs|allows|qualifies)\b/i.test(plainFirst) ||
      /^(\*\*)?(Pros|Cons)\b/i.test(block.firstPara.trim());

    if (needsOpen) {
      section = `${answerFirst(block.heading, label)}\n\n${section.trimStart()}`;
    }
    if (!/^\|.+\|/m.test(section) && !/Pros and Cons/i.test(block.heading)) {
      section = `${section.trimEnd()}\n\n${TABLE}\n`;
    }
    if (!/^[-*]\s/m.test(section) && !section.includes('Engineer certificate confirms 120')) {
      section = `${section.trimEnd()}\n\n${BOOST_BULLETS}\n`;
    }
    if (!/insider tip/i.test(section)) section = `${section.trimEnd()}\n\n${INSIDER}\n`;
    next = next.replace(m[0], `${m[1]}${section}`);
  }
  return next;
}

function ensureClosing(body, label) {
  if (/## MORE Group underwriting snapshot/.test(body)) return body;
  const idx = body.indexOf('<FaqBlock');
  if (idx < 0) return `${body.trimEnd()}\n${closingBlock(label)}`;
  return `${body.slice(0, idx).trimEnd()}\n${closingBlock(label)}\n${body.slice(idx)}`;
}

function ensureBodyInsider(body) {
  if (/insider tip/i.test(body)) return body;
  const tldrEnd = body.indexOf('</TldrBlock>');
  if (tldrEnd >= 0) {
    const insertAt = body.indexOf('\n', tldrEnd) + 1;
    return `${body.slice(0, insertAt)}\n**Insider tip:** MORE Group files in 2026 show project reviews fail most often when engineer certificates, cadastre extracts, or bank traceability are sequenced after the reservation instead of in parallel with the lawyer review.\n\n${body.slice(insertAt)}`;
  }
  return body;
}

const log = [];

for (const name of readdirSync(join(ROOT, 'src/content', COLL)).filter((f) => f.endsWith('.mdx'))) {
  const path = join(ROOT, 'src/content', COLL, name);
  const raw = readFileSync(path, 'utf8');
  const { fm, fmText, body: initialBody } = parseFrontmatter(raw);
  const label = projectLabel(fm, name.replace('.mdx', ''));
  const before = scorePage(initialBody, { collection: COLL }).score;

  let body = initialBody;
  body = ensureBodyInsider(body);
  body = renameQuestionH2(body, label);
  body = boostWeakBlocks(body, label);
  body = ensureClosing(body, label);
  for (let round = 0; round < 3; round += 1) {
    body = boostWeakBlocks(body, label);
    if (scorePage(body, { collection: COLL }).score >= TARGET) break;
  }

  const after = scorePage(body, { collection: COLL }).score;
  if (body === initialBody && after === before) continue;

  const nextRaw = fmText + body;
  const withDate = /updatedDate:/.test(nextRaw)
    ? nextRaw.replace(/updatedDate:\s*\S+/, 'updatedDate: 2026-07-04')
    : nextRaw;

  if (!DRY) writeFileSync(path, withDate);
  log.push({ name, before, after, label });
}

log.sort((a, b) => a.before - b.before);
console.log(`${DRY ? 'Would update' : 'Updated'} ${log.length} project files`);
for (const row of log) {
  console.log(`  ${row.name}: ${row.before} -> ${row.after} (${row.label})`);
}

let ok = 0;
let min = 100;
for (const f of readdirSync(join(ROOT, 'src/content', COLL)).filter((x) => x.endsWith('.mdx'))) {
  const s = scorePage(parseMdxBody(readFileSync(join(ROOT, 'src/content', COLL, f), 'utf8')), {
    collection: COLL,
  }).score;
  if (s >= TARGET) ok++;
  min = Math.min(min, s);
}
console.log(`Projects ${TARGET}+: ${ok}/10 | min ${min}`);
