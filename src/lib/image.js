export function getImageUrl(src, fallbackType = 'product') {
  if (!src) {
    return fallbackType === 'brand'
      ? '/assets/images/fallback-brand.png'
      : '/assets/images/fallback-image.webp';
  }

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Legacy images are stored as bare filenames and served from the original upload server
  return `https://apibtl.hubzero.in/uploads/${src}`;
}
