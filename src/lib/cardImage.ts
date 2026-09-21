/**
 * Card thumbnail URLs: R2 and external CDN as-is (pre-sized at upload).
 */
const HERO_WIDTHS = [360, 480, 640, 960, 1200] as const;
const HERO_SIZES = '(max-width: 1023px) calc(100vw - 3rem), 52vw';

export function getCardImageUrl(src: string | undefined, _size: 'card' | 'hero' = 'card'): string {
  return src?.trim() ?? '';
}

export function getHeroResponsive(src: string | undefined) {
  if (!src?.trim()) {
    return { src: '', srcset: undefined as string | undefined, sizes: undefined as string | undefined };
  }
  const url = getCardImageUrl(src, 'hero');
  return { src: url, srcset: `${url} 1200w`, sizes: HERO_SIZES, preloadHref: url };
}

export function formatAreaLabel(area?: string): string {
  if (!area) return '';
  return area
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatUsd(price?: number): string {
  if (!price || price <= 0) return '';
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(price / 1000)}K`;
}
