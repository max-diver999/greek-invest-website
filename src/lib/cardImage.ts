/**
 * Card thumbnail URLs: Cloudinary crop when available; external CDN as-is.
 */
const CLOUD = 'dlrrtf6bq';
const HERO_WIDTHS = [360, 480, 640, 960, 1200] as const;
const HERO_SIZES = '(max-width: 1023px) calc(100vw - 3rem), 52vw';

function cloudinaryPublicId(src: string): string | null {
  const match = src.match(/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)$/);
  if (!match) return null;
  const parts = match[1].split('/');
  while (parts.length > 1 && (parts[0].includes(',') || /^v\d+$/.test(parts[0]))) {
    parts.shift();
  }
  return parts.join('/').split('?')[0] || null;
}

function heroDeliveryUrl(publicId: string, width: number): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_${width},c_fill,g_auto,ar_4:3,q_auto:eco,f_auto/${publicId}`;
}

export function getCardImageUrl(src: string | undefined, size: 'card' | 'hero' = 'card'): string {
  if (!src?.trim()) return '';

  const trimmed = src.trim();

  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    const publicId = cloudinaryPublicId(trimmed);
    if (publicId && size === 'hero') {
      return heroDeliveryUrl(publicId, 1200);
    }
    const bare = trimmed.replace(/\/upload\/(?:v\d+\/)?(?:[^/]+\/)*more-group\//, '/upload/more-group/');
    const dims =
      size === 'hero'
        ? 'w_1200,c_fill,g_auto,ar_4:3,q_auto:eco,f_auto'
        : 'w_640,h_360,c_fill,g_auto,q_auto:eco,f_auto';
    return bare.replace(/\/upload\/(?:v\d+\/)?/, `/upload/${dims}/`);
  }

  return trimmed;
}

export function getHeroResponsive(src: string | undefined) {
  if (!src?.trim()) {
    return { src: '', srcset: undefined as string | undefined, sizes: undefined as string | undefined };
  }
  const publicId = cloudinaryPublicId(src.trim());
  if (!publicId) {
    const url = getCardImageUrl(src, 'hero');
    return { src: url, srcset: undefined, sizes: undefined };
  }
  const srcset = HERO_WIDTHS.map((w) => `${heroDeliveryUrl(publicId, w)} ${w}w`).join(', ');
  return {
    src: heroDeliveryUrl(publicId, 1200),
    srcset,
    sizes: HERO_SIZES,
    preloadHref: heroDeliveryUrl(publicId, HERO_WIDTHS[0]),
  };
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
