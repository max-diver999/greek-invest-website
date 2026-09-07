/**
 * Corpus-level signals: the part of the rubric a single article cannot fake.
 *
 * Everything here is measured across the whole corpus at once, because the
 * failure mode we are defending against is mechanical: an agent told to "raise
 * the score" edits many files with one templated mutation. That is invisible
 * when you score a file in isolation and obvious when you look at all of them
 * together. Measured on the labelled sets (59 machine-injected files from
 * commit 9cda569 vs 10 written by hand):
 *
 *   cross-file 9-gram duplication   15.6%  vs   1.0%
 *   sentence skeletons in 3+ files    127  vs     2
 *
 * Signals that sounded plausible and did NOT survive measurement are listed in
 * docs/GEO-SCORING.md so nobody re-adds them on intuition.
 */

const SHINGLE_N = 9;
export const MAX_BOILERPLATE_LINES = 8;

/**
 * Passages that are meant to be identical everywhere (legal disclaimers, the
 * standing note about modelled yields). They are declared in a file rather than
 * pattern-matched, so that exempting a passage is a visible, reviewable act.
 */
let boilerplateCache = null;
export function boilerplateLines() {
  if (boilerplateCache) return boilerplateCache;
  const p = new URL('../../../.content-os/boilerplate.txt', import.meta.url);
  let lines = [];
  try {
    lines = fs.readFileSync(p, 'utf8').split('\n');
  } catch { lines = []; }
  const declared = lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim());

  // A red team appended every colliding sentence in the corpus to this file and
  // lifted the mean by 3.5 points in five minutes, because stripBoilerplate
  // deletes whatever is declared here before anything is measured. So the file
  // is capped: an exemption list long enough to hide a template is refused
  // outright rather than trusted, and short fragments are ignored because a
  // genuine disclaimer is a whole sentence.
  const usable = declared.filter((l) => l.split(' ').length >= 12);
  if (usable.length > MAX_BOILERPLATE_LINES) {
    throw new Error(
      `.content-os/boilerplate.txt declares ${usable.length} passages; the limit is ${MAX_BOILERPLATE_LINES}. ` +
        'This file exempts text from duplication detection, so a long list defeats the check it belongs to.',
    );
  }
  boilerplateCache = usable;
  return boilerplateCache;
}

function stripBoilerplate(text) {
  let out = text;
  for (const b of boilerplateLines()) {
    if (!b) continue;
    const re = new RegExp(b.split(' ').map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^a-zA-Z0-9]+'), 'gi');
    out = out.replace(re, ' ');
  }
  return out;
}

/** Sentence skeleton: drop the specifics, keep the shape, so paraphrase farms still collide. */
export function skeleton(sentence) {
  return sentence
    .replace(/\d[\d,.]*/g, '#')
    .replace(/\b[A-Z][a-z]+\b/g, 'X')
    .toLowerCase()
    .replace(/[^a-z#x\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12)
    .join(' ');
}

import fs from 'node:fs';

export function plainText(raw) {
  return raw
    .replace(/^---\n[\s\S]*?\n---\n?/, '')
    .replace(/^\s*(?:import|export)\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    // Keep the span's content, the same way link text is kept two lines above.
    // Deleting it left dangling punctuation: a sentence citing "dataset
    // `prc_ppp_ind`, indicator `PLI_EU27_2020`, geography Greece" became
    // "dataset , indicator , geography Greece", and the malformed-token rule
    // then charged that gap as broken output and capped the article at 40.
    // A code span in this corpus is an identifier the sentence depends on, so
    // any page citing a dataset, slug or script name was penalised for it.
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\|.*$/gm, ' ')
    .replace(/^#{1,6}.*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Text for duplication detection only.
 *
 * plainText drops table rows because table cells are not prose and wreck the
 * rhythm and paragraph-length measures that score writing quality. But dropping
 * them here would mean a comparison table cloned across eight pages costs
 * nothing, which is exactly the mutation this detector exists to catch. So
 * duplication runs over prose plus table cell text, and the quality rubrics run
 * over prose alone.
 */
export const MAX_CITATION_TRAILER_WORDS = 120;

/**
 * A source trailer is a citation, not prose, and two articles that rest on the
 * same statute should cite it with the same words. Penalising that pushes a
 * writer toward vaguer attribution to dodge a collision, which is the opposite
 * of what this rubric is for, so the trailer is removed before duplication is
 * measured.
 *
 * The exemption is deliberately narrow, because "text that does not count"
 * is the shape of every hole a red team looks for. It applies only to the
 * final block of the document, only when that block opens with "Sources:",
 * and only up to MAX_CITATION_TRAILER_WORDS. A trailer longer than the bound
 * is measured in full rather than truncated: an author who moves an article
 * into its own bibliography gets no discount at all.
 */
export function stripCitationTrailer(text) {
  const m = text.match(/\bSources:\s[^]*$/);
  if (!m) return text;
  const trailer = m[0];
  if ((trailer.match(/\b[\w']+\b/g) || []).length > MAX_CITATION_TRAILER_WORDS) return text;
  return text.slice(0, m.index).trim();
}

export function duplicationText(raw) {
  // plainText drops JSX tags and backtick spans, so prose moved into a component
  // prop or a code span disappears from the detector. Recover the human-readable
  // parts of both: a red team hid 14,522 words this way for a 3.1 point gain.
  const componentText = (raw.match(/(?:text|answer|question|description|title)\s*=\s*"([^"]{40,})"/g) || [])
    .map((m) => m.replace(/^[^"]*"/, '').replace(/"$/, ''))
    .join(' ');
  const codeSpans = (raw.match(/`([^`]{40,})`/g) || []).map((m) => m.slice(1, -1)).join(' ');
  const tableCells = raw
    .split('\n')
    .filter((l) => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]*\|?\s*$/.test(l))
    .map((l) => l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').join(' '))
    .join(' ');
  // The trailer is stripped from the prose alone, before the table and component
  // text is appended, because it is the end of the prose and not the end of the
  // concatenation.
  const prose = stripCitationTrailer(plainText(raw));
  return [prose, tableCells, componentText, codeSpans]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function words(text) {
  return text.match(/\b[\w']+\b/g) || [];
}

export function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => words(s).length > 3);
}

/**
 * Figure phrases: "€620,000", "7.5%", "14 business days" — the unit matters,
 * the bare digit does not.
 *
 * The pattern and the key normaliser live here, and every consumer imports
 * them, because they used to be copy-pasted into three files. Porting this
 * scorer from a rand site to a euro one meant editing the same regex in five
 * places, and a copy missed is a detector that silently returns nothing.
 *
 * `billion` is in the alternation for a corpus reason, not a stylistic one:
 * this site writes "€8 billion" 35 times and never "€8bn", and without the
 * word the match truncates to "€8", which is also a real amount here. The
 * national FDI figure and an eight-euro charge would then share one key.
 */
export const FIGURE_RE =
  /(?:€\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:million|billion|bn|k))?|\d+(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?\s*(?:business\s+)?(?:days?|weeks?|months?|years?))/gi;

/**
 * Money and percentages without the durations, for the report-only orphan-figure
 * pass. It is a separate export rather than a fourth copy of the pattern: the
 * copy it replaces still read `R\s?\d` after the currency port, and with the `i`
 * flag and no lookbehind that matches the "r 3" inside "under 3 years". The
 * playbook's grep finds five hard-coded currency patterns; this was a sixth.
 */
export const MONEY_OR_PERCENT_RE =
  /(?:€\s?\d[\d,]*(?:\.\d+)?(?:\s*(?:million|billion|bn|k))?|\d+(?:\.\d+)?%)/gi;

const SUFFIX_ZEROS = { k: 3, million: 6, bn: 9, billion: 9 };

/**
 * One amount, one key.
 *
 * Two things fragmented the keys on this corpus, and both cost the detector
 * its subject rather than merely its tidiness.
 *
 * `[\d,]*` is greedy over commas, so "€800,000, and the regional tier" matched
 * "€800,000," — a key that ends in a comma is not a figure, and it split the
 * Golden Visa threshold across 119 files under one spelling and 27 under
 * another. And the site writes the same threshold as both "€800,000" and
 * "€800K" (1,091 K-suffixed amounts in the corpus), which is one claim about
 * the world written two ways: keyed separately, a page saying "€800K" gets a
 * different provenance verdict from the page beside it saying "€800,000".
 *
 * Only suffixed amounts are rewritten. A plain "€1,500" keeps its own spelling,
 * so the change cannot quietly restate figures it was not asked to touch.
 *
 * Scaling is done by shifting the digit string rather than multiplying, because
 * 2.06 * 1e9 is 2060000000.0000002 in floating point and that would key the
 * national FDI figure to a number that appears nowhere on the site.
 */
export function canonicalFigure(match) {
  const s = match.trim().replace(/\s+/g, ' ').toLowerCase().replace(/[,.;:]+$/, '');
  const m = s.match(/^€\s?([\d,]*\d)(?:\.(\d+))?\s*(k|million|billion|bn)$/);
  if (!m) return s;
  const zeros = SUFFIX_ZEROS[m[3]];
  const frac = m[2] || '';
  const digits = m[1].replace(/,/g, '') + frac;
  const scaled = frac.length > zeros
    ? `${digits.slice(0, digits.length - (frac.length - zeros))}.${digits.slice(digits.length - (frac.length - zeros))}`
    : digits + '0'.repeat(zeros - frac.length);
  const [whole, dec] = scaled.split('.');
  return `€${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${dec ? `.${dec}` : ''}`;
}

export function figurePhrases(text) {
  return (text.match(FIGURE_RE) || []).map(canonicalFigure);
}

function shingleSet(text) {
  const w = words(stripBoilerplate(text)).map((x) => x.toLowerCase());
  const out = new Set();
  for (let i = 0; i + SHINGLE_N <= w.length; i += 1) out.add(w.slice(i, i + SHINGLE_N).join(' '));
  return out;
}

/**
 * @param {{id: string, raw: string}[]} docs every article in the corpus
 */
export function buildCorpusIndex(docs) {
  const prepared = docs.map((d) => {
    const text = plainText(d.raw);
    const dupText = duplicationText(d.raw);
    return {
      id: d.id,
      text,
      shingles: shingleSet(dupText),
      sentences: sentences(stripBoilerplate(dupText)),
    };
  });

  const shingleOwners = new Map();
  const skeletonOwners = new Map();
  const figureCounts = new Map();

  for (const doc of prepared) {
    for (const s of doc.shingles) {
      if (!shingleOwners.has(s)) shingleOwners.set(s, new Set());
      shingleOwners.get(s).add(doc.id);
    }
    const seenSkeletons = new Set();
    for (const sentence of doc.sentences) {
      const sk = skeleton(sentence);
      if (!sk || seenSkeletons.has(sk)) continue;
      seenSkeletons.add(sk);
      if (!skeletonOwners.has(sk)) skeletonOwners.set(sk, new Set());
      skeletonOwners.get(sk).add(doc.id);
    }
    for (const f of new Set(figurePhrases(doc.text))) {
      figureCounts.set(f, (figureCounts.get(f) || 0) + 1);
    }
  }

  return { prepared, shingleOwners, skeletonOwners, figureCounts, docCount: prepared.length };
}

/** Thresholds are absolute, not corpus-relative: a corpus-relative rule shifts when you poison the corpus. */
export const SHARED_SKELETON_MIN_FILES = 3;
export const SATURATED_FIGURE_MIN_FILES = 8;
export const SATURATED_FIGURE_MIN_SHARE = 0.25;

export function analyseDoc(docId, index) {
  const doc = index.prepared.find((d) => d.id === docId);
  if (!doc) throw new Error(`document not in corpus index: ${docId}`);

  let duplicated = 0;
  const duplicateSources = new Map();
  for (const s of doc.shingles) {
    const owners = index.shingleOwners.get(s);
    if (owners && owners.size > 1) {
      duplicated += 1;
      for (const o of owners) if (o !== docId) duplicateSources.set(o, (duplicateSources.get(o) || 0) + 1);
    }
  }
  const duplicateShare = doc.shingles.size ? duplicated / doc.shingles.size : 0;
  // Share alone rewards deletion: cut the page in half and the ratio improves.
  // The absolute count is what an editor actually has to rewrite.
  const duplicatedWords = duplicated;

  const sharedSkeletons = [];
  const seen = new Set();
  for (const sentence of doc.sentences) {
    const sk = skeleton(sentence);
    if (!sk || seen.has(sk)) continue;
    seen.add(sk);
    const owners = index.skeletonOwners.get(sk);
    if (owners && owners.size >= SHARED_SKELETON_MIN_FILES) {
      sharedSkeletons.push({ skeleton: sk, files: owners.size, example: sentence.slice(0, 120) });
    }
  }

  const saturatedFigures = [];
  const minFiles = Math.max(
    SATURATED_FIGURE_MIN_FILES,
    Math.ceil(index.docCount * SATURATED_FIGURE_MIN_SHARE),
  );
  for (const f of new Set(figurePhrases(doc.text))) {
    const n = index.figureCounts.get(f) || 0;
    if (n >= minFiles) saturatedFigures.push({ figure: f, files: n });
  }

  return {
    id: docId,
    duplicateShare,
    duplicatedWords,
    duplicatedShingles: duplicated,
    totalShingles: doc.shingles.size,
    topDuplicateSources: [...duplicateSources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
    sharedSkeletons: sharedSkeletons.sort((a, b) => b.files - a.files),
    saturatedFigures: saturatedFigures.sort((a, b) => b.files - a.files),
  };
}
