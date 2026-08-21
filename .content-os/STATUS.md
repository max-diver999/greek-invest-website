# Greek Invest — Content OS status

**Site:** greek-invest.com  
**Repo:** max-diver999/greek-invest-website  
**Pilot started:** 2026-08-21  
**Phase:** 0 — audit delivered 2026-08-21, awaiting «ок» from Maxim on roadmaps

## Snapshot

| Metric | Value |
|---|---|
| MDX | 129 |
| GEO commercial avg | 92/100 (grade A) |
| validate:content --all | **FAIL — cannot run** (missing `cloudinary-gate.mjs`, see CODE-AUDIT C1) |
| qa:full:quick | **3/6 PASS** |
| build + audit:rendered:fail | PASS (0 errors) |
| Corpus boilerplate share | **~19%** (115,226 / 597,077 words) |
| GSC period | 2025-05-01 → 2026-08-18 |

**Collections:** guides 90 · compare 12 · areas 12 · projects 10 · developers 4 · news 1

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
- Legal facts **verified sound** — Law 5100/2024 tiers, 120 m² usable-area reading, Circular 1/2026 (22 Apr 2026)

## Next steps

1. ~~**Claude** — Phase 0 full audit~~ ✅ delivered 2026-08-21 → **STOPPED**
2. **Maxim** — «ок» on roadmaps (corpus / code / content)
3. **Claude** — fix batches on `cc/greece-*` branches
4. **Cursor** — merge, build, qa, deploy (correct git identity), indexing only on «отправляй»

## Artifacts (delivered 2026-08-21)

- `.content-os/reports/AUDIT-REPORT-2026-08-21.md` — corpus + rendered (Blocks A, B, D)
- `.content-os/reports/CODE-AUDIT-2026-08-21.md` — code (Block C)
- `.content-os/batches/corpus-cleanup-roadmap-2026-08-21.md` — 7 waves, batches of 25
- `.content-os/batches/code-improvements-roadmap-2026-08-21.md` — 6 waves
- `.content-os/batches/content-roadmap-2026-08-21.md` — 50 articles, 3 tiers
- `.content-os/batches/topics-proposal.json` — machine-readable 50 topics

## Lock

`pilot-lock.json` — Claude owns Phase 0 audit until Maxim says «ок» on roadmaps.
