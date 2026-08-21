# Greek Invest — Phase 0 code audit

**Date:** 2026-08-21 · **Branch:** `claude/greece-audit-phase-zero-km4045`
**Scope:** Astro 6 / Tailwind 4 / Vercel adapter · 29 `.astro` pages · 13 components · 2 layouts · `scripts/`
**Status:** audit only. No code changed.

---

## 0. Executive summary

The build is healthy (`npm run build` exits 0 in ~28 s) and the content-collection architecture is sound.
Three classes of defect matter:

1. **The primary content gate does not run.** `validate:content --all` dies on a missing module. `qa:full`
   reports 3/6 PASS. The green baseline in `STATUS.md` is not reproducible from a clean clone or in CI.
2. **Navigation is broken on mobile and omits the money topic.** There is no mobile menu at all, and
   "Golden Visa" — the site's entire commercial thesis — has no nav entry.
3. **Curation infrastructure exists but is switched off.** Every `FEATURED_*` array is empty, so the
   "Start here" rails never render and 90 guides land in one undifferentiated date-sorted grid.

---

## C1 · P0 — `validate:content --all` cannot run

```
$ npm run validate:content -- --all
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/user/scripts/lib/cloudinary-gate.mjs'
  imported from /home/user/greek-invest-website/scripts/lib/more-content-gate.mjs
```

`scripts/lib/more-content-gate.mjs:13`:

```js
import { runCloudinaryDeliveryChecks } from '../../../scripts/lib/cloudinary-gate.mjs';
```

`../../../` from `greek-invest-website/scripts/lib/` escapes the repository into the parent directory. The
file exists nowhere in this repo or the `more-group-content-os` submodule. It only resolves on a machine
where a sibling monorepo happens to sit next to the clone.

**Impact:** the whole `qa-audit.mjs` gate — word counts, FAQ minimums, frontmatter validation — is dead in CI,
in a fresh clone, and in this session. `.githooks/pre-push` runs `validate:content` on MDX changes, so the
pre-push gate is also dead.

**Fix:** vendor `cloudinary-gate.mjs` into `scripts/lib/`, or move it into the `more-group-content-os`
submodule and import via the submodule path. Then make the import failure hard-fail loudly rather than
crash with a stack trace.

## C2 · P0 — `qa:full:quick` is 3/6 PASS and is being ignored

| Step | Result |
|---|---|
| Corpus signals | PASS |
| **Content validate (full corpus)** | **FAIL** — C1 |
| **Image URLs (HTTP 200)** | **FAIL** — 403s on hotlinked developer images |
| GEO citability (`--changed`) | PASS |
| **HTTP smoke (live)** | **FAIL** — 403 (this environment's egress policy, not a site fault) |
| Rendered HTML | PASS |

The image failures are real and shipping: `solenagreece.com` and `secland.gr` heroes return 403 on
`projects/ela-tinos`, `projects/evripidou-piraeus`, `projects/the-regal`, `projects/ela-suites-kastella`.

## C3 · P0 — The QA harness is blind to the corpus's biggest defect

`npm run build && audit:rendered:fail` reports **0 errors across 129 pages** while the corpus contains 19%
verbatim boilerplate, 859 broken sentences, duplicate `FAQPage` schema on 132 pages, and `alt=""` on every
hero. `geo:audit` scores 92/100 grade A with 0 hard fails.

The harness measures presence, not quality or uniqueness. Missing checks:

- **Intra-page and cross-page duplicate-block detection** (n-gram/shingle). This alone would have surfaced A1.
- **Duplicate JSON-LD `@type` per page** — would have caught B1.
- **`alt` non-empty on content images** — `audit-rendered-live.mjs` passes empty alts.
- **Title/description pixel-or-character budget** — 126 pages are over.
- **`compare` collection has no entry in `site.config.json.contentCollections`**, so its 12 pages have no
  `minWords`, no `faqMin`, and are excluded from smoke checks entirely.

## C4 · P0 — No mobile navigation

`src/components/Header.astro`:

```html
<nav class="hidden md:flex items-center gap-6 text-sm font-medium">
```

There is no hamburger, no `md:hidden` menu, no disclosure element anywhere in `Header.astro` or
`BaseLayout.astro`. **Below the `md` breakpoint the entire site navigation is unreachable** — a mobile
visitor gets the logo and the "Free shortlist" button, nothing else. For a market where most research
traffic is mobile, this caps engagement and internal-link discovery.

The footer offers only three Explore links (`/guides/`, `/compare/`, `/methodology/`), so it does not
compensate.

## C5 · P0 — Duplicate `FAQPage` emission

Two independent emitters:

- `src/layouts/ArticleLayout.astro:95` — `const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])]`
- `src/components/FaqBlock.astro` — emits its own `FAQPage` unless `noSchema` is passed, which no MDX file does

`ArticleLayout` already tracks `hasInlineFaqBlock` to avoid rendering a *second visible* FAQ block, but does
not apply the same condition to the *schema*. 132 pages ship duplicates; 7 ship conflicting question sets.

**Fix (single owner):** make `ArticleLayout` the only emitter — pass `noSchema` from the layout's own
`<FaqBlock>` usage and have MDX-level `<FaqBlock>` default to `noSchema`. Then reconcile the 7 pages where
frontmatter and inline FAQ sets differ.

## C6 · P0 — `alt=""` hardcoded on hero and logo

- `src/layouts/ArticleLayout.astro:117` — `<img src={heroImage} alt="" …>` on all 129 content pages
- `src/components/Header.astro` — `<img src="/favicon.svg?v=3" alt="" …>` on all 152 pages

`heroAlt` is not in the content schema. Add an optional `heroAlt` frontmatter field with a sensible derived
fallback (never the raw title — that duplicates the H1).

## C7 · P0 — Lead form placeholders are corrupted

`src/components/LeadForm.astro`:

```html
<option value="">,  Select , </option>
<option value="250-400k">€250K  to  €400K</option>
```

Em-dash normalisation (`scripts/lib/normalize-typographic-dashes.mjs`) replaced `—` with `, ` in source. The
component ships on 140 pages. The `  to  ` double spaces come from the same pass.

**Fix:** restore proper placeholders and add the component files to the normaliser's exclude list — the
dash policy is a *prose* rule and should not touch UI strings.

## C8 · P1 — Editorial curation is configured but empty

`src/data/featured.ts`:

```ts
export const FEATURED_PROJECT_SLUGS = [] as const;
export const HOMEPAGE_HERO_PROJECT_SLUG = '' as const;
export const FEATURED_GUIDE_SLUGS = [] as const;
export const FEATURED_AREA_SLUGS = [] as const;
```

Consequences:

- `src/pages/guides/index.astro` guards `{priority.length > 0 && …}` — the **"Start here" rail never renders**.
  All 90 guides appear in a single flat grid sorted by `pubDate` descending, and 92 of them share the same
  `pubDate` (`2026-06-17`), so the order is effectively arbitrary.
- The homepage surfaces no guide, area, or project cards at all — only counts in stat pills.

This is the cheapest available fix for internal-link equity: populating these arrays immediately pushes
PageRank toward the pillars.

## C9 · P1 — Homepage still ships pre-launch copy

`src/pages/index.astro`:

```html
<h2 class="text-2xl mb-3">Launching now</h2>
<p>We are publishing buyer guides… First batch covers ownership rules, transfer costs, net yields…</p>
<ul>
  <li>Greece Golden Visa property guide 2026 (pillar)</li>
  <li>Greece property investment guide</li>
  …
</ul>
```

A site with 129 published pages tells visitors it is "launching now" and lists six guides as **plain text,
not links**. For a high-ticket YMYL audience this reads as abandoned, and it wastes six pillar links.

Also on the homepage:

- `<meta description>` is 208 characters (truncated in SERP).
- H1 "Understand Greece property before you buy" carries no target keyword.
- No FAQ section → no `FAQPage` schema on the highest-authority URL.
- No Golden Visa entry point despite it being the commercial core.

## C10 · P1 — Navigation omits the commercial core

`Header.astro` nav = Guides · Projects · Areas · Compare · About · Contact.

Missing: **Golden Visa**, **Tools**, **Developers**, **News**. Footer Explore = Guides · Comparisons ·
Methodology only.

Measured effect: `/tools/greece-rental-yield-calculator/` has **zero** inbound links from anywhere on the
site; only 1 of 129 MDX files links to `/tools/` at all; `/greece-property-consultation/` has zero.

There is also **no `/tools/` hub page** — `src/pages/tools/` contains three leaf pages and no `index.astro`.

## C11 · P1 — Money pages are thin and under-schema'd

| Page | Words | Schema | Contextual inbound |
|---|---:|---|---:|
| `/greece-golden-visa-consultation/` | 382 | Organization only | 113 |
| `/greece-property-consultation/` | 335 | Organization only | 0 |
| `/get-shortlist/` | 231 | Organization only | 0 (nav/footer only) |
| `/tier-golden-visa-400k/` | 755 | Organization only | 3 |
| `/invest-athens-property/` | 365 | Organization only | 0 |
| `/invest-crete-property/` | 312 | Organization only | 0 |

None carry `Service`, `FAQPage`, or `BreadcrumbList`. `/greece-golden-visa-consultation/` receives 113
internal links and still sits at position ~78 with 0 clicks — the links are not the bottleneck, the page is.

`/invest-athens-property/` and `/invest-crete-property/` are 0-inbound orphans that duplicate
`guides/athens-property-investment-guide` and `guides/crete-property-investment-guide`.

## C12 · P1 — Hub pages have no `ItemList` / `CollectionPage` schema

`/guides/ /areas/ /compare/ /projects/ /developers/ /news/` emit `Organization` only. They correctly list all
items (90 / 12 / 12 / 10 / 4 / 1), but give search engines no collection semantics and no breadcrumb.

`/guides/` renders 90 cards with no pagination, no filtering, and no topical grouping.

## C13 · P2 — `site-report` metrics are hardcoded

`src/pages/site-report/index.astro` hardcodes `129`, `90 guides`, `12 areas`, `12 compare`, `92/100`,
`18 Aug`, `v1.2` at ~24 separate line positions. These will silently drift from reality on the next content
change. Derive from `getCollection()` and a generated metrics JSON.

Correctly `noindex,nofollow` and excluded from the sitemap — good.

## C14 · P2 — `llms.txt` / `llms-full.txt` are hand-maintained and stale

Both live in `public/` with no generator. `llms-full.txt` is 379 bytes; `llms.txt` lists 5 of 129 guides and
says "batch 1 — publishing". `geo-citability-audit.mjs:80` only tests
`/scaffold|publishing next|TODO/i`, which that string does not match.

**Fix:** generate both at build time from the collections, and tighten the staleness regex.

## C15 · P2 — Miscellaneous

- `public/design-preview.html` and `public/logo-preview.html` ship to production, crawlable, not in
  `robots.txt` disallow.
- `package.json` image scripts still reference the Mexico template:
  `"images:upload": "python3 scripts/upload-mexico-cloudinary.py …"`, `rollout-mexico-cloudinary.mjs`.
  Cosmetic, but it is how template residue survives.
- `site.config.json.contentCollections` omits `compare` (see C3).
- `Organization.logo` → `favicon.svg`; SVG is not eligible for Google logo rich results. Needs a raster
  ≥112×112.
- `Article.author` is an `Organization`. For YMYL tax/legal content a credentialed `Person` is stronger.
- `check_word_count.py` sits at repo root, unreferenced by any npm script.

---

## Severity roll-up

| ID | P | Finding | Files |
|---|---|---|---|
| C1 | P0 | `validate:content --all` crashes — content gate dead | `scripts/lib/more-content-gate.mjs:13` |
| C2 | P0 | `qa:full:quick` 3/6 PASS, image 403s shipping | `scripts/qa-full.mjs` |
| C3 | P0 | QA harness blind to duplication/alt/title-length; `compare` ungated | `scripts/*`, `site.config.json` |
| C4 | P0 | No mobile navigation | `src/components/Header.astro` |
| C5 | P0 | Duplicate `FAQPage` emission | `ArticleLayout.astro:95`, `FaqBlock.astro` |
| C6 | P0 | `alt=""` hardcoded on hero + logo | `ArticleLayout.astro:117`, `Header.astro` |
| C7 | P0 | Lead-form placeholders corrupted on 140 pages | `LeadForm.astro` |
| C8 | P1 | `FEATURED_*` all empty — curation never renders | `src/data/featured.ts` |
| C9 | P1 | Homepage pre-launch copy, unlinked pillar list | `src/pages/index.astro` |
| C10 | P1 | Nav omits Golden Visa/Tools/Developers; no `/tools/` hub | `Header.astro`, `Footer.astro` |
| C11 | P1 | Money pages thin, `Organization`-only schema, 2 orphans | `src/pages/*` |
| C12 | P1 | Hubs lack `ItemList`/`CollectionPage`/breadcrumb | `src/pages/*/index.astro` |
| C13 | P2 | `site-report` numbers hardcoded | `site-report/index.astro` |
| C14 | P2 | `llms*.txt` stale, hand-maintained, weak staleness check | `public/`, `geo-citability-audit.mjs:80` |
| C15 | P2 | Preview HTML in prod, Mexico script names, SVG logo, Org author | various |

---

## What is genuinely good

Worth protecting through any refactor:

- Clean Astro content-collections architecture; `[...slug].astro` per collection; `trailingSlash: 'always'`
  consistently applied.
- Sitemap priority/changefreq tuned per collection in `astro.config.mjs`.
- `robots.txt` explicitly allows `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`.
- Canonical + OG + `Article`/`BreadcrumbList`/`FAQPage` on all 129 content pages.
- `LeadForm` auto-injected by `ArticleLayout` — every content page has a conversion surface.
- Legal disclaimer block on every article; `noindex` correctly applied to `/site-report/`.
- Build is fast and deterministic; three working interactive tools already exist.
