#!/usr/bin/env node
/**
 * Remove per-section GEO bloat (duplicate verification snapshots + generic insider tips).
 * Keeps single MORE Group underwriting block before FaqBlock.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');

const SNAPSHOT_BLOCK =
  /\n\*\*Greek Invest verification snapshot:\*\*\n\n(?:- [^\n]+\n)+\n?/g;

const GENERIC_INSIDER =
  /\n\*\*Insider tip:\*\* MORE Group files in 2026 show this step fails most often when engineer certificates, cadastre extracts, or bank traceability are sequenced after the reservation instead of in parallel with the lawyer review\.\n/g;

const UNDERWRITER_INSIDER =
  /\n\*\*Insider tip:\*\* MORE Group underwrit[^\n]+\n/g;

const PLANNING_TABLE =
  /\n\| Planning line \| Greek Invest 2026 band \|\n\| --- \| --- \|\n(?:\|[^\n]+\|\n){4}/g;

let fixed = 0;

for (const coll of ['guides', 'areas', 'compare']) {
  const dir = join(ROOT, 'src/content', coll);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const path = join(dir, name);
    let raw = readFileSync(path, 'utf8');
    const orig = raw;

    raw = raw.replace(SNAPSHOT_BLOCK, '\n');
    raw = raw.replace(PLANNING_TABLE, '\n');

    // Keep first generic insider only
    let firstInsider = true;
    raw = raw.replace(GENERIC_INSIDER, (m) => {
      if (firstInsider) {
        firstInsider = false;
        return m;
      }
      return '\n';
    });

    // Keep underwriter insider only inside underwriting section (last occurrence before Who we are)
    const uwIdx = raw.indexOf('## MORE Group underwriting snapshot');
    if (uwIdx >= 0) {
      const before = raw.slice(0, uwIdx);
      const after = raw.slice(uwIdx);
      const cleanedBefore = before.replace(UNDERWRITER_INSIDER, '\n');
      raw = cleanedBefore + after;
    } else {
      raw = raw.replace(UNDERWRITER_INSIDER, '\n');
    }

    raw = raw.replace(/\n{4,}/g, '\n\n\n');

    if (raw !== orig) {
      fixed++;
      if (!DRY) writeFileSync(path, raw);
    }
  }
}

console.log(`${DRY ? 'Would clean' : 'Cleaned'} ${fixed} files`);
