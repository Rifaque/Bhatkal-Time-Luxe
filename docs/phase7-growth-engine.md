# Phase 7 — Growth Engine

## Overview

Post-production growth phase for Bhatkal Time Luxe. All changes are additive — no regressions to checkout, auth, admin, or homepage architecture.

---

## 7.1 Product Discovery Engine

### Related Products — Weighted Scoring

**File:** `src/app/api/products/related/route.js`

**Replaced:** 3-tier waterfall (brand → color → price±35%)

**New algorithm:** Weighted scoring across the full product catalog, returns top 8.

| Signal | Points | Logic |
|--------|--------|-------|
| Same brand | 40 | Exact ObjectId match |
| Same color | 25 | Exact string match on `color` field |
| Price proximity | 0–25 | Linear decay: 25pts at 0% diff, 0pts at ≥40% diff |
| Name keyword overlap | 0–10 | 2pts per shared word (min 3 chars), max 10 |

Fallback: if fewer than 4 scored results, fills remaining slots with any in-stock products (excluding already-seen).

### Trending Watches API

**File:** `src/app/api/trending/route.js`

- GET `/api/trending?limit=10`
- Returns products sorted by `orderCount` desc
- Excludes zero-orderCount products
- Populates brand name
- Intended for: homepage trending section, discovery widgets

### Discovery Analytics

**File:** `src/app/api/admin/analytics/route.js`

Added `popularBrands` aggregate: groups orders by `brand` field (string), counts order volume and revenue, returns top 5.

**File:** `src/app/admin/dashboard/page.js`

Added "Top Brands by Revenue" panel showing order count + revenue per brand.

---

## 7.2 Performance & Product Page Rendering

### ISR — Product Pages

**File:** `src/app/product/[id]/page.js`

```javascript
export const revalidate = 3600; // 1 hour
```

Pages cached at the edge. On-demand revalidation triggers after 1 hour or via `revalidatePath` (future admin trigger). `generateStaticParams` intentionally excluded — Atlas IP restriction at build time makes pre-building all products unsafe.

### ISR — Brand Pages

**File:** `src/app/brands/[id]/page.js`

Same 1-hour revalidation. Same rationale.

### Rendering After Phase 7.2

| Route | Before | After |
|-------|--------|-------|
| `/product/[id]` | Dynamic (every request) | ISR (1h cache + revalidate) |
| `/brands/[id]` | Dynamic (every request) | ISR (1h cache + revalidate) |
| All admin routes | Dynamic | Dynamic (no change) |
| `/guides/[slug]` | N/A | Static (full SSG) |

---

## 7.3 Image Optimization V2

### image.js Enhancements

**File:** `src/lib/image.js`

Added two helpers:

**`getImageUrlWithWidth(src, width, fallbackType)`**
Generates an Imgix URL with explicit `w=` param. Falls back to default preset if Imgix not configured.

**`getImageSrcSet(src, widths, fallbackType)`**
Generates a `srcset` string (e.g. `"https://... 300w, https://... 600w"`). Enables true responsive delivery when Imgix is active. Returns empty string if source is not a Cloudinary URL or Imgix is not configured.

### sizes Attributes Added

| Component | sizes value | Imgix preset used |
|-----------|------------|-------------------|
| `MobileProductCard` | `(max-width: 768px) 42vw, (max-width: 1024px) 200px, 280px` | `mobile` (w=500) |
| `QuickViewModal` (main) | `(max-width: 768px) 90vw, 480px` | `tablet` (w=800) |
| `QuickViewModal` (thumb) | `88px` | `thumb` (w=200) |
| `DesktopProductView` (main) | `(max-width: 1024px) 90vw, 50vw` | `desktop` (w=1200) |
| `DesktopProductView` (thumb) | `88px` | `thumb` (w=200) |
| `MobileProductView` (main) | `90vw` | `tablet` (w=800) |
| `Lightbox` | `100vw` | `desktop` (w=1200) |

**Net effect:** Imgix now receives explicit `w=` parameters for every image surface, enabling server-side resizing. Browsers that support `srcset` get the optimal resolution per viewport.

---

## 7.4 Structured SEO Expansion

### Product Page (`/product/[id]`)

**Schemas added/enhanced:**

1. **Product** (enhanced) — added `seller` (Organization), `itemCondition` (NewCondition), `priceValidUntil`
2. **BreadcrumbList** — `Home > [Brand] > [Product Name]`

### Brand Page (`/brands/[id]`)

**Schemas added:**

1. **Organization** — brand as Organization with logo, url
2. **ItemList** — collection of watches by this brand (first 10 products fetched at render)
3. **BreadcrumbList** — `Home > Brands > [Brand Name]`

### FAQ Page (`/faq`)

**Refactored:** FAQ data extracted to `src/lib/faq-data.js` (shared between server JSON-LD and client component).

**Schema added:** `FAQPage` with all 6 Q&A pairs.

**Refactored `page.js`:** Now a server component that injects FAQ JSON-LD and renders `<FAQPageClient />`.

### Existing Schemas (unchanged)

| Schema | Location |
|--------|----------|
| WebSite + SearchAction | `src/app/layout.js` |
| Organization | `src/app/layout.js` |

### Rich Result Eligibility After Phase 7.4

| Schema | Eligible For |
|--------|-------------|
| Product | Product rich results, price display in SERP |
| BreadcrumbList | Breadcrumb trail in SERP |
| FAQPage | FAQ accordion in SERP |
| Organization | Knowledge Panel |
| ItemList | Carousel-eligible (brand collection) |

---

## 7.5 Content SEO Engine

### Architecture Decision: `/guides`

Chose `/guides` over `/journal` — more topical authority, better for search intent (buyers researching purchases, not reading lifestyle content).

### Content Model

**File:** `src/lib/guides.js`

```javascript
{
  slug: String,           // URL segment
  title: String,          // H1 + <title>
  description: String,    // meta description
  category: String,       // 'Comparison' | 'Buying Guide' | 'Education' | 'Market'
  publishedAt: String,    // ISO date
  readTime: String,       // '7 min'
  heroKeyword: String,    // primary target keyword
  sections: [             // ordered content blocks
    { type: 'h2', text: String },
    { type: 'p', text: String },
    { type: 'ul', items: [String] },
    { type: 'cta', label: String, href: String },
  ]
}
```

### Routes

| Route | Component | Rendering |
|-------|-----------|-----------|
| `/guides` | `src/app/guides/page.js` | Static (SSG) |
| `/guides/[slug]` | `src/app/guides/[slug]/page.js` | Static (SSG via generateStaticParams) |

All guides are statically generated at build time — no DB dependency, instant serve from CDN edge.

### Articles Published

| Slug | Title | Category | Target Keyword |
|------|-------|----------|----------------|
| `rolex-vs-omega` | Rolex vs. Omega: Which Luxury Watch Should You Choose? | Comparison | rolex vs omega |
| `best-luxury-watches-under-500-kwd` | Best Luxury Watches Under 500 KWD | Buying Guide | luxury watches kuwait |
| `how-to-identify-authentic-watches` | How to Identify an Authentic Luxury Watch | Education | authentic luxury watch |
| `automatic-vs-quartz-watches` | Automatic vs. Quartz: Which Movement Is Right for You? | Education | automatic vs quartz watch |
| `top-watch-brands-in-kuwait` | Top Luxury Watch Brands in Kuwait | Market | watch brands kuwait |

### Internal Linking Strategy

Every guide contains:
- At least one CTA to `/new-arrivals` or `/brands`
- Brand mentions link to `/brands` where relevant
- Footer CTA to WhatsApp concierge

### Schemas on Guide Pages

Each `/guides/[slug]` page emits:
- `Article` schema (type, headline, author, datePublished, publisher)
- `BreadcrumbList` (Home > Guides > [Article Title])

---

## Files Changed — Phase 7

### New Files

| File | Purpose |
|------|---------|
| `TODO.md` | Task tracking |
| `docs/phase7-growth-engine.md` | This document |
| `src/app/api/trending/route.js` | Trending watches endpoint |
| `src/lib/faq-data.js` | Shared FAQ data (server + client) |
| `src/app/guides/page.js` | Guides listing page |
| `src/app/guides/[slug]/page.js` | Individual guide page |
| `src/lib/guides.js` | Guide content library (5 articles) |

### Modified Files

| File | Change |
|------|--------|
| `src/app/api/products/related/route.js` | Weighted scoring algorithm |
| `src/app/api/admin/analytics/route.js` | + popularBrands aggregate |
| `src/app/admin/dashboard/page.js` | + Top Brands by Revenue panel |
| `src/app/product/[id]/page.js` | + ISR revalidate, enhanced schema, Breadcrumb |
| `src/app/brands/[id]/page.js` | + ISR revalidate, Organization + ItemList + Breadcrumb schemas |
| `src/app/faq/page.js` | Refactored to server component + FAQPage JSON-LD |
| `src/app/faq/MobileFAQView.jsx` | Import faq-data from shared module |
| `src/components/DesktopFAQView.jsx` | Import faq-data from shared module |
| `src/lib/image.js` | + getImageUrlWithWidth, + getImageSrcSet |
| `src/components/MobileProductCard.jsx` | + sizes attr, + mobile preset |
| `src/components/QuickViewModal.jsx` | + sizes attrs, + presets |
| `src/app/product/[id]/DesktopProductView.jsx` | + sizes attrs, + presets |
| `src/app/product/[id]/MobileProductView.jsx` | + sizes attr, + tablet preset |
| `src/components/Lightbox.jsx` | + sizes="100vw", + desktop preset |

---

## Metrics Targets (verify post-deploy)

| Metric | Baseline | Target |
|--------|----------|--------|
| TTFB (product page) | ~400ms (dynamic) | <100ms (ISR edge) |
| Image transfer per product card | ~80–120KB | ~20–40KB (w=500 Imgix) |
| Lightbox image transfer | ~500KB+ | ~150KB (w=1200) |
| Rich results | Product only | Product + FAQ + Breadcrumb |
| Indexed content pages | 0 guides | 5 guides |
