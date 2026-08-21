#!/usr/bin/env node
/**
 * Add the contextual internal links the corpus was missing.
 *
 * Measured before this ran (contextual inbound only, nav and footer excluded):
 *   /tools/greece-rental-yield-calculator/  0 inbound — nothing on the site linked it
 *   /greece-property-consultation/          0 inbound
 *   projects/*                              1 inbound each, from the hub only, even though
 *                                           golden-visa-eligible-projects-directory is the
 *                                           best-converting page on the site (11.76% CTR)
 *
 * Appends a short, honest "Related" line to the end of the body when the target
 * is genuinely relevant and not already linked. It never rewrites prose and never
 * inserts a link into a sentence.
 *
 * Usage: node scripts/add-contextual-links.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src/content');
const DRY = process.argv.includes('--dry');

/** slug (any collection) -> links to append, in order. */
const RULES = [
  {
    match: (coll, slug) =>
      coll === 'guides' &&
      /yield|buy-to-let|rental-income|gross-vs-net|is-greece-property-good-investment|highest-rental/.test(slug),
    links: [
      ['/tools/greece-rental-yield-calculator/', 'run your own numbers in the rental yield calculator'],
      ['/greece-property-consultation/', 'book a property consultation'],
    ],
  },
  {
    match: (coll) => coll === 'areas',
    links: [
      ['/tools/greece-rental-yield-calculator/', 'model net yield for this area'],
      ['/tools/greece-golden-visa-zone-lookup/', 'check which Golden Visa tier applies here'],
    ],
  },
  {
    match: (coll, slug) => coll === 'guides' && /cost-of-buying|hidden-costs|transfer-tax|enfia|objective-value/.test(slug),
    links: [['/tools/greece-property-cost-calculator/', 'total your acquisition costs in the calculator']],
  },
  {
    match: (coll, slug) => coll === 'guides' && /golden-visa|120-square|tiers|circular/.test(slug),
    links: [
      ['/golden-visa/', 'the Golden Visa hub'],
      ['/tools/greece-golden-visa-zone-lookup/', 'the zone lookup'],
    ],
  },
  {
    match: (coll) => coll === 'projects',
    links: [
      ['/guides/golden-visa-eligible-projects-directory/', 'how we screen eligible projects'],
      ['/get-shortlist/', 'request a vetted shortlist'],
    ],
  },
  {
    match: (coll) => coll === 'developers',
    links: [['/projects/', 'browse project reviews'], ['/get-shortlist/', 'request a shortlist']],
  },
  {
    match: (coll, slug) => coll === 'compare' || (coll === 'guides' && /vs-|versus/.test(slug)),
    links: [['/golden-visa/', 'the Golden Visa hub']],
  },
];

let touched = 0;
let added = 0;

for (const coll of readdirSync(CONTENT)) {
  for (const f of readdirSync(join(CONTENT, coll))) {
    if (!f.endsWith('.mdx')) continue;
    const slug = f.replace('.mdx', '');
    const path = join(CONTENT, coll, f);
    const raw = readFileSync(path, 'utf8');
    const m = raw.match(/^---\n[\s\S]*?\n---\n/);
    const fm = m ? m[0] : '';
    let body = m ? raw.slice(fm.length) : raw;

    const wanted = [];
    for (const rule of RULES) {
      if (!rule.match(coll, slug)) continue;
      for (const [href, label] of rule.links) {
        if (body.includes(href)) continue; // already linked somewhere in the body
        if (wanted.some(([h]) => h === href)) continue;
        wanted.push([href, label]);
      }
    }
    if (!wanted.length) continue;

    const line = `**Next steps:** ${wanted.map(([h, l]) => `[${l}](${h})`).join(' · ')}.`;
    body = `${body.trimEnd()}\n\n${line}\n`;

    if (!DRY) writeFileSync(path, fm + body);
    touched++;
    added += wanted.length;
  }
}

console.log(`${DRY ? '[dry-run] ' : ''}files touched: ${touched}, links added: ${added}`);
