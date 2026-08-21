# GitHub workflow — greek-invest.com pilot

## Repos

| Repo | Role |
|---|---|
| `max-diver999/greek-invest-website` | Site + `.content-os` |
| `max-diver999/more-group-content-os` | Registry, program, snapshots, policies (submodule) |

## Claude

1. Branch `cc/greece-audit-YYYYMMDD` from `main`
2. Phase 0 artifacts only — no mass MDX
3. Open PR to `main` when audit complete; **do not merge**

## Cursor (after Maxim «ок» + fix batches)

1. Review PR / merge with git identity `max-diver999 <maks.shchegolev@gmail.com>`
2. `npm run validate:content -- --changed` → build → `qa:full:quick`
3. Push → Vercel
4. Indexing only on explicit «отправляй» — key `greek-invest-indexing`

## Submodule update

After content-os changes on main:

```bash
cd greek-invest-website
git submodule update --remote more-group-content-os
git add more-group-content-os && git commit -m "chore: bump content-os submodule"
```
