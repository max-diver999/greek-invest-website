# Greek Invest — Content OS status

**Site:** greek-invest.com  
**Repo:** max-diver999/greek-invest-website  
**Pilot started:** 2026-08-21  
**Phase:** 1 — remediation executed 2026-08-21 on `claude/greece-audit-phase-zero-km4045`

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
| GEO uniqueness | 78 (metric rewarded duplication) | **93 (measured)** |
| GEO overall | 92/100 A (inflated) | **73/100 B (honest)** |

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

## Open decisions for Maxim

1. **`/invest-athens-property/` and `/invest-crete-property/`** — 0 inbound, 312-365 words,
   duplicate the Athens and Crete guides. Recommend 301 to those guides. Needs a redirect call.
2. **`SITE.phone` is `+66 65 119 5327`** — a Thai number on a Greece site, plus
   `.env.example` still carries a Cape Town `LEAD_FROM_EMAIL`. Template residue, and a
   trust problem on the lead surfaces. Needs the correct number.
3. **Author identity** — `Article.author` is the `Greek Invest Editorial` organisation. For
   YMYL tax and legal content a named, credentialed person is materially stronger E-E-A-T.
4. **297 thin H2 openers across 100 files** — sections that now open with a short lead-in
   rather than an extractable 35+ word direct answer. This is the remaining GEO drag
   (answer 70, structure 68). Genuine writing, not something to template.
5. **Nationality cluster still 49-65% similar** (US, Canadian, Australian, Indian, UAE,
   Israeli, French, German, Turkish, UK). Needs country-unique substance or consolidation.

## Next steps

1. ~~**Claude** — Phase 0 full audit~~ ✅ delivered
2. ~~**Claude** — remediation: QA gate, SEO/AEO/GEO, UX, corpus cleanup~~ ✅ delivered
3. **Maxim** — decide the five items above; «ок» on the 50-article content roadmap
4. **Cursor** — merge, build, qa, deploy, indexing only on «отправляй»

## Artifacts (delivered 2026-08-21)

- `.content-os/reports/AUDIT-REPORT-2026-08-21.md` — corpus + rendered (Blocks A, B, D)
- `.content-os/reports/CODE-AUDIT-2026-08-21.md` — code (Block C)
- `.content-os/batches/corpus-cleanup-roadmap-2026-08-21.md` — 7 waves, batches of 25
- `.content-os/batches/code-improvements-roadmap-2026-08-21.md` — 6 waves
- `.content-os/batches/content-roadmap-2026-08-21.md` — 50 articles, 3 tiers
- `.content-os/batches/topics-proposal.json` — machine-readable 50 topics

## Lock

`pilot-lock.json` — Claude owns Phase 0 audit until Maxim says «ок» on roadmaps.
