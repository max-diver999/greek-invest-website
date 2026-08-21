# Content quality audit checklist — greek-invest.com

Use in Phase 0 corpus pass. Baseline already strong — focus on gaps and CTR, not wholesale rewrites.

## Baseline (2026-08-21)

- `npm run validate:content -- --all` — **129/129 clean**
- `npm run geo:audit` — commercial **92/100**, grade **A**
- Rubric weak spot: **unique 78** (vs stats 100, structure 98)

## Corpus checks (all 129 MDX)

- [ ] Golden Visa cluster consistency (thresholds, dates, 120 m² rule wording)
- [ ] No stale Mexico/template meta (recent fix on hub — verify no stragglers)
- [ ] ENFIA and tax guides — aligned numbers, same year in title/body
- [ ] Areas ↔ guides ↔ compare cross-links (Crete, Peloponnese, Halkidiki, Athens)
- [ ] Projects/developers linked from eligible-projects directory
- [ ] FAQ blocks + schema where commercial intent high
- [ ] Cannibalization: multiple GV threshold pages, consultation vs guide overlap
- [ ] Orphan MDX (no inbound internal links)
- [ ] `serpExempt` vs missing SERP briefs (only 1 brief in content-os today)

## Rendered HTML (after build)

- [ ] Hero images + alt on guides/areas/projects
- [ ] JSON-LD Article/FAQ where applicable
- [ ] Lead forms on commercial pages
- [ ] Canonical / www vs non-www (GSC shows both host variants)

## Code / UX

- [ ] Collection hub pages completeness
- [ ] site-report metrics match corpus counts
- [ ] Navigation: Golden Visa path obvious from homepage
- [ ] Tools page linked from finance/rental guides

## Output

Document findings in `AUDIT-REPORT-{date}.md` with P0/P1/P2 and wave-sized batches (~25 files).
