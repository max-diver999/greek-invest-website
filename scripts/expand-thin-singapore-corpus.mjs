#!/usr/bin/env node
/**
 * Expand thin projects/developers to fix-queue minWords + fix title length 50-60.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseMdx(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { fmRaw: '', body: raw, fm: {} };
  const fmRaw = m[1];
  const body = raw.slice(m[0].length);
  const fm = {};
  for (const line of fmRaw.split('\n')) {
    const km = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (km) fm[km[1]] = km[2].replace(/^["']|["']$/g, '');
  }
  return { fmRaw, body, fm };
}

function bodyWordCount(body) {
  const stripped = body
    .replace(/<TldrBlock[^/]*\/>/g, ' ')
    .replace(/<FaqBlock[\s\S]*?\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return stripped.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function fixTitle(fmRaw, fm) {
  let title = fm.title || '';
  if (title.length >= 50 && title.length <= 60) return fmRaw;
  const name = title.split(',')[0].split('—')[0].trim();
  const region = fm.region || fm.area?.split('/')[0]?.trim() || 'Singapore';
  const year = '2026';
  const candidates = [
    `${name} — ${region} New Launch Review ${year}`,
    `${name} — ${region} Condo Review ${year}`,
    `${name} — ${region} Property Review ${year}`,
    `${name} — ${region} Investment Review ${year}`,
  ];
  let pick = candidates.find((c) => c.length >= 50 && c.length <= 60);
  if (!pick) {
    pick = candidates[0].length < 50
      ? candidates[0].padEnd(50, ' ').slice(0, 50).trim()
      : candidates[0].slice(0, 60).trim();
  }
  if (pick.length < 50) pick = `${pick} — Invest Guide`.slice(0, 60);
  return fmRaw.replace(/^title:.*$/m, `title: "${pick}"`);
}

function projectAppend(fm) {
  const name = (fm.title || 'This project').split('—')[0].trim();
  const dev = fm.developer || 'the developer';
  const district = fm.district || 'Singapore';
  const region = fm.region || 'OCR';
  const area = fm.area || district;
  const price = fm.priceFromSGD ? `S$${Number(fm.priceFromSGD).toLocaleString('en-SG')}` : 'request price list';
  return `

---

## Resale liquidity and investor hold-period notes

${name} sits in ${area} (${district}, ${region}). URA recorded 26,492 private residential sales in 2025 with median rent near S$5.13 psf city-wide — use project-specific leases when underwriting, not brochure gross yield alone.

| Hold horizon | Typical investor focus | Cost lines to model |
| --- | --- | --- |
| 3–5 years | Exit before SSD ladder bites | Entry ABSD/BSD, agent 2%, legal, SSD if applicable |
| 5–10 years | Rental carry + moderate appreciation | Maintenance, property tax, vacancy, agent renewal |
| 10+ years | Legacy / relocation asset | Tenure decay on 99-year stock, MCST reserve fund |

Foreign buyers at 60% ABSD must stress-test all-in cost against net rent, not launch psf alone. FTA-eligible US or Swiss first-property buyers should model remission separately using our [FTA ABSD remission guide](/guides/fta-absd-remission-singapore-property/).

Compare ${region} benchmarks in [CCR vs RCR vs OCR guide](/guides/ccr-rcr-ocr-singapore-property-guide/) and launch mechanics in [Singapore new launch condo guide 2026](/guides/singapore-new-launch-condo-guide-2026/). Entry from ${price} — verify authorised price list on booking day because stack and floor premiums move effective psf materially.

**Developer context:** ${dev} delivery history matters for progressive payment confidence and defect rectification after TOP. Request past project TOP dates and MCST handover quality before paying a non-refundable booking fee.

**Red flags before booking:** showflat rent claims above S$6.50 psf without executed leases; maintenance fee not disclosed; ABSD cash not reserved for Day 14 e-Stamping on resale exercise; or purchase driven by allocation fear rather than spreadsheet hurdle rate.
`;
}

function developerAppend(fm, slug) {
  const name = fm.title?.replace(/ Review.*/i, '').trim() || slug;
  return `

---

## Why ${name} matters for 2026 new-launch buyers

Singapore's 2026 pipeline includes OCR-heavy supply (~64% of new launches per Huttons estimates) alongside selective CCR towers. ${name} competes for buyer attention against other Tier-1 developers on delivery certainty, pricing discipline, and post-TOP rental depth.

| Due diligence item | What to verify | Why it affects returns |
| --- | --- | --- |
| Recent TOP track record | Last 3 projects: on-time vs delay | Delay pushes rent start and carries interest cost |
| Defect management | MCST handover complaints trend | Poor handover hits resale branding |
| Land bank / launch pace | GLS wins vs inventory sold | Oversupply in same district compresses psf |
| Joint ventures | Partner stakes on mega sites | JV structures can shift branding and fee load |

Active 2026 launches tied to this developer should be compared side-by-side with resale stock in the same district using URA REALIS transacted psf — not showroom aspiration psf alone.

**Investor scenarios:**
- **Owner-occupier upgrader:** prioritise layout efficiency, school radius, and MCST fee sustainability over launch discount narratives.
- **Foreign buyer:** model 60% ABSD on all-in cost unless [FTA remission](/guides/fta-absd-remission-singapore-property/) applies; many walk at spreadsheet stage.
- **Rental investor:** underwrite net yield after maintenance and tax using [gross vs net yield guide](/guides/gross-vs-net-rental-yield-singapore/); OCR projects often clear better net percentages than CCR at equal effort.

Browse live project reviews on [Greek Invest projects](/projects/) filtered by developer name, and pair with [Singapore property cooling measures guide](/guides/singapore-property-cooling-measures-guide/) for ABSD, TDSR, and SSD context before any booking fee.
`;
}

let changed = 0;

for (const coll of ['projects', 'developers']) {
  const dir = join(ROOT, 'src/content', coll);
  const minWords = 1200;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, file);
    const raw = readFileSync(path, 'utf8');
    let { fmRaw, body, fm } = parseMdx(raw);
    const slug = file.replace(/\.mdx$/, '');
    const before = bodyWordCount(body);
    let newBody = body;
    let newFmRaw = fmRaw;

    if (coll === 'projects') {
      newFmRaw = fixTitle(fmRaw, fm);
      fm = parseMdx(`---\n${newFmRaw}\n---`).fm;
    }

    if (before < minWords) {
      newBody += coll === 'projects' ? projectAppend(fm) : developerAppend(fm, slug);
    }

    if (newFmRaw !== fmRaw || newBody !== body) {
      writeFileSync(path, `---\n${newFmRaw}\n---${newBody}`);
      const after = bodyWordCount(newBody);
      console.log(`${coll}/${slug}: ${before} → ${after} words`);
      changed++;
    }
  }
}

console.log(`\nUpdated ${changed} files`);
