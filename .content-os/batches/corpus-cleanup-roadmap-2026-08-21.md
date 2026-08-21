# Corpus cleanup roadmap — greek-invest.com

**Date:** 2026-08-21 · **Source:** `AUDIT-REPORT-2026-08-21.md` · **Batch size:** ~25 files
**Status:** proposal. Nothing executed. Awaiting «ок» from Maxim.

**Goal:** move GEO `unique` from 78 toward 90+ by removing duplication and repairing broken prose, without
touching the facts — which are sound.

**Sequencing rule:** Wave 0 unblocks measurement. Do not start Wave 1 until `validate:content --all` runs,
because otherwise no wave can be verified. Wave 0 is in `code-improvements-roadmap-2026-08-21.md`.

---

## Wave 1 — De-boilerplate the corpus (P0)

**Files:** 124 (all except 4 developers + 1 news) · **Split:** 5 batches of ~25 · **Est. removal:** ~115,000 words

The mechanical part is safe and scriptable; the replacement part is not. Do both, in this order, per batch.

### 1a. Remove (scripted, reviewable diff)

Delete every occurrence beyond the **first** per page of:

| Block | Occurrences | Keep |
|---|---:|---|
| `- €800,000 prime vs €400,000 regional tiers under Law 5100/2024 …` 4-bullet list | 1,219 | 0 — replace with page-specific facts |
| `\| Planning line \| Greek Invest 2026 band \|` table | 639 | max 1, only where tiers are on-topic |
| `Insider tip: MORE Group sequences engineer, cadastre, and bank files …` | 517 | 0 |
| `Insider tip: MORE Group underwriting in 2026 sequences …` | 114 | 0 |
| `**Insider tip:** MORE Group files in 2026 show this step fails most often …` | 107 | 0 |
| `Insider tip: MORE Group underwriting in 2026 treats this as a hard gate …` | 92 | 0 |
| `MORE Group underwrites this checkpoint …` | 936 | 0 |
| `Greek Invest is the English-language Greece property desk for MORE Group …` | 153 | max 1, in an author/about block |

**Guardrail:** `corpus-cleanup-mode.md` forbids mass regex delete. Run per batch of 25, commit each batch
separately, diff-review before the next. Word counts must stay above `site.config.json` minimums
(guides 2,000 / areas 1,200 / projects 1,200 / developers 1,000) — after removal the thinnest guide sits
around 3,000 words, so there is headroom, but verify per file.

### 1b. Replace with page-specific substance (manual, the actual work)

Removing 19% of a page without replacing it makes a thin page. Each stripped section gets **one** of:

- a **page-specific data point** (price/m² for *that* area, actual fee for *that* step, real timeline for
  *that* nationality),
- a **worked example** using that page's own numbers,
- a **decision rule** ("choose X when …, choose Y when …"),
- or nothing, where the page is already complete without it.

Priority order within Wave 1 — highest boilerplate density first:

| Batch | Files | Lead files by density |
|---|---|---|
| 1.1 | 25 | `hidden-costs-buying-property-greece` (35%), `athens-vs-thessaloniki-golden-visa-investment` (28%), `budget-golden-visa-property-under-450000-greece` (28%), `golden-visa-greece-bank-transfer-proof-funds` (28%), `crete-vs-cyclades-property-investment` (26%) |
| 1.2 | 25 | 24–26% band: `golden-visa-parents-dependents-included`, `greece-golden-visa-family-members-rules`, `greece-vs-cyprus-golden-visa-property`, `corfu-property-investment-golden-visa`, `greece-golden-visa-120-square-meter-rule` |
| 1.3 | 25 | 21–23% band, incl. **`enfia-property-tax-greece`** (23% — CTR priority, pull forward if desired) |
| 1.4 | 25 | 17–20% band |
| 1.5 | 24 | ≤16% band + all 10 `projects/*` (~11%) |

**Definition of done per batch:** boilerplate share <3%; `geo:audit` `unique` not regressed;
`validate:content --all` passes; word count above collection minimum.

---

## Wave 2 — Repair broken sentences and headings (P0)

**Files:** ~114 · **Instances:** 859 spliced sentences + damaged headings

### 2a. The H2-splice pattern

Every `<H2 text> requires €400,000 regional or €800,000 prime investment under Law 5100/2024, …` becomes a
genuine **direct answer** to the H2 question — one or two sentences, specific to that section, leading with
the number or rule the heading promises.

This is the single highest-leverage AEO fix in the whole roadmap: it replaces 859 nonsense strings with 859
extractable answers, in the exact position engines quote from.

Do not batch-generate a new template. If a section cannot carry a specific answer, delete the sentence.

### 2b. Damaged headings

- `## What should foreign buyers know about thessaloniki's Key Investment Submarkets?` → sentence case fixed,
  proper nouns capitalised
- `## What should foreign buyers know about risks and How to Manage Them?` (10×) → rewrite per page
- `## What should foreign buyers know about scam 2: Deposit to the Wrong Account` → `## Scam 2: deposit to the wrong account`

Strip the mechanical `What should foreign buyers know about …` prefix where it produces a mid-sentence
lower-case proper noun. Keep genuine question headings — they earn PAA placements.

### 2c. Em-dash damage (A8)

18 ` , ` and 29 `  to  ` artifacts in MDX bodies. Restore intended punctuation:
`…hold **both** ,  Dubai tax residence…` → `…hold **both**: Dubai tax residence…`.

Do **not** reintroduce em-dashes — the house rule bans them. Use a colon, a full stop, or a rewrite.

---

## Wave 3 — Differentiate the near-duplicate clusters (P0)

### 3a. Nationality cluster — 10 files, up to 65% containment

`greece-golden-visa-us-citizens`, `-canadian-buyers`, `-australian-buyers`, `-indian-buyers`, `-uae-buyers`,
`-french-buyers`, `-german-buyers`, `israeli-buyers-greece-property`, `turkish-buyers-greece-property`,
`brexit-uk-buyers-greece-property`.

Each needs a **country-unique spine** that cannot be swapped between pages:

- the **double-tax treaty** article that governs Greek rental income and CGT for that country
- **home-country reporting** (US: FBAR/FATCA/PFIC; EU: CRS; India: LRS $250k cap and RBI rules;
  UAE: no treaty CGT interaction; Israel: Israeli CGT credit)
- **FX and transfer mechanics** from that country under Circular 1/2026 traceability
- **consulate/biometrics** route and typical lead times for that nationality
- **actual 2025 approval volumes** for that nationality where published

Target: <20% mutual containment. Where a country cannot sustain a unique page, **consolidate into a single
"Golden Visa by nationality" hub** and 301 the thin ones — better one strong page than six doorway pages.

### 3b. Projects cluster — 10 files, 28–47% containment

All 10 share one skeleton. Differentiate with per-project specifics that already exist off-site: unit mix and
actual asking €/m², delivery date and construction stage, the developer's completed-project track record,
which Golden Visa tier the units clear at 120 m², and the specific title/permit status.

### 3c. Areas cluster

`mykonos ⟷ santorini` (45.9%), `glyfada ⟷ rhodes` (37.4%), `rhodes ⟷ santorini` (32.6%). Rebuild each around
its own price bands, seasonality, rental regime and buyer profile.

---

## Wave 4 — Cannibalisation and collection structure (P1)

### 4a. Consolidations

| Action | Pages | Rationale |
|---|---|---|
| **Merge** | `golden-visa-greece-timeline-2026-realistic` + `greece-golden-visa-timeline-application-2026` | Same intent. Keep the better URL, 301 the other, merge the month-map and the phase-data. |
| **Merge or sharply split** | `athens-golden-visa-800000-areas` + `athens-suburbs-golden-visa-800000-guide` | If kept: one = which zones qualify; the other = suburb-by-suburb pricing. No overlap. |
| **Fold in** | `/tier-golden-visa-400k/` (755 w, 3 inbound) | Either build it into the real €400K hub linking Crete/Peloponnese/Rhodes, or 301 to `greece-golden-visa-property-tiers-2026`. |
| **301** | `/invest-athens-property/`, `/invest-crete-property/` | 0 inbound, 312–365 w, duplicate the corresponding guides. Redirect to `guides/athens-property-investment-guide` and `guides/crete-property-investment-guide`. |
| **Hub/spoke** | `greece-rental-yield-guide` (hub) ← `gross-vs-net-yield-greece`, `highest-rental-yield-areas-greece`, `buy-to-let-greece-guide` | Declare the hub, make the three spokes narrow, cross-link all four. |

### 4b. Collection assignment

Adopt one rule: **`areas/` = a specific place you can buy in; `guides/` = a topic or process.**

Move to `areas/`: `corfu-property-investment-golden-visa`, `nafplio-property-investment-golden-visa`,
`paros-antiparos-property-investment`, `ellinikon-athens-property-investment`.

Decide explicitly for the regional guides (`athens-`, `crete-`, `cyclades-`, `halkidiki-`, `peloponnese-`,
`thessaloniki-property-investment-guide`) — either a new `regions/` collection or keep in `guides/` as
region pillars that link down to `areas/`.

Resolve the Rhodes duplication: `areas/rhodes-property-investment` vs
`guides/rhodes-golden-visa-400000-property-guide`.

**Every move needs a 301.** Slug changes are forbidden until Maxim approves this section specifically.

---

## Wave 5 — Internal links and consultation bridges (P1)

| Fix | Detail |
|---|---|
| **Tools** | Link `/tools/greece-rental-yield-calculator/` from all 4 yield guides + `buy-to-let` + all 12 `areas/`. Currently **0 pages link to it**. Same for the cost calculator from the 2 cost guides, and the zone lookup from every tier/area page. |
| **Projects** | `golden-visa-eligible-projects-directory` (11.76% CTR — best page on the site) must link every `projects/*` page. All 10 currently have exactly 1 inbound link. |
| **Developers** | Link each developer from its own projects and back. |
| **Property consultation** | `/greece-property-consultation/` has **0** inbound from MDX. Bridge it from the non-Golden-Visa intent pages (yield, buy-to-let, areas, market forecast) so it stops competing with the GV consultation page. |
| **Lawyer cost** | `greece-golden-visa-lawyer-cost` (pos ~51, 2 inbound) needs links from all 10 nationality guides, `golden-visa-lawyer-greece-complete-guide`, `cost-of-buying-property-greece`, `hidden-costs-…`. |
| **In-content CTA** | **95 of 129 pages have no `<InlineCta>`.** Add one mid-article CTA matched to intent: GV pages → GV consultation; yield/area pages → property consultation or the calculator; project pages → shortlist. |
| **`relatedSlugs`** | Empty on 21 files, incl. `crete-golden-visa-400000-property` and `greece-golden-visa-120-square-meter-rule`. Populate all 21. |
| **Near-orphans** | 31 pages at ≤2 contextual inbound — bring each to ≥5 from topically adjacent pages. |

---

## Wave 6 — CTR rewrites on commercial pages (P1, fast win)

Titles must land **≤60 characters including the suffix**, or drop the suffix. Every one of these ranks
already — this is snippet work, not ranking work.

| Page | Now | Problem | Proposed |
|---|---|---|---|
| `enfia-property-tax-greece` | `ENFIA Greece 2026: Rates per m² and €450K Athens Example \| Greek Invest` (71) | truncated; payoff cut | `ENFIA Greece 2026: €2–16.20/m² + Who Pays` (42) |
| `greece-golden-visa-120-square-meter-rule` | 68 ch | truncated | `Greece Golden Visa 120 m² Rule: One Deed Only` (45) |
| `costa-navarino-property-investment` | 72 ch | truncated | `Costa Navarino Property: Prices & Golden Visa 2026` (50) |
| `greece-golden-visa-lawyer-cost` | 65 ch | pos ~51 | `Greece Golden Visa Lawyer Cost: €1,500–4,000` (44) |
| `cost-of-buying-property-greece` | `…Greece:: Full 2026 Fee Guide` | **double colon**, 80 inbound links | `Cost of Buying Property in Greece: 2026 Fees` (44) |
| `greece-golden-visa-circular-2026-explained` | `…Circular 2026:: Rules Explained 2026` | double colon, "2026" ×2 | `Greece Golden Visa Circular 1/2026 Explained` (44) |
| `greece-golden-visa-no-short-term-rental` | `…Airbnb:: STR Ban Rules 2026 Greece 2026` | double colon, "Greece" ×2, "2026" ×2 | `Golden Visa Greece: Airbnb Ban Rules 2026` (41) |
| 4 pages with stray `\| Greece \|` | `…\| Greece \| Greek Invest` | duplicate brand segment | strip the stray segment |

Then sweep the remaining **126 pages over 60 characters**. Decide the suffix policy first: dropping
` | Greek Invest` on long titles recovers 15 characters sitewide and is the cheapest CTR lever available.

**Meta descriptions:** lead with the number, then the qualifier, then the action. Homepage's 208-character
description must come down to ~155.

**Direct-answer blocks:** on every page in this wave, the first paragraph after the H1 answers the query in
≤40 words with the key figure in the first sentence. Add a direct-answer block for the known unserved query
*"what is included in a technical due diligence report for a greek villa"* on `due-diligence-greece-property`.

---

## Wave 7 — Freshness, media, metadata (P2)

- **`updatedDate`:** 117 files share `2026-07-04`. Stop bulk-stamping. Set `updatedDate` only when a page
  genuinely changes — which the cleanup waves will do naturally, staggering the dates as a side effect.
- **Hotlinked images (12 files):** upload the Solena / SECLAND / Adonis project images to Cloudinary and
  re-point. Several already 403. Confirm redistribution rights with each developer first.
- **Hero reuse:** Acropolis on 9 pages, Chania harbour on 5, Parthenon on 4. Source distinct imagery for at
  least the commercial pages.
- **`heroAlt`:** add per-page alt text as the schema field lands (see code roadmap C6).

---

## Batch plan

| Wave | Files | Batches | Blocking? |
|---|---:|---:|---|
| 0 (code) | — | — | **Yes** — fixes `validate:content` |
| 1 De-boilerplate | 124 | 5 × 25 | after Wave 0 |
| 2 Broken sentences | ~114 | 5 × 25 | can run with Wave 1 per batch |
| 3 Differentiate clusters | 20 | 2 | after Wave 1 |
| 4 Cannibalisation + structure | ~20 | 2 | needs 301 sign-off |
| 5 Internal links | corpus | 3 | after Wave 4 (slugs settle first) |
| 6 CTR rewrites | ~130 | 3 | **can start immediately** — independent |
| 7 Freshness/media | ~30 | 2 | last |

**Recommended order if you want results fastest:** Wave 0 → Wave 6 (CTR, immediate GSC impact on pages that
already rank) → Wave 1+2 together → Wave 5 → Wave 3 → Wave 4 → Wave 7.

**Rollback:** one branch per wave, one commit per batch of 25, `geo:audit` + `validate:content --all` +
`build` green before each merge.
