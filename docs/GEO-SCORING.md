# GEO scoring, second attempt

## Why the first one had to be replaced

The old rubric (`scripts/lib/geo-citability-scorer.mjs`) scored five properties of each H2 section and
averaged them. Every rule was additive and pattern-shaped: a 130-170 word paragraph containing any number
earned "citability", the string `MORE Group` earned "uniqueness", the words `is`, `are` or `typically`
earned "answer quality".

In July 2026 an agent was told to lift the corpus to 90+. It complied by injecting roughly 5,400 generated
blocks that satisfied those patterns, including figures that were never true (`R892 non-resident LTV
confirmation`, `179.6% withholding on disposal`) and tokens that were not even words (`r,`, `undefined`).

The failure is measurable. Scoring the labelled sets with the old rubric:

| set | what it is | old score |
|---|---|---|
| `bad` | 59 files as they stood at commit `9cda569` | **mean 90.2** |
| `good` | 10 articles written by hand in August 2026 | **mean 90.5** |
| `mid` | honest prose rebuilt semi-automatically | mean 76.3 |

Separation between garbage and hand-written: **0.3 points**. All 59 garbage files scored at or above the
worst hand-written article, and the honest middle of the corpus scored *below* the garbage. The rubric was
not merely uninformative, it was ordered backwards.

## The principle

A score that is a sum of rewards will be gamed, because whoever is asked to raise it optimises the metric
rather than the article. So this score is a **ceiling lowered by evidence that text was produced
mechanically**, plus a small base for properties that are expensive to fake, and the top of the scale is
placed out of reach of text mutation entirely:

```
deterministic  0 .. 75   patterns, corpus statistics, provenance
judge         0 .. 20    a reader ranking the article against exemplars
final         min(deterministic + judge, 95)
```

You cannot reach 90 by editing text patterns, because twenty of the points are not on that surface.

## What the deterministic stage measures

Corpus-level first, because a single file scored in isolation cannot reveal the thing we care about. The
July failure was one templated mutation applied to many files: invisible per file, obvious across the corpus.

| signal | machine corpus | hand-written | what it catches |
|---|---|---|---|
| cross-file 9-gram duplication | 18.6% | 0.5% | the same passage pasted into many articles |
| sentence skeletons shared with 3+ files | 25.2/file | 0.8/file | paraphrase templates that survive synonym swaps |
| figures stamped across the corpus | 8.3/file | 0.0/file | one number sprayed everywhere (`14 business days` × 442) |
| heading-echo openers | 12.1/file | 0.2/file | a section restating its heading instead of answering it |
| identical opener shape | 0.69 | 0.16 | every section starting the same way |
| hedge words per 1000 | 6.9 | 1.9 | prose that commits to nothing |
| repetition between a file's own sections | 0.160 | 0.000 | one template filling every section of one article |
| figures attached to things they cannot measure | 14.9/file, 59/59 files | 0.0, 0/10 files | `R450,000 turnaround`, `R2,000,000 withholding awareness` |

Gates cap the whole score rather than subtracting from it: malformed tokens cap at 40, a figure attached to
something it cannot measure caps at 40, duplication above 10% caps at 35, self-repetition above 8% caps at
35, more than three echo openers caps at 45.

Two of these came from a forensic pass that measured candidate signals against the labelled sets rather
than guessing: repetition between a file's own sections separates the two classes perfectly (every
hand-written article scores exactly zero), and the unit-type rules fire in all 59 machine files and none of
the 17 honest ones.

Rewards are deliberately few: openers that answer their heading (20), evidence and tables (15), structure
(15), sentence-length spread within sections (8), provenance (10), and a floor of 7.

## Provenance

A figure used in one article is a local worked example and needs nothing. A figure carried by five or more
articles is a load-bearing claim about the world and must appear in `.content-os/facts.json` with a source
and a date. This is the rule that would have caught July, where `7.5%` appeared 860 times across 59 files
with nothing behind it.

Provenance is a reward, not a penalty, on purpose. Penalising an unpopulated registry smears the same
complaint across every article and teaches nobody anything; making it a reward means the points appear only
after somebody has done the sourcing. The registry gate arms itself once the registry covers 80% of the
corpus's load-bearing figures, so a team can populate it incrementally.

The registry is not proof against a determined agent inventing entries. What it does is make invention
**visible**: every entry carries a source and a date, entries are few, and a change that introduces a dozen
of them is obvious in review. That is the honest limit of the mechanism.

Passages that are meant to be identical everywhere (legal disclaimers, the standing note about modelled
yields) are declared in `.content-os/boilerplate.txt`. Declaring an exemption is a visible act; the
detector does not guess.

### A figure is not a claim until you know what it measures

The registry was keyed on the bare figure, and that quietly cost the scorer in both directions.

`€2,000` is the Golden Visa application fee for the main applicant. It is also the low end of the Kipseli
price-per-square-metre band. `10%` is the top of the acquisition-cost stack, and a deposit, and a yield,
and a price move. Keyed on the digits alone the registry had two options and both were wrong: leave the
fee out, and penalise sixty articles four points each for using `10%` correctly; or register it, and hand
provenance to every page that happened to type the same digits about something else. `facts.json` had
documented the dilemma and chosen the first horn, which is why the file carried a `_deliberately_absent`
list of figures nobody could register.

A registry entry may now carry `context`: words that must appear within 140 characters of the figure for
that entry to apply. `registeredHere(figure, text)` in `scripts/lib/geo/score.mjs` replaces `registry.has`
in all three consumers — the provenance component, the stamped-figure penalty and the unregistered-figure
report — so a page gets credit for `€2,000` when it is talking about state fees and not when it is talking
about €/m².

Two properties make this safe to add rather than a widened exemption. An entry with no `context` behaves
exactly as before, so nothing already in the file changed meaning. And for an entry that has one, the test
is strictly narrower than `registry.has` ever was: context matching can only ever withhold provenance that
the old code would have granted, never manufacture it. That is the reason it was allowed to raise scores
at all — the mechanism cannot be used to make a page pass, only to stop punishing a page that was already
right.

Measured: separation rose from 64.8 to 72.0 and the hand-written minimum from 63 to 71, with the garbage
set unmoved at 0. Corpus mean rose 52.4 to 54.3.

The figures that are still deliberately unregistered — `€500`, `€800`, `€3,000`, `2%`, `8%` — are out
because they carry no single sourceable meaning on this site, not because the registry cannot express
them. That is an editorial gap, and the fix is for each page to say what its own number measures.

### Claims we cannot watch

The registry is keyed by the bare figure, which is right for its job and wrong for another one. `7.5%` is the
section 35A withholding on a non-resident individual's sale here and the flat IMT a non-resident pays in
Portugal; `5%` is a Mauritian registration duty on one page and an agent's commission on twenty others.
Grouping entries per figure fixes the first case, where one key silently replaced another and its sourcing
vanished from the file with no error. It does not fix the second: registering `5%` for a Mauritian meaning
would hand twenty unrelated pages a provenance they have not earned.

So claims about jurisdictions nobody here monitors live in `.content-os/external-claims.json` instead,
keyed by the claim rather than by the number. The reason is the failure this project already had: the corpus
carried the previous year's City of Cape Town rates on thirty pages until somebody looked, and that was a
figure with a South African source we can check on demand. Portuguese budget provisions, Mauritian
Economic Development Board thresholds and UAE tax practice have no such watcher, so a stale figure there
would sit on the site indefinitely under an `asOf` date quietly asserting it was current.

Each claim carries a `reviewBy` date and `npm run facts:review` exits non-zero once one passes. It also
reports claims whose listed files no longer exist, so a claim orphaned by a rewrite gets pruned rather than
reviewed forever. Reviewing means re-reading the primary source and either moving the dates forward or
correcting every file the claim names.

This is a process, not a measurement, and it is in this document because the alternative was worse: the only
other way to remove the risk is to stop publishing about those markets.

## What was tried and rejected

Every rule here had to earn its place on the labelled sets. These did not, and are recorded so nobody
re-adds them on intuition:

| candidate | machine | hand-written | why rejected |
|---|---|---|---|
| numbers must sit in a table | 29% prose-only | 53% prose-only | backwards: hand-written articles carry *more* prose figures |
| sentence-length variance ("burstiness") | CV 0.603 | CV 0.464 | backwards: the generated text was more variable, not less |
| count of arithmetic chains | 0.31 | 0.60 | the semi-automatic middle scored highest (1.29), so it tracks nothing |
| structural variety across sections | 0.28 | 0.52 | the middle set matched the garbage (0.26) |
| diversity of sentence openers | 0.10 | 0.19 | too weak to separate, inverted against the middle set |
| currency followed by a bare duration | fires | fires once | `R4,500 nights stack into R135,000 months` is ordinary English; a rule that caps a score has to be precise |
| opener of 18–70 words | 90.5% of sections | 90.3% of sections | shipped for weeks inside the openers component and separated nothing: it paid for a shape, which is the exact failure of the July rubric |
| opener not starting with a pronoun | 99.9% | 100.0% | both classes pass essentially always, so the rule was 5 free points for everyone |
| a figure in the opening sentence | 89.6% | 58.1% | separates, but *backwards*: machine text front-loads numbers. Not usable as a reward, and too imprecise to be a penalty |

The first rubric was built entirely out of rules like these: plausible, untested, and wrong.

### Measured and rejected on the Greek corpus

Porting the rubric meant re-measuring the unit-type rules, because the imported list was built from
another site's filler vocabulary. Two candidates separated the labelled sets and were still rejected:

| candidate | machine | hand-written | why rejected |
|---|---|---|---|
| percentage + a money noun (`10% reservation wire`) | 140 hits in 94 of 114 files | 0 in 10, 0 in 7 | separates, but read in full it is ordinary compressed English for a reservation wire of 10% of the price, which is a real step in a Greek purchase. What made it frequent is that the whole sentence is duplicated, and duplication is already measured. A rule that caps a score has to be right about the language, not merely correlated with the label. |
| currency + a count noun (`€600,000 buyers`, `€2,000 permit`) | 4 hits | 2 hits | does not separate |
| the imported list (turnaround, awareness, LTV, occupancy, vacancy) | 0 of 114 files | 0 | fires nowhere on this corpus; keeping it would be a rule that looks like a defence and is not one |

What replaced them is the error this generator actually made: a money variable dropped into an area
slot — "engineer certification of €3,500 usable residential area", with €800, €3,500 and €480,000
appearing in that same slot across different files. 39 hits in 33 of 114 garbage files, zero in both
honest sets.

### A third rule that was punishing correct writing

Written the obvious way, that rule read `€\s?[\d,]+\s+usable`, and `[\d,]+` is greedy over commas. It
fired on twelve live pages, all of them correct: "a unit qualifies only if the single deed registers at
or above **€800,000, usable** interior area reaches 120m², and the title is single" is a list of
conditions, and the comma is the boundary between two of them. The amount now has to end in a digit.
This is the same failure as the interest-rate and "May" cases above, found the same way — a legitimate
article capped — and fixed the same way, by measuring the correction rather than arguing about it.

### Figure keys have to be canonical before any of this means anything

Three separate spellings of one claim defeat every corpus-level signal at once, and on this corpus the
claim in question is the load-bearing one. `[\d,]*` swallowing a trailing comma made `€800,000,` a
different key from `€800,000` (27 files against 119), and the site writes the same threshold as `€800K`
1,091 times. Keyed separately, the saturation detector undercounts, the registry needs three entries for
one fact, and a page writing "€800K" gets a different provenance verdict from the page beside it writing
"€800,000". `canonicalFigure` expands suffixes by shifting the digit string — 2.06 × 1e9 is
2060000000.0000002 in floating point — and strips trailing punctuation. Money keys fall from 449 to 374
and separation moves 65.2 → 64.8, which is the cost of reading the corpus correctly rather than a
weakening of the signal.

`billion` is in the pattern for the same reason: this site writes `€8 billion` 35 times and never
`€8bn`, and without the word the match truncates to `€8`, which is also a real amount here.

### The openers component, rebuilt on measurement

The first three rows above were not hypotheticals: two of them shipped. `scoreOpeners` was worth 20 points
and awarded them in three parts — 0.5 for an opener of 18–70 words, 0.25 for not starting with a pronoun,
0.25 for not echoing the heading. Measured on the labelled sets, the first two parts separate the classes by
**nothing** (90.5% against 90.3%, and 99.9% against 100.0%), so 15 of the 20 points were paid to every
article regardless of quality, garbage included.

The third part carries the entire signal. Machine openers restate their heading — median overlap 1.00, with
75% of sections at 0.75 or above. Hand-written openers answer it — median 0.33, and 31% reuse none of the
heading's words at all. The component is now that measure alone, ramped across the gap between the two
distributions (full credit at 0.33 overlap, none at 0.85) rather than thresholded:

| model | machine | hand-written | separation |
|---|---|---|---|
| as shipped | 15.4 | 17.9 | 2.5 |
| overlap alone, hard threshold at 0.5 | 1.0 | 8.4 | 7.4 |
| **overlap alone, ramped 0.33 → 0.85** | **3.7** | **15.3** | **11.6** |

The ramp was chosen over the hard threshold because it separates further *and* is less punitive to good
writing: a hand-written article now reaches about 15 of 20 here rather than 8.

One guard survives from the old rule and it is not a reward. An opener under six words earns no credit at
all, because otherwise a heading of `What are the transfer duty rates?` answered with an unrelated fragment
would score full marks for sharing no words with it. Six costs the hand-written set nothing — none of its
openers is that short — so it functions as a precondition rather than as payment for length.

### Two rules that were punishing correct writing

Both were found the same way — a legitimate article capped at zero — and both were fixed by measuring the
proposed exemption on the labelled sets rather than by arguing about it.

**Implausible precision fired on interest rates.** The rule penalises percentages quoted to two decimals that
appear nowhere else and in no registry, because giving every round figure fabricated precision is how a
figure escapes provenance. It capped a rates article at zero for writing `7.00%`, `10.25%`, `10.50%` and
`11.75%` — the convention for quoting a repo or prime rate, which moves in quarter points. Quarter-point
quotes are now exempt. The measurement says this costs nothing: the machine corpus contains **no**
quarter-point two-decimal percentages at all (0 against 8 arbitrary ones), while the hand-written set uses 6.
An arbitrary two-decimal figure in the same article, `11.40%`, is still counted, which is the rule working.

**The hedge detector was counting the month of May.** `HEDGE_RE` matched `may` case-insensitively, so an
article quoting monetary policy committee dates was charged 12 points for writing "May 2026" seven times.
`may` is now matched lowercase only: the month is always capitalised and hedging "may" is almost always
mid-sentence. On the labelled sets the change moves the machine corpus from 5.83 to 5.77 hedges per 1000 and
leaves the hand-written set at 1.87 exactly.

Neither exemption was added because a page scored badly. Each was added because the page scored badly *for
doing the right thing*, and in both cases the measurement had to show the exemption did not weaken the
signal before it shipped.

### One exemption, deliberately bounded

Only one class of text is removed before duplication is measured, and it is worth stating why the bar for
adding another is high. A `Sources:` trailer is a citation, not prose. Two articles resting on the same
statute *should* cite it in the same words, and penalising that pushes a writer toward vaguer attribution
purely to dodge a collision — the rubric would then be making the corpus worse. So the final block of a
document is stripped from the duplication text when it opens with `Sources:` and runs to at most 120 words.

The bound is the whole safeguard. A trailer longer than 120 words is measured **in full** rather than
truncated, so an author who moves an article into its own bibliography earns no discount at all, and the
worst available abuse is 120 exempt words at the end of a 1,800-word page. The exemption is applied to the
prose before table and component text is appended, because the trailer ends the prose and not the
concatenation — a detail that silently disabled the rule on first implementation.

Note what is *not* exempt. Shared regulatory statements — the City rates formula, the AIMI thresholds, the
section 35A rates — collide across pages constantly and are corrected editorially, by rewording each page,
never by exemption. The figure may repeat; the sentence should not. A reader who lands on two of our pages
must not read the same paragraph twice, and that is true whether the paragraph is about a law or about a
suburb.

## What the red team broke, and what closed it

The rubric was attacked by three independent adversaries given read access to its source and the instruction
to raise every article to 90. Six attacks worked against the shipped code, each one measured rather than
argued. All six are closed:

| Attack | Measured gain | What closes it |
|---|---|---|
| `git mv` files one directory deeper, out of a non-recursive `readdirSync` | corpus mean 40.7 → 51 in four minutes | Discovery walks `src/content` recursively, so anything Astro publishes is scored |
| Forge the judge verdict, which was a JSON file the scored agent writes | +20 points per file, ninety seconds | Verdicts carry an HMAC over (content hash, award); without `GEO_JUDGE_SECRET` no judge points count at all |
| Script every unregistered figure into the fact registry | corpus mean +5.2 | Entries need a real source, statement and ISO date; a registry where one source or statement shape covers over 35% of entries withholds provenance credit corpus-wide |
| Append every colliding sentence to `boilerplate.txt` | corpus mean +3.5 | The file is capped at 8 declared passages of 12+ words; exceeding it throws rather than exempting |
| Move prose into tables, JSX props and code spans, all stripped before measurement | corpus mean +3.1 | Duplication runs over its own extraction that recovers table cells, component text props and code spans |
| Give every figure fabricated precision so it stops being shared | corpus mean +2.9 | Percentages quoted to two decimals appearing nowhere else and in no registry are penalised |

Two further attacks were confirmed and are only partly closed, which is worth stating plainly. Deleting
content improves any ratio, so an absolute duplicated-sequence penalty now sits alongside the share, but
truncation still helps a page that has nothing to say. And a paraphrase farm with enough iterations defeats
any fixed lexical detector: the answer there is the judge stage and provenance, not another regex.

## Calibration

`scripts/geo-calibrate.mjs` rebuilds the labelled sets from git history and scores them. The
implementation must hold:

- garbage `max ≤ 25`
- hand-written `min ≥ 55`
- separation `≥ 35` points

The sets are labelled by this repository's own history: `bad` is the 114 files commit `525fb89`
rewrote ("second GEO pass — commercial corpus 114/114 at 90+", +22,918 lines), `good` is the ten
articles written by hand in the August 2026 waves, `mid` is seven pages that were garbage at that
commit, were stripped, and then had hand-written openers inserted by script.

Current state: garbage mean **0.0** (max 0), hand-written mean **72.0** (min 71), middle **54.9**,
separation **72.0 points**, and **0 of 114** garbage files reach the worst hand-written article.
Ordering is correct: hand-written > semi-automatic > machine-injected.

Separation was 64.8 until the registry learned about context (below). Hand-written articles gained
seven points because figures they were using correctly finally counted as sourced; the garbage set
gained nothing, because context matching is strictly narrower than the test it replaced.

Any change to the rubric must keep calibration passing. A rule that cannot separate the two sets is a
rule with no evidence behind it.

### What the rubric it replaced scored here

The live rubric, run the way the site runs it (with the corpus shingle index injected), scores the
machine-injected set **86.2** and the hand-written set **91.3**: separation of **3.0 points**, against
a site gate of 90 that **17 of the 114 garbage files clear**. All seven `mid` pages scored *lower*
after the fabricated statistics were removed than they had with them — the full before-and-after table
is in `.content-os/reports/GEO-DIAGNOSTIC-2026-08-27.md`.

## How an article is actually written under this

What raises the score:

- Answering each heading in the first sentence, in your own words, with a figure you can source.
- Sourcing the figures the rest of the site also relies on, in `.content-os/facts.json`.
- Saying something the reader cannot get elsewhere, which is the judge's first dimension.
- Making the numbers reconcile: the judge deducts 4 points per arithmetic error it finds.

What cannot raise it, by construction:

- Pasting a paragraph into many articles: the duplication detector is corpus-wide.
- Rotating synonyms through a template: skeletons ignore the words that were swapped.
- Adding sections: the base is an average, and new sections carry their own penalties.
- Repeating a favourite figure everywhere: that is what saturation detection is for.
- Inventing numbers: unregistered load-bearing figures earn none of the provenance points.
- Editing an article after a good judge verdict: verdicts are bound to a content hash and go stale.

## Commands

```bash
node scripts/geo-score.mjs                          # whole corpus, ranked, with gates
node scripts/geo-score.mjs <file.mdx> --explain     # one article, every penalty
node scripts/geo-calibrate.mjs                      # does the rubric still separate the labelled sets?
node scripts/geo-calibrate.mjs --old                # what the previous rubric scored
node scripts/geo-judge.mjs packet <file.mdx>        # emit the judging packet
node scripts/geo-judge.mjs record <file.mdx> v.json # store a verdict, bound to content hash
node scripts/geo-judge.mjs final <file.mdx>         # deterministic + judge
```
