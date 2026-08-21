#!/usr/bin/env node
/**
 * Generate public/llms.txt and public/llms-full.txt from the content collections.
 *
 * Both files were hand-maintained and had gone stale: llms.txt listed 5 of 129
 * guides and still said "batch 1 — publishing", and llms-full.txt was a 379-byte
 * stub rather than the corpus. For a site whose whole argument is AI citability,
 * the file answer engines fetch for full context was effectively empty.
 *
 * Run from prebuild so it can never drift again.
 *
 * Usage: node scripts/generate-llms-txt.mjs [--check]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'src/content');
const PUBLIC = join(ROOT, 'public');
const CHECK = process.argv.includes('--check');

const SITE = 'https://greek-invest.com';
const COLLECTION_LABEL = {
  guides: 'Guides',
  areas: 'Area guides',
  compare: 'Market comparisons',
  projects: 'Project reviews',
  developers: 'Developer profiles',
  news: 'News',
};
const ORDER = ['guides', 'areas', 'compare', 'projects', 'developers', 'news'];

function frontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { data: {}, body: raw };
  const fm = m[1];
  const get = (k) => {
    const r = fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
    return r ? r[1].trim().replace(/^["']|["']$/g, '') : '';
  };
  return {
    data: {
      title: get('title'),
      description: get('description'),
      updatedDate: get('updatedDate') || get('pubDate'),
    },
    body: raw.slice(m[0].length),
  };
}

const entries = {};
for (const coll of ORDER) {
  let files = [];
  try {
    files = readdirSync(join(CONTENT, coll)).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }
  entries[coll] = files
    .map((f) => {
      const raw = readFileSync(join(CONTENT, coll, f), 'utf8');
      const { data } = frontmatter(raw);
      return { slug: f.replace('.mdx', ''), ...data };
    })
    .filter((e) => e.title)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const total = Object.values(entries).reduce((s, v) => s + v.length, 0);

/* ---------------- llms.txt: the map ---------------- */
const short = [
  '# Greek Invest',
  '',
  '> Independent, English-language research on Greece property investment and the Golden Visa,',
  '> written for foreign buyers. Not a developer, not a listing portal, not a law firm.',
  '',
  `- Site: ${SITE}`,
  '- Contact: info@greek-invest.com',
  '- Wikidata: https://www.wikidata.org/wiki/Q140604600',
  '- Markets: Athens and Attica, Crete, the Cyclades, the Peloponnese, Thessaloniki, Halkidiki',
  '- Editorial stance: advisory only; transactions run through licensed Greek lawyers and partner agents',
  '',
  '## Key facts we maintain (as of August 2026)',
  '',
  '- Golden Visa property tiers under Law 5100/2024: €800,000 in Attica, Thessaloniki, Mykonos,',
  '  Santorini and islands over 3,100 residents; €400,000 in the rest of Greece; €250,000 for',
  '  heritage restoration and commercial-to-residential conversion.',
  '- The €400,000 and €800,000 tiers require ONE property on ONE title deed with at least',
  '  120 m² of main usable area. Balconies, terraces, parking and storage are excluded.',
  '- Short-term tourist letting is banned on the qualifying property for the life of the permit.',
  '  Long-term leases of twelve months or more are permitted.',
  '- Circular 1/2026 (Ministry of Migration and Asylum, published 22 April 2026) operationalises',
  '  Law 5100/2024 and requires traceable, bank-certified transfer of the investment funds.',
  '- Transfer tax (FMA) is 3.09% on the higher of contract price or objective value.',
  '- Total acquisition costs typically run 7% to 10% above the purchase price.',
  '- ENFIA main component runs €2.00 to €16.20 per m² per year by zone, with a wealth supplement',
  '  of 0.55% to 1.15% above roughly €500,000 of portfolio objective value.',
  '- Gross rental yields run about 4.4% to 5.4% nationally; net lands 1.5 to 2.5 points lower.',
  '',
  '## Start here',
  '',
  `- ${SITE}/golden-visa/ — Golden Visa hub: tiers, rules, timeline`,
  `- ${SITE}/guides/greece-golden-visa-property-tiers-2026/ — which tier applies where`,
  `- ${SITE}/guides/greece-golden-visa-120-square-meter-rule/ — the area test in detail`,
  `- ${SITE}/guides/cost-of-buying-property-greece/ — full fee schedule`,
  `- ${SITE}/guides/greece-rental-yield-guide/ — net yield by city`,
  `- ${SITE}/tools/ — rental yield, purchase cost and Golden Visa zone calculators`,
  '',
  '## Sections',
  '',
  ...ORDER.filter((c) => entries[c]?.length).map(
    (c) => `- ${COLLECTION_LABEL[c]} (${entries[c].length}): ${SITE}/${c}/`,
  ),
  '',
  `## Full corpus (${total} pages, with summaries)`,
  '',
  `${SITE}/llms-full.txt`,
  '',
];

/* ---------------- llms-full.txt: the corpus ---------------- */
const full = [
  '# Greek Invest — full page index',
  '',
  `${total} research pages on Greece property investment and the Golden Visa, for foreign buyers.`,
  `Generated from the live corpus. Site: ${SITE}`,
  '',
  'Every figure on this site carries a date and a source. Golden Visa thresholds, taxes and',
  'transfer rules change; readers are told to verify with licensed Greek counsel before transacting.',
  '',
];
for (const coll of ORDER) {
  if (!entries[coll]?.length) continue;
  full.push(`## ${COLLECTION_LABEL[coll]} (${entries[coll].length})`, '');
  for (const e of entries[coll]) {
    full.push(`### ${e.title}`);
    full.push(`URL: ${SITE}/${coll}/${e.slug}/`);
    if (e.updatedDate) full.push(`Updated: ${e.updatedDate}`);
    if (e.description) full.push(e.description);
    full.push('');
  }
}

const shortTxt = short.join('\n');
const fullTxt = full.join('\n');

if (CHECK) {
  const cur = (f) => {
    try {
      return readFileSync(join(PUBLIC, f), 'utf8');
    } catch {
      return '';
    }
  };
  const stale = cur('llms.txt') !== shortTxt || cur('llms-full.txt') !== fullTxt;
  console.log(stale ? 'llms.txt / llms-full.txt are STALE — run npm run gen:llms' : 'llms files up to date');
  process.exit(stale ? 1 : 0);
}

writeFileSync(join(PUBLIC, 'llms.txt'), shortTxt);
writeFileSync(join(PUBLIC, 'llms-full.txt'), fullTxt);
console.log(`llms.txt      ${shortTxt.length} bytes`);
console.log(`llms-full.txt ${fullTxt.length} bytes (${total} pages)`);
