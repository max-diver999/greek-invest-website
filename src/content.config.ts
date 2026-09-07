import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string().default('Greek Invest Editorial'),
  category: z.string().default('guides'),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  /** Descriptive alt for the hero. Never duplicate the H1 — describe the image. */
  heroAlt: z.string().optional(),
  /**
   * No readingTime here on purpose. It was a hand-set number that drifted from
   * the content the moment either changed, and was out by more than two minutes
   * on 88 of 133 articles. It is computed from the body in src/lib/readingTime.ts
   * so it cannot be wrong.
   */
  relatedSlugs: z.array(z.string()).default([]),
  noindex: z.boolean().default(false),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
});

const projectSchema = articleSchema.extend({
  category: z.string().default('projects'),
  heroImage: z.string(),
  district: z.string().optional(),
  region: z.enum(['CCR', 'RCR', 'OCR']).optional(),
  area: z.string().optional(),
  developer: z.string().optional(),
  propertyType: z.string().default('condo'),
  tenure: z.string().optional(),
  status: z.string().optional(),
  units: z.number().optional(),
});

export const collections = {
  guides: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
    schema: articleSchema,
  }),
  compare: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/compare' }),
    schema: articleSchema,
  }),
  areas: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/areas' }),
    schema: articleSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: projectSchema,
  }),
  developers: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/developers' }),
    schema: articleSchema,
  }),
  news: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
    schema: articleSchema,
  }),
  /**
   * Relocation branch. The audit of 7 September 2026 measured 7,990 impressions a
   * month in the "life" cluster (cost of living, moving, retiring) and the site had
   * no page for any of it. The collection keeps one `overview` entry that the hub
   * index renders, so the hub is a real answer page rather than a list of links.
   */
  /**
   * The Golden Visa hub's body. It lives here rather than inline in
   * src/pages/golden-visa/index.astro because prose written into an .astro file is
   * invisible to every quality gate on this site: qa-audit, geo-score and the
   * cannibalisation checker all read src/content. The hub had a quick answer, a
   * tier table and six curated card sections, and no body at all between them.
   */
  'golden-visa': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/golden-visa' }),
    schema: articleSchema,
  }),
  'living-in-greece': defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/living-in-greece' }),
    schema: articleSchema,
  }),
};
