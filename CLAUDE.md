# greek-invest.com — Claude Code

Content OS pilot. Submodule: `more-group-content-os`.

**Start:** read `CLAUDE-CODE-START.md` and paste the audit prompt into chat.

**Never without Maksim ok:** mass new MDX, Astro/layout refactors, push to main, Google Indexing API,
deleting a page or adding a 301.

**Indexing:** only `greek-invest-indexing` key — see `more-group-content-os/policies/cursor-rules/greek-invest-indexing-isolation.mdc`.

**Checks:**

```bash
npm run validate:content -- --all
npm run check:jurisdiction
npm run check:related
npm run facts:review
npm run geo:calibrate
npm run build && npm run audit:rendered:fail
npm run qa:full:quick
```

**GEO scoring.** `npm run geo:audit` is the OLD rubric and is not a quality gate: measured on this
repository's own labelled sets it separates machine-injected text from hand-written text by 3.0
points, and 17 of 114 known-garbage files clear its 90 threshold. Use the honest scorer instead:

```bash
npm run geo:score                              # whole corpus, ranked, out of 75
node scripts/geo-score.mjs <file.mdx> --explain # base parts and every penalty
npm run geo:cannibals -- --min 60              # page pairs that are the same page
npm run geo:calibrate                          # does the rubric still separate? gate, not a report
```

Method, rejected signals and red-team results: `docs/GEO-SCORING.md`. Current state:
`.content-os/reports/GEO-DIAGNOSTIC-2026-08-27.md`.

**Rules that matter more than the score:**

- Every page must hold a topic no neighbouring page holds. Not reworded — different.
- Never raise a threshold or widen an exemption so your own text passes. Cut the text.
- Never invent a figure, and never add decimal places to escape a duplicate-figure match.
- A figure in 2+ articles needs a source and a date in `.content-os/facts.json`.
- Claims about jurisdictions nobody here watches go in `.content-os/external-claims.json` with a
  `reviewBy` date, not in `facts.json`.
- If a rule penalises correct writing, fix the rule and prove the fix on the labelled sets.
- Word minimums are counted on prose. The inline `<FaqBlock>` is 400-700 words and does not count
  toward an article's length: `validate:content` reports both figures so the gap stays visible.

**Branch:** `cc/greece-audit-*` or `cc/greece-fix-*`
