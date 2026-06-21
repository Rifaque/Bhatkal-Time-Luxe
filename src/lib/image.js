// ─── Imgix delivery layer ─────────────────────────────────────────────────────
//
// Imgix sits in front of Cloudinary: Cloudinary remains the authoritative source;
// Imgix handles format negotiation (AVIF/WebP), compression, and optional resizing.
//
// Activation: set NEXT_PUBLIC_IMGIX_DOMAIN in .env
// Fallback:   if the env var is absent, Cloudinary URLs are returned unchanged.
//
// Cloudinary base origin configured in the Imgix source:
//   https://res.cloudinary.com/dnrxzdvkx/image/upload/
// Imgix domain:
//   watch-commerce-1.imgix.net

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dnrxzdvkx/image/upload/';
const IMGIX_DOMAIN    = process.env.NEXT_PUBLIC_IMGIX_DOMAIN; // e.g. 'watch-commerce-1.imgix.net'

// Responsive presets — exported for explicit use; not required by any component.
// getImageUrl() uses 'default' (format+compress only, no width cap) so all surfaces
// automatically get AVIF/WebP negotiation without breaking the lightbox or hero.
export const IMGIX_PRESETS = {
  default: { auto: 'format,compress' },
  mobile:  { auto: 'format,compress', w: 500,  q: 75 },
  tablet:  { auto: 'format,compress', w: 800,  q: 75 },
  desktop: { auto: 'format,compress', w: 1200, q: 80 },
  thumb:   { auto: 'format,compress', w: 200,  q: 70 },
};

// Build an Imgix URL from a Cloudinary URL.
// Returns the Cloudinary URL unchanged if NEXT_PUBLIC_IMGIX_DOMAIN is not set
// or if the URL is not from this Cloudinary account.
export function buildImgixUrl(cloudinaryUrl, preset = 'default') {
  if (!IMGIX_DOMAIN || !cloudinaryUrl.startsWith(CLOUDINARY_BASE)) {
    return cloudinaryUrl;
  }
  const path   = cloudinaryUrl.slice(CLOUDINARY_BASE.length);
  const params = IMGIX_PRESETS[preset] ?? IMGIX_PRESETS.default;
  const qs     = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `https://${IMGIX_DOMAIN}/${path}?${qs}`;
}

// ─── Width-aware URL builder ───────────────────────────────────────────────────

// Returns an Imgix URL with an explicit pixel width. Falls back to the default
// preset if Imgix is not configured or the src is not from this Cloudinary account.
export function getImageUrlWithWidth(src, width, fallbackType = 'product') {
  if (!src) {
    return fallbackType === 'brand'
      ? '/assets/images/fallback-brand.png'
      : '/assets/images/fallback-image.webp';
  }
  if (IMGIX_DOMAIN && src.startsWith(CLOUDINARY_BASE)) {
    const path = src.slice(CLOUDINARY_BASE.length);
    return `https://${IMGIX_DOMAIN}/${path}?auto=format,compress&w=${width}`;
  }
  return src;
}

// Build a srcset string for responsive delivery via Imgix.
// Returns '' when Imgix is not configured or src is not a Cloudinary URL.
export function getImageSrcSet(src, widths = [300, 600, 900], fallbackType = 'product') {
  if (!src || !IMGIX_DOMAIN || !src.startsWith(CLOUDINARY_BASE)) return '';
  return widths
    .map((w) => `${getImageUrlWithWidth(src, w, fallbackType)} ${w}w`)
    .join(', ');
}

// ─── Primary image URL resolver ───────────────────────────────────────────────

export function getImageUrl(src, fallbackType = 'product', preset = 'default') {
  if (!src) {
    return fallbackType === 'brand'
      ? '/assets/images/fallback-brand.png'
      : '/assets/images/fallback-image.webp';
  }

  if (src.startsWith('http://') || src.startsWith('https://')) {
    // Route Cloudinary URLs through Imgix when the delivery domain is configured.
    // Non-Cloudinary https:// URLs (e.g. legacy apibtl.hubzero.in) pass through unchanged.
    return buildImgixUrl(src, preset);
  }

  // Legacy bare filenames — should not appear after Phase 4.8C migration,
  // but the fallback path is preserved for safety.
  return `https://apibtl.hubzero.in/uploads/${src}`;
}
