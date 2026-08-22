# Greek Invest — Content OS status

**Site:** greek-invest.com  
**Repo:** max-diver999/greek-invest-website  
**Pilot started:** 2026-08-21  
**Phase:** 1 — remediation and the full manual writing pass executed 2026-08-21 on `claude/greece-audit-phase-zero-km4045`

## Snapshot (after remediation)

| Metric | Before | After |
|---|---|---|
| validate:content --all | **crashed** (missing module) | **129/129 clean** |
| qa checks in rendered audit | 10 | **19** |
| corpus duplicate-block detection | none | **corpus-wide, gate-blocking** |
| Verbatim boilerplate | **19%** (115k/597k words) | **0%** |
| Most-repeated block | **1,219x / 114 files** | 0 |
| Broken H2-spliced sentences | **859** | 0 |
| Malformed headings | **805** | 0 |
| Duplicate FAQPage JSON-LD | **132 pages** | 0 |
| Empty hero alt | **129 pages** | 0 |
| Titles over the 60-char SERP budget | **126 / 152** | 0 |
| Broken lead-form placeholder | **140 pages** | 0 |
| Mobile navigation | **none** | full drawer |
| Hot-linked third-party images | **12** | 0 (on Cloudinary) |
| llms-full.txt | **379 bytes** | 39 KB, all 129 pages |
| Tools inbound (in-content) | **0 / 2 / 5** | **20 / 8 / 58** |
| Content pages with <3 inbound | 31 | 26 |
| GEO uniqueness | 78 (metric rewarded duplication) | **94 (measured)** |
| GEO overall | 92/100 A (inflated) | **76/100 B (honest)** |
| Thin H2 openers (no extractable answer) | **349** | **0** |
| Ungrammatical generated headings | **225** | **0** |
| Broken/empty tables in the corpus | **6** | **0** |
| Invented first-party statistics | **103 sentences** | **0** (now gate-blocked) |
| Pages with no passage an answer engine can quote | **41** | **0** |
| Pages below the two-citable-passage standard | **82** | **0** |
| Rental income tax scale | pre-2026 (35% from €12,001) | **2026 scale, Law 5246/2025** |
| Worked examples taxing net instead of gross | **5** | **0** |
| STR registry abbreviation | **ΑΜΕΑ (wrong word) ×86** | **ΑΜΑ** |
| qa:full:quick | 2/6 | **5/6** (only the live HTTP smoke fails, proxy-blocked) |

## GSC signals (early)

- **Winners:** Crete Golden Visa €400k, eligible projects directory, ENFIA tax (impressions)
- **CTR gaps:** ENFIA (770 imp, 0.39% CTR), Costa Navarino area hub, lawyer-cost guide (pos ~51)
- **Funnel:** consultation pages need bridges from top Golden Visa guides

## Phase 0 headline findings

- **P0** ~19% of corpus is verbatim boilerplate; one 4-bullet block repeats **1,219×** across 114 files
- **P0** **859** grammatically broken sentences spliced under H2 headings
- **P0** Nationality guides are near-duplicates (up to **65%** containment after boilerplate stripping)
- **P0** Duplicate `FAQPage` JSON-LD on **132** pages; 7 with conflicting question sets
- **P0** `alt=""` on every hero (129 pages); lead-form placeholders render `,  Select , ` on 140 pages
- **P0** **126** titles exceed the SERP truncation limit; 8 have literal defects (`::`, duplicated tokens)
- **P0** `validate:content --all` cannot run — the "129/129 clean" baseline was unverified
- **P0** No mobile navigation at all; no "Golden Visa" or "Tools" nav entry
- **P1** Tools, `/greece-property-consultation/`, `/invest-*` pages are orphans; 95/129 pages lack an in-content CTA
- Legal facts on Law 5100/2024 tiers, the 120 m² usable-area reading and Circular 1/2026 **verified sound**

## Findings from the writing pass (after Phase 0)

Things the audit could not see until the boilerplate was gone and every section was read:

- **P0 The rental income tax scale was a year out of date.** Law 5246/2025 inserted a 25% band
  for €12,001–€24,000 from 1 January 2026, so 35% now starts at €24,001. 36 statements across
  15 files taught the old scale. Five worked examples also taxed **net** income where Greece
  taxes **gross**, understating the bill by up to €8,000 a year on one page.
- **P0 103 sentences cited internal datasets that do not exist** ("underwriting snapshots show",
  "case study data from 2026 shows", "transaction data shows that 78 percent of…"). Fabricated
  E-E-A-T on YMYL pages. All rewritten to keep the substance; a gate now blocks the phrasing.
- **P0 Six tables rendered a header and separator with no rows.** Four needed real data written;
  two were a stray blank line splitting the separator from its rows.
- **P1 The short-term rental registry was called ΑΜΕΑ 86 times.** ΑΜΕΑ means something else
  entirely in Greek; the registry number is the ΑΜΑ.
- **P1 225 headings were ungrammatical** — "How does Financial Comparison of Athens Riviera vs
  Athens Center?", "What is Spouse or Civil Partner?" — and rendered that way on the page.
- **P1 Law 5170/2025 was absent.** Short-term rental property standards in force since
  1 October 2025, with fines of €5,000–€20,000. Now documented.
- **P1 Five buyer-scenario sections started at "Scenario B"** or skipped a letter, because the
  removed boilerplate had carried the missing one.

## Findings after the content waves (2026-08-22)

- **P0 `/methodology/` and `/privacy-policy/` were still the UAE template.** "DLD, AMPI, ICA visa
  rules", "Official UAE government and emirate-level portals", "AMPI-licensed partner". Both are
  linked from all 139 article pages and from the footer. Root cause: the earlier template-residue
  scan searched for the known-bad words already found (Phuket, Mexico, THB, Cape Town) instead of
  verifying that a page was about Greece — "UAE", "DLD", "AMPI", "ICA" were never on the list, and
  every structural gate checks markup, not subject matter. Both pages rewritten for Greece.
- **New permanent gate: `scripts/check-jurisdiction.mjs`,** wired into `qa:full`. Inverted logic —
  a foreign-jurisdiction term is an error by default rather than something to remember to look for.
  Tier 1 (foreign regulators: AMPI, DLD, RERA, Deeds Office, Chanote, Fideicomiso) fails anywhere
  outside comparative pages; Tier 2 (country names and currencies) fails inside site chrome and on
  legal pages, where they can only mean un-localised template.
- **P1 The `ArticleLayout` "About this research" aside repeated the byline on the same page** and
  restated the four publication checks on all 139 pages. Repeated template boilerplate is not a
  Google duplicate-content penalty — template regions are discounted — but the byline duplication
  was a genuine same-page defect and the methodology belongs once, on `/methodology/`. Trimmed to
  a disclaimer plus a link.
- **P1 The four trust pages were thin for YMYL.** `/about/` 173 words, `/terms/` 154, `/contact/`
  83 — and `/about/` is the target of every article byline while saying nothing about who writes
  the site. Expanded to 464 / 602 / 425 rendered words, with a Person schema on `/about/`.

## Decisions taken (from Maxim's five answers)

1. **`/invest-athens-property/` and `/invest-crete-property/`** — rebuilt rather than redirected,
   at 2,402 and 2,374 words with Service + BreadcrumbList + FAQPage schema.
2. **Phone** — removed from the site's contact surfaces; retained behind the WhatsApp click.
   `SITE.whatsapp` still carries the Thai number: **the correct number is still needed.**
3. **Author** — set to `Maxim`, a Person, across the corpus and the Article schema.
4. **The thin openers** — all 349 written by hand, none templated.
5. **Nationality cluster** — differentiated on real country specifics (LRS caps for Indian buyers,
   T1135 for Canadians, the Israel treaty text conflict, Brexit Schengen limits for UK buyers).
   Worst pair fell from 65.5% to 44.7% containment.

## Still open for Maxim

1. **The correct phone number** for `SITE.whatsapp`.
2. **Whether "MORE Group" should appear on this site at all.** The 103 fabricated-data sentences
   also named MORE Group as the source; the rewrites speak as Greek Invest. If MORE Group is the
   operating entity and should be named, say so and it goes back in as an honest attribution.
3. **The 50-article content roadmap** — still a proposal, still awaiting «ок».
4. **Live-site-only checks** — www vs non-www canonical behaviour, real Core Web Vitals, actual
   HTTP status codes. The egress proxy here returns 403 for greek-invest.com, so these must be
   run from Cursor.

## Content roadmap execution (approved by Maxim 2026-08-22)

Wave 1 of Tier 1 delivered: 5 articles, hand-written, GEO 90 to 93 each,
all gates green. Corpus now 134 pages.

| # | Slug | GEO | Words |
|---|---|---|---|
| 4 | guides/greece-tax-changes-2026-law-5246 | 93 | ~2,500 |
| 1 | guides/greece-non-dom-tax-regime-5a-guide | 91 | ~2,150 |
| 3 | guides/greece-golden-visa-plus-non-dom-strategy | 91 | ~2,100 |
| 41 | compare/athens-riviera-vs-crete-golden-visa | 90 | ~1,950 |
| 44 | guides/greece-golden-visa-statistics-2026 | 92 | ~2,050 |

Wave 2 delivered same day: 5 more Tier-1 articles, GEO 91 to 92,
all gates green. Corpus now 139 pages.

| # | Slug | GEO | Words |
|---|---|---|---|
| 2 | guides/greece-7-percent-pension-tax-retirees | 91 | ~2,070 |
| 10 | guides/greece-golden-visa-without-property | 91 | ~2,000 |
| 11 | guides/greece-golden-visa-350k-fund-route | 92 | ~2,000 |
| 13 | guides/greece-golden-visa-250k-heritage-restoration | 91 | ~2,020 |
| 45 | guides/greece-property-price-index-by-region-2026 | 91 | ~2,000 |

Cross-corpus 5-gram containment of every new article: under 5%.
Two maintained dataset pages now live (GV statistics, price index),
both stating a quarterly update cadence.

Next: Wave 3 (Tier 1 final): #16 technical due diligence report,
#17 forest maps, #24 escrow, #25 currency/FX transfer, #30 Vouliagmeni,
#38 Greece vs Turkey citizenship.
Hero note: one new unique hero uploaded (Zappeion); nine articles now
re-use 1x-pool images pending replacement from Cursor, where Wikimedia
is reachable.

## Next steps

1. ~~**Claude** — Phase 0 full audit~~ ✅ delivered
2. ~~**Claude** — remediation: QA gate, SEO/AEO/GEO, UX, corpus cleanup~~ ✅ delivered
3. ~~**Claude** — the manual writing pass across all 129 pages~~ ✅ delivered
4. **Maxim** — the four open items above; «ок» on the 50-article content roadmap
5. **Cursor** — merge, build, qa, deploy, indexing only on «отправляй»

## Artifacts (delivered 2026-08-21)

- `.content-os/reports/AUDIT-REPORT-2026-08-21.md` — corpus + rendered (Blocks A, B, D)
- `.content-os/reports/CODE-AUDIT-2026-08-21.md` — code (Block C)
- `.content-os/batches/corpus-cleanup-roadmap-2026-08-21.md` — 7 waves, batches of 25
- `.content-os/batches/code-improvements-roadmap-2026-08-21.md` — 6 waves
- `.content-os/batches/content-roadmap-2026-08-21.md` — 50 articles, 3 tiers
- `.content-os/batches/topics-proposal.json` — machine-readable 50 topics

## Lock

`pilot-lock.json` — Claude owns Phase 0 audit until Maxim says «ок» on roadmaps.
