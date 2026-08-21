# Code improvements roadmap — greek-invest.com

**Date:** 2026-08-21 · **Source:** `CODE-AUDIT-2026-08-21.md`
**Status:** proposal. No code changed. Awaiting «ок» from Maxim.

**Constraint:** `CLAUDE.md` forbids Astro/layout refactors without explicit approval. Every item below that
touches `src/layouts/` or `src/components/` is flagged **[needs layout ok]**.

---

## Wave 0 — Unblock measurement (P0, do first)

Nothing else can be verified until these land.

### 0.1 Fix `validate:content --all` — `scripts/lib/more-content-gate.mjs:13`

```js
// now — escapes the repo, resolves to /home/user/scripts/lib/…
import { runCloudinaryDeliveryChecks } from '../../../scripts/lib/cloudinary-gate.mjs';
```

Vendor `cloudinary-gate.mjs` into `scripts/lib/`, or relocate it into `more-group-content-os/scripts/lib/`
and import through the submodule. Then make a missing gate module fail with a clear message rather than an
`ERR_MODULE_NOT_FOUND` stack.

**Verify:** `npm run validate:content -- --all` → 129/129, from a clean clone.

### 0.2 Add `compare` to `site.config.json.contentCollections`

12 pages currently have no `minWords`, no `faqMin`, and no smoke coverage. Suggested:
`{ dir: "compare", urlPrefix: "/compare/", minWords: 1800, faqMin: 5 }` — current compare pages run
~3,800–4,800 words with 8 FAQs, so this gates without forcing rewrites.

### 0.3 Restore green on `qa:full:quick`

Currently 3/6. After 0.1 the content step passes. The Image URLs step needs the 12 hotlinked developer
images moved to Cloudinary (corpus Wave 7). The HTTP smoke step fails only because this environment blocks
egress to `greek-invest.com` — re-run from Cursor to confirm it passes there.

---

## Wave 1 — Correctness bugs shipping to users (P0)

### 1.1 Duplicate `FAQPage` JSON-LD — 132 pages **[needs layout ok]**

`ArticleLayout.astro:95` and `FaqBlock.astro` both emit. Make the layout the single owner:

- `FaqBlock.astro` — default `noSchema = true`, or drop schema emission entirely
- `ArticleLayout.astro` — always emit `faqSchema` from frontmatter, and pass `noSchema` to its own `<FaqBlock>`
- reconcile the 7 pages where frontmatter and inline FAQ sets differ (listed in the audit report)

**Verify:** exactly one `"@type":"FAQPage"` per page across `dist/`.

### 1.2 Lead-form placeholders — 140 pages

`LeadForm.astro`: `,  Select , ` → `— Select —` (or `Select…`), and `€250K  to  €400K` → `€250K–€400K`.
Add `src/components/**` to the exclude list in `scripts/lib/normalize-typographic-dashes.mjs` — the dash rule
is a prose rule and must not rewrite UI strings.

### 1.3 Hero and logo `alt` **[needs layout ok]**

- add optional `heroAlt` to the content schema
- `ArticleLayout.astro:117` — `alt={heroAlt ?? derivedFallback}`; never fall back to `title` (duplicates H1)
- `Header.astro` — logo `alt="Greek Invest"`, or mark decorative and add a visible text label (a text label
  is already present, so `alt=""` on the logo alone is defensible — the hero is the real bug)

### 1.4 Title defects

Fix in MDX frontmatter, not in code: two `::` double colons, three duplicated-token titles, four stray
`| Greece |` segments. Full list in the audit report, rewrites in the corpus roadmap Wave 6.

Then add the guard in Wave 4.1 so they cannot come back.

---

## Wave 2 — Navigation and discovery (P0/P1)

### 2.1 Mobile navigation — currently none **[needs layout ok]**

`Header.astro` nav is `hidden md:flex` with no `md:hidden` alternative. Below the `md` breakpoint the site
has no navigation at all.

Add a disclosure menu (`<details>`-based works without JS and keeps it dependency-free) exposing the full nav
plus Golden Visa, Tools, Developers.

### 2.2 Nav and footer information architecture **[needs layout ok]**

Header today: Guides · Projects · Areas · Compare · About · Contact.

Proposed: **Golden Visa** · Guides · Areas · Projects · Compare · **Tools** · About · Contact.

"Golden Visa" is the commercial core and has no nav entry. Point it at a new `/golden-visa/` hub (Wave 3.2)
or, as an interim, `guides/greece-golden-visa-property-guide-2026`.

Footer Explore currently has 3 links. Expand to Areas, Projects, Developers, Tools, News, and both
consultation pages.

### 2.3 Create `/tools/index.astro`

`src/pages/tools/` has three leaf pages and no hub. Zero pages link to the rental-yield calculator today.

---

## Wave 3 — Commercial surfaces (P1)

### 3.1 Money pages: depth + schema

`/greece-golden-visa-consultation/` (382 w), `/greece-property-consultation/` (335 w), `/get-shortlist/`
(231 w), `/tier-golden-visa-400k/` (755 w) carry `Organization` schema only.

Each needs: `Service` (or `ProfessionalService`) + `FAQPage` + `BreadcrumbList`, 800–1,200 words of genuine
process/eligibility/pricing content, and a visible "what happens after you submit" sequence.

`/greece-golden-visa-consultation/` receives 113 internal links and sits at position ~78 with 0 clicks. The
links are fine; the page is too thin to convert them.

### 3.2 Golden Visa hub — new page

There is no `/golden-visa/` hub. Build one as the nav target and the cluster's canonical entry: tiers,
120 m² rule, eligible zones, timeline, costs, by-nationality, consultation. This is the highest-value
new page on the site.

### 3.3 Redirect the two orphan landing pages

`/invest-athens-property/` and `/invest-crete-property/` — 0 inbound, 312–365 words, duplicate the
corresponding guides. 301 to `guides/athens-property-investment-guide` and
`guides/crete-property-investment-guide`. Add to `vercel.json`.

### 3.4 Hub pages: `CollectionPage` + `ItemList` + `BreadcrumbList` **[needs layout ok]**

All six hubs emit `Organization` only.

### 3.5 Populate `src/data/featured.ts`

All arrays are empty, so the "Start here" rail on `/guides/` never renders and 90 guides sit in one flat
date-sorted grid — with 92 sharing the same `pubDate`, the order is effectively arbitrary.

Suggested `FEATURED_GUIDE_SLUGS`: `greece-golden-visa-property-guide-2026`,
`greece-golden-visa-property-tiers-2026`, `crete-golden-visa-400000-property`,
`cost-of-buying-property-greece`, `greece-rental-yield-guide`, `buy-property-greece-foreigner`.

Cheapest available internal-link-equity fix.

### 3.6 Homepage rebuild **[needs layout ok]**

- **Delete the "Launching now" section.** A 129-page site says it is "launching now" and lists six guides as
  plain text, not links.
- Add featured guide / area / project rails once 3.5 lands.
- Add a Golden Visa entry block.
- Add an FAQ section → `FAQPage` schema on the highest-authority URL.
- Cut `<meta description>` from 208 to ~155 characters.
- Reconsider the H1 — "Understand Greece property before you buy" carries no target keyword.

---

## Wave 4 — Make the harness catch what it missed (P0 for prevention)

The harness reported 0 errors across 129 pages while every P0 in the audit was true. Add:

### 4.1 Title / description budget check
Fail over 60 characters (title) and 160 (description); warn under 25/80. Flag `::`, repeated tokens, and
repeated `|` segments. **Would have caught 126 over-length titles and all 8 defects.**

### 4.2 Duplicate-block detector
5-gram shingles across the corpus. Fail when a block ≥40 words repeats >3× corpus-wide or >1× within a page.
**Would have caught the 1,219× block.**

### 4.3 Duplicate JSON-LD `@type` per page
Fail on more than one `FAQPage` / `Article` / `BreadcrumbList` per URL. **Would have caught 132 pages.**

### 4.4 Non-empty `alt` on content images
`audit-rendered-live.mjs` currently passes `alt=""`. **Would have caught 129 heroes.**

### 4.5 Broken-sentence heuristic
Flag a sentence whose opening clause duplicates the preceding H2 text. **Would have caught all 859.**

### 4.6 Internal-link floor
Fail any content page under 3 contextual inbound links (excluding nav/footer). **Would have caught the 31
near-orphans and all 10 projects.**

### 4.7 Tighten the `llms.txt` staleness regex
`geo-citability-audit.mjs:80` tests `/scaffold|publishing next|TODO/i`; the live file says
`batch 1 — publishing` and passes. Add `batch \d`, `publishing`, `coming soon`.

---

## Wave 5 — GEO / AEO infrastructure (P1)

### 5.1 Generate `llms.txt` and `llms-full.txt` at build time

`llms-full.txt` is 379 bytes; `llms.txt` lists 5 of 129 guides. Emit both from the collections during build:
full URL inventory, per-page one-line summaries, key facts and figures with dates. This is the file AI
engines fetch for full context, and it is empty.

### 5.2 E-E-A-T entity work **[needs layout ok]**

- `Article.author` is `Organization`. For YMYL tax/legal content, add a credentialed `Person` author and a
  `reviewedBy` where a Greek lawyer has reviewed.
- `Organization.logo` → `favicon.svg`; SVG is not eligible for Google logo rich results. Add a raster ≥112×112.
- Consider `HowTo` on the step-by-step guides and `Place` on areas.

---

## Wave 6 — Hygiene (P2)

- Derive `site-report` metrics from `getCollection()` — `129`, `90 guides`, `92/100`, `18 Aug`, `v1.2` are
  hardcoded at ~24 line positions and will drift.
- Remove `public/design-preview.html` and `public/logo-preview.html` from production, or `Disallow` them.
- Rename the Mexico-template image scripts (`upload-mexico-cloudinary.py`, `rollout-mexico-cloudinary*.mjs`).
- Add `<meta description>` and canonical to `/site-report/`; canonical to `/thanks/`.
- Remove or wire up the unreferenced root-level `check_word_count.py`.

---

## Sequencing

| Wave | Theme | Layout ok needed? | Blocks |
|---|---|---|---|
| 0 | Unblock measurement | no | everything |
| 1 | User-facing bugs | **yes** (1.1, 1.3) | — |
| 2 | Navigation | **yes** | Wave 3 |
| 3 | Commercial surfaces | **yes** (3.4, 3.6) | — |
| 4 | Harness gaps | no | prevents regression |
| 5 | GEO infrastructure | **yes** (5.2) | — |
| 6 | Hygiene | no | — |

**Recommended:** Wave 0 → Wave 4 (so the corpus waves are measurable) → Wave 1 → Wave 2 → Wave 3 → Wave 5 → Wave 6.

Waves 0, 4 and 6 need no layout approval and can start on «ок» alone.
