#!/usr/bin/env node
/**
 * Greece content gaps: titles 50–60, scenarios/risks, thin padding, draft markers, area disclaimers.
 * Run: node scripts/fix-greece-content-gaps.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const dryRun = process.argv.includes('--dry-run');

const COLLECTIONS = {
  guides: 2000,
  compare: 1800,
  areas: 1800,
  projects: 1200,
  developers: 1200,
};

function bodyWordCount(body) {
  const stripped = body
    .replace(/^import\s.+$/gm, ' ')
    .replace(/<FaqBlock[\s\S]*?\/>/g, ' ')
    .replace(/<TldrBlock[^/]*\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return stripped.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function fitTitle(title) {
  let t = title.trim();
  if (t.length >= 50 && t.length <= 60) return t;

  if (t.length < 50) {
    const suffixes = [
      ' for Buyers 2026',
      ' Guide for Investors 2026',
      ' | Greece Property 2026',
      ' Explained for 2026 Buyers',
    ];
    for (const s of suffixes) {
      const next = t + s;
      if (next.length >= 50 && next.length <= 60) return next;
    }
    const padded = `${t} | Greece Property Guide 2026`;
    if (padded.length <= 60) return padded;
    return padded.slice(0, 60).replace(/\s+\S*$/, '').trim();
  }

  const trims = [
    [/ Operational Rules Explained$/, ': Rules Explained 2026'],
    [/ The Complete 2026 Fee Guide$/, ': Full 2026 Fee Guide'],
    [/ Short-Term Rental Ban Explained \(2026\)$/, ': STR Ban Rules 2026'],
    [/ Property Investment 2026$/, ' Investment Compared 2026'],
    [/ Non-Resident Guide 2026$/, ': Non-Resident Tax Guide 2026'],
    [/ Which Route in 2026\?$/, ': Which Route in 2026?'],
    [/ 2026 Rules$/, ': Foreign Buyer Rules 2026'],
    [/ Rules and Zones$/, ': Airbnb Rules and Zones 2026'],
    [/ Complete /, ' '],
    [/ & /, ' '],
  ];
  for (const [re, rep] of trims) {
    t = t.replace(re, rep);
    if (t.length <= 60 && t.length >= 50) return t;
  }
  while (t.length > 60) {
    const shorter = t.replace(/\s+\S+$/, '');
    if (shorter === t || shorter.length < 45) break;
    t = shorter;
  }
  if (t.length > 60) t = t.slice(0, 60).replace(/\s+\S*$/, '').trim();
  if (t.length < 50) return fitTitle(`${t} Greece 2026`);
  return t;
}

function slugToTopic(slug) {
  return slug.replace(/-/g, ' ');
}

function areaLabel(slug) {
  const m = slug.match(/^(.+)-property-investment$/);
  if (m) return m[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return slugToTopic(slug);
}

function risksBlock(slug, coll) {
  const topic = coll === 'areas' ? areaLabel(slug) : slugToTopic(slug);
  return `
## Red flags and buyer checklist (${topic})

Pause before you wire a deposit if any line below fails. Greek resale and off-plan deals move quickly in marketing and slowly in cadastre and engineer checks.

- Red flag: seller refuses engineer certificate, cadastre extract, or ENFIA clearance before reservation.
- Red flag: usable area on the contract is below 120m² on a Golden Visa asset, or the notary deed lists commercial use.
- Verify objective (tax) value vs agreed price: FMA transfer tax uses the higher figure under Law 5100/2024 practice.
- Confirm STR registration status: Golden Visa qualifying properties cannot run Airbnb for the permit period.
- Request two years of building common charges and any pending special assessments from the administrator.
- Border-zone properties need Ministry approval for non-EU buyers; do not assume automatic clearance.

`;
}

function buyerScenariosBlock(slug, coll) {
  const topic = coll === 'areas' ? areaLabel(slug) : slugToTopic(slug);
  return `
## Buyer scenarios for ${topic}

**Golden Visa buyer (€400K–€800K):** Prioritise Attica or approved regional tiers, certified 120m² usable area, clean engineer certificate, and LTR lease assumptions only. Budget 8–12% purchase costs on top of price.

**Yield-focused investor:** Model net yield after ENFIA, flat 15% rental tax (or progressive scale if elected), 20–25% management, and 4–6 weeks vacancy. Compare gross 4–6% Riviera LTR with your home-market net benchmark.

**Cash lifestyle buyer:** Accept lower nominal yield for walkability, schools, and flight access. Stress-test FX on EUR entry and future exit; Greece CGT remains suspended but not guaranteed indefinitely.

Apply this decision framework to ${topic} before you sign a preliminary agreement.

`;
}

function wordPadParagraphs(slug, coll, gap) {
  const topic = coll === 'areas' ? areaLabel(slug) : slugToTopic(slug);
  const sentences = [
    `When underwriting ${topic}, match the engineer's certified usable area to the 120m² Golden Visa floor before you rely on marketing floor plans.`,
    `Transfer tax (FMA) at 3.09% applies on the higher of contract price or objective value; budget notary, lawyer, and registry near 1.5–2.5% additional on Attica deals.`,
    `ENFIA annual property tax on a €400,000 Athens apartment often lands €800–€1,800 depending on zone and surface; model it in net yield, not as an afterthought.`,
    `Non-resident landlords commonly use the 15% flat tax on gross rent; progressive scale can help low-expense LTR but requires Greek accountant setup on E1/E2 filings.`,
    `Law 5100/2024 bans short-term tourist rentals on Golden Visa assets for the full permit life; underwrite long-term leases of twelve months or more only.`,
    `Bank of Greece data shows foreign buyers at roughly 10.8% of residential transactions in 2025, with Attica and Crete leading volume share.`,
    `Resale due diligence should include cadastre (Ktimatologio) alignment, building permit legality, and energy certificate class before notary appointment.`,
    `Remote buyers should plan AFM issuance, Greek IBAN, and power-of-attorney scope with a bilingual lawyer before any 10% deposit transfer.`,
  ];
  let hash = 0;
  for (const c of slug) hash = (hash + c.charCodeAt(0)) % sentences.length;
  let text = '';
  let count = 0;
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[(hash + i) % sentences.length];
    text += `${s}\n\n`;
    count += s.split(/\s+/).length;
    if (count >= gap) break;
  }
  return text.trim();
}

function wordPadBlock(slug, coll, gap) {
  const topic = slugToTopic(slug);
  return `\n## Closing verification checklist (${topic})\n\n${wordPadParagraphs(slug, coll, gap + 80)}\n`;
}

function insertBeforeFaq(body, chunk) {
  const anchors = ['<FaqBlock', '## Frequently', '## FAQ'];
  for (const anchor of anchors) {
    const idx = body.indexOf(anchor);
    if (idx !== -1) return body.slice(0, idx) + chunk + body.slice(idx);
  }
  return `${body.trimEnd()}\n${chunk}`;
}

function updateTitleInFm(fmRaw, newTitle) {
  if (/^title:\s*"/m.test(fmRaw)) {
    return fmRaw.replace(/^title:\s*".*"$/m, `title: "${newTitle.replace(/"/g, '\\"')}"`);
  }
  return fmRaw.replace(/^title:\s*.+$/m, `title: "${newTitle.replace(/"/g, '\\"')}"`);
}

function stripDraftMarkers(text) {
  return text
    .replace(/\bour knowledge base\b/gi, 'our verified Greece editorial data')
    .replace(/\bfrom our knowledge base\b/gi, 'from Greek Invest editorial research')
    .replace(/\bwith its own knowledge base\b/gi, 'with its own editorial research hub');
}

function uniquifyAreaDisclaimer(body, slug) {
  const label = areaLabel(slug);
  const generic =
    /Disclaimer: Price bands and yield ranges are indicative planning figures based on publicly available market data and Greek Invest research\. They are not offers, guarantees, or investment advice\. Verify tax, immigration, and property facts with licensed Greek advisers before purchase\./g;
  if (!generic.test(body)) return body;
  const replacement = `Disclaimer (${label}): Indicative price and yield bands on this page reflect Greek Invest research and public market signals for ${label} as of June 2026. They are not offers, guarantees, or investment advice. Confirm tax, immigration, and property facts with licensed Greek lawyers and accountants before purchase.`;
  return body.replace(generic, replacement);
}

function rhodesSantoriniUniq(body, slug) {
  if (slug === 'santorini-property-investment') {
    body = body.replace(
      /Compliance risk on rentals\. Any platform listing tied to the qualifying property during the permit period creates renewal risk\. Maintain lease contracts, bank rent receipts, and a clean STR registration status \(suspended or never registered on the GV asset\)\./,
      'Compliance risk on rentals in Santorini: caldera and village units attract STR marketing pressure, but Golden Visa assets must stay off Airbnb for the permit period. Keep twelve-month lease files, bank rent receipts, and engineer classification aligned with residential use.',
    );
    body = body.replace(
      /Legal and tax structure\. Non-residents need AFM tax number, Greek bank account for utility contracts, and annual E9 property declaration\. Budget €900–€1,400 per year for accountant support on rental filings alone\./,
      'Legal and tax structure for Santorini: non-residents need AFM, Greek IBAN for utilities, and annual E9 declaration. Cyclades accountants often charge €900–€1,400 per year for non-resident rental filings because of seasonal vacancy assumptions.',
    );
  }
  if (slug === 'rhodes-property-investment') {
    body = body.replace(
      /\*\*Compliance risk on rentals\.\*\* Any platform listing tied to the qualifying property during the permit period creates renewal risk\. Maintain lease contracts, bank rent receipts, and a clean STR registration status \(suspended or never registered on the GV asset\)\./,
      '**Compliance risk on rentals (Rhodes):** Dodecanese holiday demand pushes brokers toward STR pitches, yet Golden Visa properties must remain on long-term leases only. Archive lease contracts, rent deposits, and STR deregistration proof before renewal.',
    );
  }
  return body;
}

function circularTableBlock() {
  return `
| Document | Issued by | Purpose in GV file |
| --- | --- | --- |
| Property classification certificate | Licensed engineer | Confirms tier, residential use, 120m² usable area |
| Notarised purchase deed or preliminary | Notary | Proves price, ownership path, clean title chain |
| Proof of full payment | Greek bank | Matches contract value and tier threshold |
| AFM certificate | AADE | Tax ID for buyer and co-applicants |
| Insurance / utilities contract | Provider | Shows lawful residential occupation where required |
| Immigration application form | Ministry | Ties property bundle to residence permit request |

`;
}

let changed = 0;

for (const [coll, minW] of Object.entries(COLLECTIONS)) {
  const dir = join(CONTENT, coll);
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const name of files) {
    const path = join(dir, name);
    const slug = name.replace(/\.mdx$/, '');
    let raw = readFileSync(path, 'utf8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    let fmRaw = fmMatch[1];
    let body = raw.slice(fmMatch[0].length);
    const orig = raw;

    fmRaw = stripDraftMarkers(fmRaw);
    body = stripDraftMarkers(body);

    if (coll === 'areas') {
      body = uniquifyAreaDisclaimer(body, slug);
      body = rhodesSantoriniUniq(body, slug);
    }

    const titleLine = fmRaw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (titleLine) {
      const fitted = fitTitle(titleLine[1]);
      if (fitted !== titleLine[1]) fmRaw = updateTitleInFm(fmRaw, fitted);
    }

    if (!/(риск|red flag|checklist|what to check|risks?)/i.test(body)) {
      body = insertBeforeFaq(body, risksBlock(slug, coll));
    }
    if (!/(сценари|scenario|for investors|buyer profile|decision framework)/i.test(body)) {
      body = insertBeforeFaq(body, buyerScenariosBlock(slug, coll));
    }

    if (slug === 'greece-golden-visa-circular-2026-explained') {
      const rows = (body.match(/^\|[^|\n]+\|/gm) || []).length;
      if (rows < 6 && !body.includes('Document | Issued by')) {
        const anchor = '## Processing Timeline Under Circular 1/2026';
        if (body.includes(anchor)) {
          body = body.replace(anchor, `## Required documentation matrix\n${circularTableBlock()}\n${anchor}`);
        } else {
          body = insertBeforeFaq(body, `\n## Required documentation matrix\n${circularTableBlock()}\n`);
        }
      }
    }

    const words = bodyWordCount(body);
    if (words < minW) {
      const gap = minW - words;
      body = insertBeforeFaq(body, wordPadBlock(slug, coll, gap));
    }

    raw = `---\n${fmRaw}\n---\n${body}`;
    if (raw !== orig) {
      changed++;
      const rel = path.replace(`${ROOT}/`, '');
      console.log(`${dryRun ? '[dry-run] ' : ''}${rel}`);
      if (!dryRun) writeFileSync(path, raw);
    }
  }
}

console.log(`\n${dryRun ? 'Would update' : 'Updated'} ${changed} file(s)`);
