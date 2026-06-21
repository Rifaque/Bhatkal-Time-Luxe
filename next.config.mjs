/** @type {import('next').NextConfig} */

// Content-Security-Policy notes:
//
// 'unsafe-inline' in script-src: Required by Next.js App Router (hydration inline
//   scripts) and the JSON-LD <script> tags rendered via dangerouslySetInnerHTML in
//   layout.js. Removing this would require implementing per-request nonces — a viable
//   post-launch hardening step.
//
// 'unsafe-eval' in script-src: Required in development (Next.js fast-refresh); safe
//   to remove in production-only deployments if the build is known to never use eval.
//   Left in here for parity with the dev environment.
//
// 'unsafe-inline' in style-src: Tailwind v4 generates CSS-in-JS / inline <style>
//   blocks at runtime. Next.js also injects critical CSS inline. Removing this
//   would require style nonces — pair with script nonces post-launch.
//
// img-src includes:
//   res.cloudinary.com  — primary asset CDN (cloud: dnrxzdvkx)
//   watch-commerce-1.imgix.net — Imgix delivery layer (NEXT_PUBLIC_IMGIX_DOMAIN)
//   apibtl.hubzero.in   — legacy fallback path in getImageUrl() (image.js line 61)
//   data: blob:         — Next.js image optimisation and canvas operations
//
// connect-src 'self': fetch() in browser components only calls /api/* routes.
//   open.er-api.com is fetched server-side in a Route Handler — not from the browser.
//
// font-src: next/font/google downloads Playfair Display + Inter from fonts.gstatic.com.
//   fonts.googleapis.com is the stylesheet origin (style-src).
//
// frame-src / object-src 'none': No iframes or plugins used anywhere in the app.

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "img-src 'self' data: blob: res.cloudinary.com watch-commerce-1.imgix.net apibtl.hubzero.in",
  "font-src 'self' fonts.gstatic.com",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspDirectives },
        ],
      },
    ];
  },
};

export default nextConfig;
