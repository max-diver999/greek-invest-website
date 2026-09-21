/**
 * Card thumbnail URLs: R2 and external CDN as-is (pre-sized at upload).
 */
import { r2Responsive, r2NarrowSrc, isR2Url, type ResponsiveImage } from './r2Image';

export function getCardImageUrl(src: string | undefined, _size: 'card' | 'hero' = 'card'): string {
  return src?.trim() ?? '';
}

/**
 * Карточка списка с выбором размера. Раньше в плитку шириной 327 точек приезжал файл на 1200
 * пикселей: обрезку делал Cloudinary, а после переезда на R2 эта функция просто отдавала ссылку
 * как есть. На странице /guides/ со ста четырьмя карточками это 23 мегабайта.
 */
export function getCardImage(
  src: string | undefined,
  size: 'card' | 'hero' | 'band' = 'card',
): ResponsiveImage | null {
  if (!src?.trim()) return null;
  if (isR2Url(src)) return r2Responsive(src, size);
  return { src: getCardImageUrl(src, size === 'band' ? 'hero' : size) };
}

/**
 * Фото первого экрана главной. Раньше здесь стоял srcset из одного-единственного кандидата
 * (`${url} 1200w`): формально атрибут был, а выбора у браузера не было, и телефон качал тот же
 * файл, что и компьютер. Теперь список ширин берётся из манифеста, где записано, что реально
 * залито на R2, а в preload идёт самый узкий вариант.
 */
export function getHeroResponsive(src: string | undefined) {
  if (!src?.trim()) {
    return {
      src: '',
      srcset: undefined as string | undefined,
      sizes: undefined as string | undefined,
      preloadHref: undefined as string | undefined,
      width: undefined as number | undefined,
      height: undefined as number | undefined,
    };
  }
  const url = src.trim();
  const responsive = r2Responsive(url, 'band');
  return {
    src: responsive?.src ?? url,
    srcset: responsive?.srcset,
    sizes: responsive?.sizes,
    preloadHref: r2NarrowSrc(url) ?? url,
    width: responsive?.width,
    height: responsive?.height,
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
