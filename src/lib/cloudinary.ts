import dimensions from '../../scripts/data/cloudinary-image-dims.json';

const cloudinaryPattern =
  /^https:\/\/res\.cloudinary\.com\/([a-z0-9]+)\/image\/upload\/(.+)$/;
const cloudinaryBase = 'https://res.cloudinary.com';
const widths = [360, 480, 640, 960, 1200];
const sizes = '(max-width: 768px) calc(100vw - 2rem), 72ch';

type ImageDimensions = { w: number; h: number };

function parseCloudinaryUrl(src: string) {
  const match = cloudinaryPattern.exec(src);
  if (!match) return null;
  const parts = match[2].split('/');
  while (
    parts.length > 1 &&
    (/^v\d+$/.test(parts[0]) || parts[0].includes(','))
  ) {
    parts.shift();
  }
  return {
    cloud: match[1],
    publicId: parts.join('/').split('?')[0],
  };
}

export function responsiveCloudinary(src: string) {
  const parsed = parseCloudinaryUrl(src);
  if (!parsed) return { src };

  const intrinsic = (dimensions as Record<string, ImageDimensions>)[parsed.publicId];
  const preserveOptimizedOriginal = /\.(webp|avif)$/i.test(parsed.publicId);
  if (preserveOptimizedOriginal) {
    return {
      src,
      width: intrinsic?.w,
      height: intrinsic?.h,
    };
  }

  const imageUrl = (width: number) =>
    `${cloudinaryBase}/${parsed.cloud}/image/upload/w_${width},c_fill,g_auto,q_auto:eco,f_auto/${parsed.publicId}`;

  const srcset = widths.map((width) => `${imageUrl(width)} ${width}w`).join(', ');

  return {
    src: imageUrl(widths[widths.length - 1]),
    srcset,
    sizes,
    width: intrinsic?.w,
    height: intrinsic?.h,
  };
}

/** LCP preload props for article heroes. */
export function heroPreloadFromResponsive(src: string) {
  const img = responsiveCloudinary(src);
  if (!img.srcset) return null;
  const firstEntry = img.srcset.split(/,\s+/)[0]?.trim() ?? '';
  const href = firstEntry.replace(/\s+\d+w$/, '') || img.src;
  return { href, srcset: img.srcset, sizes: img.sizes };
}
