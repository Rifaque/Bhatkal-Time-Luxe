/**
 * Safely resolves product and brand image URLs.
 * Handles legacy filenames (hosted on backend server) and new full Cloudinary URLs.
 */
export function getImageUrl(src, fallbackType = 'product') {
  if (!src) {
    return fallbackType === 'brand' 
      ? '/assets/images/fallback-brand.png' 
      : '/assets/images/fallback-image.webp';
  }
  
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  return `https://apibtl.hubzero.in/uploads/${src}`;
}
