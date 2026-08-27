#!/usr/bin/env node
/**
 * Calibration harness for the GEO scorer.
 *
 * The point of this file is that a scoring rubric is a hypothesis, and a
 * hypothesis needs a test set. Ours is labelled by history:
 *
 *   bad/  the 114 files commit 525fb89 rewrote ("second GEO pass — commercial
 *         corpus 114/114 at 90+", 4 July 2026, +22,918 lines). The agent hit 90
 *         by restating each heading as its own opening sentence (443 of them)
 *         and pasting one templated paragraph under every H2, complete with an
 *         invented underwriting desk. The cleanup commit 21f6380 later stripped
 *         197k words of it.
 *   good/ articles written by hand, section by section, in August 2026. None
 *         of them existed at the garbage commit, so the two sets do not
 *         overlap on a single file.
 *   mid/  pages that were garbage at 525fb89, were stripped, and then had
 *         hand-written openers and a citable passage inserted by script:
 *         honest prose assembled semi-automatically. Should sit between.
 *
 * A rubric is only worth shipping if it separates bad from good. Run:
 *   node scripts/geo-calibrate.mjs --prepare      # rebuild the labelled sets
 *   node scripts/geo-calibrate.mjs                # score them and report separation
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const LAB = '/tmp/geo-lab';
const GARBAGE_COMMIT = '525fb89';
const HANDWRITTEN = [
  'greece-tax-changes-2026-law-5246',
  'greece-non-dom-tax-regime-5a-guide',
  'greece-golden-visa-plus-non-dom-strategy',
  'greece-golden-visa-statistics-2026',
  'athens-riviera-vs-crete-golden-visa',
  'greece-7-percent-pension-tax-retirees',
  'greece-golden-visa-without-property',
  'greece-golden-visa-350k-fund-route',
  'greece-golden-visa-250k-heritage-restoration',
  'greece-property-price-index-by-region-2026',
];
const MIDDLE = [
  'greece-rental-yield-guide',
  'cost-of-buying-property-greece',
  'buy-property-greece-foreigner',
  'greece-golden-visa-120-square-meter-rule',
  'greece-golden-visa-timeline-application-2026',
  'greece-property-investment-guide',
  'greece-golden-visa-250000-conversion-route',
];

/**
 * Slugs are resolved across every collection rather than assumed to live in
 * guides/. One hand-written article is a comparison page, and hard-coding
 * src/content/guides silently dropped it from the labelled set: fs.existsSync
 * returned false and the file was skipped without a word, which is the failure
 * mode this whole harness exists to prevent.
 */
const COLLECTION_ROOT = 'src/content';

function findSlug(slug) {
  const stack = [COLLECTION_ROOT];
  while (stack.length) {
    const dir = stack.pop();
    if (!fs.existsSync(dir)) continue;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (e.name === `${slug}.mdx`) return full;
    }
  }
  return null;
}

function prepare() {
  for (const d of ['bad', 'good', 'mid']) {
    fs.rmSync(path.join(LAB, d), { recursive: true, force: true });
    fs.mkdirSync(path.join(LAB, d), { recursive: true });
  }
  // The garbage set is the files this commit REWROTE, not every file that
  // existed when it landed. Taking the whole tree swept in 14 developer and
  // project pages the injection never touched, and they then sat in the bad set
  // scoring up to 46 — which reads as the scorer failing when in fact the label
  // was wrong.
  //
  // The threshold is not tuned. Insertions per file at this commit are strictly
  // bimodal: 114 files received 50 or more lines (median 184) and 14 received
  // exactly one, with nothing at all in between. Fifty sits in an empty gap, and
  // 114 is the number the commit message itself claims.
  const REWRITE_MIN_INSERTIONS = 50;
  const listed = execFileSync('git', ['show', '--numstat', '--format=', GARBAGE_COMMIT, '--', COLLECTION_ROOT])
    .toString().trim().split('\n')
    .map((l) => l.split('\t'))
    .filter(([ins, , f]) => f && f.endsWith('.mdx') && Number(ins) >= REWRITE_MIN_INSERTIONS)
    .map(([, , f]) => f);
  let n = 0;
  for (const f of listed) {
    try {
      const content = execFileSync('git', ['show', `${GARBAGE_COMMIT}:${f}`], { maxBuffer: 32e6 }).toString();
      fs.writeFileSync(path.join(LAB, 'bad', path.basename(f)), content);
      n += 1;
    } catch { /* file did not exist at that commit */ }
  }
  const missing = [];
  for (const [dir, slugs] of [['good', HANDWRITTEN], ['mid', MIDDLE]]) {
    for (const slug of slugs) {
      const src = findSlug(slug);
      if (src) fs.copyFileSync(src, path.join(LAB, dir, `${slug}.mdx`));
      else missing.push(slug);
    }
  }
  // A labelled set that quietly shrank is worthless, so a slug that no longer
  // resolves is an error rather than a smaller set.
  if (missing.length) {
    throw new Error(`labelled slugs not found under ${COLLECTION_ROOT}: ${missing.join(', ')}`);
  }
  console.log(`prepared: bad=${n} good=${HANDWRITTEN.length} mid=${MIDDLE.length} in ${LAB}`);
}

function stats(xs) {
  if (!xs.length) return { n: 0, mean: 0, min: 0, max: 0, p90: 0 };
  const s = [...xs].sort((a, b) => a - b);
  return {
    n: xs.length,
    mean: xs.reduce((a, b) => a + b, 0) / xs.length,
    min: s[0],
    max: s[s.length - 1],
    p90: s[Math.floor(s.length * 0.9)] ?? s[s.length - 1],
  };
}

async function scoreSet(dir, scorer) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).map((f) => path.join(dir, f));
  if (!files.length) throw new Error(`labelled set ${dir} is empty; run --prepare`);
  const out = [];
  for (const f of files) out.push({ file: f, ...(await scorer(f, files)) });
  return out;
}

async function main() {
  if (process.argv.includes('--prepare')) return prepare();
  if (!fs.existsSync(path.join(LAB, 'bad'))) prepare();

  const which = process.argv.includes('--old') ? 'old' : 'new';
  let scorer;
  if (which === 'old') {
    // The live audit injects a corpus-wide 5-gram index before it scores
    // anything, and the uniqueness component silently falls back to a different
    // heuristic without one. Scoring the labelled sets without it would measure
    // a rubric the site never runs, so the index is rebuilt per set — each
    // labelled set is its own corpus, exactly as the new scorer treats it.
    const { scorePage, shinglesOf, setCorpusShingleIndex, parseMdxBody } =
      await import('./lib/geo-citability-scorer.mjs');
    let indexedFor = null;
    scorer = async (f, peers) => {
      const key = peers.join('|');
      if (indexedFor !== key) {
        const index = new Map();
        for (const p of peers) {
          for (const g of shinglesOf(parseMdxBody(fs.readFileSync(p, 'utf8')))) {
            index.set(g, (index.get(g) || 0) + 1);
          }
        }
        setCorpusShingleIndex(index, peers.length);
        indexedFor = key;
      }
      const r = scorePage(parseMdxBody(fs.readFileSync(f, 'utf8')), { collection: 'guides' });
      return { score: r.score };
    };
  } else {
    const mod = await import('./lib/geo/score.mjs').catch(() => null);
    if (!mod) {
      console.error('scripts/lib/geo/score.mjs not implemented yet; run with --old to see the baseline');
      process.exit(2);
    }
    scorer = mod.scoreFileForCalibration;
  }

  const sets = {};
  for (const d of ['bad', 'good', 'mid']) sets[d] = await scoreSet(path.join(LAB, d), scorer);

  console.log(`\n=== GEO calibration (${which} scorer) ===`);
  const summary = {};
  for (const [k, rows] of Object.entries(sets)) {
    const st = stats(rows.map((r) => r.score));
    summary[k] = st;
    console.log(
      `${k.padEnd(5)} n=${String(st.n).padStart(3)}  mean=${st.mean.toFixed(1)}  min=${st.min}  p90=${st.p90}  max=${st.max}`,
    );
  }
  const sep = summary.good.mean - summary.bad.mean;
  console.log(`\nseparation (good.mean - bad.mean) = ${sep.toFixed(1)} points`);
  const overlap = sets.bad.filter((r) => r.score >= Math.min(...sets.good.map((g) => g.score))).length;
  console.log(`garbage files scoring at or above the worst hand-written file: ${overlap}/${sets.bad.length}`);

  // Targets are set against the deterministic stage, which tops out at 75.
  // The remaining twenty points to the 95 ceiling are only reachable through
  // the judge stage, so a deterministic 60 is a good article, not a mediocre one.
  const TARGETS = { badMax: 25, goodMin: 55, separation: 35 };
  const fails = [];
  if (summary.bad.max > TARGETS.badMax) fails.push(`bad.max ${summary.bad.max} > ${TARGETS.badMax}`);
  if (summary.good.min < TARGETS.goodMin) fails.push(`good.min ${summary.good.min} < ${TARGETS.goodMin}`);
  if (sep < TARGETS.separation) fails.push(`separation ${sep.toFixed(1)} < ${TARGETS.separation}`);
  if (which === 'new') {
    console.log(fails.length ? `\n❌ calibration FAILED\n  ${fails.join('\n  ')}` : '\n✅ calibration passed');
    if (fails.length) process.exit(1);
  }
}

main();
