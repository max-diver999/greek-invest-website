/** Detect image-like URLs for audit-all-images.mjs (all MORE niche sites). */
export function isImageUrl(url) {
  if (!url?.startsWith('http')) return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const hasAssetPath = parsed.pathname !== '/' && parsed.pathname !== '';
  return (
    (parsed.hostname.endsWith('cloudinary.com') && hasAssetPath) ||
    (parsed.hostname.includes('wikimedia') && hasAssetPath) ||
    (parsed.hostname.includes('unsplash') && hasAssetPath) ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i.test(url)
  );
}
