# Claude Code — greek-invest.com

Environment: **MORE Group Content**  
Repo: **max-diver999/greek-invest-website**

```bash
git pull origin main
git submodule update --init --recursive
```

Read order:

1. `.content-os/STATUS.md`
2. `.content-os/site-passport.yaml`
3. `more-group-content-os/programs/greek-invest.yaml`
4. `more-group-content-os/policies/claude-autonomous-decisions.md`
5. `more-group-content-os/policies/corpus-cleanup-mode.md`
6. `more-group-content-os/policies/publishing-gates.md`
7. `docs/PRIORITY-CTR-LEADS.md` + `docs/CONTENT_QUALITY_AUDIT.md`
8. `more-group-content-os/analytics-snapshots/greek-invest-website/2026-08-21.json`
9. `src/pages/site-report/index.astro` (live report context)
10. `CLAUDE.md`

**Full audit prompt (copy to chat):**

```text
Pull main + submodule. greek-invest.com — Content OS pilot (EN, ~129 MDX, 6 collections).

Прочитай STATUS, site-passport, programs/greek-invest.yaml, PRIORITY-CTR-LEADS, CONTENT_QUALITY_AUDIT, analytics snapshot, site-report.

GEO сейчас 92/100 (grade A, 0 hard fails). Rubric: unique 78 — усилить дифференциацию. Задача: полный аудит + roadmap улучшений + план будущего контента (после «ок»).

Фаза 0 — четыре блока, потом СТОП:

A) КОРПУС (все 129 MDX): Golden Visa кластер (пороги, 120 m², eligible projects, Crete €400k), налоги (ENFIA, lawyer cost), areas (Costa Navarino, Chania, Athens), compare (12), projects/developers. Каннибализация, internal links, orphans, FAQ/schema, consultation bridges.

B) RENDERED HTML: npm run build + audit:rendered:fail + qa:full:quick — hero, alt, JSON-LD, tools (rental yield calculator), lead forms / get-shortlist.

C) КОД: hub/list pages guides/areas/compare/projects; navigation; Golden Visa consultation funnel; site-report gaps. CODE-AUDIT + code-improvements-roadmap.

D) GSC: CTR на enfia-property-tax-greece (770 imp), costa-navarino area, lawyer-cost (pos ~51); усилить title/meta и direct-answer на commercial queries.

Артефакты (commit в ветку cc/greece-audit-*):
- .content-os/reports/AUDIT-REPORT-{date}.md
- .content-os/reports/CODE-AUDIT-{date}.md
- .content-os/batches/corpus-cleanup-roadmap-{date}.md
- .content-os/batches/code-improvements-roadmap-{date}.md
- .content-os/batches/content-roadmap-{date}.md
- topics-proposal.json

СТОП: не пиши MDX массово, не меняй Astro/layouts, не PR на main, не push, не индексация. Жди «ок» от Максима на roadmaps.

Индексация — только Cursor после «выложи», ключ greek-invest-indexing only.
```
