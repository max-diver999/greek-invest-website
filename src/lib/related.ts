import { getCollection, type CollectionEntry } from 'astro:content';
import { readingMinutes } from './readingTime';

/**
 * relatedSlugs has been declared on every article since the schema was written
 * and rendered nowhere, so 108 files carried 572 curated references the site
 * never showed. The slugs are bare — "greece-golden-visa-property-tiers-2026",
 * with no collection prefix — so resolving one means looking across all six
 * collections rather than assuming the neighbour is in the same folder, and
 * roughly a third of the references do cross collections.
 */
// The three collections added in September 2026 must be listed here too. They
// were not, so a relatedSlugs reference to any of their pages resolved to
// nothing and rendered no card, while `check:related` still passed because that
// script reads the content directories rather than this list. The result was the
// bug this file's header describes, in a second form: 24 new pages that no
// existing article could point at.
const COLLECTIONS = [
  'guides',
  'compare',
  'areas',
  'projects',
  'developers',
  'news',
  'golden-visa',
  'property-for-sale',
  'living-in-greece',
] as const;

type AnyEntry = CollectionEntry<(typeof COLLECTIONS)[number]>;

export interface RelatedItem {
  href: string;
  title: string;
  description: string;
  image?: string;
  badges: string[];
  meta: string;
}

let cache: Map<string, { collection: string; entry: AnyEntry }> | null = null;

async function index() {
  if (cache) return cache;
  const map = new Map<string, { collection: string; entry: AnyEntry }>();
  for (const collection of COLLECTIONS) {
    const entries = (await getCollection(collection)) as AnyEntry[];
    for (const entry of entries) {
      // First collection wins. Slugs are unique across the corpus today; if that
      // ever stops being true the duplicate is a content bug, not a render bug.
      if (!map.has(entry.id)) map.set(entry.id, { collection, entry });
    }
  }
  cache = map;
  return map;
}

const LABEL: Record<string, string> = {
  'golden-visa': 'Golden Visa',
  'property-for-sale': 'Market',
  'living-in-greece': 'Living',
  guides: 'Guide',
  compare: 'Comparison',
  areas: 'Area',
  projects: 'Project',
  developers: 'Developer',
  news: 'News',
};

/**
 * Resolve curated slugs to cards, dropping anything that no longer exists or is
 * noindexed, and never linking a page to itself. Silently dropping a dangling
 * slug is deliberate: a merged or renamed page should not render a dead card,
 * and `npm run check:related` is what reports the dangling reference.
 */
/**
 * The default was 3 while the corpus curated up to 10, so 361 hand-picked links
 * on 130 pages were assigned and never rendered: the caller passed the whole
 * list, this function returned the first three, and nothing reported the rest.
 * Verified on the live site before the change: /areas/glyfada-property-investment/
 * curated 7, of the 4 that its body does not mention, 1 reached the page;
 * /areas/kalamata-property-investment/ rendered 0 of 4.
 *
 * 12 covers every list in the corpus and keeps the three-column grid's rows
 * full at 3, 6, 9 and 12. Raise it if lists grow; do not let the overflow
 * vanish again.
 */
export async function resolveRelated(
  slugs: string[] | undefined,
  currentId: string,
  limit = 12,
): Promise<RelatedItem[]> {
  if (!slugs?.length) return [];
  const map = await index();
  const out: RelatedItem[] = [];
  const seen = new Set<string>([currentId]);

  for (const slug of slugs) {
    if (out.length >= limit) break;
    if (seen.has(slug)) continue;
    const hit = map.get(slug);
    if (!hit || hit.entry.data.noindex) continue;
    seen.add(slug);
    out.push({
      // `overview` is the hub's own body, rendered at the collection root, so it
      // must link to /<collection>/ rather than to /<collection>/overview/.
      href: hit.entry.id === 'overview' ? `/${hit.collection}/` : `/${hit.collection}/${hit.entry.id}/`,
      title: hit.entry.data.title,
      description: hit.entry.data.description,
      image: hit.entry.data.heroImage,
      badges: [LABEL[hit.collection] ?? 'Article'],
      meta: `${readingMinutes(hit.entry.body ?? '')} min read`,
    });
  }
  return out;
}
