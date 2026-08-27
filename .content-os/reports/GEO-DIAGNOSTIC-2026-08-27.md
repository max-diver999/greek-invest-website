# GEO diagnostic — honest scorer, first full measurement

**Date:** 2026-08-27 · **Corpus:** 139 MDX across 6 collections · **Branch:** `claude/greece-audit-phase-zero-km4045`

The scorer ported here is a ceiling lowered by evidence of mechanical writing, not a sum of rewards.
Methodology, rejected signals and the red-team results are in `docs/GEO-SCORING.md`.

---

## 1. The live rubric does not separate machine text from hand-written text

Labelled by this repository's own history:

| set | what it is | n |
|---|---|---|
| `bad` | the files commit `525fb89` rewrote — "second GEO pass — commercial corpus 114/114 at 90+", 4 July 2026, +22,918 lines | 114 |
| `good` | articles written by hand, section by section, in the August 2026 waves | 10 |
| `mid` | pages that were garbage at `525fb89`, were stripped, then had hand-written openers inserted by script | 7 |

Scored with the rubric the site actually runs (`scripts/lib/geo-citability-scorer.mjs`, corpus shingle
index injected exactly as `geo-citability-audit.mjs` injects it):

| set | mean | min | max |
|---|---|---|---|
| bad | **86.2** | 63 | 91 |
| good | 91.3 | 90 | 93 |
| mid | 77.1 | 73 | 83 |

**Separation: 3.0 points.** The playbook's threshold for "broken" is 20.

The operational failure is sharper than the mean. The site's gate is **GEO ≥ 90**:

- **17 of 114** machine-injected files score 90 or 91 — they clear the gate.
- **113 of 129** score 85 or above.
- The worst hand-written article scores 90, tied with garbage.

### The same page, before and after the garbage was removed

Every one of the seven `mid` pages scored **lower** after the fabricated statistics and templated
blocks were stripped out. The rubric was paying for the filler:

| page | as garbage | cleaned | change |
|---|---|---|---|
| greece-property-investment-guide | 91 | 82 | −9 |
| greece-golden-visa-250000-conversion-route | 89 | 73 | −16 |
| greece-golden-visa-timeline-application-2026 | 89 | 77 | −12 |
| cost-of-buying-property-greece | 88 | 83 | −5 |
| greece-golden-visa-120-square-meter-rule | 88 | 77 | −11 |
| greece-rental-yield-guide | 88 | 75 | −13 |
| buy-property-greece-foreigner | 87 | 73 | −14 |

A metric that ranks the fabricated version of a page above the honest one cannot be used to decide
whether a page is finished.

## 2. The new scorer, calibrated

| set | mean | min | max |
|---|---|---|---|
| bad | **0.0** | 0 | **0** |
| good | 64.8 | **63** | 69 |
| mid | 54.9 | 38 | 63 |

**Separation: 64.8 points.** Targets: garbage max ≤ 25, hand-written min ≥ 55, separation ≥ 35 — all met.
Ordering is correct (hand-written > semi-automatic > machine), and **0 of 114** garbage files reach the
worst hand-written article.

## 3. Where the corpus actually stands

Deterministic stage only, out of 75. The remaining 20 points to the 95 ceiling are behind the judge
stage and are not reachable by editing text patterns.

**Corpus: 139 files, mean 25.0, min 0, max 55, 21 pages at zero.**

| collection | n | mean | min | max | zeros |
|---|---|---|---|---|---|
| news | 1 | 34.0 | 34 | 34 | 0 |
| guides | 99 | 29.5 | 0 | 55 | 6 |
| developers | 4 | 20.8 | 16 | 26 | 0 |
| compare | 13 | 20.5 | 0 | 37 | 2 |
| areas | 12 | **9.2** | 0 | 24 | 6 |
| projects | 10 | **6.6** | 0 | 31 | 7 |

Distribution: 21 at zero · 17 at 1–19 · 86 at 20–39 · 14 at 40–54 · 1 at 55–64 · none above 64.

### What is costing the points

| penalty | total points | files |
|---|---|---|
| stamped-figure | 2,600 | 650 hits |
| duplicated-text | 1,438 | 63 |
| template-family | 1,116 | 37 |
| duplicated-volume | 750 | 22 |
| hedging | 217 | 53 |
| unit-mismatch | 72 | 12 |
| heading-echo | 40 | 8 |
| self-repetition | 28 | 4 |
| implausible-precision | 27 | 2 |

Gates: **17 files** capped at 35 by `mass-duplication`, **12** capped at 40 by `unit-mismatch`.

### Provenance is zero everywhere, by construction

`.content-os/facts.json` does not exist yet, so all 139 pages score 0/10 on provenance and the corpus
loses 1,390 points it could hold. **177 figures are load-bearing** (used in 5+ articles) with no source:
`€800,000` in 122 files, `€400,000` in 119, `3.09%` in 75, `€250,000` in 63. Building the registry is
the single cheapest lift available and it is the rule that would have caught July.

## 4. Live garbage the July cleanup missed

The unit-mismatch rule, rebuilt on this corpus's own labelled sets, found **12 live pages** carrying one
templated sentence with figures dropped into the wrong units:

> **Children Under 21** means confirming **95% tier pricing**, **€400,000 usable-area certification**, and
> **€800,000 transfer or compliance cost** before any deposit under Law 5100/2024.

> **Scam 4: Title Fraud** means confirming **78% tier pricing**, €800,000 usable-area certification, and
> €400,000 transfer or compliance cost…

> **Quick Answer** means confirming **€4.2 tier pricing**, €100,770 usable-area certification, and 13%
> transfer or compliance cost…

The subject is the section heading pasted in. An engineer certifies square metres, not euros; a transfer
cost is not €800,000 on a €400,000 property; tier pricing is not a percentage. These are fabricated,
internally contradictory financial statements on live YMYL pages, and every existing gate passes them.

Affected: `areas/chania-property-investment`, `areas/elounda-property-investment`,
`areas/heraklion-property-investment`, `compare/athens-riviera-vs-athens-center-investment`,
`compare/golden-visa-greece-vs-hungary-guest-investor`, `compare/greece-vs-malta-permanent-residence-property`,
`compare/greece-vs-portugal-golden-visa-property`, `guides/greece-golden-visa-family-members-rules`,
`guides/greece-property-market-transactions-2025`, `guides/greece-property-scams-avoid`,
`guides/halkidiki-property-investment-guide`, `guides/peloponnese-property-investment-guide`.

## 5. Cannibals

57 pairs share 25 or more nine-word sequences. `node scripts/geo-cannibals.mjs`. Four clusters carry
almost all of it:

**Nationality guides** — five pages that are substantially one page with the country swapped:

| pair | shared |
|---|---|
| australian-buyers / uae-buyers | 579 |
| canadian-buyers / israeli-buyers | 540 |
| australian-buyers / israeli-buyers | 404 |
| uae-buyers / israeli-buyers | 277 |
| australian-buyers / canadian-buyers | 244 |
| canadian-buyers / uae-buyers | 192 |
| canadian-buyers / us-citizens | 156 |

**Island and suburb areas** — mykonos/santorini 418, mykonos/rhodes 326, glyfada/rhodes 281,
glyfada/mykonos 218, rhodes/santorini 191, glyfada/santorini 136.

**Projects** — artis-9-living/lotus-voula 312, the-grandline/the-regal 271, 3s-athens/lotus-voula 223,
3s-athens/artis-9-living 149, 3s-athens/greca-developments 143.

**Regional tier guides** — crete-golden-visa-400000 / peloponnese-golden-visa-400000 164.

### Template families

111 sentence skeletons appear in 3 or more files. The largest:

| files | sentence |
|---|---|
| 27 | `**Next steps:** the Golden Visa hub · the zone lookup.` |
| 13 | `Greek Invest buyers typically require engineer certificates, cadastre extracts, and Circular 1/2026 bank traceability at this stage.` |
| 13 | `Treat broker summaries as planning bands until a licensed Greek lawyer confirms each line item in writing.` |
| 10 | `Buyer Scenarios means confirming €400,000 tier pricing, €2,200 usable-area certification…` |
| 8 | `Model LTR at 4.0 to 5.0% gross.` |
| 7 | `Budget ENFIA at €800 to €2,500 annually.` |
| 6 | `Law 5100/2024 prohibits short-term tourist rentals on the qualifying Golden Visa property everywhere in Greece.` |

Only two sentences on this corpus are legitimate boilerplate and they are declared in
`.content-os/boilerplate.txt`. The rest are an editorial problem: the figure may repeat, the sentence
should not.

## 6. What had to change to port the scorer here

- **Currency**, five hard-coded rand patterns → euro. Without this, provenance and stamped-figure
  detection return silently empty on a euro site.
- **A sixth pattern the playbook's grep does not find.** `orphanFigures` in `document-signals.mjs` used
  `R\s?\d` with no lookbehind; under the `i` flag that matches the `r 3` inside "under 3 years". All six
  now import one shared `FIGURE_RE` instead of restating it.
- **Figure keys were fragmenting.** `[\d,]*` swallows a trailing comma, so `€800,000,` was a separate key
  from `€800,000` — the Golden Visa threshold sat under 119 files in one spelling and 27 in another. The
  corpus also writes the same threshold as `€800K` 1,091 times. `canonicalFigure` unifies them; money
  keys fall 449 → 374 and `€800,000` reads 122 files instead of 119. Calibration is unchanged
  (separation 65.2 → 64.8).
- **`billion` added to the pattern.** The site writes `€8 billion` 35 times and never `€8bn`; without the
  word the match truncated to `€8`, which is also a real amount here.
- **Unit-type rules replaced.** The imported list (turnaround, awareness, LTV, occupancy) fires on 0 of
  114 garbage files here. Replaced with the rule this corpus's garbage actually produced — see §4.
- **Labelled sets.** The bad set is the 114 files the lift commit *rewrote*, not all 129 that existed when
  it landed: insertions per file are strictly bimodal (114 files at 50+, median 184; 14 files at exactly
  1; nothing between), and the 14 untouched developer and project pages had been scoring up to 46 inside
  the bad set, which reads as the scorer failing when the label was wrong.
- **The `--old` comparison was itself wrong.** It called the live rubric without the corpus shingle index
  the live audit injects, so the uniqueness component silently used a different fallback. Fixed before
  any number in §1 was recorded.

## 7. Commands

```bash
node scripts/geo-score.mjs                      # whole corpus, ranked
node scripts/geo-score.mjs <file.mdx> --explain # one article, base parts and every penalty
node scripts/geo-calibrate.mjs                  # does the rubric still separate the labelled sets?
node scripts/geo-calibrate.mjs --old            # what the previous rubric scored
node scripts/geo-cannibals.mjs --min 60         # page pairs that are the same page
npm run facts:review                            # claims about jurisdictions nobody here watches
```
