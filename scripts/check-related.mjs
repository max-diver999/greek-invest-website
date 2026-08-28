/**
 * relatedSlugs is curated by hand and resolved at build time, and the resolver
 * drops anything it cannot find rather than rendering a dead card. That is the
 * right runtime behaviour and the wrong review behaviour: a page merged or
 * renamed would silently lose its inbound links with nothing failing. This gate
 * is the half that complains.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'src/content';
const collections = fs.readdirSync(ROOT).filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory());

const known = new Map();
for (const c of collections) {
  for (const f of fs.readdirSync(path.join(ROOT, c)).filter((f) => /\.mdx?$/.test(f))) {
    known.set(f.replace(/\.mdx?$/, ''), c);
  }
}

let refs = 0;
let withRelated = 0;
const problems = [];

for (const c of collections) {
  for (const f of fs.readdirSync(path.join(ROOT, c)).filter((f) => /\.mdx?$/.test(f))) {
    const id = f.replace(/\.mdx?$/, '');
    const raw = fs.readFileSync(path.join(ROOT, c, f), 'utf8');
    // Both indentations are valid YAML and both appear in this corpus: 108
    // files indent the list items, 7 do not. The first version of this gate
    // required the indent and silently skipped those 7, which is the same
    // class of blind spot it was written to catch.
    const block = raw.match(/^relatedSlugs:\n((?:[ \t]*- .*\n)+)/m);
    if (!block) continue;
    withRelated += 1;
    const slugs = block[1].trim().split('\n').map((l) => l.trim().replace(/^-\s*/, '').replace(/^["']|["']$/g, ''));
    const seen = new Set();
    for (const slug of slugs) {
      refs += 1;
      if (!known.has(slug)) problems.push(`${c}/${id}: relatedSlugs -> "${slug}" does not exist`);
      else if (slug === id) problems.push(`${c}/${id}: relatedSlugs links to itself`);
      else if (seen.has(slug)) problems.push(`${c}/${id}: relatedSlugs lists "${slug}" twice`);
      seen.add(slug);
    }
  }
}

console.log('\n=== RELATED SLUGS GATE ===');
console.log(`Articles with relatedSlugs: ${withRelated} | references: ${refs}`);
const missing = [...known.keys()].length - withRelated;
if (missing > 0) console.log(`Articles without any relatedSlugs: ${missing} (not an error, they render no "Read next")`);

if (problems.length) {
  console.log(`\n❌ FAIL — ${problems.length} broken reference(s)\n`);
  for (const p of problems) console.log('  ' + p);
  process.exit(1);
}
console.log('\n✅ PASS — every relatedSlugs reference resolves');
