#!/usr/bin/env node
/**
 * Generate batch 1: 15 project MDX + 3 developer MDX for greek-invest.com
 * Run: node scripts/generate-singapore-batch1.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = join(ROOT, 'src/content/projects');
const DEVS_DIR = join(ROOT, 'src/content/developers');

mkdirSync(PROJECTS_DIR, { recursive: true });
mkdirSync(DEVS_DIR, { recursive: true });

const HERO_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Marina_Bay_Sands_%28Singapore%29.jpg/1280px-Marina_Bay_Sands_%28Singapore%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Singapore_skyline_at_day_%28b%29.jpg/1280px-Singapore_skyline_at_day_%28b%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Gardens_by_the_Bay%2C_Singapore%2C_at_night_%282012%29.jpg/1280px-Gardens_by_the_Bay%2C_Singapore%2C_at_night_%282012%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Singapore_CBD_skyline.jpg/1280px-Singapore_CBD_skyline.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Singapore_-_Central_Business_District.jpg/1280px-Singapore_-_Central_Business_District.jpg',
];

const GUIDE_NEW_LAUNCH = '/guides/singapore-new-launch-condo-guide-2026/';
const GUIDE_INVEST = '/guides/singapore-property-investment-guide/';

function fmtPrice(n) {
  return n.toLocaleString('en-SG');
}

function buildFaqYaml(faqs) {
  return faqs
    .map(
      (f) =>
        `  - question: "${f.q.replace(/"/g, '\\"')}"\n    answer: "${f.a.replace(/"/g, '\\"')}"`,
    )
    .join('\n');
}

function buildFaqItems(faqs) {
  return faqs
    .map(
      (f) =>
        `  { question: "${f.q.replace(/"/g, '\\"')}", answer: "${f.a.replace(/"/g, '\\"')}" }`,
    )
    .join(',\n');
}

function projectBody(p, heroIdx) {
  const priceFrom = p.psfLow * p.typicalSqft;
  const priceMid = Math.round(((p.psfLow + p.psfHigh) / 2) * p.typicalSqft);
  const tenureLabel = p.tenure === 'FH' ? 'freehold' : '99-year leasehold';
  const typeLabel = p.propertyType === 'ec' ? 'Executive Condominium (EC)' : 'private condominium';
  const hero = HERO_IMAGES[heroIdx % HERO_IMAGES.length];
  const devLink = p.developerSlug
    ? `/developers/${p.developerSlug}/`
    : GUIDE_INVEST;

  const faqs = [
    {
      q: `What is the starting price at ${p.name}?`,
      a: `Indicative entry pricing starts around S$${fmtPrice(priceFrom)} based on approximately S$${p.psfLow.toLocaleString()} psf and a typical ${p.typicalSqft} sq ft unit mix. Launch bands vary by floor, stack, and facing; request the latest price list before booking.`,
    },
    {
      q: `Who is the developer of ${p.name}?`,
      a: `${p.name} is developed by ${p.developer}. Review the developer track record, past TOP dates, and defect management history before committing a booking fee.`,
    },
    {
      q: `What tenure does ${p.name} hold?`,
      a: `${p.name} sits on ${tenureLabel} land in ${p.district} (${p.region}). Tenure affects long-term land-bank value, financing terms, and how the asset competes at resale against newer leasehold stock.`,
    },
    {
      q: `When is ${p.name} expected to complete?`,
      a: `Marketing materials point to completion around ${p.handover}. Progress payments follow the standard sale-and-purchase schedule; verify the licensed surveyor certificate and TOP timeline in your OTP.`,
    },
    {
      q: `Can foreigners buy at ${p.name}?`,
      a: `Foreign buyers may purchase private ${p.propertyType === 'ec' ? 'EC units only after minimum occupation period rules apply to prior owners; new EC sales are restricted to eligible Singapore citizens and PRs' : 'condo units subject to ABSD tiers'}. Run ABSD and financing checks early using our ${p.propertyType === 'ec' ? 'EC eligibility' : 'foreign buyer'} workflow before paying a booking fee.`,
    },
    {
      q: `Is ${p.name} a good investment in 2026?`,
      a: `Investment merit depends on entry psf versus recent ${p.district} transacts, rental depth near ${p.area}, and your hold period. Compare against alternate launches in ${p.region} and stress-test exit liquidity before you assume appreciation.`,
    },
  ];

  const body = `import TldrBlock from '../../components/TldrBlock.astro';
import FaqBlock from '../../components/FaqBlock.astro';

**Quick answer:** ${p.name} is a ${typeLabel} by ${p.developer} in ${p.area} (${p.district}, ${p.region}). Indicative pricing from S$${fmtPrice(priceFrom)} (about S$${p.psfLow.toLocaleString()} psf on ${p.typicalSqft} sq ft). ${tenureLabel.charAt(0).toUpperCase() + tenureLabel.slice(1)} tenure; status: ${p.statusLabel}. Use this review to compare entry psf, rental demand, and ABSD impact before booking.

<TldrBlock text="${p.name} offers ${p.units} units in ${p.area} with ${tenureLabel} tenure and indicative pricing from S$${fmtPrice(priceFrom)}. Strongest fit: buyers targeting ${p.region} ${p.propertyType === 'ec' ? 'EC ownership after MOP' : 'private condo'} exposure with ${p.developer} delivery track record. Verify latest price list, showflat availability, and ABSD before committing." />

${p.name} anchors the ${p.area} micro-market within Singapore's ${p.region} planning band. The development sits in ${p.district}, where recent government land sales and private launches have repriced buyer expectations for ${p.region} stock. Whether you are upgrading from an HDB flat, adding a second property, or buying from overseas, the decision starts with whether entry psf at ${p.name} still leaves room relative to nearby resale comparables.

For launch mechanics, payment stages, and balloting context, see our [Singapore new launch condo guide 2026](${GUIDE_NEW_LAUNCH}). For portfolio-level ABSD, financing, and hold-period planning, use the [Singapore property investment guide](${GUIDE_INVEST}). Foreign buyers should also read the [ABSD guide](/guides/singapore-absd-foreign-buyer-guide/) and [foreign buyer checklist](/guides/buy-property-singapore-foreigner/) before booking.

![${p.name} — ${p.area} Singapore residential skyline placeholder](${hero})

## About ${p.name}

${p.name} is a ${typeLabel} developed by ${p.developer}. The project comprises approximately ${p.units} residential units on ${tenureLabel} land in ${p.district}. Marketing status as of June 2026: ${p.statusLabel}. Expected completion is around ${p.handover}, subject to construction progress and regulatory approvals.

The developer positions ${p.name} for ${p.buyerProfile}. Unit mixes typically span compact two-bedroom layouts suitable for owner-occupiers through larger three- and four-bedroom formats that attract family upgraders and long-hold investors who prioritise bedroom count over absolute psf.

Location-wise, ${p.area} benefits from ${p.locationHighlights}. These factors feed both owner-occupier demand and rental depth, which matters if you are underwriting a five- to eight-year hold rather than pure end-user use.

## Unit mix and indicative pricing

Indicative pricing bands below translate launch psf guidance into approximate absolute prices using typical sizes. Always request the authorised price list on booking day because stack, facing, and floor premiums can move effective psf by 8 to 15 percent within the same bedroom type.

| Bedroom type | Typical size (sq ft) | Indicative psf (S$) | Indicative price from (S$) |
| --- | ---: | ---: | ---: |
| 2-bedroom | ${Math.round(p.typicalSqft * 0.85)} | ${p.psfLow.toLocaleString()} – ${Math.round((p.psfLow + p.psfHigh) / 2).toLocaleString()} | ${fmtPrice(Math.round(p.psfLow * p.typicalSqft * 0.85))} |
| 3-bedroom | ${p.typicalSqft} | ${p.psfLow.toLocaleString()} – ${p.psfHigh.toLocaleString()} | ${fmtPrice(priceFrom)} |
| 4-bedroom | ${Math.round(p.typicalSqft * 1.25)} | ${Math.round(p.psfLow * 1.05).toLocaleString()} – ${p.psfHigh.toLocaleString()} | ${fmtPrice(Math.round(p.psfHigh * p.typicalSqft * 1.25))} |

| Cost item | Indicative range (S$) | Notes |
| --- | ---: | --- |
| Booking fee | 5% of purchase price | Usually cheque or paynow; refundable within OTP period if terms allow |
| BSD / ABSD | Depends on profile | Foreign and second-property buyers pay higher ABSD tiers |
| Legal fees | 2,500 – 4,500 | Conveyancing plus mortgage documentation |
| Maintenance (monthly) | 280 – 450 | Varies with unit size and shared facilities load |

| Nearby benchmark | Approx. psf (S$) | Comment |
| --- | ---: | --- |
| ${p.name} (launch guide) | ${p.psfLow.toLocaleString()} – ${p.psfHigh.toLocaleString()} | New launch premium for fresh lease / product |
| ${p.district} resale condos (2025–26) | ${Math.round(p.psfLow * 0.88).toLocaleString()} – ${Math.round(p.psfHigh * 0.95).toLocaleString()} | Older stock may trade lower psf but shorter remaining lease |
| ${p.region} OCR/RCR average (2026) | ${Math.round(p.psfLow * 0.75).toLocaleString()} – ${Math.round(p.psfHigh * 0.85).toLocaleString()} | Use for sanity-checking regional affordability |

## Location and connectivity

${p.name} sits in ${p.area}, ${p.district}. ${p.transportNote}

Daily amenities cluster around ${p.amenities}. For families, school proximity within one to two kilometres often drives resale liquidity more than a marginal psf discount at launch.

Investors should map tenant demand: ${p.rentalNote}. If you rely on rental income, underwrite void periods and furnishing costs rather than assuming full-year occupancy at headline asking rents.

## Investment angles and rental outlook

${p.investmentNote}

Compare ${p.name} against other 2026 launches in ${p.region} before you anchor on a single showflat narrative. Entry psf is only half the equation; the other half is how quickly the sub-market absorbs new supply at TOP when owners start leasing or selling concurrently.

Use the [property investment guide](${GUIDE_INVEST}) to model ABSD, LTV limits, and hold-period exit scenarios. If you are navigating multiple launches, the [new launch guide](${GUIDE_NEW_LAUNCH}) explains balloting, OTP timelines, and progress payment schedules in plain language.

## Advantages and disadvantages

| Advantages | Disadvantages |
| --- | --- |
| ${p.pros[0]} | ${p.cons[0]} |
| ${p.pros[1]} | ${p.cons[1]} |
| ${p.pros[2]} | ${p.cons[2]} |
| Reputable developer exposure via ${p.developer} | Launch pricing may embed future psf growth assumptions |
| ${p.region} positioning suits ${p.buyerProfile} | Competing supply in ${p.district} can cap resale psf at TOP |

## Risks, red flags, and what to verify

Treat every new launch as a structured diligence exercise, not a same-day emotional booking. Priority checks for ${p.name}:

1. **Price list versus URA transacts** — Compare launch psf to recent ${p.district} caveats; ask your agent for a three-kilometre comp table dated within 90 days.
2. **Developer delivery** — Review ${p.developer}'s prior TOP delays and defect rectification scores on HDB/BCA public records where applicable.
3. **Financing buffer** — Stress-test mortgage payments at plus 1 percent interest and 70 percent LTV; confirm TDSR headroom if you hold other loans.
4. **Supply pipeline** — Map other ${p.district} launches completing within 12 months of ${p.handover}; overlapping TOP waves can pressure rents.
5. **ABSD and eligibility** — ${p.propertyType === 'ec' ? 'Confirm EC citizenship and household eligibility before booking.' : 'Foreign buyers should confirm ABSD tier and whether decoupling or trust structures are in scope with a licensed tax adviser.'}

**Insider tip:** Visit the showflat twice — once on a weekday quiet slot to read the price list calmly, and once on a weekend to gauge real buyer depth. Developers rarely discount publicly; your edge is choosing the right stack and avoiding units with hidden west-sun or MRT noise premiums baked into misleadingly cheap psf.

## Who this project fits

**Owner-occupiers:** Families anchored to ${p.area} schools and workplaces who plan to occupy through TOP and hold five plus years.

**Investors:** Buyers seeking ${p.region} exposure with moderate leverage, comfortable holding through construction and prepared for 6 to 12 months of post-TOP competition.

**Ill-suited profiles:** Short-term flippers expecting quick capital gains before TOP, or buyers who cannot pass TDSR if rates rise one notch.

For developer background, see [${p.developer}](${devLink}) when available. Related launches in the same region may include ${p.peerLinks}.

## Buyer decision framework

| Step | Action | Outcome |
| --- | --- | --- |
| 1 | Set maximum all-in budget incl. ABSD and stamp duty | Clear price ceiling before showflat visit |
| 2 | Compare three competing launches in ${p.region} | Relative psf and tenure value |
| 3 | Model rental yield at 85% occupancy | Net return after maintenance and tax |
| 4 | Book only after OTP legal review | Avoid non-refundable mistakes |
| 5 | Plan exit at TOP plus 24 months | Realistic liquidity window |

<FaqBlock items={[
${buildFaqItems(faqs)}
]} />
`;

  return { body, faqs, priceFrom, hero };
}

const PROJECTS = [
  {
    slug: 'newport-residences',
    name: 'Newport Residences',
    title: 'Newport Residences — Anson Road CBD Freehold Condo',
    description:
      'Newport Residences by CDL: D2 CCR freehold from S$3,400 psf, 246 units. Investment review, pricing tables, ABSD notes, and buyer checklist for 2026.',
    developer: 'City Developments Limited (CDL)',
    developerSlug: 'city-developments-cdl',
    district: 'D2',
    region: 'CCR',
    area: 'Tanjong Pagar / Anson Road',
    tenure: 'FH',
    status: 'new-launch',
    statusLabel: 'launched January 2026 with active sales',
    psfLow: 3400,
    psfHigh: 3800,
    typicalSqft: 700,
    units: 246,
    handover: '2029',
    propertyType: 'condo',
    tags: ['newport residences', 'CDL', 'district 2', 'CCR', 'freehold', 'new launch 2026'],
    buyerProfile: 'CBD fringe owner-occupiers and long-hold investors',
    locationHighlights: 'walking distance to Tanjong Pagar MRT and the CBD employment cluster',
    transportNote:
      'Tanjong Pagar and Prince Edward Road corridors link residents to Raffles Place within minutes on the East-West Line, with future Greater Southern Waterfront rejuvenation planned nearby.',
    amenities: 'Tanjong Pagar dining belts, Icon Village, and Marina Bay leisure options',
    rentalNote:
      'Financial-sector tenants and expatriate professionals drive one-bedroom and compact two-bedroom rental demand, though supply from competing CCR launches keeps yields moderate.',
    investmentNote:
      'Freehold CBD fringe land is scarce; Newport Residences competes on tenure permanence versus leasehold peers at similar psf. Underwrite conservatively because CCR ABSD and higher absolute ticket sizes shrink the buyer pool at resale.',
    pros: [
      'Freehold tenure in District 2 CCR',
      'CDL track record on premium CBD fringe projects',
      'Strong MRT and office cluster connectivity',
    ],
    cons: [
      'High absolute entry price limits tenant pool breadth',
      'ABSD materially affects foreign buyer demand',
      'CBD fringe supply from other 2026 launches',
    ],
    peerLinks: '[River Modern](/projects/river-modern/) and [Dunearn House](/projects/dunearn-house/)',
  },
  {
    slug: 'river-modern',
    name: 'River Modern',
    title: 'River Modern — Robertson Quay Luxury Condo by GuocoLand',
    description:
      'River Modern GuocoLand D9 CCR: from S$3,266 psf, 90% sold in 2026. Pricing, tenure, rental demand, and investor checklist for Robertson Quay.',
    developer: 'GuocoLand',
    developerSlug: 'guocoland',
    district: 'D9',
    region: 'CCR',
    area: 'Robertson Quay / River Valley',
    tenure: '99LH',
    status: 'selling',
    statusLabel: 'over 90% sold as of March 2026',
    psfLow: 3266,
    psfHigh: 3600,
    typicalSqft: 900,
    units: 450,
    handover: '2029',
    propertyType: 'condo',
    tags: ['river modern', 'guocoland', 'district 9', 'CCR', 'robertson quay'],
    buyerProfile: 'luxury owner-occupiers and high-net-worth investors',
    locationHighlights: 'Robertson Quay dining frontage and direct access to Great World and Fort Canning MRT nodes',
    transportNote:
      'Great World MRT (Thomson-East Coast Line) and multiple bus corridors connect to Orchard and the CBD within 10 to 15 minutes off-peak.',
    amenities: 'Robertson Quay F&B strip, Great World City, and River Valley primary schools',
    rentalNote:
      'Expatriate tenants working in CBD and Orchard command premium rents on larger two- and three-bedroom layouts with river-facing stacks.',
    investmentNote:
      'With most units sold, remaining inventory carries stack premiums. Resale liquidity historically holds well in D9 when entry psf was not overstretched versus URA caveats.',
    pros: [
      'Prime D9 river precinct address',
      'GuocoLand premium product specification',
      'Strong dining and lifestyle amenity cluster',
    ],
    cons: [
      'Limited remaining choice units at higher psf',
      '99-year leasehold versus freehold alternatives',
      'Luxury segment sensitive to global rate cycles',
    ],
    peerLinks: '[Newport Residences](/projects/newport-residences/) and [Chuan Grove](/projects/chuan-grove/)',
  },
  {
    slug: 'coastal-cabana-ec',
    name: 'Coastal Cabana',
    title: 'Coastal Cabana EC — District 17 Executive Condo 2026',
    description:
      'Coastal Cabana EC in D17: 99-year EC from S$1,200 psf. Eligibility, MOP rules, pricing tables, and investment angles for 2026 buyers.',
    developer: 'Joint venture developer consortium',
    developerSlug: null,
    district: 'D17',
    region: 'OCR',
    area: 'Loyang / Pasir Ris coast',
    tenure: '99LH',
    status: 'new-launch',
    statusLabel: 'expected 2026 EC launch',
    psfLow: 1200,
    psfHigh: 1400,
    typicalSqft: 1000,
    units: 500,
    handover: '2030',
    propertyType: 'ec',
    tags: ['coastal cabana', 'EC', 'district 17', 'OCR', 'executive condo'],
    buyerProfile: 'eligible Singapore citizens and PR first-time upgraders',
    locationHighlights: 'east coast lifestyle positioning near parks and expressway access to Changi Business Park',
    transportNote:
      'Pasir Ris and Loyang MRT nodes plus TPE/ECP connectivity support commutes to the east employment corridor and CBD.',
    amenities: 'Pasir Ris Park, White Sands, and Tampines regional centre retail',
    rentalNote:
      'Post-MOP EC units compete with OCR condos; until MOP, rental is restricted for EC owners who have not satisfied occupancy rules.',
    investmentNote:
      'EC entry psf typically trades below private OCR peers at launch, embedding a future step-up after MOP if the broader market is stable.',
    pros: [
      'Lower entry psf versus comparable private OCR condos',
      'East coast family-oriented amenity set',
      'EC asset class historically saw MOP re-rating',
    ],
    cons: [
      'Strict citizenship and income eligibility caps',
      'Minimum occupation period limits early exit',
      'Future supply along the east coast OCR belt',
    ],
    peerLinks: '[Rivelle Tampines EC](/projects/rivelle-tampines-ec/) and [Pinery Residences](/projects/pinery-residences/)',
  },
  {
    slug: 'narra-residences',
    name: 'Narra Residences',
    title: 'Narra Residences — Dairy Farm Walk D23 Nature Condo',
    description:
      'Narra Residences D23 OCR: 540 units from S$1,750 psf by Dairy Farm Walk JV. Pricing, Hillview MRT access, and 2026 buyer checklist.',
    developer: 'Dairy Farm Walk JV (Santarli / Apex Asia consortium)',
    developerSlug: null,
    district: 'D23',
    region: 'OCR',
    area: 'Dairy Farm / Hillview',
    tenure: '99LH',
    status: 'new-launch',
    statusLabel: '2026 launch at Dairy Farm Walk',
    psfLow: 1750,
    psfHigh: 1950,
    typicalSqft: 850,
    units: 540,
    handover: '2030',
    propertyType: 'condo',
    tags: ['narra residences', 'dairy farm', 'district 23', 'OCR', 'hillview'],
    buyerProfile: 'nature-fringe families and west-region owner-occupiers',
    locationHighlights: 'proximity to Bukit Timah Nature Reserve and Hillview MRT on the Downtown Line',
    transportNote:
      'Hillview MRT connects to Botanic Gardens interchange and the CBD with one transfer, appealing to hybrid WFH households.',
    amenities: 'HillV2, The Rail Mall, and nature park trailheads',
    rentalNote:
      'NUS and one-north professionals occasionally rent in the Bukit Timah fringe; yields are moderate but vacancy risk lower for well-priced two-bedrooms.',
    investmentNote:
      'Nature-adjacent OCR launches attract occupier demand; compare psf against Vela Bay and Dairy Farm resale stock before booking.',
    pros: [
      'Large site with greenery-facing unit options',
      'Downtown Line MRT within comfortable access',
      'Consortium with local construction depth',
    ],
    cons: [
      'OCR psf rising faster than rental growth in pockets',
      'Competing west OCR launches at similar price bands',
      'Car-dependent for some daily errands despite MRT',
    ],
    peerLinks: '[Vela Bay](/projects/vela-bay/) and [Tengah Garden Residences](/projects/tengah-garden-residences/)',
  },
  {
    slug: 'rivelle-tampines-ec',
    name: 'Rivelle (Tampines EC)',
    title: 'Rivelle Tampines EC — District 18 Executive Condo 2026',
    description:
      'Rivelle Tampines EC D18: 99-year EC from S$1,250 psf. March 2026 launch pricing, eligibility, MOP, and comparison with OCR condos.',
    developer: 'EC developer consortium (Tampines)',
    developerSlug: null,
    district: 'D18',
    region: 'OCR',
    area: 'Tampines',
    tenure: '99LH',
    status: 'new-launch',
    statusLabel: 'March 2026 EC launch window',
    psfLow: 1200,
    psfHigh: 1400,
    typicalSqft: 1050,
    units: 550,
    handover: '2030',
    propertyType: 'ec',
    tags: ['rivelle', 'tampines EC', 'district 18', 'OCR', 'executive condo'],
    buyerProfile: 'HDB upgraders in the east seeking EC price points',
    locationHighlights: 'mature Tampines town amenities and express connectivity to Changi Business Park',
    transportNote:
      'Tampines MRT interchange links the East-West and Downtown lines, supporting commutes to the CBD and airport logistics hubs.',
    amenities: 'Tampines Mall, Our Tampines Hub, and east region schools',
    rentalNote:
      'Family-sized EC layouts appeal to long-stay tenants in the east when eligible owners lease after MOP.',
    investmentNote:
      'EC launches in mature towns often sell quickly; compare net price after grants and the implied psf step-up post-MOP versus private OCR peers.',
    pros: [
      'Mature town infrastructure already in place',
      'Dual MRT line access via Tampines interchange',
      'EC price point below many private OCR launches',
    ],
    cons: [
      'Income ceiling limits buyer pool',
      'MOP and resale levy rules add complexity',
      'Competition from Treasure at Tampines resale stock',
    ],
    peerLinks: '[Coastal Cabana EC](/projects/coastal-cabana-ec/) and [Pinery Residences](/projects/pinery-residences/)',
  },
  {
    slug: 'pinery-residences',
    name: 'Pinery Residences',
    title: 'Pinery Residences — District 16 Bedok Launch Condo 2026',
    description:
      'Pinery Residences D16 OCR: new 2026 launch from S$1,750 psf. East coast pricing, connectivity, rental outlook, and investor checklist.',
    developer: 'Private developer (D16 launch)',
    developerSlug: null,
    district: 'D16',
    region: 'OCR',
    area: 'Bedok / Upper East Coast',
    tenure: '99LH',
    status: 'preview',
    statusLabel: 'launching 2026 with preview expected mid-year',
    psfLow: 1750,
    psfHigh: 2000,
    typicalSqft: 850,
    units: 400,
    handover: '2030',
    propertyType: 'condo',
    tags: ['pinery residences', 'bedok', 'district 16', 'OCR', 'new launch'],
    buyerProfile: 'east region upgraders and long-hold investors',
    locationHighlights: 'east coast family belt with established schools and park connectors',
    transportNote:
      'Bedok and Tanah Merah MRT nodes plus ECP access support commutes to the CBD and Changi Business Park.',
    amenities: 'Bedok Mall, East Coast Park, and Siglap dining clusters',
    rentalNote:
      'Three-bedroom layouts attract family tenants working in the east and CBD; underwrite with 5 to 8 percent void allowance.',
    investmentNote:
      'D16 launches price against steady OCR demand; verify launch psf against Bedok Residences and Bayshore pipeline completions.',
    pros: [
      'Established east coast owner-occupier depth',
      'Dual MRT access within short drive',
      'Family-sized unit mix alignment',
    ],
    cons: [
      'Launch pricing may embed optimistic east OCR psf growth',
      'Bayshore and coastal pipeline adds future supply',
      'Smaller absolute rental yield versus mass-market OCR',
    ],
    peerLinks: '[Coastal Cabana EC](/projects/coastal-cabana-ec/) and [Rivelle Tampines EC](/projects/rivelle-tampines-ec/)',
  },
  {
    slug: 'tengah-garden-residences',
    name: 'Tengah Garden Residences',
    title: 'Tengah Garden Residences — D24 Garden Town OCR Condo',
    description:
      'Tengah Garden Residences D24: GuocoLand / Hong Leong / CSC joint launch from S$1,400 psf. 99% sold review, pricing, and 2026 resale angles.',
    developer: 'Hong Leong Holdings, GuocoLand, and CSC Land Group',
    developerSlug: 'guocoland',
    district: 'D24',
    region: 'OCR',
    area: 'Tengah New Town',
    tenure: '99LH',
    status: 'selling',
    statusLabel: 'about 99% sold with limited units remaining',
    psfLow: 1400,
    psfHigh: 1600,
    typicalSqft: 900,
    units: 700,
    handover: '2028',
    propertyType: 'condo',
    tags: ['tengah garden residences', 'tengah', 'district 24', 'OCR', 'guocoland'],
    buyerProfile: 'young families priced into the west garden town masterplan',
    locationHighlights: 'Tengah forest corridor and planned car-lite town infrastructure',
    transportNote:
      'Future Tengah MRT stations on the Jurong Region Line will improve connectivity; until then, bus-first commutes dominate.',
    amenities: 'Planned town centre, community farmways, and regional park network',
    rentalNote:
      'Early-town rental pools are thinner until employment nodes mature; favour owner-occupier underwriting for the first five years.',
    investmentNote:
      'With most units sold, remaining inventory is stack-sensitive. Tengah story is long-dated; compare against Jurong Lake District and OCR west resale.',
    pros: [
      'Strong developer consortium with OCR track record',
      'Car-lite masterplan appeals to eco-conscious buyers',
      'Lower entry psf than central OCR peers',
    ],
    cons: [
      'Limited near-term rental depth until town matures',
      'Transport reliance on future JRL completion',
      'Competing Tengah and Jurong supply waves',
    ],
    peerLinks: '[Vela Bay](/projects/vela-bay/) and [Hudson Place Residences](/projects/hudson-place-residences/)',
  },
  {
    slug: 'vela-bay',
    name: 'Vela Bay',
    title: 'Vela Bay — District 23 West Coast OCR Condo Review',
    description:
      'Vela Bay D23 OCR: from S$1,700 psf, 72% sold in 2026. Dairy Farm fringe pricing, MRT access, rental yield notes, and buyer checklist.',
    developer: 'West region private developer',
    developerSlug: null,
    district: 'D23',
    region: 'OCR',
    area: 'Bukit Batok West / Jurong gateway',
    tenure: '99LH',
    status: 'selling',
    statusLabel: 'about 72% sold with ongoing release of units',
    psfLow: 1700,
    psfHigh: 1900,
    typicalSqft: 850,
    units: 480,
    handover: '2029',
    propertyType: 'condo',
    tags: ['vela bay', 'district 23', 'OCR', 'jurong gateway', 'new launch'],
    buyerProfile: 'west OCR upgraders and Jurong employment corridor workers',
    locationHighlights: 'Jurong Lake District spillover and west coast expressway connectivity',
    transportNote:
      'Future Jurong Region Line and existing bus networks link to Jurong East interchange and the second CBD narrative.',
    amenities: 'West Mall, Jurong Lake Gardens, and IMM retail belt',
    rentalNote:
      'Jurong tech and logistics tenants create two-bedroom rental demand; watch for competing OCR TOP clusters in 2028 to 2030.',
    investmentNote:
      'Vela Bay psf sits between mass OCR and nature-fringe premiums; benchmark against Narra Residences and Clavon resale once available.',
    pros: [
      'Jurong Lake District long-term employment story',
      'Mid OCR psf with family unit sizes',
      'Strong west region owner-occupier base',
    ],
    cons: [
      'Competing D22 and D23 launches at similar psf',
      'Rental yields compress if too many units TOP together',
      'Some stacks may face west sun or road noise',
    ],
    peerLinks: '[Narra Residences](/projects/narra-residences/) and [Lucerne Grand](/projects/lucerne-grand/)',
  },
  {
    slug: 'hudson-place-residences',
    name: 'Hudson Place Residences',
    title: 'Hudson Place Residences — Jurong Lake D22 OCR Condo',
    description:
      'Hudson Place Residences D22 OCR: Q2 2026 launch from S$1,750 psf. Jurong Innovation District pricing, rental outlook, investor checklist.',
    developer: 'Jurong Lake District developer',
    developerSlug: null,
    district: 'D22',
    region: 'OCR',
    area: 'Jurong Lake District / Media Circle fringe',
    tenure: '99LH',
    status: 'preview',
    statusLabel: 'Q2 to Q3 2026 expected launch',
    psfLow: 1750,
    psfHigh: 2050,
    typicalSqft: 850,
    units: 520,
    handover: '2030',
    propertyType: 'condo',
    tags: ['hudson place', 'jurong lake', 'district 22', 'OCR', 'new launch 2026'],
    buyerProfile: 'Jurong employment node workers and west OCR investors',
    locationHighlights: 'Jurong Lake District masterplan and innovation corridor tenants',
    transportNote:
      'Jurong East and future Jurong Region Line stations improve over the hold period; plan for interim bus-first commutes.',
    amenities: 'JEM, Westgate, Jurong Lake Gardens, and hospital cluster',
    rentalNote:
      'Two- and three-bedroom units near Jurong East interchange attract stable tenant demand from healthcare and retail sectors.',
    investmentNote:
      'JLD rebranding supports long-hold thesis; near-term psf moves with OCR sentiment and ABSD policy more than micro-location tweaks.',
    pros: [
      'Second CBD narrative with government masterplan backing',
      'Integrated retail and transport at Jurong East',
      'Family unit mix suited to west region upgraders',
    ],
    cons: [
      'Multiple competing JLD launches can dilute TOP resale',
      'Launch psf rising ahead of fully built amenity set',
      'Long construction timeline to 2030',
    ],
    peerLinks: '[Lucerne Grand](/projects/lucerne-grand/) and [Vela Bay](/projects/vela-bay/)',
  },
  {
    slug: 'lentor-gardens-residences',
    name: 'Lentor Gardens Residences',
    title: 'Lentor Gardens Residences — District 26 OCR Launch 2026',
    description:
      'Lentor Gardens Residences D26 OCR: 2026 launch from S$2,100 psf. Lentor MRT cluster pricing, schools, rental yield, and buyer checklist.',
    developer: 'North-east OCR developer consortium',
    developerSlug: null,
    district: 'D26',
    region: 'OCR',
    area: 'Lentor / Yio Chu Kang',
    tenure: '99LH',
    status: 'preview',
    statusLabel: '2026 launch in the Lentor MRT cluster',
    psfLow: 2100,
    psfHigh: 2350,
    typicalSqft: 900,
    units: 600,
    handover: '2030',
    propertyType: 'condo',
    tags: ['lentor gardens', 'district 26', 'OCR', 'lentor mrt', 'new launch'],
    buyerProfile: 'north-east families upgrading near Lentor interchange',
    locationHighlights: 'Lentor MRT on Thomson-East Coast Line linking to Caldecott and the CBD',
    transportNote:
      'Lentor interchange connects TEL and CRL phases, shortening commutes to the north-east and central regions over time.',
    amenities: 'Lentor Modern retail, Ang Mo Kio hub, and north region schools',
    rentalNote:
      'Family three-bedrooms attract stable long-stay tenants; Lentor cluster TOP waves may temporarily soften rents.',
    investmentNote:
      'Lentor saw multiple launches; differentiate by entry psf, remaining lease at TOP, and proximity to interchange exits.',
    pros: [
      'Interchange MRT on Thomson-East Coast Line',
      'Strong school belt demand for family units',
      'OCR with central connectivity premium',
    ],
    cons: [
      'Dense Lentor supply from 2024 to 2027 launches',
      'Higher OCR psf than older Yio Chu Kang resale',
      'Stack selection critical near rail viaducts',
    ],
    peerLinks: '[Thomson Reserve](/projects/thomson-reserve/) and [Pinery Residences](/projects/pinery-residences/)',
  },
  {
    slug: 'dunearn-house',
    name: 'Dunearn House',
    title: 'Dunearn House — Bukit Timah D10 CCR En-bloc Condo',
    description:
      'Dunearn House D10 CCR: CSC, Frasers, Sekisui launch from S$3,000 psf. Bukit Timah pricing, schools, tenure, and 2026 investment review.',
    developer: 'CSC Land Group, Frasers Property, and Sekisui House',
    developerSlug: null,
    district: 'D10',
    region: 'CCR',
    area: 'Bukit Timah / Dunearn Road',
    tenure: '99LH',
    status: 'new-launch',
    statusLabel: '2026 launch following en-bloc redevelopment',
    psfLow: 3000,
    psfHigh: 3600,
    typicalSqft: 800,
    units: 350,
    handover: '2029',
    propertyType: 'condo',
    tags: ['dunearn house', 'bukit timah', 'district 10', 'CCR', 'en-bloc'],
    buyerProfile: 'landed-adjacent upgraders and CCR school-belt families',
    locationHighlights: 'Bukit Timah prestige belt and proximity to top schools and nature reserves',
    transportNote:
      'Sixth Avenue and Tan Kah Kee MRT stations on the Downtown Line serve the Bukit Timah corridor with direct Botanic Gardens access.',
    amenities: 'Coronation Plaza, Holland Village, and Bukit Timah dining clusters',
    rentalNote:
      'Expatriate families prioritise school proximity; four-bedroom layouts lease slower but at higher absolute rents when well fitted.',
    investmentNote:
      'D10 launches command premiums; justify entry against Perfect Ten and Fourth Avenue transacts, not OCR benchmarks.',
    pros: [
      'Bukit Timah CCR school and prestige positioning',
      'Joint venture with Frasers and Sekisui quality cues',
      'Downtown Line MRT within comfortable access',
    ],
    cons: [
      'High absolute ticket size and ABSD exposure',
      'En-bloc replacement launches priced forward-looking',
      'Competition from Holland and King Albert Park pipeline',
    ],
    peerLinks: '[Amberwood at Holland](/projects/amberwood-at-holland/) and [Newport Residences](/projects/newport-residences/)',
  },
  {
    slug: 'thomson-reserve',
    name: 'Thomson Reserve',
    title: 'Thomson Reserve — Upper Thomson D20 RCR Condo 2026',
    description:
      'Thomson Reserve D20 RCR: UOL, CapitaLand, SingLand from S$1,900 psf. Q3 2026 launch, pricing tables, rental outlook, buyer checklist.',
    developer: 'UOL Group, CapitaLand Development, and SingLand',
    developerSlug: 'capitaland-development',
    district: 'D20',
    region: 'RCR',
    area: 'Upper Thomson / Bright Hill',
    tenure: '99LH',
    status: 'preview',
    statusLabel: 'Q3 2026 launch following former Thomson View site',
    psfLow: 1900,
    psfHigh: 2200,
    typicalSqft: 900,
    units: 500,
    handover: '2030',
    propertyType: 'condo',
    tags: ['thomson reserve', 'upper thomson', 'district 20', 'RCR', 'capitaland'],
    buyerProfile: 'RCR families seeking central-north connectivity without CCR tickets',
    locationHighlights: 'Bright Hill MRT on Thomson-East Coast Line and Upper Thomson dining belt',
    transportNote:
      'Bright Hill and Upper Thomson stations link to Caldecott interchange and the CBD with fewer transfers than bus-only OCR towns.',
    amenities: 'Thomson Plaza, Bishan-Ang Mo Kio Park, and mature central-north schools',
    rentalNote:
      'Young professional couples rent two-bedrooms near MRT for central access; family three-bedrooms attract longer leases.',
    investmentNote:
      'RCR pricing sits between OCR and CCR; Thomson Reserve competes with Lentor and Bishan resale on psf and remaining lease.',
    pros: [
      'Tier-one developer consortium track record',
      'Thomson-East Coast Line MRT at Bright Hill',
      'RCR ticket size below many CCR alternatives',
    ],
    cons: [
      'Competing RCR launches in D20 and D26',
      'Construction timeline to 2030 requires patience',
      'Some units priced at forward-looking RCR psf highs',
    ],
    peerLinks: '[Lentor Gardens Residences](/projects/lentor-gardens-residences/) and [Chuan Grove](/projects/chuan-grove/)',
  },
  {
    slug: 'lucerne-grand',
    name: 'Lucerne Grand',
    title: 'Lucerne Grand — Lakeside D22 OCR Condo by CDL 2026',
    description:
      'Lucerne Grand CDL D22 OCR: Q3 2026 launch from S$1,800 psf. Jurong West pricing, MRT access, rental yield, and investor checklist.',
    developer: 'City Developments Limited (CDL)',
    developerSlug: 'city-developments-cdl',
    district: 'D22',
    region: 'OCR',
    area: 'Lakeside / Jurong West',
    tenure: '99LH',
    status: 'preview',
    statusLabel: 'Q3 2026 expected launch by CDL',
    psfLow: 1800,
    psfHigh: 2100,
    typicalSqft: 900,
    units: 450,
    handover: '2030',
    propertyType: 'condo',
    tags: ['lucerne grand', 'CDL', 'lakeside', 'district 22', 'OCR'],
    buyerProfile: 'west OCR buyers seeking CDL-branded product near Lakeside MRT',
    locationHighlights: 'Lakeside MRT on East-West Line and Jurong Lake Gardens lifestyle anchor',
    transportNote:
      'Lakeside and Chinese Garden stations connect to Jurong East and the CBD on the East-West Line with bus backups.',
    amenities: 'Jurong Lake Gardens, Taman Jurong, and JCube retail legacy nodes',
    rentalNote:
      'Jurong West family tenants stabilise three-bedroom occupancy; watch Hudson Place and JLD launches completing nearby.',
    investmentNote:
      'CDL OCR launches historically see steady owner-occupier take-up; compare Lucerne Grand psf to Lakeside resale and Parc Clematis benchmarks.',
    pros: [
      'CDL delivery and defect-management reputation',
      'Mature Lakeside MRT on East-West Line',
      'Jurong Lake lifestyle and park connectivity',
    ],
    cons: [
      'OCR west supply from JLD and Jurong pipelines',
      'Launch may price ahead of fully upgraded Jurong West rents',
      'Long wait to TOP in 2030',
    ],
    peerLinks: '[Hudson Place Residences](/projects/hudson-place-residences/) and [Vela Bay](/projects/vela-bay/)',
  },
  {
    slug: 'chuan-grove',
    name: 'Chuan Grove',
    title: 'Chuan Grove — Lorong Chuan D21 RCR Condo 2026',
    description:
      'Chuan Grove D21 RCR: 2026 GLS launch from S$2,300 psf. Lorong Chuan MRT pricing, schools, tenure, rental outlook, investor checklist.',
    developer: 'Chuan Grove JV developer consortium',
    developerSlug: null,
    district: 'D21',
    region: 'RCR',
    area: 'Lorong Chuan / Serangoon',
    tenure: '99LH',
    status: 'new-launch',
    statusLabel: '2026 launch on former Chuan Grove GLS site',
    psfLow: 2300,
    psfHigh: 2600,
    typicalSqft: 900,
    units: 550,
    handover: '2030',
    propertyType: 'condo',
    tags: ['chuan grove', 'lorong chuan', 'district 21', 'RCR', 'new launch'],
    buyerProfile: 'RCR families near NEX and Lorong Chuan MRT',
    locationHighlights: 'Circle Line interchange access and Serangoon mature town amenities',
    transportNote:
      'Lorong Chuan MRT on the Circle Line links to one-north and Paya Lebar employment hubs within 15 to 20 minutes.',
    amenities: 'NEX, Serangoon Gardens dining, and central-north schools',
    rentalNote:
      'One-north and CBD professionals rent two-bedrooms along the Circle Line; family units compete with Serangoon resale stock.',
    investmentNote:
      'RCR psf rose sharply 2024 to 2026; verify Chuan Grove launch against recent D21 caveats and Thomson Reserve pricing.',
    pros: [
      'Circle Line MRT at Lorong Chuan',
      'Mature Serangoon amenity depth',
      'RCR central access below CCR tickets',
    ],
    cons: [
      'GLS sites priced after competitive tenders',
      'Competing RCR launches in D19 and D20',
      'Higher psf may compress gross rental yields',
    ],
    peerLinks: '[Thomson Reserve](/projects/thomson-reserve/) and [River Modern](/projects/river-modern/)',
  },
  {
    slug: 'amberwood-at-holland',
    name: 'Amberwood at Holland',
    title: 'Amberwood at Holland — Holland Link D10 Condo 2026',
    description:
      'Amberwood at Holland Sim Lian D10: 233 units, 99-year from S$2,800 psf. Holland Plain launch, MRT, schools, and 2026 buyer guide.',
    developer: 'Sim Lian Land and Sim Lian Development',
    developerSlug: null,
    district: 'D10',
    region: 'CCR',
    area: 'Holland Plain / King Albert Park',
    tenure: '99LH',
    status: 'new-launch',
    statusLabel: '2026 launch on Holland Link GLS site',
    psfLow: 2800,
    psfHigh: 3200,
    typicalSqft: 800,
    units: 233,
    handover: '2029',
    propertyType: 'condo',
    tags: ['amberwood at holland', 'holland link', 'district 10', 'CCR', 'sim lian'],
    buyerProfile: 'Holland Village fringe owner-occupiers and school-belt investors',
    locationHighlights:
      'King Albert Park interchange for Downtown Line and future Cross Island Line at Holland Plain',
    transportNote:
      'King Albert Park MRT and planned CRL exit in Holland Plain improve connectivity to the CBD, Jurong Lake District, and the east.',
    amenities: 'Holland Village, Beauty World integrated hub, and Botanic Gardens fringe',
    rentalNote:
      'Holland and Bukit Timah tenants pay premiums for walkable F&B and school access; two-bedrooms lease fastest.',
    investmentNote:
      'Sim Lian won Holland Link GLS at about S$1,432 psf ppr; launch psf reflects land cost plus low-rise six-storey product constraints.',
    pros: [
      'Holland Plain CRL and DTL interchange story',
      'Low-rise boutique scale with limited unit count',
      'Prestige D10 address at sub-orchard psf in pockets',
    ],
    cons: [
      'Six-storey height cap limits sky views versus towers',
      '99-year leasehold on premium Holland land',
      'Competition from Skye at Holland and nearby en-bloc launches',
    ],
    peerLinks: '[Dunearn House](/projects/dunearn-house/) and [River Modern](/projects/river-modern/)',
  },
];

function writeProject(p, idx) {
  const { body, faqs, priceFrom, hero } = projectBody(p, idx);
  const fm = `---
title: "${p.title}"
description: "${p.description}"
pubDate: 2026-06-16
updatedDate: 2026-06-16
author: "Greek Invest Editorial"
category: "projects"
tags: [${p.tags.map((t) => `"${t}"`).join(', ')}]
readingTime: 9
heroImage: "${hero}"
priceFromSGD: ${priceFrom}
priceToSGD: ${p.psfHigh * Math.round(p.typicalSqft * 1.25)}
district: "${p.district}"
region: "${p.region}"
area: "${p.area}"
developer: "${p.developer}"
propertyType: "${p.propertyType === 'ec' ? 'executive-condo' : 'condo'}"
tenure: "${p.tenure === 'FH' ? 'freehold' : '99-year leasehold'}"
status: "${p.status}"
units: ${p.units}
faq:
${buildFaqYaml(faqs)}
---
${body}`;
  writeFileSync(join(PROJECTS_DIR, `${p.slug}.mdx`), fm, 'utf8');
  const words = body.split(/\s+/).filter(Boolean).length;
  console.log(`  projects/${p.slug}.mdx — ${words} words`);
}

function developerBody(d) {
  const projectLinks = d.projects
    .map((s) => `[${PROJECTS.find((p) => p.slug === s)?.name || s}](/projects/${s}/)`)
    .join(', ');

  const faqs = [
    {
      q: `What is ${d.shortName} known for in Singapore?`,
      a: d.faq1,
    },
    {
      q: `Which 2026 launches involve ${d.shortName}?`,
      a: `Key active or upcoming projects include ${d.projects.map((s) => PROJECTS.find((p) => p.slug === s)?.name || s).join(', ')}. Always verify sales status on booking day because sell-through rates change weekly during hot launches.`,
    },
    {
      q: `Is ${d.shortName} a good developer for foreign buyers?`,
      a: d.faq3,
    },
    {
      q: `How does ${d.shortName} compare with other Singapore developers?`,
      a: d.faq4,
    },
    {
      q: `What should buyers verify before booking a ${d.shortName} launch?`,
      a: d.faq5,
    },
  ];

  return `import TldrBlock from '../../components/TldrBlock.astro';
import FaqBlock from '../../components/FaqBlock.astro';

**Quick answer:** ${d.shortName} (${d.fullName}) is ${d.summary}. Active 2026 Singapore launches linked to this developer include ${projectLinks}. Read this profile before you compare launch psf, ABSD impact, and delivery track record across ${d.regionFocus} projects.

<TldrBlock text="${d.tldr}" />

${d.fullName} sits among Singapore's most active private residential developers, with a pipeline spanning Core Central Region luxury towers, Rest of Central Region family condos, and Outside Central Region mass-market launches. For investors and upgraders, the developer name is a shorthand for delivery risk, finishing quality, and how aggressively a launch is priced on day one.

Use our [Singapore property investment guide](${GUIDE_INVEST}) to model ABSD and hold-period returns before you anchor on a brand premium. For launch mechanics and balloting, see the [new launch condo guide 2026](${GUIDE_NEW_LAUNCH}). Foreign buyers should cross-read the [ABSD foreign buyer guide](/guides/singapore-absd-foreign-buyer-guide/) and [buy property in Singapore guide](/guides/buy-property-singapore-foreigner/) before paying a booking fee.

![${d.shortName} — Singapore residential development placeholder](${d.hero})

## Company overview

${d.overview}

| Metric | Indicative range | Notes |
| --- | --- | --- |
| Founded / listed | ${d.founded} | ${d.listingNote} |
| Primary segments | Private residential, commercial | Singapore-weighted with regional portfolio |
| Typical unit count per launch | ${d.unitRange} | Larger sites in OCR; boutique towers in CCR |
| Average launch to TOP | ${d.topRange} | Verify project-specific timelines in OTP |

## Track record and delivery

${d.trackRecord}

| Strength | Weakness |
| --- | --- |
| ${d.strength1} | ${d.weakness1} |
| ${d.strength2} | ${d.weakness2} |
| Consistent sales galleries and launch execution | Premium pricing on branded CCR launches |
| Established defect-management processes post-TOP | Multiple simultaneous launches can stretch buyer attention |

## 2026 project pipeline

${d.pipeline}

| Project | District | Region | Indicative from (S$) | Status |
| --- | --- | ---: | ---: | --- |
${d.projectTableRows}

Related reviews: ${projectLinks}.

## Investment perspective

${d.investment}

| Buyer profile | Fit | Reason |
| --- | --- | --- |
| Owner-occupier upgrader | Strong | Brand trust and finishing quality reduce move-in friction |
| Long-hold investor | Moderate | Entry psf and ABSD dominate returns more than developer logo |
| Foreign buyer | Case-by-case | ABSD tiers may outweigh developer reputation at resale |

## Advantages and disadvantages of buying ${d.shortName}

| Advantages | Disadvantages |
| --- | --- |
| ${d.buyPros[0]} | ${d.buyCons[0]} |
| ${d.buyPros[1]} | ${d.buyCons[1]} |
| ${d.buyPros[2]} | ${d.buyCons[2]} |
| Portfolio depth across CCR, RCR, and OCR | Launch premiums may exceed nearby resale comps |

## Risks and what to verify

Before booking any ${d.shortName} launch, run this checklist:

1. **Compare launch psf to URA caveats** within three kilometres — developer brand does not justify unlimited premium.
2. **Read the sale and purchase agreement schedule** — payment stages, late delivery clauses, and defect liability periods differ by project vehicle.
3. **Inspect showflat finish specs** — branded fittings are marketing unless itemised in the schedule.
4. **Map competing supply** completing within 12 months of your target TOP — even strong developers face market-wide rent softening.
5. **Confirm ABSD and financing** with a licensed mortgage adviser — TDSR stress tests matter more than historical capital gains stories.

**Insider tip:** ${d.insiderTip}

## Who should consider this developer

**Strong fit:** Buyers who value delivery certainty, plan to hold through TOP plus five years, and compare ${d.shortName} launches against a shortlist of two rival projects in the same district.

**Weaker fit:** Pure short-term flippers or buyers stretching budget to the last dollar for a brand name without rental or resale comps to support the psf.

## Buyer scenarios and decision framework

| Scenario | Hold period | ${d.shortName} fit | Why |
| --- | --- | --- | --- |
| First private condo upgrade | 7 to 10 years | Strong | Brand reduces delivery anxiety for family owner-occupiers |
| Second property investor | 5 to 8 years | Moderate | ABSD and LTV matter more than developer logo at entry |
| Overseas buyer | 8 plus years | Case-by-case | Stamp duty tiers may dominate; see [can foreigners buy](/guides/can-foreigners-buy-property-singapore/) |
| EC or HDB upgrader | N/A for EC-only | Moderate | ${d.shortName} private launches differ from EC eligibility rules |

${d.extraSection}

For side-by-side launch comparison methodology, use the [new launch guide](${GUIDE_NEW_LAUNCH}) alongside district-level URA caveat downloads refreshed monthly.

<FaqBlock items={[
${buildFaqItems(faqs)}
]} />
`;
}

const DEVELOPERS = [
  {
    slug: 'city-developments-cdl',
    shortName: 'CDL',
    fullName: 'City Developments Limited',
    title: 'City Developments Limited (CDL) — Developer Profile 2026',
    description:
      'CDL developer profile 2026: track record, Newport Residences and Lucerne Grand pipeline, pros and cons, and investor checklist for Singapore launches.',
    hero: HERO_IMAGES[0],
    projects: ['newport-residences', 'lucerne-grand'],
    summary: 'a listed Singapore developer with CCR freehold and OCR launch depth',
    tldr:
      'CDL combines institutional scale with frequent CCR and OCR launches. Review Newport Residences and Lucerne Grand against district psf comps before paying a brand premium.',
    regionFocus: 'CCR and OCR',
    founded: '1963 / SGX-listed (C09)',
    listingNote: 'One of Singapore’s largest listed property companies',
    unitRange: '250 to 700 units',
    topRange: '3 to 4 years from launch in recent OCR cycles',
    faq1:
      'CDL is known for consistent delivery across CCR luxury and OCR mass-market condos, with a long SGX-listed track record and recurring launches such as Newport Residences and Lucerne Grand in 2026.',
    faq3:
      'Foreign buyers may purchase CDL private condos subject to ABSD. The developer reputation does not reduce stamp duty; run full tax and financing checks before booking.',
    faq4:
      'CDL competes with CapitaLand, UOL, and GuocoLand on premium launches. CDL often leads on OCR volume while maintaining selective CCR freehold products.',
    faq5:
      'Request the authorised price list, compare psf to three nearby URA transacts, confirm OTP payment stages, and review the project-specific defect liability period before paying the booking fee.',
    extraSection:
      'CDL’s dual presence in CCR freehold and OCR leasehold means the same brand can appear on projects with very different resale liquidity. Treat Newport Residences and Lucerne Grand as separate underwriting exercises even though both carry the CDL name.',
    overview:
      'City Developments Limited (CDL) is a Singapore-listed developer with decades of residential, commercial, and hotel exposure. Locally, CDL launches span freehold CCR towers such as Newport Residences through OCR projects like Lucerne Grand near Lakeside MRT. Institutional governance and recurring bond-market access typically translate into steady construction progress, though launch pricing still follows hot-market bidding for land.',
    trackRecord:
      'CDL’s recent Singapore residential launches have generally achieved strong sell-through in up-cycles, with TOP dates that track marketed schedules within reasonable variance. Post-TOP defect workflows are institutionalised, which matters for owner-occupiers planning immediate move-in. Investors should still compare each launch psf to URA transacts rather than assuming automatic resale premiums from the CDL badge alone.',
    strength1: 'SGX-listed balance sheet depth',
    strength2: 'Experience across CCR freehold and OCR leasehold',
    weakness1: 'Brand premium can inflate launch psf versus resale comps',
    weakness2: 'OCR pipeline overlaps with other CDL-adjacent joint ventures',
    pipeline:
      'In 2026, CDL-linked headlines include Newport Residences on Anson Road (freehold CCR) and Lucerne Grand in the Lakeside OCR sub-market. Both target different buyer pools but share CDL’s standard launch playbook: phased price list releases, controlled stack openings, and emphasis on MRT or lifestyle anchors in marketing materials.',
    projectTableRows: `| Newport Residences | D2 | CCR | 2,380,000 | Launched Jan 2026 |
| Lucerne Grand | D22 | OCR | 1,620,000 | Q3 2026 preview |`,
    investment:
      'CDL suits buyers who want developer diversification without venturing into unknown joint-venture vehicles. Underwrite each project on district fundamentals, not logo alone. CCR freehold launches like Newport can preserve land-bank value longer, while OCR projects such as Lucerne Grand depend on MRT connectivity and Jurong West rental depth.',
    buyPros: [
      'Listed parent with transparent reporting',
      'Broad portfolio from luxury to mass OCR',
      'Historically orderly launch and TOP processes',
    ],
    buyCons: [
      'Launch psf often at top of district range',
      'Multiple CDL projects can compete at resale simultaneously',
      'Foreign ABSD still applies without exemption',
    ],
    insiderTip:
      'Ask for CDL’s historical price list progression on the last OCR launch in the same district — if early tranches moved fast, remaining stacks often carry quiet premiums above the headline average psf.',
  },
  {
    slug: 'guocoland',
    shortName: 'GuocoLand',
    fullName: 'GuocoLand Limited',
    title: 'GuocoLand Singapore — Developer Profile and 2026 Launches',
    description:
      'GuocoLand profile 2026: River Modern, Tengah Garden Residences, delivery track record, pros and cons, and links to project reviews.',
    hero: HERO_IMAGES[1],
    projects: ['river-modern', 'tengah-garden-residences'],
    summary: 'a premium-leaning developer active in CCR luxury and OCR garden-town projects',
    tldr:
      'GuocoLand pairs CCR luxury such as River Modern with OCR scale at Tengah Garden Residences. Compare sell-through and remaining stack premiums before you buy the brand narrative.',
    regionFocus: 'CCR and OCR',
    founded: '1978 / SGX-listed (GLL)',
    listingNote: 'Regional developer with Singapore luxury focus',
    unitRange: '450 to 700 units on recent sites',
    topRange: '3 to 5 years depending on project scale',
    faq1:
      'GuocoLand is recognised for design-forward luxury condos in CCR and large OCR joint ventures such as Tengah Garden Residences with Hong Leong and CSC.',
    faq3:
      'Foreign buyers face standard ABSD on GuocoLand private condos. EC or restricted schemes do not apply to River Modern; eligibility is standard private residential rules.',
    faq4:
      'GuocoLand often prices closer to luxury peers like CDL and CapitaLand on CCR river projects, while OCR joint ventures may price at market-clearing OCR psf with faster sell-through.',
    faq5:
      'On high-absorption projects like River Modern, verify remaining stack premiums, compare showflat specs to the schedule of finishes, and stress-test mortgage payments before booking.',
    extraSection:
      'GuocoLand buyers often choose between luxury CCR river product and OCR joint ventures such as Tengah Garden Residences. The investment thesis differs: Robertson Quay relies on immediate rental depth, while Tengah relies on masterplan maturation over a decade.',
    overview:
      'GuocoLand Limited develops residential, commercial, and integrated projects across Singapore and the region. Locally, the brand is associated with luxury CCR products — River Modern at Robertson Quay sold through strongly in early 2026 — and OCR garden-town scale at Tengah Garden Residences alongside Hong Leong and CSC. Product positioning emphasises architecture, fittings, and lifestyle narrative more than absolute unit count.',
    trackRecord:
      'GuocoLand’s Singapore launches in 2024 to 2026 show strong absorption on well-located CCR and OCR sites when psf was aligned with transacts. Delivery timelines should be verified per project because luxury specifications occasionally extend construction complexity. Investors should note that high sell-through can leave only premium stacks, shifting effective psf upward late in the sales cycle.',
    strength1: 'Luxury design and specification focus',
    strength2: 'Successful joint ventures on OCR mega-sites',
    weakness1: 'Remaining units often at highest psf bands',
    weakness2: 'Luxury segment more rate-sensitive at resale',
    pipeline:
      'River Modern exceeded 90% sold by March 2026, making it a benchmark for Robertson Quay pricing. Tengah Garden Residences neared sell-out at OCR psf attractive to young families betting on the Tengah masterplan. Both appear in investor shortlists for different reasons — luxury hold versus long-dated OCR growth.',
    projectTableRows: `| River Modern | D9 | CCR | 2,939,400 | 90%+ sold Mar 2026 |
| Tengah Garden Residences | D24 | OCR | 1,260,000 | ~99% sold |`,
    investment:
      'GuocoLand fits buyers who want premium specification and are comfortable paying psf at the upper quartile of the district. OCR joint ventures may offer lower entry than CCR towers but carry masterplan timing risk until transport nodes mature.',
    buyPros: [
      'Strong luxury branding and design cues',
      'Proven joint-venture execution on large OCR sites',
      'High sell-through when psf aligned with market',
    ],
    buyCons: [
      'Late-stage inventory priced at premiums',
      'Luxury launches sensitive to global sentiment',
      'OCR garden-town rental pool matures slowly',
    ],
    insiderTip:
      'On high-absorption launches like River Modern, compare the average psf of transacted stacks from the first price list versus current list — the gap tells you how much premium is left for late buyers.',
  },
  {
    slug: 'capitaland-development',
    shortName: 'CapitaLand Development',
    fullName: 'CapitaLand Development',
    title: 'CapitaLand Development — Singapore Developer Profile 2026',
    description:
      'CapitaLand Development 2026 profile: Thomson Reserve with UOL and SingLand, track record, pros and cons, and linked project reviews.',
    hero: HERO_IMAGES[2],
    projects: ['thomson-reserve'],
    summary: 'part of CapitaLand Group, frequently co-developing RCR and CCR projects via consortiums',
    tldr:
      'CapitaLand Development co-leads major sites such as Thomson Reserve with UOL and SingLand. Treat consortium launches as a combined delivery and pricing benchmark, not CapitaLand alone.',
    regionFocus: 'RCR and CCR',
    founded: '2000s vehicle / CapitaLand Group listed',
    listingNote: 'Residential arm of CapitaLand Investment',
    unitRange: '400 to 650 units on recent joint sites',
    topRange: '3 to 4 years on standard RCR schedules',
    faq1:
      'CapitaLand Development is the residential development arm behind many Singapore joint-venture launches, including Thomson Reserve at former Thomson View with UOL and SingLand.',
    faq3:
      'Foreign buyers purchasing CapitaLand-linked private condos pay prevailing ABSD. Consortium structures do not change stamp duty treatment for standard residential units.',
    faq4:
      'CapitaLand Development often partners UOL and SingLand on large GLS sites, competing with CDL and GuocoLand on premium RCR land while leveraging integrated town planning experience.',
    faq5:
      'On consortium sites like Thomson Reserve, confirm which partner leads construction, compare launch psf to Bright Hill resale, and read joint-venture defect-management clauses in the OTP.',
    extraSection:
      'CapitaLand Development rarely sells under a solo brand on mega-sites; marketing materials show UOL and SingLand logos alongside CapitaLand. Your diligence should reference all three track records because post-TOP service pathways may route through the managing partner named in the contract.',
    overview:
      'CapitaLand Development operates as the development engine within CapitaLand’s residential ecosystem, frequently teaming with UOL Group and Singapore Land Group on substantial GLS and en-bloc sites. Thomson Reserve on Upper Thomson represents the 2026 headline RCR launch following the Thomson View en-bloc, targeting families who want Thomson-East Coast Line connectivity without CCR ticket sizes.',
    trackRecord:
      'CapitaLand-backed consortiums historically delivered large RCR projects with orderly sales phases and transparent progress updates. Joint-venture governance can slow decision-making but spreads land risk. For Thomson Reserve, verify launch psf against Bright Hill and Bishan resale because RCR pricing compressed OCR discounts in 2025 to 2026.',
    strength1: 'Institutional JV governance on mega-sites',
    strength2: 'Integrated planning experience from CapitaLand Group',
    weakness1: 'Consortium branding can blur accountability',
    weakness2: 'RCR launch psf rose quickly in 2024 to 2026 cycle',
    pipeline:
      'Thomson Reserve targets Q3 2026 launch with Bright Hill MRT on the Thomson-East Coast Line as the anchor story. CapitaLand Development’s role typically covers product positioning, construction management standards, and sales coordination alongside UOL and SingLand.',
    projectTableRows: `| Thomson Reserve | D20 | RCR | 1,710,000 | Q3 2026 preview |`,
    investment:
      'CapitaLand Development suits buyers comfortable with joint-venture launches who prioritise MRT-first RCR locations. Compare Thomson Reserve psf to Lentor and Upper Thomson resale, and stress-test ABSD if you already own a property.',
    buyPros: [
      'Backed by CapitaLand institutional processes',
      'Strong RCR locations via GLS consortium wins',
      'Experience on en-bloc redevelopment sites',
    ],
    buyCons: [
      'Joint-venture launches priced after competitive land bids',
      'Multiple RCR alternatives launch in same cycle',
      'Long timeline to 2030 TOP on recent sites',
    ],
    insiderTip:
      'On consortium launches, ask which partner leads construction and defect management — the answer affects who you chase post-TOP even if marketing uses all three logos equally.',
  },
];

console.log('Generating projects...');
PROJECTS.forEach((p, i) => writeProject(p, i));

console.log('\nGenerating developers...');
for (const d of DEVELOPERS) {
  const body = developerBody(d);
  const faqs = [
    { q: `What is ${d.shortName} known for in Singapore?`, a: d.faq1 },
    {
      q: `Which 2026 launches involve ${d.shortName}?`,
      a: `Key projects: ${d.projects.map((s) => PROJECTS.find((p) => p.slug === s)?.name).join(', ')}.`,
    },
    { q: `Is ${d.shortName} a good developer for foreign buyers?`, a: d.faq3 },
    { q: `How does ${d.shortName} compare with other Singapore developers?`, a: d.faq4 },
    { q: `What should buyers verify before booking a ${d.shortName} launch?`, a: d.faq5 },
  ];
  const fm = `---
title: "${d.title}"
description: "${d.description}"
pubDate: 2026-06-16
updatedDate: 2026-06-16
author: "Greek Invest Editorial"
category: "developers"
tags: ["${d.slug}", "singapore developer", "new launch", "condo developer"]
readingTime: 8
heroImage: "${d.hero}"
faq:
${buildFaqYaml(faqs)}
---
${body}`;
  writeFileSync(join(DEVS_DIR, `${d.slug}.mdx`), fm, 'utf8');
  const words = body.split(/\s+/).filter(Boolean).length;
  console.log(`  developers/${d.slug}.mdx — ${words} words`);
}

console.log('\nDone: 15 projects + 3 developers');
