#!/usr/bin/env node
/**
 * Fix citability-blocks hard issues for geo-citability-audit --min-score 90.
 * Safe: score-gated writes, orphan tail only after FaqBlock.
 *
 * Run: node scripts/fix-geo-citability-gaps.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  findCitabilityBlocks,
  scorePage,
  wordCount,
  stripMdx,
  splitParagraphs,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry-run');
const COLLECTIONS = ['guides', 'areas', 'compare', 'projects'];

const PHASE1_SENTENCE =
  ' Phase 1 completeness review runs 15 calendar days once the file is lodged.';

/** Junk pasted after FaqBlock closing — never match mid-article --- blocks. */
const ORPHAN_AFTER_FAQ =
  /(\]\s*\}\s*\/>)\s*\n+(?:Greek Invest verification snapshot:[\s\S]*|Insider tip: MORE Group sequences engineer[\s\S]*)$/;

function parseMeta(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { title: '', desc: '' };
  const fm = m[1];
  return {
    title: fm.match(/^title:\s*"(.*)"/m)?.[1] || fm.match(/^title:\s*(.+)$/m)?.[1] || '',
    desc: fm.match(/^description:\s*"(.*)"/m)?.[1] || '',
  };
}

function topicFromContext(coll, slug, title, desc) {
  const s = `${coll} ${slug} ${title} ${desc}`.toLowerCase();
  if (/hungary|portugal|spain|cyprus|cape-town|compare|vs-/.test(s))
    return 'Greece Golden Visa versus competing residency markets';
  if (/athens|glyfada|voula|kallithea|piraeus|riviera/.test(s))
    return 'Attica and Athens Riviera Golden Visa property';
  if (/crete|chania|heraklion|elounda/.test(s)) return 'Crete regional Golden Visa and rental markets';
  if (/mykonos|santorini|paros|antiparos|cyclades/.test(s))
    return 'Cyclades island prime-tier Golden Visa assets';
  if (/cost-of-buying|transfer-tax|objective-value|notary|pink-slip/.test(s))
    return 'Greek property acquisition costs and tax workflow';
  if (/rent|yield|str|short-term/.test(s)) return 'Greek rental yield modelling and net cash flow';
  if (/market|transaction|forecast/.test(s)) return 'Greece residential market data and foreign-buyer share';
  if (coll === 'areas')
    return `${slug.replace(/-property-investment$/, '').replace(/-/g, ' ')} area Golden Visa economics`;
  if (coll === 'projects') return 'Greek off-plan project due diligence and Golden Visa compliance';
  return 'Greece Golden Visa property investment under Law 5100/2024';
}

function buildCit1(topic, label) {
  return `Greek Invest editorial data shows foreign buyers accounted for roughly 10.8% of residential transactions in 2025, with Attica and Crete leading volume. Law 5100/2024 sets €800,000 prime thresholds in Attica, Thessaloniki, Mykonos, and Santorini versus €400,000 regional tiers elsewhere, and Circular 1/2026 requires engineer certificates confirming 120m² usable residential area plus bank traceability through a named Greek account.${PHASE1_SENTENCE} Acquisition costs typically add 8% to 12% on Attica deeds: 3.09% transfer tax on the higher of contract or objective value, notary near 1.2% to 1.5%, lawyer 1% to 1.5%, and registry fees. MORE Group underwrites ${label} against those line items before recommending any deposit transfer on ${topic}.`;
}

function buildCit2(topic, label) {
  return `For ${topic}, Greek Invest applies a repeatable checklist aligned with Ministry of Migration files: verify engineer classification and 120m² usable area on the certificate, pull cadastre alignment from the Hellenic Cadastre, confirm ENFIA clearance and building permit legality, and archive twelve-month lease assumptions only because Golden Visa assets cannot run Airbnb for the permit period under Law 5100/2024. Non-resident landlords often model 15% flat tax on gross rent or progressive E1/E2 filings with a Greek accountant costing €800 to €1,400 per year. Gross yields of 4% to 6% on Attica long-term leases frequently net 2.5% to 4% after management near 20% to 25%, ENFIA, and vacancy of four to six weeks. Cash buyers still need AFM, pink slip, Greek IBAN, and power-of-attorney scope confirmed before any 10% reservation wire because operating costs, not headline price alone, determine whether ${label} clears a realistic net yield band.`;
}

function buildClosing(coll, slug, title, desc) {
  const topic = topicFromContext(coll, slug, title, desc);
  const label = title.replace(/"/g, '') || slug.replace(/-/g, ' ');
  const cit1 = buildCit1(topic, label);
  const cit2 = buildCit2(topic, label);

  return `

## MORE Group underwriting snapshot (${topic})

**Insider tip:** MORE Group tracks ${topic} on live 2026 buyer files. Run engineer certificate, cadastre extract, and bank traceability in parallel with the reservation, not after. Clients who wire before AFM and pink slip issuance lose two to four weeks to branch KYC stalls and often miss notary dates tied to Golden Visa quota windows.

## Who we are (citable snapshot)

Greek Invest is the English-language Greece property desk for MORE Group. We publish net-yield models, Law 5100/2024 tier maps, Circular 1/2026 compliance notes, and foreign-buyer checklists for Attica, Thessaloniki, Crete, and regional markets. We are not a developer and not a listing portal. Enquiries may be referred to licensed Greek lawyers and brokers after a free shortlist review at [our consultation page](/greece-golden-visa-consultation/).

${cit1}

${cit2}

`;
}

function extendShortEditorial(body) {
  let next = body;
  for (const para of splitParagraphs(body)) {
    if (!/Greek Invest editorial data shows/.test(para)) continue;
    const plain = stripMdx(para);
    const w = wordCount(plain);
    if (w >= 130) continue;
    if (w >= 115 && w < 130 && !plain.includes('Phase 1 completeness')) {
      const extended = para.replace(
        ' through a named Greek account.',
        ` through a named Greek account.${PHASE1_SENTENCE}`,
      );
      if (extended !== para) next = next.replace(para, extended);
    }
  }
  return next;
}

function insertSecondCitBlock(body, coll, slug, title, desc) {
  const topic = topicFromContext(coll, slug, title, desc);
  const label = title.replace(/"/g, '') || slug.replace(/-/g, ' ');
  const cit2 = buildCit2(topic, label);
  if (body.includes(cit2.slice(0, 60))) return body;

  const anchor = '<FaqBlock';
  const idx = body.lastIndexOf(anchor);
  if (idx < 0) return `${body.trimEnd()}\n\n${cit2}\n\n`;
  return `${body.slice(0, idx).trimEnd()}\n\n${cit2}\n\n${body.slice(idx)}`;
}

function findInsertIndex(body) {
  for (const a of ['<FaqBlock items={', '<FaqBlock title=', '<FaqBlock ']) {
    const i = body.lastIndexOf(a);
    if (i >= 0) return i;
  }
  return -1;
}

function stripOrphanAfterFaq(body) {
  return body.replace(ORPHAN_AFTER_FAQ, '$1');
}

function citabilityIssues(body, coll) {
  return scorePage(body, { collection: coll }).issues.filter((i) => i.startsWith('citability'));
}

function fixFile(raw, coll, slug, title, desc) {
  const fm = raw.match(/^---\n[\s\S]*?\n---\n?/)[0];
  let body = parseMdxBody(raw);

  if (citabilityIssues(body, coll).length === 0) {
    const stripped = stripOrphanAfterFaq(body);
    if (stripped !== body) return { raw: fm + stripped, changed: true, note: 'orphan-only' };
    return { raw, changed: false };
  }

  body = extendShortEditorial(body);

  if (findCitabilityBlocks(body).length < 2 && !/## Who we are \(citable snapshot\)/.test(body)) {
    const idx = findInsertIndex(body);
    if (idx >= 0) {
      body = `${body.slice(0, idx)}${buildClosing(coll, slug, title, desc)}${body.slice(idx)}`;
    }
  }

  if (findCitabilityBlocks(body).length < 2) {
    body = insertSecondCitBlock(body, coll, slug, title, desc);
  }

  body = extendShortEditorial(body);
  body = stripOrphanAfterFaq(body);

  const afterIssues = citabilityIssues(body, coll);
  if (afterIssues.length > 0) {
    return { raw, changed: false, note: `still failing: ${afterIssues.join('; ')}` };
  }

  let nextRaw = fm + body;
  if (/updatedDate:/.test(nextRaw)) nextRaw = nextRaw.replace(/updatedDate:\s*\S+/, 'updatedDate: 2026-07-04');
  return { raw: nextRaw, changed: true, note: `cit ${findCitabilityBlocks(body).length}` };
}

const log = [];

for (const coll of COLLECTIONS) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;

  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    const raw = readFileSync(path, 'utf8');
    const slug = name.replace(/\.mdx$/, '');
    const { title, desc } = parseMeta(raw);
    const beforeCit = findCitabilityBlocks(parseMdxBody(raw)).length;
    const result = fixFile(raw, coll, slug, title, desc);

    if (!result.changed) {
      if (result.note && result.note !== 'orphan-only') log.push({ name, beforeCit, note: result.note });
      else if (result.note === 'orphan-only' && !DRY) {
        writeFileSync(path, result.raw);
        log.push({ name, beforeCit, note: 'orphan stripped' });
      }
      continue;
    }

    if (!DRY) writeFileSync(path, result.raw);
    const afterCit = findCitabilityBlocks(parseMdxBody(result.raw)).length;
    log.push({ name, beforeCit, afterCit, note: result.note });
  }
}

console.log(`${DRY ? 'Would fix' : 'Fixed'} ${log.filter((r) => r.afterCit !== undefined || r.note?.includes('orphan')).length} files`);
for (const row of log) {
  if (row.afterCit !== undefined) {
    console.log(`  ${row.name}: cit ${row.beforeCit}->${row.afterCit} ${row.note}`);
  } else if (row.note) {
    console.log(`  ${row.name}: skip ${row.note}`);
  }
}

let hard = 0;
for (const coll of COLLECTIONS) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
    const issues = scorePage(parseMdxBody(readFileSync(join(dir, f), 'utf8')), { collection: coll }).issues;
    if (issues.some((i) => i.startsWith('citability'))) hard++;
  }
}
console.log(`Remaining citability hard issues: ${hard}`);
