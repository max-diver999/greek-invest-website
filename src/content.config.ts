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
};
