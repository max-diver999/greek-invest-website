/** Editorial picks for homepage and hub rails (order preserved).
 *
 * These were all empty, so the "Start here" rail on /guides/ never rendered and
 * all 90 guides fell into one flat grid sorted by pubDate — with 92 of them
 * sharing the same pubDate, that order was effectively arbitrary. Populating
 * these is the cheapest way to push internal link equity at the pillars.
 */
export const FEATURED_PROJECT_SLUGS = [
  'the-grandline',
  'lotus-voula',
  'ela-suites-kastella',
] as const;

export const HOMEPAGE_HERO_PROJECT_SLUG = '' as const;

export const FEATURED_GUIDE_SLUGS = [
  'greece-golden-visa-property-guide-2026',
  'greece-golden-visa-property-tiers-2026',
  'crete-golden-visa-400000-property',
  'cost-of-buying-property-greece',
  'greece-rental-yield-guide',
  'buy-property-greece-foreigner',
] as const;

export const FEATURED_AREA_SLUGS = [
  'glyfada-property-investment',
  'chania-property-investment',
  'costa-navarino-property-investment',
] as const;

export const HOMEPAGE_HERO_IMAGE =
  'https://res.cloudinary.com/dlrrtf6bq/image/upload/w_1200,q_85,f_webp/more-group/greece/wikimedia-hero/acropolis-of-athens-01361-7fec93a1';
