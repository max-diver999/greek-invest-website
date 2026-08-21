# Greek Invest — Phase 0 full audit (corpus + rendered)

**Date:** 2026-08-21 · **Branch:** `claude/greece-audit-phase-zero-km4045`
**Scope:** 129 MDX across 6 collections · 152 rendered pages in `dist/` · GSC 2025-05-01 → 2026-08-18
**Status:** audit only. No content or layout changed.

---

## 0. Executive summary

The site's **facts are strong and its schema plumbing is mostly right**. The problem is not accuracy — it is
**uniqueness, presentation and funnel wiring**. Three things hold this corpus back:

1. **~19% of the corpus is verbatim boilerplate** (115,226 of 597,077 words). One 4-bullet block is repeated
   **1,219 times across 114 files**. This is the real cause of GEO rubric `unique 78`, and it is a live
   scaled-content-abuse risk, not a style nit.
2. **859 grammatically broken sentences** sit directly under H2 headings — the exact position Google and
   AI answer engines extract from.
3. **The QA harness is green while all of this is true.** `validate:content --all` does not run at all
   (missing module), so the "129/129 clean" baseline in `STATUS.md` is unverified.

Everything below is evidence-backed with counts and file paths.

---

## A. CORPUS — 129 MDX

### A1 · P0 — Templated boilerplate at scale

Verbatim-repeated blocks, measured across the corpus body text (frontmatter excluded):

| Repeated block | Occurrences | Files |
|---|---:|---:|
| `- €800,000 prime vs €400,000 regional tiers under Law 5100/2024 …` (4-bullet list) | **1,219** | 114 |
| `\| Planning line \| Greek Invest 2026 band \|` (identical 5-row table) | **639** | 124 |
| `Insider tip: MORE Group sequences engineer, cadastre, and bank files …` | **517** | 124 |
| `Greek Invest is the English-language Greece property desk for MORE Group …` | 153 | 107 |
| `Insider tip: MORE Group underwriting in 2026 sequences engineer certificate …` | 114 | 114 |
| `**Insider tip:** MORE Group files in 2026 show this step fails most often …` | 107 | 107 |
| `Insider tip: MORE Group underwriting in 2026 treats this as a hard gate …` | 92 | 92 |
| `MORE Group underwrites this checkpoint …` | 936 | — |
| `Insider tip` (any form) | **1,003** | — |
| `Law 5100/2024` | **3,446** | — |

**Density:** `hidden-costs-buying-property-greece` is 35% boilerplate (1,813 of 5,150 words); 10 files exceed
25%; 60 files exceed 20%. Corpus-wide ≈ **19%**.

The same 4-bullet block appearing ~10.7× *within a single page* is worse than cross-page duplication —
it reads as generated filler to both users and crawlers.

**Exempt:** `developers/*` (4 files) and `news/*` (1 file) carry zero boilerplate. `projects/*` carry ~11%.

### A2 · P0 — Broken generated sentences under headings

**859 sentences** follow the pattern `<H2 text> requires €400,000 regional or €800,000 prime investment under
Law 5100/2024, …`, i.e. the heading is spliced into the sentence as its grammatical subject. Live examples:

- `What should foreign buyers know about scam 2: Deposit to the Wrong Account requires €400,000 regional or €800,000 prime investment…`
- `What Is ENFIA and How Did It Come About requires €400,000 regional or €800,000 prime investment…` (`guides/enfia-property-tax-greece.mdx`)
- `How does Crete vs Côte d'Azur: Direct Price Comparison compare requires €400,000 regional…`

These sit in the **first paragraph after an H2** — prime featured-snippet and AI-citation real estate. They also
inject Golden Visa thresholds into pages about ENFIA, scams and inheritance, where they are off-topic.

Heading text itself is damaged too: `## What should foreign buyers know about thessaloniki's Key Investment
Submarkets?` (lower-case proper noun mid-sentence), `## What should foreign buyers know about risks and How to
Manage Them?` (10×).

### A3 · P0 — Near-duplicate page clusters (doorway risk)

5-gram containment **after stripping all boilerplate** — so this is genuine body-copy overlap:

| Pair | Containment | Jaccard |
|---|---:|---:|
| `greece-golden-visa-canadian-buyers` ⟷ `israeli-buyers-greece-property` | **65.5%** | 37.5% |
| `greece-golden-visa-australian-buyers` ⟷ `israeli-buyers-greece-property` | 62.1% | 42.5% |
| `greece-golden-visa-australian-buyers` ⟷ `greece-golden-visa-uae-buyers` | 62.0% | 44.1% |
| `greece-golden-visa-uae-buyers` ⟷ `israeli-buyers-greece-property` | 56.2% | 37.7% |
| `greece-golden-visa-australian-buyers` ⟷ `greece-golden-visa-canadian-buyers` | 52.1% | 29.3% |
| `projects/the-grandline` ⟷ `projects/the-regal` | 47.4% | 30.4% |
| `areas/mykonos-property-investment` ⟷ `areas/santorini-property-investment` | 45.9% | 29.3% |
| `projects/artis-9-living` ⟷ `projects/lotus-voula` | 46.2% | 28.6% |

**The nationality cluster is the sharpest risk.** Ten pages (`us-citizens`, `canadian`, `australian`, `indian`,
`uae`, `israeli`, `french`, `german`, `turkish`, `brexit-uk`) are one template with the nationality swapped.
They need genuinely country-specific substance — home-country tax treaty treatment, FX/transfer mechanics,
consulate/visa steps, CRS/FATCA reporting — or consolidation.

All 10 `projects/*` and several `areas/*` share the same skeleton.

### A4 · P1 — Cannibalisation

| Cluster | Pages | Assessment |
|---|---|---|
| **Timeline** | `golden-visa-greece-timeline-2026-realistic`, `greece-golden-visa-timeline-application-2026` | **Sharpest overlap.** Both target "greece golden visa timeline / processing time". H2 sets differ, intent does not. Consolidate to one, 301 the other. |
| €400K tier | `crete-…`, `peloponnese-…`, `rhodes-…-400000`, `/tier-golden-visa-400k/`, `cheapest-…`, `budget-…-under-450000` | Geo-split is defensible; `/tier-golden-visa-400k/` (755 w, 3 inbound) duplicates the guides' intent without depth. |
| €800K tier | `athens-golden-visa-800000-areas`, `athens-suburbs-golden-visa-800000-guide`, `thessaloniki-…-800000` | Athens pair overlaps heavily — merge or sharply differentiate (city zones vs suburb-by-suburb). |
| Lawyer | `golden-visa-lawyer-greece-complete-guide`, `greece-golden-visa-lawyer-cost` | Well differentiated (choose vs cost). Keep both, cross-link. |
| Cost | `cost-of-buying-property-greece`, `hidden-costs-buying-property-greece` | Differentiated (fee schedule vs surprises). Keep both. |
| Yield | `greece-rental-yield-guide`, `gross-vs-net-yield-greece`, `highest-rental-yield-areas-greece`, `buy-to-let-greece-guide` | Four-way overlap on "greece rental yield". Needs an explicit hub/spoke split. |
| Athens | `guides/athens-property-investment-guide`, `/invest-athens-property/`, `areas/{glyfada,voula,kallithea,piraeus}` | `/invest-athens-property/` (365 w, **0 inbound**) adds nothing the guide does not. |
| Crete | `guides/crete-property-investment-guide`, `/invest-crete-property/`, `areas/{chania,heraklion,elounda}` | Same pattern: `/invest-crete-property/` 312 w, **0 inbound**. |

### A5 · P1 — Collection assignment is inconsistent

Place pages are split across `guides` and `areas` with no rule:

- **In `areas/`:** chania, costa-navarino, elounda, glyfada, heraklion, kalamata, kallithea, mykonos, piraeus, rhodes, santorini, voula
- **Place pages living in `guides/`:** `corfu-property-investment-golden-visa`, `nafplio-property-investment-golden-visa`, `paros-antiparos-property-investment`, `ellinikon-athens-property-investment`, plus the regional guides (athens, crete, cyclades, halkidiki, peloponnese, thessaloniki)

Consequence: `/areas/` hub shows 12 of ~22 place pages; breadcrumbs and `ItemList` coverage are wrong;
`rhodes` exists in **both** collections (`areas/rhodes-property-investment` + `guides/rhodes-golden-visa-400000-property-guide`).

### A6 · P1 — Internal links, orphans, funnel bridges

Measured on rendered HTML, **excluding** the global nav/footer set (`/ /about/ /areas/ /compare/ /contact/
/get-shortlist/ /guides/ /methodology/ /privacy-policy/ /projects/ /terms/`).

Inbound distribution across 129 content pages: `1–2: 31` · `3–5: 45` · `6–10: 28` · `11–20: 11` · `21+: 14`.

**Near-orphans (≤2 contextual inbound):** all 10 `projects/*` (**1 each — only the hub**), `news/*` (1),
`guides/non-resident-mortgage-greece` (1), 5 `compare/*` (2), and 15 guides including
`greece-golden-visa-us-citizens`, `greece-capital-gains-tax-property`, `greece-property-notary-process`,
`greek-property-glossary-foreign-buyers`.

**Money-page inbound:**

| Page | Contextual inbound | Note |
|---|---:|---|
| `/greece-golden-visa-consultation/` | **113** | healthy — recent funnel commit |
| `/greece-property-consultation/` | **0** | fully orphaned; 0 MDX files link to it |
| `/tools/greece-rental-yield-calculator/` | **0** | **no page on the site links to it** |
| `/tools/greece-property-cost-calculator/` | 2 | |
| `/tools/greece-golden-visa-zone-lookup/` | 5 | |
| `/tier-golden-visa-400k/` | 3 | |
| `/invest-athens-property/` | **0** | orphan |
| `/invest-crete-property/` | **0** | orphan |

Only **1 of 129** MDX files links to `/tools/` at all, and **zero** link to the rental-yield calculator —
despite four yield guides and a `gross-vs-net-yield` guide.

**In-content CTAs:** **95 of 129 pages have no `<InlineCta>`** — including all 10 projects, all 4 developers,
10 of 12 areas, and 6 of 12 compares. Every page does get the layout-injected `LeadForm` at the bottom, but
there is no mid-article bridge on three quarters of the corpus.

`golden-visa-eligible-projects-directory` (11.76% CTR, best on the site) **does not link to a single
`projects/*` page**.

### A7 · P1 — Freshness signals are flat

- `updatedDate`: **117 of 129 files share `2026-07-04`**; 7 share `2026-08-18`; 5 share `2026-06-17`.
- `pubDate`: 92 files share `2026-06-17`.

Identical bulk timestamps across a whole corpus are a weak (and detectable) freshness signal, and they make
genuine updates invisible in `dateModified`.

### A8 · P1 — Typography damage from dash normalisation

Em-dashes were replaced with commas, producing broken copy:

- `…hold **both** ,  Dubai tax residence plus Greece Golden Visa…` (`greece-golden-visa-uae-buyers`)
- `…same yield as Airbnb" on a Greek Golden Visa unit ,  illegal on the qualifying asset…`
- 18 ` , ` artifacts and 29 `  to  ` double-space artifacts in MDX bodies.

The same normalisation broke the **lead form**, which ships on **140 pages** — see B4.

### A9 · P2 — Metadata hygiene

`relatedSlugs` is empty on **21 files**, including top performers `crete-golden-visa-400000-property`
(top clicks) and `greece-golden-visa-120-square-meter-rule`.

**Hero image reuse:** Acropolis on 9 pages; Chania harbour on 5; Parthenon on 4. `developers/adonis-group`
and `projects/lotus-voula` share one image; so do `secland-development` and `the-grandline`.

**Not a finding — verified good:** FAQ counts pass every configured gate (areas 7, compare 8, developers 6,
guides 6–12 avg 7.8, projects 7). Legal facts spot-checked against primary-ish sources and hold up:
Law 5100/2024 tiers, the 120 m² **main usable area** reading (balconies/parking excluded), and
**Circular 1/2026 published 22 April 2026** are all correctly stated.

---

## B. RENDERED HTML — 152 pages in `dist/`

`npm run build` exits 0 and `audit:rendered:fail` reports **0 errors / 0 pages with issues**. The following
were all found by direct inspection of the same HTML the auditor passed.

### B1 · P0 — Duplicate `FAQPage` JSON-LD on every content page

`ArticleLayout.astro:95` emits an `FAQPage` from frontmatter `faq`, **and** `FaqBlock.astro` emits its own
`FAQPage` because MDX calls it without `noSchema`. Result: **132 pages ship 2+ `FAQPage` blocks**
(`projects/the-regal` ships 3).

Worse, on 7 pages the two blocks carry **different question sets**:

| Page | frontmatter Qs | inline Qs |
|---|---:|---:|
| `guides/cost-of-buying-property-greece` | 8 | 9 |
| `guides/crete-golden-visa-400000-property` | 6 | 9 |
| `guides/greece-golden-visa-250000-conversion-route` | 7 | 8 |
| `guides/greece-rental-yield-guide` | 10 | 9 |
| `guides/hidden-costs-buying-property-greece` | 7 | 6 |
| `guides/peloponnese-golden-visa-400000-property` | 7 | 8 |
| `news/greece-golden-visa-approvals-2025` | 4 | 5 |

Conflicting structured data on the same URL invites Google to ignore both.

### B2 · P0 — Every hero image ships `alt=""`

`ArticleLayout.astro:117` hardcodes `alt=""`. All 129 content pages have an unlabelled hero. `Header.astro`
does the same for the logo. Net: 2 empty-alt images per content page, 258 total. Zero image-search value,
and an accessibility failure on a YMYL site.

### B3 · P0 — Title tags are all over the truncation limit, and some are broken

**126 of 152 titles are 63–79 characters.** The ` | Greek Invest` suffix (15 chars) is consuming the SERP
budget on every page. Google truncates around 55–60 characters, so most titles are being cut mid-phrase.
This is the single most direct explanation for the CTR gaps in section D.

Outright defects:

| Page | Title | Problem |
|---|---|---|
| `guides/cost-of-buying-property-greece` | `Cost of Buying Property in Greece:: Full 2026 Fee Guide` | **double colon** — and this is the most-linked page on the site (80 inbound) |
| `guides/greece-golden-visa-circular-2026-explained` | `Greece Golden Visa Circular 2026:: Rules Explained 2026` | double colon + "2026" twice |
| `guides/greece-golden-visa-no-short-term-rental` | `Golden Visa Greece Airbnb:: STR Ban Rules 2026 Greece 2026` | double colon + "Greece" twice + "2026" twice |
| `compare/greece-vs-italy-vs-spain-property-investment` | `… Investment 2026 \| Greece \| Greek Invest` | stray `\| Greece` segment |
| `guides/athens-short-term-rental-moratorium-2026` | `… Rules and Zones \| Greece \| Greek Invest` | stray `\| Greece` |
| `guides/can-foreigners-buy-property-greece` | `… 2026 Rules \| Greece \| Greek Invest` | stray `\| Greece` |
| `guides/greece-rental-income-tax-non-resident` | `… Guide 2026 \| Greece \| Greek Invest` | stray `\| Greece` |
| `guides/off-plan-vs-resale-greece` | `… Which Route in 2026? \| Greece \| Greek Invest` | stray `\| Greece` |

### B4 · P0 — The lead form renders broken placeholder text on 140 pages

Dash normalisation turned the `<select>` placeholders into literal `,  Select , `:

```html
<option value="">,  Select , </option>
```

It also mangled the option labels: `€250K  to  €400K`, `€400K  to  €800K (Golden Visa tiers)`.
This is the primary conversion surface, on 140 pages.

### B5 · P1 — `llms-full.txt` is a 379-byte stub

`public/llms-full.txt` is five lines of boilerplate, not the corpus. `llms.txt` (746 B) lists **5 of 129
guides** and still says `## Key guides (batch 1 — publishing)`. For a site whose whole thesis is AI
citability, the file AI engines fetch for full context is empty.

`geo:audit` only greps `llms.txt` for `/scaffold|publishing next|TODO/i` — "batch 1 — publishing" slips past.

Positive: `robots.txt` correctly allows `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`.

### B6 · P1 — Schema coverage gaps

Present and correct on all 129 content pages: `Organization` + `Article` + `BreadcrumbList` + `FAQPage`.
Tools carry `WebApplication`. Missing:

- **Hub pages** (`/guides/ /areas/ /compare/ /projects/ /developers/ /news/`) have **`Organization` only** —
  no `CollectionPage`, no `ItemList`, no `BreadcrumbList`.
- **Money pages** (`/greece-golden-visa-consultation/`, `/greece-property-consultation/`, `/get-shortlist/`,
  `/tier-golden-visa-400k/`, `/invest-athens-property/`, `/invest-crete-property/`) have `Organization` only —
  no `Service`, no `FAQPage`, no `BreadcrumbList`.
- `Article.author` is `{"@type":"Organization","name":"Greek Invest Editorial"}`. For YMYL legal/tax content a
  named `Person` with credentials is materially stronger E-E-A-T.
- `Organization.logo` points at `favicon.svg` — SVG is not eligible for Google logo rich results.
- No `HowTo` on the step-by-step guides, no `Place`/`RealEstateListing` on areas/projects.

### B7 · P1 — Hotlinked third-party project images

12 project/developer heroes load straight from developer websites rather than Cloudinary:

- `solenagreece.com` — 6 files, **some already returning HTTP 403** (`ela-tinos`, `evripidou-piraeus`)
- `secland.gr` — 3 files, incl. `the-regal` → `建筑学长_1763379180180-1-1024x679.png` (403)
- `adonisgroup.gr` — 3 files

Broken heroes on the exact pages meant to convert project interest, plus Greek/Chinese filenames and no
optimisation. `qa:full:quick` catches this (Image URLs step FAILs) — it is being ignored.

### B8 · P2 — Small rendered issues

- `/site-report/` has no `<meta description>` and no canonical. It *is* correctly `noindex,nofollow`.
- `/thanks/` has no canonical.
- Homepage `<meta description>` is **208 characters** — truncated.
- `public/design-preview.html` and `public/logo-preview.html` ship to production and are crawlable
  (not in `robots.txt` disallow, not in sitemap).
- Sitemap: 150 URLs, correctly excluding `/thanks/` and `/site-report/`.

---

## D. GSC — CTR and commercial-query capture

Baseline: GSC 2025-05-01 → 2026-08-18. Site is young; impressions are growing faster than clicks.

| Page | Imp | Clicks | CTR | Pos | Diagnosis from this audit |
|---|---:|---:|---:|---:|---|
| `guides/enfia-property-tax-greece` | 770 | 3 | **0.39%** | 6.6 | Title is 71 chars → truncated. Ranks top-10 but the snippet never shows the payoff. First post-H2 sentence is the broken Golden Visa splice (A2), so Google has no clean direct answer to lift. |
| `areas/costa-navarino-property-investment` | 183 | 3 | 1.64% | 6.2 | 72-char title. No `<InlineCta>`. Empty hero alt. |
| `guides/greece-golden-visa-120-square-meter-rule` | 254 | 2 | 0.79% | 8.1 | 68-char title; `relatedSlugs` empty. Content itself is the strongest on the site — this is purely a snippet problem. |
| `guides/greece-golden-visa-lawyer-cost` | 289 | — | — | ~51 | Depth is fine; only 2 contextual inbound links. Needs links from all 10 nationality guides + the lawyer guide. |
| `greece-golden-visa-consultation` | — | 0 | — | ~78 | 382 words, `Organization` schema only, no FAQ, no breadcrumb. 113 inbound links point at a page too thin to rank. |

**Winners to protect:** `crete-golden-visa-400000-property` (8.0% CTR) and
`golden-visa-eligible-projects-directory` (11.76% CTR) prove the format works when the title fits. The
directory page's failure to link any `projects/*` page is the biggest single wasted click on the site.

**Structural CTR finding:** the ` | Greek Invest` suffix costs 15 characters on all 152 pages. Dropping it on
long titles (or shortening to ` | GI`) is the cheapest sitewide CTR lever available.

**Unserved query already in GSC:** *"what is included in a technical due diligence report for a greek villa"* —
`due-diligence-greece-property` ranks but does not answer it as a direct, extractable block.

---

## Severity roll-up

| ID | P | Finding | Blast radius |
|---|---|---|---|
| A1 | P0 | 19% verbatim boilerplate; one block repeated 1,219× | 124 files |
| A2 | P0 | 859 broken H2-spliced sentences | ~114 files |
| A3 | P0 | Near-duplicate nationality + project clusters (to 65% containment) | 20 files |
| B1 | P0 | Duplicate/conflicting `FAQPage` JSON-LD | 132 pages |
| B2 | P0 | `alt=""` on every hero | 129 pages |
| B3 | P0 | Titles over truncation limit; 8 with literal defects | 126 pages |
| B4 | P0 | Lead-form placeholders render `,  Select , ` | 140 pages |
| C1 | P0 | `validate:content --all` cannot run (see CODE-AUDIT) | whole gate |
| A4 | P1 | Cannibalisation, sharpest on the timeline pair | ~20 files |
| A5 | P1 | Place pages split between `guides` and `areas` | ~22 files |
| A6 | P1 | Tools/consultation orphans; 95 pages without in-content CTA | corpus-wide |
| A7 | P1 | 117 files share one `updatedDate` | 129 files |
| A8 | P1 | Em-dash → comma damage in body copy | 47 sites |
| B5 | P1 | `llms-full.txt` is a stub | GEO-wide |
| B6 | P1 | Hub/money-page schema gaps; Organization-only author | 25 pages |
| B7 | P1 | 12 hotlinked project images, several 403 | 12 pages |
| A9 | P2 | 21 files with empty `relatedSlugs`; hero reuse | 21 files |
| B8 | P2 | Homepage meta 208 chars; preview HTML in production | 4 pages |

---

## Method

- Corpus: `src/content/**/*.mdx`, frontmatter stripped, 5-gram shingles for similarity, boilerplate blocks
  removed before similarity so overlap is genuine body copy.
- Rendered: `npm run build` → 152 `index.html` in `dist/client`, parsed for meta/heading/schema/image/link data.
- Link graph: contextual inbound only — the 12 links present on ~every page (nav + footer) are excluded.
- Facts: spot-checked against public legal sources (Law 5100/2024, Circular 1/2026 of 22 Apr 2026, 120 m²
  usable-area reading).
- **Not covered:** live `greek-invest.com` could not be fetched — this environment's egress policy returns
  403 for the domain. The audit therefore used the local production build, which is byte-identical to what
  Vercel deploys. Live-only checks (www vs non-www canonical behaviour, real CWV, actual HTTP status codes)
  remain open and should be run from Cursor.
