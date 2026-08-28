/**
 * Reading time, computed from the article instead of declared in frontmatter.
 *
 * Every file carried a hand-set `readingTime` that was written when the file
 * was created and never revisited. On 88 of 133 articles it was out by more
 * than two minutes, and the US guide told readers 19 minutes for what is a
 * ten-minute article. A number a person types once and the content then drifts
 * away from is not a measurement, so this derives it and the frontmatter field
 * is gone.
 *
 * What counts is what a reader sees on the page: the prose, plus the text
 * carried as props by TldrBlock and FaqBlock, which render as visible copy.
 * That is a different question from the `validate:content` word gate, which
 * deliberately excludes the FAQ because it measures how much article there is
 * rather than how long the page takes to read.
 */

/** Words per minute. 200 is the usual convention for online prose. */
const WPM = 200;

/** Component props whose values are rendered as text on the page. */
const TEXT_PROPS = /\b(?:text|answer|question|title|description)\s*[:=]\s*(?:"([^"]*)"|'([^']*)'|\{?`([^`]*)`\}?)/g;

export function visibleText(body: string): string {
  const withoutFrontmatter = body.replace(/^---\n[\s\S]*?\n---\n?/, '');

  const propText: string[] = [];
  for (const m of withoutFrontmatter.matchAll(TEXT_PROPS)) {
    propText.push(m[1] ?? m[2] ?? m[3] ?? '');
  }

  const prose = withoutFrontmatter
    .replace(/^import\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')       // tags go, the text between them stays
    .replace(/[|`*_#>-]+/g, ' ');   // markdown punctuation is not read aloud

  return `${prose} ${propText.join(' ')}`;
}

export function countWords(body: string): number {
  return visibleText(body).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(countWords(body) / WPM));
}
