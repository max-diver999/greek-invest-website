import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * relatedSlugs has been declared on every article since the schema was written
 * and rendered nowhere, so 108 files carried 572 curated references the site
 * never showed. The slugs are bare — "greece-golden-visa-property-tiers-2026",
 * with no collection prefix — so resolving one means looking across all six
 * collections rather than assuming the neighbour is in the same folder, and
 * roughly a third of the references do cross collections.
 */
const COLLECTIONS = ['guides', 'compare', 'areas', 'projects', 'developers', 'news'] as const;

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
export async function resolveRelated(
  slugs: string[] | undefined,
  currentId: string,
  limit = 3,
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
      href: `/${hit.collection}/${hit.entry.id}/`,
      title: hit.entry.data.title,
      description: hit.entry.data.description,
      image: hit.entry.data.heroImage,
      badges: [LABEL[hit.collection] ?? 'Article'],
      meta: `${hit.entry.data.readingTime ?? 8} min read`,
    });
  }
  return out;
}
