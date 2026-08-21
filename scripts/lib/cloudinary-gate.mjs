/**
 * MORE Group — Cloudinary delivery gate.
 *
 * Checks that images referenced from MDX are delivered through the site's
 * Cloudinary account with explicit delivery transformations, rather than
 * hot-linked from a third-party origin.
 *
 * Previously this module was imported from `../../../scripts/lib/cloudinary-gate.mjs`,
 * a path outside the repository. It resolved only on a machine that happened to have
 * a sibling monorepo checkout, so `validate:content` crashed with ERR_MODULE_NOT_FOUND
 * everywhere else (CI, fresh clone). It is now vendored here.
 */

/** Image URLs found in MDX: markdown images, HTML/JSX src, and frontmatter heroImage. */
const IMAGE_URL_RE = /https?:\/\/[^\s"'`)<>]+\.(?:jpe?g|png|webp|avif|gif|svg)(?:\?[^\s"'`)<>]*)?/gi;
const CLOUDINARY_HOST_RE = /^https:\/\/res\.cloudinary\.com\/([a-z0-9_-]+)\//i;

/** A delivery URL should carry at least a width and a format/quality directive. */
const HAS_TRANSFORM_RE = /\/image\/(?:upload|fetch)\/[^/]*\b(?:w_\d+|c_[a-z]+)/i;

/**
 * Hosts we knowingly serve from outside Cloudinary. Keep this empty by default —
 * an entry here is a deliberate, reviewed exception, not a convenience.
 */
const ALLOWED_EXTERNAL_HOSTS = new Set();

/** Local/site-relative assets are fine — favicons, og fallbacks, static art. */
function isLocalAsset(url) {
  return url.startsWith('/') || url.startsWith('data:');
}

/**
 * @param {object} opts
 * @param {string} opts.prefix   Human-readable file prefix for error messages.
 * @param {string} opts.text     Full MDX text (frontmatter + body).
 * @param {string[]} opts.errors Mutated in place with any failures found.
 * @param {boolean} [opts.legacyExempt] Skip strict checks for grandfathered files.
 * @param {string}  [opts.cloudName] Expected Cloudinary cloud; defaults to env.
 */
export function runCloudinaryDeliveryChecks({ prefix, text, errors, legacyExempt = false, cloudName } = {}) {
  if (!text) return;

  const expectedCloud = cloudName || process.env.CLOUDINARY_CLOUD_NAME || 'dlrrtf6bq';
  const seen = new Set();

  for (const match of text.matchAll(IMAGE_URL_RE)) {
    const url = match[0];
    if (seen.has(url) || isLocalAsset(url)) continue;
    seen.add(url);

    const cloudinary = url.match(CLOUDINARY_HOST_RE);

    if (!cloudinary) {
      const host = (() => {
        try {
          return new URL(url).host;
        } catch {
          return url.slice(0, 60);
        }
      })();
      if (ALLOWED_EXTERNAL_HOSTS.has(host)) continue;
      errors.push(
        `${prefix} image hot-linked from ${host} — re-host on Cloudinary (third-party origins break, throttle, and cannot be optimised)`,
      );
      continue;
    }

    if (cloudinary[1] !== expectedCloud) {
      errors.push(`${prefix} Cloudinary image from unexpected cloud "${cloudinary[1]}" (expected "${expectedCloud}")`);
      continue;
    }

    if (!legacyExempt && !HAS_TRANSFORM_RE.test(url)) {
      errors.push(`${prefix} Cloudinary URL without delivery transformation (expected w_/c_ before the public id): ${url.slice(0, 90)}`);
    }
  }
}

export default { runCloudinaryDeliveryChecks };
