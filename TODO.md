# Bhatkal Time Luxe

# Phase 7 — Growth Engine

## Status Legend

* [ ] Not Started
* [~] In Progress
* [x] Complete
* [!] Blocked

---

# Phase 7.1 — Product Discovery Engine

## Discovery Audit

* [x] Audit existing related products logic
* [x] Audit search capabilities
* [x] Audit recently viewed implementation
* [x] Audit wishlist discovery impact

## Similar Watches

* [x] Design weighted relevance algorithm
* [x] Same-brand scoring (40 pts)
* [x] Same-color scoring (25 pts)
* [x] Similar-price scoring (up to 25 pts, linear decay)
* [x] Name keyword overlap scoring (up to 10 pts)
* [x] Exclude current product
* [x] Deduplicate results

## Smart Related Products

* [x] Replace current 3-tier waterfall implementation
* [x] Add weighted ranking (brand+color+price+keywords)
* [x] Add fallback logic (fill to 8 with any in-stock if scored pool thin)
* [x] Verify mobile rendering
* [x] Verify desktop rendering

## Trending Watches

* [x] Define popularity model (orderCount primary)
* [x] Use orderCount for ranking
* [x] Create /api/trending endpoint
* [ ] Homepage integration (future — homepage hero already curated)

## Discovery Analytics

* [x] Most ordered products (existing admin dashboard)
* [x] Most popular brands (brand order revenue added to analytics)
* [x] Dashboard integration — Top Brands by Revenue panel

---

# Phase 7.2 — Performance & Product Rendering

## Audit

* [x] Audit rendering strategy — all pages were dynamic
* [x] Audit dynamic routes
* [x] Audit product page rendering
* [x] Audit brand page rendering

## ISR Product Pages

* [x] Determine revalidation interval (3600s = 1 hour)
* [x] Implement ISR (export const revalidate = 3600)
* [x] Verify SEO (generateMetadata preserved)
* [x] Verify metadata
* [x] Verify dynamic updates (ISR regenerates on demand)

## ISR Brand Pages

* [x] Implement ISR
* [x] Verify metadata
* [x] Verify cache behavior

## Homepage Performance

* [x] Identify LCP element (btimehome.webp logo in MobileLayout + DesktopNavbar)
* [x] Hero image priority loading (priority prop on next/image, pre-existing)
* [x] Eliminate layout shifts (no CLS regressions)
* [x] Verify Core Web Vitals (LCP warning resolved)

## Bundle Optimization

* [x] Bundle analysis (DesktopHomeView, QuickViewModal are largest client bundles)
* [ ] Lazy-load non-critical components (future — requires Suspense boundaries)
* [ ] Remove unnecessary hydration (future)
* [ ] Verify bundle reductions (future)

---

# Phase 7.3 — Image Optimization V2

## Audit

* [x] Audit all image entry points (getImageUrl is sole gateway)
* [x] Audit sizes usage (none — all missing)
* [x] Audit responsive behavior

## Product Cards

* [x] Add sizes attributes ("(max-width: 768px) 42vw, (max-width: 1024px) 200px, 280px")
* [x] Use mobile preset (w=500) via getImageUrl

## Quick View

* [x] Add sizes attribute ("(max-width: 768px) 90vw, 480px")
* [x] Use tablet preset for main image

## Product Detail

* [x] Add sizes to primary image ("(max-width: 768px) 90vw, 50vw")
* [x] Add sizes to gallery thumbnails ("88px")
* [x] Use desktop preset for main image on desktop

## Lightbox

* [x] Add sizes="100vw" (full-screen image viewer)
* [x] Use desktop preset for full-res

## Hero

* [x] next/image priority already set on all above-fold logo images

## Image Utilities

* [x] Add getImageSrcSet() helper to image.js for Imgix-backed srcset generation
* [x] Add getImageUrlWithWidth() for explicit width requests

## Verification

* [x] No quality regressions (presets maintain q=75-80)
* [x] Reduced transfer sizes (Imgix w= params now sent for all surfaces)
* [x] Build passes

---

# Phase 7.4 — Structured SEO Expansion

## Audit

* [x] Audit current JSON-LD (Product schema on /product/[id]; Organization+WebSite+SearchAction on layout)
* [x] Audit metadata implementation (generateMetadata on product + brand pages)

## Product Schema

* [x] Enhance existing schema (add seller, priceValidUntil, itemCondition)
* [x] Add Breadcrumb schema to product page
* [x] Validate

## Brand Schema

* [x] Implement Brand (Organization) schema
* [x] Add Breadcrumb schema to brand page
* [x] Validate

## Collection Schema

* [x] ItemList schema on brand page (watches by brand)

## FAQ Schema

* [x] Extract FAQ data to shared module
* [x] Add FAQPage JSON-LD to /faq page
* [x] Validate

## SearchAction Schema

* [x] Already implemented in layout.js WebSite schema

## Breadcrumb Schema

* [x] Product page: Home > Brand > Product
* [x] Brand page: Home > Brands > Brand Name

## Verification

* [x] Valid JSON-LD (no syntax errors)
* [x] No duplicate schema conflicts
* [x] Rich result eligibility (Product, FAQ, BreadcrumbList)

---

# Phase 7.5 — Content SEO Engine

## Architecture

* [x] Decided: /guides (cleaner discovery URLs than /journal)
* [x] Content model defined (slug, title, description, category, publishedAt, readTime, sections)
* [x] URL structure: /guides (listing), /guides/[slug] (article)

## Platform

* [x] Article listing page (/guides/page.js)
* [x] Article detail page (/guides/[slug]/page.js)
* [x] Metadata generation (generateMetadata per article)
* [x] JSON-LD Article schema per article
* [x] Breadcrumb schema on articles
* [x] Internal linking (cross-links to /new-arrivals, /brands, /search)

## Initial Content Framework

* [x] Rolex vs Omega (rolex-vs-omega)
* [x] Best Luxury Watches Under 500 KWD (best-luxury-watches-under-500-kwd)
* [x] How To Identify Authentic Watches (how-to-identify-authentic-watches)
* [x] Automatic vs Quartz Watches (automatic-vs-quartz-watches)
* [x] Top Watch Brands in Kuwait (top-watch-brands-in-kuwait)

## SEO Verification

* [x] Metadata validation (title, description, OG per guide)
* [x] Internal linking (CTAs to product discovery in every article)
* [x] Crawlability (static server components, no JS required for content)

---

# Final Verification

* [x] Full build passes
* [x] No regressions
* [x] SEO audit passes
* [x] Performance improved (ISR + image sizes + presets)
* [x] Discovery improvements verified (weighted related, trending endpoint)
* [x] Documentation updated

---

# Future Opportunities

* [ ] Personalized recommendations (requires user auth / session tracking)
* [ ] Search intelligence (query analytics, auto-complete improvements)
* [ ] Behavioral recommendations (view history weighting, cross-session)
* [ ] Advanced analytics (funnel tracking, conversion events)
* [ ] Editorial CMS (Sanity or Contentlayer if editorial velocity increases)
* [ ] AI-assisted content generation
* [ ] Lazy-load QuickViewModal (split code from initial bundle)
* [ ] generateStaticParams for top-N products (requires Atlas IP allow-list at build time)
* [ ] wishlistCount as discovery signal in trending (currently client-side only)
