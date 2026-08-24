import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import referenceInfraConfig from './reference-infra.config.json' with { type: 'json' };
import { collectContentLastmod } from './scripts/reference-infra/content-lastmod.mjs';

const CONTENT_LASTMOD = new Map(
  (await collectContentLastmod(referenceInfraConfig, { root: process.cwd() })).map(
    ({ url, lastmod }) => [url, lastmod],
  ),
);

function withContentLastmod(item) {
  const contentDate = CONTENT_LASTMOD.get(item.url);
  return contentDate
    ? { ...item, lastmod: new Date(`${contentDate}T00:00:00Z`) }
    : item;
}

export default defineConfig({
  site: 'https://greek-invest.com',
  output: 'static',
  trailingSlash: 'always',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter(page) {
        const excluded = [
          '/thanks/',
          '/site-report/',
        ];
        return !excluded.some((path) => page.includes(path));
      },
      serialize(item) {
        item = withContentLastmod(item);
        if (item.url === 'https://greek-invest.com/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (item.url.includes('/guides/')) {
          return { ...item, priority: 0.85, changefreq: 'weekly' };
        }
        if (item.url.includes('/areas/') || item.url.includes('/compare/')) {
          return { ...item, priority: 0.8, changefreq: 'weekly' };
        }
        if (item.url.includes('/projects/')) {
          return { ...item, priority: 0.75, changefreq: 'weekly' };
        }
        if (item.url.includes('/developers/')) {
          return { ...item, priority: 0.72, changefreq: 'monthly' };
        }
        if (item.url.includes('/news/')) {
          return { ...item, priority: 0.65, changefreq: 'weekly' };
        }
        return { ...item, priority: 0.7, changefreq: 'monthly' };
      },
    }),
    mdx(),
  ],
});
