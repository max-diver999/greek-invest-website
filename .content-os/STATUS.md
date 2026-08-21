# Greek Invest — Content OS status

**Site:** greek-invest.com  
**Repo:** max-diver999/greek-invest-website  
**Pilot started:** 2026-08-21  
**Phase:** 0 — awaiting Claude full audit

## Snapshot

| Metric | Value |
|---|---|
| MDX | 129 |
| GEO commercial avg | 92/100 (grade A) |
| validate:content --all | PASS |
| GSC period | 2025-05-01 → 2026-08-18 |

**Collections:** guides 90 · compare 12 · areas 12 · projects 10 · developers 4 · news 1

## GSC signals (early)

- **Winners:** Crete Golden Visa €400k, eligible projects directory, ENFIA tax (impressions)
- **CTR gaps:** ENFIA (770 imp, 0.39% CTR), Costa Navarino area hub, lawyer-cost guide (pos ~51)
- **Funnel:** consultation pages need bridges from top Golden Visa guides

## Next steps

1. **Claude** — Phase 0 full audit (corpus + rendered + code) → roadmaps + topics proposal → **STOP**
2. **Maxim** — «ок» on roadmaps
3. **Claude** — fix batches on `cc/greece-*` branches
4. **Cursor** — merge, build, qa, deploy (correct git identity), indexing only on «отправляй»

## Artifacts (to be created by Claude)

- `.content-os/reports/AUDIT-REPORT-{date}.md`
- `.content-os/reports/CODE-AUDIT-{date}.md`
- `.content-os/batches/corpus-cleanup-roadmap-{date}.md`
- `.content-os/batches/code-improvements-roadmap-{date}.md`
- `.content-os/batches/content-roadmap-{date}.md`
- `.content-os/batches/topics-proposal.json`

## Lock

`pilot-lock.json` — Claude owns Phase 0 audit until Maxim says «ок» on roadmaps.
