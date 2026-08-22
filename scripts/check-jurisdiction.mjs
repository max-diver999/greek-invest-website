#!/usr/bin/env node
/**
 * Fail the build when a page talks about the wrong country.
 *
 * This exists because a keyword hunt for known-bad words (Phuket, Mexico, THB)
 * missed /methodology/ and /privacy-policy/, which were still the UAE template:
 * "DLD, AMPI, ICA visa rules", "Official UAE government and emirate-level
 * portals", "AMPI-licensed partner". Both were linked from all 139 article
 * pages. Searching for the wrong words you already know about only ever finds
 * the wrong words you already know about.
 *
 * So this check is inverted. Any occurrence of a foreign-jurisdiction term is
 * an error unless the file is an explicitly comparative page (Greece vs Dubai,
 * UAE buyers) where naming the other country is the entire point.
 *
 * Usage: node scripts/check-jurisdiction.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

/**
 * Tier 1: foreign regulators, licensing bodies and land registries. These name
 * an authority that has no jurisdiction over Greek property, so they are wrong
 * on any page of this site, including a comparison page, unless that page is
 * explicitly about that country's process. This is the tier that would have
 * caught "DLD, AMPI, ICA visa rules" and "AMPI-licensed partner".
 */
const FOREIGN_AUTHORITIES = [
  'AMPI', 'DLD', 'RERA', 'DTCM', 'ICA visa', 'Deeds Office', 'URA', 'HDB',
  'Land Department', 'Chanote', 'Fideicomiso',
];

/**
 * Tier 2: country names and currencies. Legitimate in body content, a foreign
 * buyer's currency and home city are ordinary subject matter, but never
 * legitimate in site chrome or on a legal page, where they mean the template
 * was never localised.
 */
const FOREIGN_PLACES = [
  'UAE', 'Dubai', 'Abu Dhabi', 'emirate', 'AED', 'dirham',
  'Mexico', 'Mexican', 'Tulum', 'Cancun', 'MXN',
  'Thailand', 'Phuket', 'Bangkok', 'THB', 'Samui',
  'Cape Town', 'South Africa', 'ZAR',
  'SGD', 'Singapore',
];

/**
 * Pages whose subject legitimately includes another country's process, so even
 * a foreign authority may be named there.
 */
const COMPARATIVE = /(compare\/|-vs-|uae-buyers|dubai)/i;

/**
 * Chrome, legal and policy pages. These describe this site and this business,
 * so any foreign place or currency here is un-localised template.
 */
const CHROME = /^src\/(layouts|components|data)\/|^src\/pages\/(methodology|privacy-policy|terms|about|contact)\//;

const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(astro|mdx|ts)$/.test(entry)) files.push(full);
  }
}
walk(join(ROOT, 'src'));

const errors = [];
function scan(text, rel, terms, label) {
  const found = [];
  for (const term of terms) {
    const re = new RegExp(`(^|[^A-Za-z])${term}(?![A-Za-z])`, 'g');
    const hits = [...text.matchAll(re)];
    if (!hits.length) continue;
    const line = text.slice(0, hits[0].index).split('\n').length;
    found.push(`${rel}:${line}  ${label}: "${term}" \u00d7${hits.length}`);
  }
  return found;
}

for (const file of files) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');

  if (!COMPARATIVE.test(rel)) {
    errors.push(...scan(text, rel, FOREIGN_AUTHORITIES, 'foreign authority'));
  }
  if (CHROME.test(rel)) {
    errors.push(...scan(text, rel, FOREIGN_PLACES, 'un-localised chrome'));
  }
}

console.log('=== JURISDICTION GATE ===');
console.log(`Files scanned: ${files.length}`);

if (errors.length) {
  console.log(`\n❌ FAIL — ${errors.length} foreign-jurisdiction reference(s) outside comparative pages\n`);
  for (const e of errors) console.log(`  ${e}`);
  console.log('\nThis site is about Greece. Either rewrite the page for Greece, or, if the');
  console.log('page genuinely compares jurisdictions, name it so COMPARATIVE matches it.');
  process.exit(1);
}

console.log('✅ PASS — no foreign-jurisdiction residue outside comparative pages');
