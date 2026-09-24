/**
 * Картинки с Cloudflare R2: выбор размера под экран.
 *
 * Зачем это нужно. Раньше размер под устройство считал Cloudinary на лету, и за каждую такую
 * трансформацию мы платили. Переезд на R2 убрал плату, но вместе с ней и выбор: на R2 лежал один
 * файл на картинку, и телефон качал ровно то же, что и компьютер.
 *
 * Теперь рядом с каждой картинкой лежат её узкие версии (скрипт scripts/r2-add-widths.mjs), а
 * какие именно, записано в src/data/r2-image-widths.json. Здесь этот список превращается в srcset,
 * то есть в предложение браузеру: вот размеры, возьми подходящий. Считать на лету никому не надо,
 * платить не за что, а телефон получает маленький файл.
 *
 * Правило имён: hero.webp, рядом hero-w360.webp, hero-w640.webp, hero-w768.webp, hero-w960.webp.
 */
import widthManifest from '../data/r2-image-widths.json';

/**
 * Адрес хранилища картинок. С 24.09.2026 картинки отдаёт свой домен media.oper-stack.com: у старого
 * адреса r2.dev лимит частоты запросов и нет кэша. Файлы те же, другое только начало адреса.
 * Старый адрес код понимает, пока все статьи и загрузчик не переехали; размеры в srcset
 * всегда строятся с нового.
 */
export const R2_HOST = 'media.oper-stack.com';
export const R2_HOSTS = [R2_HOST, 'pub-2855c73eea384110b510f25966292c37.r2.dev'];
export const R2_BASE = `https://${R2_HOST}`;

type Entry = { w: number; h: number; variants: number[] };
const MANIFEST = widthManifest as Record<string, Entry>;

/**
 * Слоты, в которых картинка реально показывается. От них зависит, какой файл возьмёт браузер.
 *
 * Числа не круглые намеренно. Все они померены на живом greek-invest.com 21.09.2026 через
 * getBoundingClientRect, а не прикинуты: контейнер сайта это max-width 68rem и поля
 * clamp(1.5rem, 4vw, 3.5rem), поэтому при экране 375 в распоряжении картинки не 375 точек, а 327.
 * Если написать здесь круглое 100vw, браузер поверит на слово, посчитает 390 на 2 и возьмёт файл
 * 960 там, где хватает 768.
 */
export const SIZES = {
  /**
   * Обложка статьи: ширина внутренней части контейнера.
   * Замерено: 375 -> 327, 900 -> 828, 1440 -> 976. Потолок 1001 (при 1088 контейнер упирается).
   */
  hero: '(max-width: 599px) calc(100vw - 48px), (max-width: 1087px) 92vw, 1001px',
  /**
   * Карточка в списке. Сетка grid sm:grid-cols-2 lg:grid-cols-3, зазор 28px.
   * Замерено: 375 -> 327, 600 -> 552, 768 -> 339, 1024 -> 295, 1440 -> 307. Потолок 315.
   */
  card: '(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) calc(46vw - 14px), 315px',
  /**
   * Картинка внутри текста статьи: ширина колонки .prose, её потолок 702.72px.
   * Замерено: 375 -> 327, 900 -> 703, 1440 -> 703.
   */
  inline: '(max-width: 599px) calc(100vw - 48px), (max-width: 763px) 92vw, 703px',
  /**
   * Фото первого экрана главной. С 1024 оно выходит из контейнера к правому краю окна, поэтому
   * растёт быстрее контейнера. Замерено: 375 -> 327, 900 -> 828, 1100 -> 546, 1440 -> 715.
   */
  band: '(max-width: 599px) calc(100vw - 48px), (max-width: 1023px) 92vw, calc(50vw - 2px)',
} as const;

export type ResponsiveImage = {
  src: string;
  srcset?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export function isR2Url(src: string | undefined | null): boolean {
  return typeof src === 'string' && R2_HOSTS.some((h) => src.includes(h));
}

/** Из полного адреса достаём ключ, по которому картинка лежит в манифесте. */
export function r2Key(src: string): string | null {
  const host = R2_HOSTS.find((h) => src.includes(h));
  if (!host) return null;
  const key = src.slice(src.indexOf(host) + host.length).replace(/^\//, '').split('?')[0];
  return key || null;
}

function variantUrl(key: string, width: number): string {
  return `${R2_BASE}/${key.replace(/\.webp$/i, `-w${width}.webp`)}`;
}

/**
 * Главное здесь: в srcset попадают только те ширины, которые реально залиты. Гадать нельзя, иначе
 * браузер запросит несуществующий файл и получит 404 вместо картинки.
 */
export function r2Responsive(
  src: string | undefined | null,
  slot: keyof typeof SIZES = 'hero',
): ResponsiveImage | null {
  if (!src?.trim()) return null;
  const trimmed = src.trim();
  const key = r2Key(trimmed);
  if (!key) return null;

  const entry = MANIFEST[key];
  if (!entry) {
    // Картинки нет в манифесте: отдаём как есть, но честно, без придуманных размеров.
    return { src: trimmed };
  }

  const candidates = [...(entry.variants || [])].filter((w) => w < entry.w).sort((a, b) => a - b);
  if (!candidates.length) {
    return { src: trimmed, width: entry.w, height: entry.h };
  }

  const srcset = [
    ...candidates.map((w) => `${variantUrl(key, w)} ${w}w`),
    `${R2_BASE}/${key} ${entry.w}w`,
  ].join(', ');

  return {
    src: trimmed,
    srcset,
    sizes: SIZES[slot],
    width: entry.w,
    height: entry.h,
  };
}

/** Самый узкий из залитых вариантов: им грузят главную картинку экрана на телефоне. */
export function r2NarrowSrc(src: string | undefined | null): string | null {
  if (!src?.trim()) return null;
  const key = r2Key(src.trim());
  if (!key) return null;
  const entry = MANIFEST[key];
  const narrowest = entry?.variants?.length ? Math.min(...entry.variants) : null;
  return narrowest ? variantUrl(key, narrowest) : src.trim();
}
