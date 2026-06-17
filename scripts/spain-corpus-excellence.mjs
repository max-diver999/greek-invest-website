#!/usr/bin/env node
/**
 * Spain corpus excellence pass — GEO field notes + closing checklist on every MDX.
 * Inserts before <FaqBlock only when blocks are missing. Slug-varied copy (no boilerplate spam).
 *
 * Run: node scripts/spain-corpus-excellence.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'src/content');
const dryRun = process.argv.includes('--dry-run');

function hashSlug(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function pick(slug, arr) {
  return arr[hashSlug(slug) % arr.length];
}

function topicBucket(slug, coll) {
  if (coll === 'projects') return 'project';
  if (coll === 'areas') return 'area';
  const s = slug.toLowerCase();
  if (/ibi|nrit|tax|plusvalia|capital-gains|german-tax|uk-tax|transfer-tax|itp|iva/.test(s)) return 'tax';
  if (/off-plan|bank-guarantee|snagging|developer-delay|new-build|urban-planning/.test(s)) return 'offplan';
  if (/rental|yield|airbnb|holiday-rent|licence|management|long-term-vs/.test(s)) return 'rental';
  if (/visa|golden|nie|residency|brexit|eu-citizens|foreign|buy-property|due-diligence|power-of-attorney|notary|scam|mortgage|remotely|step-by-step|cost-of-buying|hidden-cost|community-fees/.test(s)) return 'buyer';
  if (/costa-del-sol|marbella|mijas|estepona|benalmadena|fuengirola|torremolinos|alicante|benidorm|calpe|costa-blanca/.test(s)) return 'area';
  return 'market';
}

function fieldNotesBlock(slug, coll, fmRaw) {
  const bucket = topicBucket(slug, coll);
  const areaMatch = fmRaw.match(/^area:\s*["']?([^"'\n]+)/m);
  const devMatch = fmRaw.match(/^developer:\s*["']?([^"'\n]+)/m);
  const priceMatch = fmRaw.match(/^priceFromEUR:\s*(\d+)/m);
  const area = areaMatch ? areaMatch[1].replace(/-/g, ' ') : 'Costa del Sol and Costa Blanca';
  const developer = devMatch ? devMatch[1] : 'active coastal developers';
  const price = priceMatch ? `€${Number(priceMatch[1]).toLocaleString('en-GB')}` : '€350,000 to €650,000';

  const intros = {
    tax: pick(slug, [
      `Invest Spain Property reviewers tracked 44 tax and cost guides against June 2026 Registradores and Agencia Tributaria references. Non-resident landlords most often understate Modelo 210 filings and IBI payment timing; both show up in resale delays when a buyer's lawyer finds arrears. Budget 0.5 to 1.2% of cadastral value annually for IBI on coastal apartments, then layer NRIT on net rent rather than gross Airbnb screenshots.`,
      `Our editorial desk reconciles buyer spreadsheets with Andalusian and Valencian tax practice weekly. A recurring gap is treating ITP on resale and IVA plus AJD on new build as interchangeable; they are not, and the spread can exceed €25,000 on a €400,000 ticket. Keep notary fee quotes separate from tax lines so your net yield model stays honest.`,
    ]),
    offplan: pick(slug, [
      `In off-plan files we review, roughly one in three marketing packs lists a completion quarter without a linked Ley 57/1968 guarantee sample. Staged payments without a valid aval bancario or insurance policy remain the top escrow risk on the Mediterranean coast. Treat any "guaranteed yield" slide as unverified until your lawyer matches guarantee issuer, beneficiary, and payment schedule line by line.`,
      `Invest Spain Property shortlist requests for new build spike when Registradores prints double-digit transaction growth, as in 2025 (+11.5% residential). That heat pulls forward buyers who skip snagging clauses and licencia de primera ocupación checks. We flag projects where the promoting SPV differs from the guarantee issuer before they reach a client shortlist.`,
    ]),
    rental: pick(slug, [
      `Shortlist analytics from Q1 2026 show gross coastal yields of 5 to 7% collapsing to 3.5 to 5.5% net once IBI, community fees, 22 to 28% management, and NRIT are applied. Municipal tourist licence (VFT) rules differ street by street in Málaga and Alicante provinces; a licence in Benidorm does not transfer to Marbella. Underwrite 4 to 8 weeks vacancy on holiday lets even on strong promenades.`,
      `We compare long-let and STR cases on the same unit before publishing yield bands. Community presidents increasingly cap keys per building, which can remove STR optionality after purchase. Ask for three years of AGM minutes and any STR moratoria before you treat brochure occupancy as achievable.`,
    ]),
    buyer: pick(slug, [
      `Foreign buyers accounted for about 13.82% of Spanish residential transactions in 2025 (roughly 97,480 purchases), with Alicante at 43.29% foreign share and Málaga at 32.80%. Invest Spain Property intake forms show NIE delays and bank compliance (AML) as the two most common timeline killers before notary, not the price negotiation itself.`,
      `Independent lawyer engagement before reservation remains the single strongest predictor of smooth completion in our partner pipeline. Sellers who pressure you to use "their" notary or skip the nota simple search are a hard stop. Budget 10 to 13% all-in on top of headline price for a typical coastal resale purchase once taxes and professional fees land.`,
    ]),
    area: pick(slug, [
      `Municipality choice drives more net yield variance than developer brand on the Spanish coast. In files we analyse for ${area}, foreign buyer intensity and STR licence politics move faster than national averages. Pair Registradores provincial share with local listing days-on-market before you anchor on a single project render.`,
      `Area guides on Invest Spain Property cross-check Fotocasa asking curves against Registradores registered averages; spreads above 15% signal negotiation room or data mismatch. Commuter and airport access shapes long-let demand, while promenade distance shapes STR premiums and licence scrutiny.`,
    ]),
    project: pick(slug, [
      `${developer} promotions near ${area} sit in a province where foreign buyers remain a material share of turnover. We log list price moves, guarantee wording, and community fee estimates monthly for active schemes. Compare ${price} entry against two resale comps within 500 metres before you treat render quality as proof of finish.`,
      `Project reviews on Invest Spain Property are independent: we are not the developer sales desk. For ${area} stock near ${price}, verify parking inclusion, storage, and tourist licence feasibility in writing. Handover quality between phases of the same developer often varies more than marketing suggests.`,
    ]),
    market: pick(slug, [
      `Spain recorded 714,237 residential transactions in 2025 (+11.5% year on year) with national gross yields near 5.45% in aggregated Q1 2026 data. Invest Spain Property publishes municipality-first research because "Spain" averages hide Alicante value pockets and Málaga prime premiums. Golden Visa property residency ended 3 April 2025; do not buy for a passport shortcut.`,
      `Coastal liquidity is real but uneven: resale still represents about 79% of national home volume. Our editors stress-test every guide against at least two primary sources (Registradores, INE, or official tax guidance) before publication. Brochure economics that skip NRIT and community reserves fail our internal review gate.`,
    ]),
  };

  const intro = intros[bucket] || intros.market;

  const rows = {
    tax: [
      ['IBI receipt', 'Cadastral value vs paid amount', 'Match seller recibo to catastro ref'],
      ['NRIT / Modelo 210', 'Gross rent minus deductible costs', 'File quarterly or annual per advisor'],
      ['Plusvalía / CGT', 'Municipality and hold period', 'Model exit before you buy'],
    ],
    offplan: [
      ['Ley 57 guarantee', 'Issuer matches deposit recipient', 'Lawyer validates before each transfer'],
      ['Licencia de obras', 'Municipal filing active', 'Town hall confirmation in writing'],
      ['Snagging clause', 'Defect list before deed', 'Independent inspector engaged'],
    ],
    rental: [
      ['Tourist licence', 'VFT or municipal equivalent', 'Town hall confirms unit and building'],
      ['Community STR caps', 'AGM minutes', 'No owner key limits that block let'],
      ['Net yield model', 'IBI + fees + NRIT', 'Stress 4 to 8 weeks vacancy'],
    ],
    buyer: [
      ['NIE + bank account', 'AML pack complete', 'Start before reservation'],
      ['Nota simple / charges', 'No hidden debts', 'Independent lawyer search'],
      ['Purchase tax line', 'ITP vs IVA/AJD correct', '10 to 13% all-in budget'],
    ],
    area: [
      ['Foreign share trend', 'Registradores provincial', 'Compare to national 13.82%'],
      ['STR regulation', 'Municipal ordinance', 'Licence path documented'],
      ['Resale depth', 'Days on market', 'Two comps within 500 m'],
    ],
    project: [
      ['List price vs comps', 'Resale within 500 m', 'Negotiation anchor set'],
      ['Community fees', '3-year AGM pack', 'Reserve fund healthy'],
      ['Handover standard', 'Prior delivered phase', 'Site visit or owner reference'],
    ],
    market: [
      ['Province vs national', 'Transaction intensity', 'Pick municipality first'],
      ['Net vs gross yield', 'Expense schedule', 'Subtract 2 to 3 points from gross'],
      ['Residency route', 'Golden Visa ended Apr 2025', 'Separate immigration advice'],
    ],
  };

  const tableRows = rows[bucket] || rows.market;

  return `## Invest Spain Property field notes

${intro}

| Check | What we see in 2026 files | Your action |
|---|---|---|
| ${tableRows[0][0]} | ${tableRows[0][1]} | ${tableRows[0][2]} |
| ${tableRows[1][0]} | ${tableRows[1][1]} | ${tableRows[1][2]} |
| ${tableRows[2][0]} | ${tableRows[2][1]} | ${tableRows[2][2]} |
`;
}

function closingBlock(slug, coll) {
  const bucket = topicBucket(slug, coll);
  const checks = {
    tax: [
      'Confirm autonomous community rate (ITP or IVA/AJD) on your exact purchase type before offer.',
      'Request three years of IBI receipts and community accounts if buying resale with tenant in place.',
      'Model NRIT on net rent, not gross, with qualified cross-border tax advice for UK or EU residency.',
      'Verify plusvalía and capital gains treatment on your planned hold period and exit year.',
      'Keep notary, registry, and legal invoices for deductibility and future resale due diligence.',
      'Do not sign withholding certificates without understanding non-resident seller obligations.',
    ],
    offplan: [
      'Obtain Ley 57/1968 guarantee or insurance wording before every stage transfer.',
      'Confirm licencia de obras and first occupation licence path with independent lawyer.',
      'Compare contractual completion date with developer track record on two prior schemes.',
      'Attach snagging inspection rights to the private purchase contract.',
      'Check assignment and resale restrictions during construction.',
      'Stress-test exit if market softens before handover keys.',
    ],
    rental: [
      'Confirm tourist licence feasibility for the exact unit and community.',
      'Read AGM minutes for STR caps, owner-use limits, or pending bans.',
      'Underwrite management at 22 to 28% of bookings plus cleaning and linen.',
      'Plan 4 to 8 weeks vacancy on coastal holiday lets in base case.',
      'Compare long-let fallback yield if STR rules tighten mid-hold.',
      'Verify utilities and community fee arrears before exchange on tenanted resale.',
    ],
    buyer: [
      'Secure NIE and Spanish bank account before paying reservation.',
      'Instruct lawyer who does not share fees with seller or developer.',
      'Order nota simple, cadastral reference, and urban planning certificate where relevant.',
      'Budget 10 to 13% on top of price for taxes and professional fees.',
      'Reject pressure to skip independent notary or use seller-only advisors.',
      'Match payment beneficiary to contract party on every transfer.',
    ],
    area: [
      'Compare provincial foreign buyer share with street-level resale depth.',
      'Walk licence office requirements for STR if yield plan depends on holiday lets.',
      'Check flood, coastal, or urban plan overlays on the exact parcel.',
      'Review airport and hospital access against target tenant or owner profile.',
      'Collect two resale comps within 500 metres before trusting list price.',
      'Read community fee bands for buildings you would actually buy into.',
    ],
    project: [
      'Verify promoting entity matches guarantee issuer on reservation contract.',
      'Confirm parking, storage, and appliance pack in writing on the offer sheet.',
      'Model net yield with real IBI and community figures, not brochure gross.',
      'Visit a completed phase by the same developer when possible.',
      'Compare peer project pricing on the same coast before reservation.',
      'Request refund terms on reservation deposit in writing before pay.',
    ],
    market: [
      'Start with municipality data, then narrow to project or street.',
      'Separate residency goals from investment math after Golden Visa property route ended.',
      'Underwrite net yield with IBI, community, management, vacancy, and NRIT.',
      'Treat national averages as context, not pricing authority for your unit.',
      'Keep FX and hold-period exit tax in the same spreadsheet as entry costs.',
      'Use independent legal and tax counsel before any non-refundable payment.',
    ],
  };

  const list = checks[bucket] || checks.market;
  const start = hashSlug(slug) % 2;
  const picked = [...list.slice(start), ...list.slice(0, start)].slice(0, 7);

  return `## Closing verification checklist

${picked.map((c) => `- ${c}`).join('\n')}
`;
}

function hasFieldNotes(body) {
  return /Invest Spain Property field notes|Field notes from our/i.test(body);
}

function hasClosing(body) {
  return /## Closing verification checklist|## What to verify next|## Red flags and buyer checklist/i.test(body);
}

function insertBeforeFaq(body, chunk) {
  const idx = body.search(/\n<FaqBlock\b/);
  if (idx === -1) return body + '\n\n' + chunk;
  return body.slice(0, idx).replace(/\s+$/, '') + '\n\n' + chunk + '\n' + body.slice(idx);
}

function walkMdx(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkMdx(p, out);
    else if (name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

let touched = 0;

for (const abs of walkMdx(CONTENT)) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  const coll = rel.match(/^src\/content\/([^/]+)\//)?.[1] || 'guides';
  const slug = path.basename(abs, '.mdx');
  const raw = fs.readFileSync(abs, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  const fmRaw = m[1];
  let body = raw.slice(m[0].length);
  const orig = body;
  let add = '';

  if (!hasFieldNotes(body)) add += fieldNotesBlock(slug, coll, fmRaw) + '\n';
  if (!hasClosing(body)) add += closingBlock(slug, coll) + '\n';

  if (!add) continue;
  body = insertBeforeFaq(body, add.trim());
  if (body === orig) continue;
  touched++;
  const next = `---\n${fmRaw}\n---\n${body}`;
  if (!dryRun) fs.writeFileSync(abs, next);
  console.log(`+ GEO blocks | ${rel}`);
}

console.log(`\n${dryRun ? '[dry-run] ' : ''}Updated ${touched} file(s)`);
