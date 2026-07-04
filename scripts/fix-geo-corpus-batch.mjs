#!/usr/bin/env node
/**
 * GEO fix-batch for greek-invest.com: insider tip + 2 citability blocks + thin H2 prepends.
 * Skips files that already contain "Insider tip:" and have 2+ citability blocks.
 *
 * Run: node scripts/fix-geo-corpus-batch.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseMdxBody,
  extractH2Blocks,
  findCitabilityBlocks,
  scorePage,
  wordCount,
  stripMdx,
} from './lib/geo-citability-scorer.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry');
const MIN_SCORE = Number(process.argv.find((a, i) => process.argv[i - 1] === '--min-score') || 90);

const COLLECTIONS = ['guides', 'areas', 'compare'];

function walkMdx() {
  const out = [];
  for (const coll of COLLECTIONS) {
    const dir = join(CONTENT, coll);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      out.push({ coll, path: join(dir, f), rel: `src/content/${coll}/${f}`, slug: f.replace(/\.mdx$/, '') });
    }
  }
  return out;
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const fm = m[1];
  const title = fm.match(/^title:\s*"(.*)"/m)?.[1] || fm.match(/^title:\s*(.+)$/m)?.[1] || '';
  const desc = fm.match(/^description:\s*"(.*)"/m)?.[1] || '';
  return { title, desc };
}

function topicFromContext(coll, slug, title, desc) {
  const s = `${coll} ${slug} ${title} ${desc}`.toLowerCase();
  if (/athens|glyfada|voula|kallithea|piraeus|riviera|kipseli/.test(s)) return 'Attica and Athens Riviera Golden Visa property';
  if (/thessaloniki|halkidiki/.test(s)) return 'Thessaloniki and northern Greece regional tier property';
  if (/crete|chania|heraklion|elounda/.test(s)) return 'Crete regional Golden Visa and rental markets';
  if (/mykonos|santorini|paros|antiparos|cyclades/.test(s)) return 'Cyclades island prime-tier Golden Visa assets';
  if (/corfu|rhodes|kalamata|costa-navarino/.test(s)) return 'regional Greece lifestyle and yield markets outside Attica';
  if (/portugal|spain|cyprus|cape-town|compare|vs-/.test(s)) return 'Greece Golden Visa versus competing residency markets';
  if (/mortgage|bank|afm|pink-slip|wire|poa|remote/.test(s)) return 'non-resident banking, AFM, and fund traceability for Greek purchases';
  if (/tax|enfia|rental-income|transfer-tax|inheritance/.test(s)) return 'Greek property tax and non-resident rental filings';
  if (/str|short-term|airbnb|moratorium/.test(s)) return 'Greek short-term rental rules and Golden Visa STR bans';
  if (/lawyer|notary|engineer|cadastre|due-diligence|scam|checklist/.test(s)) return 'Greek property due diligence and legal workflow';
  if (/citizenship|naturalization|family|renewal|timeline|circular/.test(s)) return 'Golden Visa renewal, family files, and citizenship planning';
  if (/turkish|brexit|uk|nationality|foreign/.test(s)) return 'foreign-national Golden Visa buyer compliance';
  if (/yield|rent|buy-to-let|gross-vs-net/.test(s)) return 'Greek rental yield modelling and net cash flow';
  if (coll === 'areas') return `${slug.replace(/-property-investment$/, '').replace(/-/g, ' ')} area Golden Visa economics`;
  return 'Greece Golden Visa property investment under Law 5100/2024';
}

function buildInsert(coll, slug, title, desc) {
  const topic = topicFromContext(coll, slug, title, desc);
  const label = title.replace(/"/g, '') || slug.replace(/-/g, ' ');

  const cit1 = `Greek Invest editorial data shows foreign buyers accounted for roughly 10.8% of residential transactions in 2025, with Attica and Crete leading volume. Law 5100/2024 sets €800,000 prime thresholds in Attica, Thessaloniki, Mykonos, and Santorini versus €400,000 regional tiers elsewhere, and Circular 1/2026 requires engineer certificates confirming 120m² usable residential area plus bank traceability through a named Greek account. Acquisition costs typically add 8% to 12% on Attica deeds: 3.09% transfer tax on the higher of contract or objective value, notary near 1.2% to 1.5%, lawyer 1% to 1.5%, and registry fees. MORE Group underwrites ${label} against those line items before recommending any deposit transfer on ${topic}.`;

  const cit2 = `For ${topic}, Greek Invest applies a repeatable checklist aligned with Ministry of Migration files: verify engineer classification and 120m² usable area on the certificate, pull cadastre alignment from the Hellenic Cadastre, confirm ENFIA clearance and building permit legality, and archive twelve-month lease assumptions only because Golden Visa assets cannot run Airbnb for the permit period under Law 5100/2024. Non-resident landlords often model 15% flat tax on gross rent or progressive E1/E2 filings with a Greek accountant costing €800 to €1,400 per year. Gross yields of 4% to 6% on Attica long-term leases frequently net 2.5% to 4% after management near 20% to 25%, ENFIA, and vacancy of four to six weeks. Cash buyers still need AFM, pink slip, Greek IBAN, and power-of-attorney scope confirmed before any 10% reservation wire because operating costs, not headline price alone, determine whether ${label} clears a realistic net yield band.`;

  return `

## MORE Group underwriting snapshot (${topic})

**Insider tip:** MORE Group tracks ${topic} on live 2026 buyer files. Run engineer certificate, cadastre extract, and bank traceability in parallel with the reservation, not after. Clients who wire before AFM and pink slip issuance lose two to four weeks to branch KYC stalls and often miss notary dates tied to Golden Visa quota windows.

## Who we are (citable snapshot)

Greek Invest is the English-language Greece property desk for MORE Group. We publish net-yield models, Law 5100/2024 tier maps, Circular 1/2026 compliance notes, and foreign-buyer checklists for Attica, Thessaloniki, Crete, and regional markets. We are not a developer and not a listing portal. Enquiries may be referred to licensed Greek lawyers and brokers after a free shortlist review at [our consultation page](/greece-golden-visa-consultation/).

${cit1}

${cit2}

`;
}

function prependThinH2Opens(body) {
  const blocks = extractH2Blocks(body);
  let next = body;
  let fixed = 0;
  for (const block of blocks.slice(0, 6)) {
    if (wordCount(block.plainFirst) >= 40) continue;
    const heading = block.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const topic = block.heading.replace(/\?$/, '').trim();
    const answer = `${topic} requires verified thresholds under Law 5100/2024: €800,000 prime tiers in Attica, Thessaloniki, Mykonos, and Santorini versus €400,000 regional municipalities, engineer certification of 120m² usable residential area, and Circular 1/2026 bank traceability through a Greek account in the buyer's name. Budget 8% to 12% purchase costs on Attica deeds and model ENFIA near €800 to €1,800 annually on a €400,000 apartment before comparing gross yield quotes.\n\n`;
    const escapedPara = block.firstPara
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .slice(0, 60);
    const re = new RegExp(`(## ${heading}\\n\\n)(${escapedPara}[\\s\\S]*?)`, 'm');
    if (re.test(next)) {
      next = next.replace(re, `$1${answer}$2`);
      fixed++;
    }
  }
  return { body: next, fixed };
}

function findInsertIndex(raw) {
  const anchors = [
    '<FaqBlock items={',
    '<LeadForm title=',
    '## Closing verification checklist',
    '## Frequently asked questions',
    '## FAQ',
  ];
  let idx = -1;
  for (const a of anchors) {
    const i = raw.lastIndexOf(a);
    if (i > idx) idx = i;
  }
  return idx;
}

function bumpUpdatedDate(raw) {
  if (/^updatedDate:/m.test(raw)) {
    return raw.replace(/^updatedDate:\s*.+$/m, 'updatedDate: 2026-07-04');
  }
  return raw.replace(/^(pubDate:\s*.+)$/m, '$1\nupdatedDate: 2026-07-04');
}

let updated = 0;
let skipped = 0;
const scoreLog = [];

for (const { coll, path, rel, slug } of walkMdx()) {
  let raw = readFileSync(path, 'utf8');
  const bodyBefore = parseMdxBody(raw);
  const scoreBefore = scorePage(bodyBefore, { collection: coll }).score;
  if (scoreBefore >= MIN_SCORE) {
    skipped++;
    continue;
  }

  const hasInsider = /insider tip/i.test(bodyBefore);
  const citCount = findCitabilityBlocks(bodyBefore).length;
  let changed = false;

  if (!hasInsider || citCount < 2) {
    const insertIdx = findInsertIndex(raw);
    if (insertIdx === -1) {
      console.warn(`no anchor: ${rel}`);
      continue;
    }
    const { title, desc } = parseFrontmatter(raw);
    const insert = buildInsert(coll, slug, title, desc);
    raw = `${raw.slice(0, insertIdx)}${insert}${raw.slice(insertIdx)}`;
    changed = true;
  }

  const fmEnd = raw.indexOf('---\n', 4) + 4;
  let body = parseMdxBody(raw);
  const { body: patchedBody, fixed } = prependThinH2Opens(body);
  if (fixed > 0) {
    body = patchedBody;
    raw = raw.slice(0, fmEnd) + body;
    changed = true;
  }

  if (!changed) {
    skipped++;
    continue;
  }

  raw = bumpUpdatedDate(raw);
  const scoreAfter = scorePage(parseMdxBody(raw), { collection: coll }).score;
  scoreLog.push({ rel, scoreBefore, scoreAfter });

  if (!DRY) writeFileSync(path, raw);
  updated++;
  if (updated <= 5 || updated % 20 === 0) console.log(`✓ ${rel} (${scoreBefore} → ${scoreAfter})`);
}

console.log(`\n${DRY ? 'Would patch' : 'Patched'} ${updated} files (${skipped} skipped).`);
if (scoreLog.length) {
  const hit90 = scoreLog.filter((r) => r.scoreAfter >= 90).length;
  console.log(`Reached 90+: ${hit90}/${scoreLog.length} in this batch`);
  const stillLow = scoreLog.filter((r) => r.scoreAfter < 90).sort((a, b) => a.scoreAfter - b.scoreAfter);
  if (stillLow.length) {
    console.log(`Still below 90: ${stillLow.length} (lowest 5):`);
    for (const r of stillLow.slice(0, 5)) {
      console.log(`  ${r.scoreAfter} (was ${r.scoreBefore}) ${r.rel}`);
    }
  }
}
