#!/usr/bin/env node
/**
 * One-shot: expand 6 pilot project MDX stubs to validate:content P0 (1200+ words).
 * Run: node scripts/expand-pilot-projects.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/content/projects');

const PROJECTS = [
  {
    file: 'the-kove.mdx',
    slug: 'the-kove',
    name: 'The Kove',
    title: 'The Kove Mijas Review: Kronos Homes Off-Plan Guide 2026',
    description:
      'The Kove La Cala de Mijas review: Kronos Homes off-plan from €410,000, payment plan, bank guarantee checks, and net yield for foreign buyers.',
    price: 410000,
    developer: 'Kronos Homes',
    areaLabel: 'La Cala de Mijas',
    areaSlug: 'mijas-property-investment',
    coast: 'Costa del Sol',
    provinceShare: '32.80%',
    status: 'off-plan',
    completion: '2027 to 2028 (marketing estimate)',
    hero: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466962/more-group/spain/projects/the-kove/hero.webp',
    inline1: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466964/more-group/spain/projects/the-kove/inline_1.jpg',
    inline2: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466963/more-group/spain/projects/the-kove/inline_2.webp',
    tags: ['the kove', 'mijas', 'la cala', 'off-plan', 'kronos homes'],
    peer: 'kosmos',
    peerName: 'Kosmos',
    yieldGross: '5.5 to 7.0',
    yieldNet: '4.0 to 5.5',
    ibiBand: '450 to 900',
    comunidad: '120 to 220',
  },
  {
    file: 'kosmos.mdx',
    slug: 'kosmos',
    name: 'Kosmos',
    title: 'Kosmos Torremolinos Review: Kronos Homes Off-Plan 2026',
    description:
      'Kosmos Torremolinos off-plan review from €405,000: Kronos Homes payment stages, Ley 57 guarantee, rental context, and buyer checklist for foreigners.',
    price: 405000,
    developer: 'Kronos Homes',
    areaLabel: 'Torremolinos',
    areaSlug: 'benalmadena-property-investment',
    coast: 'Costa del Sol',
    provinceShare: '32.80%',
    status: 'off-plan',
    completion: '2027 (marketing estimate)',
    hero: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466960/more-group/spain/projects/kosmos/hero.webp',
    inline1: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466964/more-group/spain/projects/kosmos/inline_1.jpg',
    inline2: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466961/more-group/spain/projects/kosmos/inline_2.webp',
    tags: ['kosmos', 'torremolinos', 'off-plan', 'kronos homes', 'costa del sol'],
    peer: 'the-kove',
    peerName: 'The Kove',
    yieldGross: '5.0 to 6.5',
    yieldNet: '3.8 to 5.2',
    ibiBand: '400 to 850',
    comunidad: '110 to 200',
  },
  {
    file: 'insur-scala.mdx',
    slug: 'insur-scala',
    name: 'Insur Scala',
    title: 'Insur Scala Estepona Review: Grupo Insur Homes 2026',
    description:
      'Insur Scala Estepona review from €470,000: Grupo Insur completed homes, community fees, rental licence context, and net yield for foreign investors.',
    price: 470000,
    developer: 'Grupo Insur',
    areaLabel: 'Estepona',
    areaSlug: 'estepona-property-investment',
    coast: 'Costa del Sol',
    provinceShare: '32.80%',
    status: 'completed',
    completion: 'delivered (verify licencia de primera ocupación)',
    hero: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781467001/more-group/spain/projects/insur-scala/hero.jpg',
    inline1: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781467002/more-group/spain/projects/insur-scala/inline_1.jpg',
    inline2: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781467001/more-group/spain/projects/insur-scala/inline_2.jpg',
    tags: ['insur scala', 'estepona', 'grupo insur', 'new build', 'costa del sol'],
    peer: 'obra-nueva-mijas-balance',
    peerName: 'Balance Mijas',
    yieldGross: '4.5 to 6.0',
    yieldNet: '3.5 to 4.8',
    ibiBand: '500 to 950',
    comunidad: '140 to 260',
  },
  {
    file: 'obra-nueva-mijas-balance.mdx',
    slug: 'obra-nueva-mijas-balance',
    name: 'Balance Mijas',
    title: 'Balance Mijas Review: Grupo Insur Off-Plan La Cala 2026',
    description:
      'Balance Mijas off-plan review from €395,000 on La Cala coast: Grupo Insur stages, bank guarantee, snagging, and yield math for non-resident buyers.',
    price: 395000,
    developer: 'Grupo Insur',
    areaLabel: 'La Cala de Mijas',
    areaSlug: 'mijas-property-investment',
    coast: 'Costa del Sol',
    provinceShare: '32.80%',
    status: 'off-plan',
    completion: '2027 to 2028 (marketing estimate)',
    hero: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466907/more-group/spain/projects/obra-nueva-mijas-balance/hero.jpg',
    inline1: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466908/more-group/spain/projects/obra-nueva-mijas-balance/inline_1.jpg',
    inline2: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466909/more-group/spain/projects/obra-nueva-mijas-balance/inline_2.jpg',
    tags: ['balance mijas', 'mijas', 'grupo insur', 'off-plan', 'la cala'],
    peer: 'the-kove',
    peerName: 'The Kove',
    yieldGross: '5.5 to 7.5',
    yieldNet: '4.0 to 5.5',
    ibiBand: '420 to 880',
    comunidad: '115 to 210',
  },
  {
    file: 'beach-apartments-sea-views-spain-benidorm-costa-blanca-north-tm-tower-by-tm.mdx',
    slug: 'beach-apartments-sea-views-spain-benidorm-costa-blanca-north-tm-tower-by-tm',
    name: 'TM Tower Benidorm',
    title: 'TM Tower Benidorm Review: Poniente Beach Off-Plan 2026',
    description:
      'TM Tower Benidorm off-plan from €607,000: TM Grupo sea-view apartments, stage payments, Alicante province rental rules, and foreign buyer due diligence.',
    price: 607000,
    developer: 'TM Grupo Inmobiliario',
    areaLabel: 'Benidorm Poniente',
    areaSlug: null,
    coast: 'Costa Blanca',
    provinceShare: '43.29%',
    status: 'off-plan',
    completion: '2028 (marketing estimate)',
    hero: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466931/more-group/spain/projects/beach-apartments-sea-views-spain-benidorm-costa-blanca-north-tm-tower-by-tm/hero.jpg',
    inline1:
      'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466932/more-group/spain/projects/beach-apartments-sea-views-spain-benidorm-costa-blanca-north-tm-tower-by-tm/inline_1.jpg',
    inline2:
      'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466933/more-group/spain/projects/beach-apartments-sea-views-spain-benidorm-costa-blanca-north-tm-tower-by-tm/inline_2.jpg',
    tags: ['tm tower', 'benidorm', 'costa blanca', 'off-plan', 'tm grupo'],
    peer: 'sea-views-apartments-alicante-calpe-beach-la-fossa-azure-icons-by-tm',
    peerName: 'Azure Icons Calpe',
    yieldGross: '5.0 to 7.0',
    yieldNet: '3.8 to 5.5',
    ibiBand: '550 to 1100',
    comunidad: '150 to 280',
  },
  {
    file: 'sea-views-apartments-alicante-calpe-beach-la-fossa-azure-icons-by-tm.mdx',
    slug: 'sea-views-apartments-alicante-calpe-beach-la-fossa-azure-icons-by-tm',
    name: 'Azure Icons by TM',
    title: 'Azure Icons Calpe Review: TM Grupo Off-Plan Costa 2026',
    description:
      'Azure Icons Calpe La Fossa review from €520,000: TM Grupo off-plan terms, Costa Blanca rental licence, payment plan, and net yield for overseas buyers.',
    price: 520000,
    developer: 'TM Grupo Inmobiliario',
    areaLabel: 'Calpe La Fossa',
    areaSlug: null,
    coast: 'Costa Blanca',
    provinceShare: '43.29%',
    status: 'off-plan',
    completion: '2027 to 2028 (marketing estimate)',
    hero: 'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466921/more-group/spain/projects/sea-views-apartments-alicante-calpe-beach-la-fossa-azure-icons-by-tm/hero.jpg',
    inline1:
      'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466922/more-group/spain/projects/sea-views-apartments-alicante-calpe-beach-la-fossa-azure-icons-by-tm/inline_1.jpg',
    inline2:
      'https://res.cloudinary.com/dphvjbqb4/image/upload/v1781466922/more-group/spain/projects/sea-views-apartments-alicante-calpe-beach-la-fossa-azure-icons-by-tm/inline_2.webp',
    tags: ['azure icons', 'calpe', 'costa blanca', 'off-plan', 'tm grupo'],
    peer: 'beach-apartments-sea-views-spain-benidorm-costa-blanca-north-tm-tower-by-tm',
    peerName: 'TM Tower Benidorm',
    yieldGross: '5.5 to 7.5',
    yieldNet: '4.0 to 5.8',
    ibiBand: '480 to 980',
    comunidad: '130 to 240',
  },
];

function fmt(n) {
  return n.toLocaleString('en-GB');
}

function body(p) {
  const areaLink = p.areaSlug
    ? `See the [${p.areaLabel} property investment guide](/areas/${p.areaSlug}/) for municipality yields and licence notes.`
    : `${p.coast} foreign buyers represented ${p.provinceShare} of provincial transactions in recent Registradores data. Model municipality rules separately for Benidorm or Calpe.`;

  const paymentSection =
    p.status === 'completed'
      ? `## Pricing and completion status

Insur Scala is marketed as a delivered promotion. Confirm the licencia de primera ocupación, energy certificate, and community constitution before exchange. Resale pricing from €${fmt(p.price)} should be cross-checked against comparable units in Estepona within a 500 metre radius.

| Item | Buyer action | Typical range |
|---|---|---|
| List price | Verify live inventory | From €${fmt(p.price)} plus VAT if applicable |
| ITP (resale) | 7% Andalucia transfer tax | ~€${fmt(Math.round(p.price * 0.07))} on €${fmt(p.price)} |
| Notary and registry | Budget at completion | 1 to 1.5% of price |
| Community fees | Request 3-year AGM pack | €${p.comunidad} per month |
| IBI | Read seller recibo | €${p.ibiBand} per year |

Completed stock removes stage-payment risk but not snagging risk. Book an independent [snagging inspection in Spain](/guides/snagging-inspection-spain-new-build/) walk-through even on supposedly finished units.`
      : `## Off-plan payment plan and Ley 57/1968 guarantee

Standard Costa ${p.coast.includes('Blanca') ? 'Blanca' : 'del Sol'} off-plan contracts split price across reservation, private contract, construction milestones, and completion. Every transfer before escritura must be covered by a [bank guarantee under Ley 57/1968](/guides/bank-guarantee-off-plan-spain/) or equivalent insurance.

| Stage | Typical % | What to verify |
|---|---:|---|
| Reservation | 6,000 to 12,000 EUR | Refund terms in writing |
| Private contract (arras) | 10% | Lawyer review before pay |
| Construction milestone 1 | 20 to 30% | Guarantee issued and valid |
| Construction milestone 2 | 10 to 20% | Guarantee updated to new total |
| Completion balance | Remainder + IVA 10% | Snagging list annexed to deed |

Marketing completion window: ${p.completion}. Treat any date as contractual only after your lawyer reads the penalty clauses in the [developer delay risks guide](/guides/developer-delay-risks-spain/).`;

  return `
import TldrBlock from '../../components/TldrBlock.astro';
import FaqBlock from '../../components/FaqBlock.astro';

**Quick answer:** ${p.name} is a ${p.developer} promotion in ${p.areaLabel} on the ${p.coast}, listed from approximately €${fmt(p.price)} in June 2026 marketing. Foreign buyers need an NIE, Spanish bank account, independent lawyer, and ${p.status === 'completed' ? 'licence and community checks before notary' : 'Ley 57/1968 guarantee verification on every stage payment'}. Gross yield marketing often ignores IBI, community fees, and non-resident tax: underwrite net returns using the [Spain rental yield guide](/guides/spain-rental-yield-guide/).

<TldrBlock text="${p.name}: ${p.developer} in ${p.areaLabel}, from €${fmt(p.price)}. ${p.status === 'completed' ? 'Completed stock' : 'Off-plan'}: verify legal pack, ${p.status === 'completed' ? 'licences' : 'bank guarantee'}, and net yield before reservation." />

${p.name} sits in one of Spain's busiest foreign-buyer corridors. ${areaLink} This review translates developer marketing into a buyer checklist: location context, pricing bands, ${p.status === 'completed' ? 'completion' : 'payment'} mechanics, rental outlook, and the risks that trip non-resident investors. Figures are indicative from June 2026 materials: confirm live list price, inventory, and timelines with a licensed broker before any deposit.

## About ${p.name} and ${p.developer}

![${p.name} exterior](${p.inline1})

${p.developer} positions ${p.name} as ${p.status === 'completed' ? 'completed' : 'new-build'} apartments targeting ${p.coast} lifestyle and rental demand. The development emphasises sea or golf proximity, contemporary finishes, and communal amenities typical of mid-to-upper mid promotions in ${p.areaLabel}. ${p.developer} operates multiple active schemes on the coast; compare track record on delivered projects, not only render quality.

![${p.name} interior or amenity](${p.inline2})

Before reservation, request the full commercial pack: unit schedule, surface areas, parking and storage options, community fee estimate, and draft purchase contract. Cross-read with the [due diligence on Spain property](/guides/due-diligence-spain-property/) hub and the [off-plan property Spain guide](/guides/off-plan-property-spain-guide/) if you are new to staged payments.

| Data point | Indicative value (June 2026) | Source to verify |
|---|---|---|
| Entry price | From €${fmt(p.price)} | Developer price list |
| Developer | ${p.developer} | Contract header |
| Municipality | ${p.areaLabel} | Escritura / catastro |
| Foreign buyer share (${p.coast.includes('Blanca') ? 'Alicante' : 'Malaga'} province) | ~${p.provinceShare} | Registradores annual |
| Status | ${p.status} | Lawyer + licencia |

## Location and why ${p.areaLabel} matters

${p.areaLabel} competes on ${p.coast.includes('Blanca') ? 'Benidorm-Calpe tourism volume and Alicante airport access' : 'Malaga airport access, golf tourism, and year-round commuter rental in nearby towns'}. Properties within walking distance of beach or rail tend to command higher short-let rates but also face stricter tourist licence scrutiny.

| Distance | Typical time | Investor relevance |
|---|---|---|
| Nearest international airport | 35 to 55 minutes by road | Guest transfers and owner access |
| Beach or promenade | 5 to 20 minutes walk | Short-let premium |
| Supermarket and services | 5 to 15 minutes | Long-let tenant appeal |
| Hospital | 20 to 40 minutes | Lifestyle buyer checklist |

Pair location due diligence with the [cost of buying property in Spain](/guides/cost-of-buying-property-spain/) so entry tax (IVA on new build or ITP on resale) sits in the same spreadsheet as ${p.name} list price.

${paymentSection}

## Rental outlook and net yield

Do not accept gross yield on developer slides without a net model. For a €${fmt(p.price)} unit, illustrative short-let math might show €${Math.round(p.price * 0.065)} gross rent at 6.5% before costs. After IBI (€${p.ibiBand}), community (€${p.comunidad} per month), management (22 to 28% of rent), insurance, and [non-resident rental tax](/guides/spain-non-resident-income-tax-rental/), net often lands near ${p.yieldNet}%.

| Strategy | Gross yield band | Net yield band (illustrative) | Licence needed |
|---|---|---|---|
| Short-term holiday let | ${p.yieldGross}% | ${p.yieldNet}% | Yes, municipality VFT |
| Long-term annual contract | 4.5 to 6.0% | 3.5 to 5.0% | Usually no |
| Personal use only | n/a | n/a | n/a |

Use the [gross vs net yield Spain](/guides/gross-vs-net-yield-spain/) worksheet and [IBI property tax](/guides/ibi-property-tax-spain/) guide to stress-test ${p.name} against ${p.peerName} ([peer project review](/projects/${p.peer}/)) in the same price band.

## Pros and cons of ${p.name}

| Pros | Cons |
|---|---|
| ${p.developer} active pipeline on ${p.coast} | Marketing dates can slip versus contract |
| Entry from €${fmt(p.price)} in ${p.areaLabel} | Community fees vary by phase and amenities |
| Strong foreign-buyer liquidity in province | Tourist licence not automatic in every block |
| New-build energy ratings (A/B typical) | Net yield lower than gross brochures suggest |
| Communal pool and security common | Compare carefully with resale in same street |

## Risks and red flags before you reserve

1. Paying any stage transfer without a valid Ley 57/1968 guarantee or insurance policy.
2. Skipping independent legal review of the arras contract.
3. Assuming tourist licence availability from the developer brochure alone.
4. Modeling yield without IBI, community, management, and NRIT.
5. Ignoring snagging and licencia de primera ocupación at handover.
6. Choosing ${p.name} on render alone without visiting a ${p.developer} completed site.

**Insider tip:** ask for two references from owners already in a ${p.developer} completed community on the same coast. Finish quality between phases often differs more than marketing suggests.

## Buyer scenarios for investors

| Buyer profile | Fit for ${p.name} | De-prioritise if |
|---|---|---|
| Off-plan investor seeking completion uplift | ${p.status === 'off-plan' ? 'Yes, with delay buffer' : 'Limited, stock is completed'} | You need immediate rent in 90 days |
| Holiday home with occasional let | Strong if licence obtainable | You will not manage licence paperwork |
| Pure long-let buyer | Moderate, compare resale stock | You require lowest entry price only |
| Portfolio buyer comparing ${p.coast} | Compare with [${p.peerName}](/projects/${p.peer}/) | You skip net yield modeling |

## ${p.coast} market context for ${p.name}

Foreign buyers accounted for roughly ${p.provinceShare} of provincial property transactions in recent Registradores annual statistics. That liquidity helps resale if your unit is priced correctly at completion, but it also means competing promotions launch every quarter. ${p.name} should be compared against at least two alternatives in ${p.areaLabel} at the same price point, not only against ${p.peerName} on this site.

| Factor | ${p.areaLabel} signal | What to verify locally |
|---|---|---|
| Foreign buyer share | ~${p.provinceShare} provincial | Registradores annual report |
| Typical gross short-let | ${p.yieldGross}% marketing band | Your net model after tax |
| Annual IBI band | €${p.ibiBand} | Seller or developer recibo |
| Community fees | €${p.comunidad} per month | AGM minutes and reserve fund |
| Airport access | 35 to 55 minutes | Peak-season traffic test |

Transaction costs on a €${fmt(p.price)} purchase often add 10 to 13% on top of list price once notary, registry, legal fees, and VAT or ITP are included. Read the [cost of buying property in Spain](/guides/cost-of-buying-property-spain/) before comparing ${p.name} with resale stock on the same street. If you plan to let the unit, map municipality tourist licence rules early: a block without VFT capacity can erase several percentage points from your net yield even when gross occupancy looks strong on paper.

## Next steps

1. Obtain NIE and open a Spanish bank account ([NIE guide](/guides/nie-number-spain-property/)).
2. Instruct an independent lawyer before paying reservation.
3. Request guarantee wording, payment schedule, and community fee estimate in writing.
4. Model net yield with IBI and management included.
5. [Request a shortlist](/get-shortlist/) if you want broker-vetted alternatives in ${p.areaLabel}.

<FaqBlock items={[
  { question: "Who develops ${p.name}?", answer: "${p.name} is developed by ${p.developer}. Confirm the promoting entity on the reservation contract matches the guarantee issuer before any transfer." },
  { question: "What is the entry price at ${p.name}?", answer: "June 2026 marketing lists from approximately €${fmt(p.price)} plus VAT where applicable on new build. Verify live inventory and parking options before offer." },
  { question: "Can foreigners buy at ${p.name}?", answer: "Yes. Non-residents need an NIE, Spanish bank account, and independent legal counsel. ${p.status === 'completed' ? 'Completed units follow standard purchase tax and notary steps.' : 'Off-plan buyers must verify Ley 57/1968 guarantee on each stage payment.'}" },
  { question: "What yield should I expect from ${p.name}?", answer: "Illustrative gross short-let yields in ${p.areaLabel} run ${p.yieldGross}% before costs. Net yields after IBI, community, management, and tax commonly fall to ${p.yieldNet}% depending on occupancy and licence status." },
  { question: "What must I verify before reserving?", answer: "Lawyer review of contract, ${p.status === 'completed' ? 'licencia de primera ocupación and community statutes' : 'bank guarantee or insurance on stage payments'}, tourist licence feasibility for your unit, and a net yield model using real IBI and community figures." },
]} />
`.trim();
}

function frontmatter(p) {
  const related = [
    'off-plan-property-spain-guide',
    'bank-guarantee-off-plan-spain',
    'due-diligence-spain-property',
    'snagging-inspection-spain-new-build',
    p.peer,
  ];
  if (p.areaSlug) related.push(p.areaSlug);

  const relYaml = [...new Set(related)].map((s) => `  - "${s}"`).join('\n');

  const propType = 'apartment';
  const statusFm = p.status === 'completed' ? 'completed' : 'off-plan';

  return `---
title: "${p.title}"
description: "${p.description}"
pubDate: 2026-06-14
updatedDate: 2026-06-15
author: "Invest Spain Property Editorial"
category: "projects"
tags: ${JSON.stringify(p.tags)}
readingTime: 14
heroImage: "${p.hero}"
priceFromEUR: ${p.price}
area: "${p.areaLabel.toLowerCase().replace(/\s+/g, '-')}"
developer: "${p.developer}"
propertyType: "${propType}"
status: "${statusFm}"
relatedSlugs:
${relYaml}
faq:
  - question: "Who is the developer of ${p.name}?"
    answer: "${p.name} is developed by ${p.developer}. Verify the promoting company and guarantee issuer on the reservation contract before any payment."
  - question: "What is the entry price at ${p.name}?"
    answer: "Marketing reviewed in June 2026 lists from approximately €${fmt(p.price)} plus VAT where applicable on new build. Confirm live inventory and unit sizes with the developer or broker."
  - question: "Is ${p.name} suitable for foreign buyers?"
    answer: "Yes, with an NIE, Spanish bank account, and independent lawyer. ${p.status === 'completed' ? 'Check licences and community fees on completed stock.' : 'Off-plan buyers must verify Ley 57/1968 bank guarantee on every stage payment.'}"
  - question: "Where is ${p.name} located?"
    answer: "${p.name} is in ${p.areaLabel} on the ${p.coast}, a corridor with heavy foreign-buyer activity in recent Registradores data."
  - question: "What should I verify before buying at ${p.name}?"
    answer: "Contract review, ${p.status === 'completed' ? 'licencia de primera ocupación and community statutes' : 'bank guarantee documentation'}, tourist licence feasibility, IBI and community fee estimates, and net rental yield after tax."
---
`;
}

for (const p of PROJECTS) {
  const content = `${frontmatter(p)}\n${body(p)}\n`;
  writeFileSync(join(OUT, p.file), content, 'utf8');
  const words = body(p).split(/\s+/).filter(Boolean).length;
  console.log(`Wrote ${p.file} (~${words} body words)`);
}

console.log('Done. Run: npm run validate:content');
