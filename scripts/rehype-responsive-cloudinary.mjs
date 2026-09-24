import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'performance-images.config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const dimsPath = path.join(ROOT, config.dimensionsCache);
const dimensions = fs.existsSync(dimsPath)
  ? JSON.parse(fs.readFileSync(dimsPath, 'utf8'))
  : {};

/**
 * Картинки внутри текста статей. До 21.09.2026 этот плагин умел только адреса Cloudinary: на
 * адресе R2 responsiveAttributes возвращал null, и тег оставался как есть, без выбора размера и
 * без размеров кадра. Внешне страница выглядела целой, а телефон качал файл для компьютера и
 * страница прыгала при загрузке.
 *
 * Какие ширины реально залиты, знает манифест: его пишет scripts/r2-add-widths.mjs. Гадать здесь
 * нельзя, иначе браузер попросит несуществующий файл и получит 404 вместо картинки.
 *
 * Ширина слота своя, не из performance-images.config.json: колонка .prose померена на живом сайте
 * и упирается в 702.72px, а поля контейнера съедают 48 точек при экране уже 600.
 */
/**
 * Адрес хранилища картинок. С 24.09.2026 картинки отдаёт свой домен media.oper-stack.com: у старого
 * адреса r2.dev лимит частоты запросов и нет кэша. Файлы те же, другое только начало адреса.
 * Старый адрес код понимает, пока все статьи и загрузчик не переехали; размеры в srcset
 * всегда строятся с нового.
 */
const R2_HOST = 'media.oper-stack.com';
const R2_HOSTS = [R2_HOST, 'pub-2855c73eea384110b510f25966292c37.r2.dev'];
const R2_SIZES = '(max-width: 599px) calc(100vw - 48px), (max-width: 763px) 92vw, 703px';
const r2WidthsPath = path.join(ROOT, 'src', 'data', 'r2-image-widths.json');
const r2Widths = fs.existsSync(r2WidthsPath)
  ? JSON.parse(fs.readFileSync(r2WidthsPath, 'utf8'))
  : {};

function r2Attributes(src) {
  const trimmed = String(src || '').trim();
  const host = R2_HOSTS.find((h) => trimmed.includes(h));
  if (!host) return null;
  const key = trimmed.slice(trimmed.indexOf(host) + host.length).replace(/^\//, '').split('?')[0];
  const entry = r2Widths[key];
  if (!entry) return null;

  const variants = (entry.variants || []).filter((w) => w < entry.w).sort((a, b) => a - b);
  const base = `https://${R2_HOST}/${key}`;
  const srcset = variants.length
    ? [...variants.map((w) => `${base.replace(/\.webp$/i, `-w${w}.webp`)} ${w}w`), `${base} ${entry.w}w`].join(', ')
    : null;

  return {
    src: trimmed,
    srcset,
    sizes: R2_SIZES,
    width: String(entry.w),
    height: String(entry.h),
  };
}

const cloudinaryPattern =
  /^https:\/\/res\.cloudinary\.com\/([a-z0-9]+)\/image\/upload\/(.+)$/;

function parseCloudinaryUrl(src) {
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
    quality: /q_(\d+)/.exec(match[2])?.[1] ?? String(config.quality),
    original: src,
  };
}

function responsiveAttributes(src) {
  const fromR2 = r2Attributes(src);
  if (fromR2) return fromR2;

  const parsed = parseCloudinaryUrl(src);
  if (!parsed) return null;
  const preserveOptimizedOriginal = /\.(webp|avif)$/i.test(parsed.publicId);
  const imageUrl = (width) =>
    `https://res.cloudinary.com/${parsed.cloud}/image/upload/w_${width},q_${parsed.quality},f_auto/${parsed.publicId}`;
  const intrinsic = dimensions[parsed.publicId];
  const largestWidth = Math.max(...config.widths);
  return {
    src: preserveOptimizedOriginal ? parsed.original : imageUrl(largestWidth),
    srcset: preserveOptimizedOriginal
      ? null
      : config.widths
          .map((width) => `${imageUrl(width)} ${width}w`)
          .join(', '),
    sizes: config.sizes,
    width: intrinsic ? String(intrinsic.w) : null,
    height: intrinsic ? String(intrinsic.h) : null,
  };
}

export function rehypeResponsiveCloudinary() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const attrs = responsiveAttributes(String(node.properties?.src || ''));
      if (!attrs) return;
      node.properties.src = attrs.src;
      if (attrs.srcset && !node.properties.srcset) {
        node.properties.srcset = attrs.srcset;
        node.properties.sizes = node.properties.sizes || attrs.sizes;
      }
      if (attrs.width && !node.properties.width) {
        node.properties.width = attrs.width;
        node.properties.height = attrs.height;
      }
    });

    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
      if (node.name !== 'img') return;
      const findAttribute = (name) =>
        node.attributes.find(
          (attribute) =>
            attribute.type === 'mdxJsxAttribute' && attribute.name === name,
        );
      const src = findAttribute('src');
      if (!src || typeof src.value !== 'string') return;
      const attrs = responsiveAttributes(src.value);
      if (!attrs) return;
      src.value = attrs.src;
      const add = (name, value) => {
        if (!findAttribute(name)) {
          node.attributes.push({ type: 'mdxJsxAttribute', name, value });
        }
      };
      if (attrs.srcset) {
        add('srcset', attrs.srcset);
        add('sizes', attrs.sizes);
      }
      if (attrs.width) {
        add('width', attrs.width);
        add('height', attrs.height);
      }
    });
  };
}
