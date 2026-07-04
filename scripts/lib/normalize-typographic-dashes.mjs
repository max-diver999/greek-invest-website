/**
 * Zero typographic dashes (em — and en –) per .cursor/rules/no-em-dash.mdc
 * Ranges → "to", clause em-dashes → comma/colon, headings → colon.
 */

const EM_CLAUSE_SUBS = [
  [/ — not /g, ', not '],
  [/ — and /g, ', and '],
  [/ — or /g, ', or '],
  [/ — if /g, '; if '],
  [/ — but /g, ', but '],
  [/ — so /g, ', so '],
  [/ — which /g, ', which '],
  [/ — who /g, ', who '],
  [/ — where /g, ', where '],
  [/ — while /g, ', while '],
  [/ — though /g, ', though '],
  [/ — because /g, ', because '],
  [/ — see /g, '; see '],
  [/ — often /g, ', often '],
  [/ — still /g, ', still '],
  [/ — rarely /g, ', rarely '],
  [/ — never /g, ', never '],
  [/ — always /g, ', always '],
  [/ — usually /g, ', usually '],
  [/ — e\.g\./g, ', e.g.'],
  [/ — i\.e\./g, ', i.e.'],
  [/ — absent /g, ', absent '],
  [/ — illegal /g, ', illegal '],
  [/ — especially /g, ', especially '],
  [/ — plus /g, ', plus '],
  [/ — verify /g, '; verify '],
  [/ — each /g, '; each '],
  [/ — editorial/gi, ', editorial'],
  [/ — not a /gi, ', not a '],
];

/** @param {string} text */
export function normalizeTypographicDashes(text) {
  let s = text;

  // Word–year / word–word compounds → ASCII hyphen
  s = s.replace(/\b([a-z]{2,})[–—](\d{4})\b/gi, '$1-$2');
  s = s.replace(/\b(\d{4})[–—](\d{4})\b/g, '$1 to $2');

  // Currency ranges
  s = s.replace(/(€[\d,]+)\s*[–—]\s*(€[\d,]+)/g, '$1 to $2');
  s = s.replace(/(\$[\d,]+)\s*[–—]\s*(\$[\d,]+)/g, '$1 to $2');
  s = s.replace(/(CAD\s[\d,]+)\s*[–—]\s*(CAD\s[\d,]+)/gi, '$1 to $2');

  // Section labels: Months 1–2, Steps 3–5, Q1–Q4
  s = s.replace(
    /\b(Months|Steps|Weeks|Phase|Tiers|Tier|Q)(\s+)(\d+[A-Z]?)\s*[–—]\s*(\d+[A-Z]?)\b/gi,
    '$1$2$3 to $4',
  );

  // Numeric ranges with shared trailing unit: 7–10%, 80–100 m², 18–24 weeks
  s = s.replace(
    /(\d[\d,.]*)\s*[–—]\s*(\d[\d,.]*)\s*(%|m²|m2|sqm|sq\.?\s*m|weeks|months|years|days|hours|minutes|bn|million)\b/gi,
    '$1 to $2 $3',
  );

  // Plain numeric ranges (incl. decimals): 0.8–1.2, 7–10, 425,000–435,000
  s = s.replace(/(\d[\d,.]*)\s*[–—]\s*(\d[\d,.]*)/g, '$1 to $2');

  // Single-letter spans: A–D, B–C
  s = s.replace(/\b([A-Z])–([A-Z])\b/g, '$1 to $2');

  // Headings and list patterns
  s = s.replace(/^(#{1,6}\s+[^—\n]+) — ([^\n]+)$/gm, '$1: $2');
  s = s.replace(/^Scenario ([A-D]) — /gm, 'Scenario $1: ');
  s = s.replace(/^(\d+)\. ([^—\n]{1,140}) — /gm, '$1. $2: ');

  for (const [re, rep] of EM_CLAUSE_SUBS) {
    s = s.replace(re, rep);
  }

  let guard = 0;
  while (s.includes(' — ') && guard < 64) {
    s = s.replace(' — ', ', ');
    guard++;
  }

  s = s.replace(/—/g, ', ');
  s = s.replace(/–/g, ' to ');

  return s;
}

/** @param {string} raw MDX with optional frontmatter */
export function normalizeMdxFile(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return normalizeTypographicDashes(raw);
  return `---\n${normalizeTypographicDashes(m[1])}\n---\n${normalizeTypographicDashes(m[2])}`;
}
