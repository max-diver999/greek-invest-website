# greek-invest.com — Claude Code

Content OS pilot. Submodule: `more-group-content-os`.

**Start:** read `CLAUDE-CODE-START.md` and paste the audit prompt into chat.

**Never without Maxim ok:** mass new MDX, Astro/layout refactors, push to main, Google Indexing API.

**Indexing:** only `greek-invest-indexing` key — see `more-group-content-os/policies/cursor-rules/greek-invest-indexing-isolation.mdc`.

**Checks:**

```bash
npm run validate:content -- --all
npm run geo:audit
npm run build && npm run audit:rendered:fail
npm run qa:full:quick
```

**Branch:** `cc/greece-audit-*` or `cc/greece-fix-*`
