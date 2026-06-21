# Bhatkal Time Luxe

A premium watch eCommerce storefront built with Next.js 16, MongoDB Atlas, and Cloudinary. Designed for a luxury retail context in the Kuwait/GCC market. Commerce runs through WhatsApp — no payment gateway is integrated.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Features](#4-features)
5. [Reference System](#5-reference-system)
6. [Security](#6-security)
7. [Image Delivery](#7-image-delivery)
8. [Environment Variables](#8-environment-variables)
9. [Installation](#9-installation)
10. [Production Deployment](#10-production-deployment)
11. [Admin Bootstrap](#11-admin-bootstrap)
12. [Project Structure](#12-project-structure)
13. [API Reference](#13-api-reference)
14. [Known Limitations](#14-known-limitations)
15. [Launch Status](#15-launch-status)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Project Overview

**Bhatkal Time Luxe** is a curated luxury watch storefront serving the Kuwait and GCC market. The platform combines a polished browsing experience with a WhatsApp-based checkout flow, eliminating payment gateway complexity for high-value watch sales where personal communication is standard practice.

**Business model:** Browse online, complete purchase via WhatsApp concierge. Orders are tracked internally through an admin dashboard with a full status pipeline.

**Key business features:**
- Full-catalog product browse with search, filtering, and brand pages
- WhatsApp checkout with automatic order message generation
- Admin-managed featured products, best sellers, and homepage editorial content
- Multi-currency display (base: KWD) with live exchange rate fetching
- Product reference codes for professional catalog management

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Runtime** | Node.js 20+ |
| **Frontend** | React 19, Tailwind CSS v4 |
| **Database** | MongoDB Atlas via Mongoose 8 |
| **Image Storage** | Cloudinary |
| **Image Delivery** | Imgix (optional, in front of Cloudinary) |
| **Authentication** | JWT — `jsonwebtoken` in API routes, Web Crypto API in Edge middleware |
| **Password Hashing** | bcrypt (12 rounds) |
| **Deployment** | Vercel (recommended) or any Node.js host |

---

## 3. Architecture

### Image Delivery Pipeline

```
Upload (admin)
    │
    ▼
Cloudinary (authoritative storage)
    │
    ▼
Imgix (optional delivery layer — format negotiation, compression)
    │   └─ Activated by NEXT_PUBLIC_IMGIX_DOMAIN env var
    │   └─ Falls back to direct Cloudinary URL if not configured
    ▼
Browser (AVIF / WebP / JPEG, served at optimal size)
```

`getImageUrl(src, fallbackType, preset)` in `src/lib/image.js` is the sole gateway. All components call this function — no component constructs image URLs directly.

### Authentication Flow

```
POST /api/admin/login
    │
    ├─ bcrypt.compare(password, storedHash)
    │
    └─ signToken({ id, username }) → JWT (7d expiry)
         │
         └─ Set as httpOnly cookie: adminToken
              │
              ├─ src/proxy.js (Edge middleware) — guards all /admin/* page routes
              │   └─ Uses Web Crypto API (HMAC-SHA256) for Edge compatibility
              │
              └─ getAdminFromRequest(req) — guards all admin API routes
                  └─ Reads Authorization: Bearer header, falls back to cookie
```

### Admin Flow

```
/admin/login → proxy.js validates JWT → /admin/dashboard
                                              │
                        ┌─────────────────────┼──────────────────────┐
                        ▼                     ▼                      ▼
                   /admin/products    /admin/brands         /admin/orders
                   /admin/featured    /admin/settings       /admin/homepage
                   /admin/best-selling /admin/top-brands    /admin/dashboard
```

### Commerce Flow

```
Customer browses → adds to cart (cartId cookie, 30-day) → clicks "Buy via WhatsApp"
                                                                │
                                               POST /api/cart/checkout
                                                                │
                                               ┌────────────────┴──────────────┐
                                               │                               │
                                        Creates Order             Builds WhatsApp URL
                                        Deletes Cart              (wa.me/... with
                                        Returns orderId           pre-filled message)
                                               │
                                         Customer opens WhatsApp → negotiates → admin marks order status
```

### Mobile/Desktop Split

Every customer-facing page uses the `useIsDesktop` hook (`src/hooks/useIsDesktop.js`, breakpoint 1024px) to render either a `Desktop*View` or `Mobile*View` component. These are separate components — not the same component with responsive CSS. When adding UI, both views must be implemented.

---

## 4. Features

### Storefront

| Feature | Description |
|---|---|
| **Homepage** | Hero, brand spotlight, featured collection, editorial showcases (executive/sport), best sellers, new arrivals, concierge CTA |
| **Search** | Real-time search across product name, brand, and reference code |
| **Brands** | Full brand directory; brand detail page with filtered product grid |
| **Product Pages** | Image gallery with lightbox, swipe gestures (mobile), sticky buy CTA, related products, share, wishlist |
| **Cart** | Cookie-based persistent cart; quantity management; wishlist |
| **Wishlist** | localStorage-persisted wishlist; surfaces on homepage when ≥4 items saved |
| **Recently Viewed** | localStorage-persisted; shown in cart and product pages |
| **WhatsApp Checkout** | Cart and individual product checkout routes; pre-filled order message; order confirmation page with fallback link |
| **Multi-currency** | KWD base; currency picker (USD, EUR, GBP, AED, SAR, INR, others); live exchange rates from open.er-api.com |
| **New Arrivals page** | Dedicated page sorted by `dateAdded` descending |
| **FAQ** | Static FAQ covering shipping, authenticity, payment, returns |
| **Contact** | WhatsApp concierge, phone, email; inquiry form (routes to WhatsApp) |

### Admin Panel

| Section | Path | Description |
|---|---|---|
| **Dashboard** | `/admin/dashboard` | Business metrics (orders, revenue, pending, today), catalog counts, recent orders, top sellers, 7-day summary |
| **Products** | `/admin/products` | Full CRUD; image upload; availability toggle; reference code display |
| **Brands** | `/admin/brands` | Full CRUD; logo upload; reference prefix management |
| **Featured** | `/admin/featured` | Curate the "Featured Collection" homepage section |
| **Best Selling** | `/admin/best-selling` | Curate the "Best Selling Timepieces" homepage section |
| **Top Brands** | `/admin/top-brands` | Curate the brand spotlight (max 3 shown on homepage) |
| **Homepage Content** | `/admin/homepage` | Override editorial text: hero heading/subheading, CTAs, section titles, trust card copy |
| **Orders** | `/admin/orders` | Order management with 9-status pipeline; customer details; internal notes |
| **Settings** | `/admin/settings` | Store name, contact info, WhatsApp number, address, currency rate management |
| **Users** | `/admin/users` | Placeholder — no customer account system implemented |

---

## 5. Reference System

Every product is assigned a unique reference code on creation:

```
BTL-RLX-001
 │    │    │
 │    │    └── Sequential counter per brand prefix (zero-padded to 3 digits)
 │    └────── Brand code (3 letters, derived from referencePrefix or brand name)
 └─────────── Store prefix (always BTL — Bhatkal Time Luxe)
```

**Examples:**
- `BTL-RLX-001` → First Rolex in the catalog
- `BTL-OMG-003` → Third Omega
- `BTL-CSO-001` → First Casio (auto-derived code)

**How it works:**
1. When a product is created via `POST /api/products`, the server calls `generateReference(prefix, Product)` in a non-blocking try/catch after saving.
2. The prefix comes from the brand's `referencePrefix` field. If unset, it is auto-derived from the brand name using `brandCode(name)` (first 3 significant letters, uppercased).
3. The function scans existing references for the prefix and assigns the next sequential number.
4. References are **immutable** after assignment — `PUT /api/products/[id]` strips the `reference` field from any update payload.
5. The `reference` field has a sparse unique index in MongoDB — no two products share a reference.

**Admin UI:** References are displayed as monospace badges on product cards and the product detail page. They are read-only and cannot be edited through the admin.

---

## 6. Security

| Layer | Implementation |
|---|---|
| **Route protection** | `src/proxy.js` — Next.js Edge middleware guards all `/admin/*` page routes using Web Crypto API JWT verification (HS256) |
| **API protection** | `getAdminFromRequest(req)` in `src/lib/auth.js` — verifies JWT from `Authorization: Bearer` header or `adminToken` cookie |
| **JWT** | Signed with `JWT_SECRET` (HS256), 7-day expiry, `jsonwebtoken` library |
| **Cookies** | `httpOnly: true`, `secure: true` in production, `sameSite: 'strict'`, `path: '/'` |
| **Password hashing** | bcrypt with 12 salt rounds |
| **Login rate limiting** | 10 attempts per 15 minutes per IP (in-memory — see Known Limitations) |
| **Checkout rate limiting** | 20 requests per 10 minutes per IP |
| **Image upload validation** | MIME type and file size checked before upload |
| **Input validation** | Brand ID validated as ObjectId; prices cast to float |
| **Reference immutability** | `PUT` handler explicitly strips `reference` from update payload |
| **Security headers** | `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` set globally in `next.config.mjs` |
| **Admin registration** | Permanently disabled — returns HTTP 403 for all requests |

---

## 7. Image Delivery

All images are stored on Cloudinary. Imgix is an optional delivery layer that provides automatic format negotiation (AVIF/WebP), compression, and responsive sizing.

**Cloudinary configuration:**
- Product images → `bhatkal-time-luxe/products/` folder
- Brand logos → `bhatkal-time-luxe/brands/` folder
- Allowed formats: `jpg`, `jpeg`, `png`, `webp`

**Imgix activation:**
Set `NEXT_PUBLIC_IMGIX_DOMAIN` in `.env`. Point the Imgix source at your Cloudinary base URL (`https://res.cloudinary.com/<cloud_name>/image/upload/`). Without this variable, all images are served directly from Cloudinary.

**Responsive presets** (`src/lib/image.js`):

| Preset | Width | Quality | Use |
|---|---|---|---|
| `default` | uncapped | auto | Most components |
| `mobile` | 500px | 75 | Mobile-specific |
| `tablet` | 800px | 75 | Tablet |
| `desktop` | 1200px | 80 | Desktop |
| `thumb` | 200px | 70 | Thumbnails |

**Orphaned image cleanup:** Admin → `POST /api/admin/cleanup-images` removes Cloudinary assets that are no longer referenced by any product or brand in the database.

---

## 8. Environment Variables

Create a `.env` file in the project root. Never commit this file.

```env
# Required — MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# Required — JWT signing secret (generate with: openssl rand -base64 64)
JWT_SECRET=your-very-long-random-secret-here

# Required — Cloudinary credentials (from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Required — WhatsApp number for checkout (country code + number, no + or spaces)
# Example: Kuwait +965 1234 5678 → 96512345678
WHATSAPP_NUMBER=96512345678

# Optional — Imgix delivery domain (omit to serve directly from Cloudinary)
NEXT_PUBLIC_IMGIX_DOMAIN=your-subdomain.imgix.net
```

All variables except `NEXT_PUBLIC_IMGIX_DOMAIN` are server-only. `NEXT_PUBLIC_*` variables are exposed to the browser bundle.

---

## 9. Installation

```bash
# Clone and install
git clone <repo-url>
cd bhatkal-time-luxe
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
# → http://localhost:3000
# → Admin panel: http://localhost:3000/admin/login
```

Other commands:

```bash
npm run build         # Production build
npm run start         # Start production server (after build)
npm run lint          # Run ESLint
npm run generate:sitemap  # Regenerate public/sitemap.xml
```

---

## 10. Production Deployment

### Vercel (Recommended)

1. Push the repository to GitHub/GitLab.
2. Import the project in Vercel.
3. Add all environment variables in Vercel Project Settings → Environment Variables.
4. Deploy. Vercel auto-detects Next.js and configures the build.

**Note on rate limiting:** The in-memory rate limiter in `src/lib/rateLimit.js` does not share state across Vercel serverless function instances. For production, replace the `Map` store with an [Upstash Redis](https://upstash.com) store. The file contains a comment explaining the replacement point.

### Self-hosted (Node.js)

```bash
npm run build
npm run start         # Starts Next.js on port 3000

# Or with a custom port:
PORT=8080 npm run start
```

Use a reverse proxy (Nginx, Caddy) to terminate TLS and forward to port 3000.

---

## 11. Admin Bootstrap

Admin accounts are created via a one-time seed script. **The registration API is permanently disabled** — it returns HTTP 403 for all requests. Use this script for first-time setup and any future admin account creation.

### Prerequisites

- Node.js 20.6 or later (for `--env-file` support)
- A valid `.env` file with `MONGO_URI` set
- The project installed (`npm install`)

### Create admin accounts

```bash
node --env-file=.env scripts/seed-admin.mjs
```

The script will:
1. Connect to MongoDB using `MONGO_URI` from your `.env`
2. Hash each password with bcrypt (12 rounds — identical to the application)
3. Insert accounts that do not already exist (idempotent)
4. Skip silently if the username already exists

**Defined accounts in the script:**
- `admin` / `admin@btl`
- `rifaque` / `rifaque.dev`

To add more accounts, edit `scripts/seed-admin.mjs` before running. Delete the script or remove it from version control after use if the passwords are sensitive.

### Verify accounts work

After running the seed script, test login at `/admin/login` with each account.

### Changing passwords

Re-run the seed script after updating the password values (accounts that already exist are skipped). To reset a password for an existing account, connect to MongoDB directly and update the `password` field with a freshly hashed value, or add a temporary route in development.

---

## 12. Project Structure

```
bhatkal-time-luxe/
├── public/
│   └── assets/images/          # Fallback images (fallback-image.webp, fallback-brand.png)
├── scripts/
│   └── seed-admin.mjs          # One-time admin account seeder
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js             # Homepage (dispatches to Desktop/Mobile view)
│   │   ├── layout.js           # Root layout with providers
│   │   ├── globals.css         # Global styles, animations, view transitions
│   │   ├── admin/              # Admin panel pages
│   │   │   ├── login/          # Login page (public)
│   │   │   ├── dashboard/      # Analytics dashboard
│   │   │   ├── products/       # Product CRUD
│   │   │   ├── brands/         # Brand CRUD
│   │   │   ├── featured/       # Featured curation
│   │   │   ├── best-selling/   # Best sellers curation
│   │   │   ├── top-brands/     # Top brands curation
│   │   │   ├── homepage/       # Homepage content CMS
│   │   │   ├── orders/         # Order management
│   │   │   ├── settings/       # Store settings
│   │   │   └── components/
│   │   │       └── AdminShell.jsx  # Admin layout, navigation, shared UI primitives
│   │   ├── api/                # Next.js Route Handlers
│   │   │   ├── admin/          # Admin-only endpoints (auth required)
│   │   │   ├── products/       # Product endpoints
│   │   │   ├── brands/         # Brand endpoints
│   │   │   ├── cart/           # Cart + checkout endpoints
│   │   │   └── ...
│   │   ├── brands/             # Brand pages
│   │   ├── product/[id]/       # Product detail page
│   │   ├── contact/            # Contact page
│   │   ├── faq/                # FAQ page
│   │   └── new-arrivals/       # New arrivals page
│   ├── components/             # Shared storefront components
│   │   ├── DesktopHomeView.jsx
│   │   ├── MobileHomeView.jsx
│   │   ├── DesktopNavbar.jsx
│   │   ├── MobileLayout.jsx
│   │   ├── DesktopCartView.jsx
│   │   ├── MobileCartView.jsx
│   │   ├── QuickViewModal.jsx
│   │   ├── Lightbox.jsx
│   │   ├── ShareModal.jsx
│   │   ├── WishlistButton.jsx
│   │   └── ui/
│   │       ├── button.jsx
│   │       └── skeleton.jsx
│   ├── context/                # React context providers
│   │   ├── CurrencyContext.jsx     # Multi-currency state
│   │   ├── CartContext.jsx         # Cart item count
│   │   ├── WishlistContext.jsx     # Wishlist state (localStorage)
│   │   ├── StoreSettingsContext.jsx # Store settings + homepage content
│   │   └── ToastContext.jsx        # Global toast notifications
│   ├── hooks/
│   │   ├── useIsDesktop.js         # Breakpoint hook (1024px)
│   │   └── useProductPageLogic.js  # Shared product page state
│   ├── lib/
│   │   ├── mongodb.js          # Mongoose singleton connection
│   │   ├── auth.js             # signToken, verifyToken, getAdminFromRequest
│   │   ├── cloudinary.js       # uploadBuffer()
│   │   ├── image.js            # getImageUrl(), buildImgixUrl(), IMGIX_PRESETS
│   │   ├── settings.js         # getSettings() with 5-minute cache
│   │   ├── rateLimit.js        # In-memory per-IP rate limiter
│   │   ├── audit.js            # logAdminAction() for audit trail
│   │   └── currency.js         # formatINR() formatter
│   ├── models/
│   │   └── Schemas.js          # All Mongoose models in one file
│   └── proxy.js                # Next.js Edge middleware (admin route guard)
├── .env                        # Environment variables (not committed)
├── .gitignore
├── next.config.mjs             # Security headers
├── package.json
└── README.md
```

---

## 13. API Reference

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/products` | All products (with brand populated) |
| `GET` | `/api/products/[id]` | Single product |
| `GET` | `/api/products/new-arrivals` | Products sorted by `dateAdded` DESC |
| `GET` | `/api/products/brand/[brandId]` | Products by brand |
| `GET` | `/api/products/related` | Related products (query: `?productId=`) |
| `GET` | `/api/brands` | All brands |
| `GET` | `/api/brands/[id]` | Single brand |
| `GET` | `/api/featured` | Featured products (with product populated) |
| `GET` | `/api/best-selling` | Best selling products (with product populated) |
| `GET` | `/api/top-brands` | Top brands (with brand populated) |
| `GET` | `/api/cart` | Current cart by cartId cookie |
| `POST` | `/api/cart` | Add item to cart |
| `PUT` | `/api/cart` | Update item quantity |
| `DELETE` | `/api/cart` | Remove item |
| `GET` | `/api/cart/total` | Cart item count |
| `POST` | `/api/cart/checkout` | WhatsApp checkout (rate limited: 20/10min) |
| `POST` | `/api/product/[productId]/checkout` | Single-product WhatsApp checkout |
| `GET` | `/api/settings` | Public store settings (name, contact, homepage content) |
| `GET` | `/api/currency-rates` | Live exchange rates |
| `GET` | `/api/whatsapp` | Redirect to WhatsApp (for CTAs) |
| `GET` | `/api/sitemap.xml` | Sitemap |

### Admin Endpoints (JWT required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Login (rate limited: 10/15min) |
| `POST` | `/api/admin/logout` | Clear session cookie |
| `GET` | `/api/admin/settings` | Full settings (includes private fields) |
| `PATCH` | `/api/admin/settings` | Update settings (store info or homepageContent) |
| `GET` | `/api/admin/analytics` | Order analytics (totals, recent, top products, 7-day) |
| `GET` | `/api/admin/orders` | All orders (paginated, sortable) |
| `PATCH` | `/api/admin/orders/[orderId]` | Update order status, notes, tracking |
| `GET` | `/api/admin/featured` | Featured list |
| `POST` | `/api/admin/featured` | Add to featured |
| `DELETE` | `/api/admin/featured/[productId]` | Remove from featured |
| `GET` | `/api/admin/best-selling` | Best selling list |
| `POST` | `/api/admin/best-selling` | Add to best selling |
| `DELETE` | `/api/admin/best-selling/[productId]` | Remove from best selling |
| `GET` | `/api/admin/top-brands` | Top brands list |
| `POST` | `/api/admin/top-brands` | Add to top brands |
| `DELETE` | `/api/admin/top-brands/[brandId]` | Remove from top brands |
| `POST` | `/api/admin/exchange-rates/refresh` | Force-refresh live exchange rates |
| `POST` | `/api/admin/cleanup-images` | Delete orphaned Cloudinary assets |
| `GET` | `/api/admin/integrity-check` | Check for data integrity issues |
| `GET` | `/api/admin/brand-impact/[brandId]` | Preview cascade delete impact |
| `GET` | `/api/admin/suggest-prefix` | Suggest brand reference prefix |

### Product CRUD (admin auth on mutating methods)

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/products` | Public |
| `POST` | `/api/products` | Admin |
| `GET` | `/api/products/[id]` | Public |
| `PUT` | `/api/products/[id]` | Admin |
| `DELETE` | `/api/products/[id]` | Admin |

### Brand CRUD (admin auth on mutating methods)

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/brands` | Public |
| `POST` | `/api/brands` | Admin |
| `GET` | `/api/brands/[id]` | Public |
| `PUT` | `/api/brands/[id]` | Admin |
| `DELETE` | `/api/brands/[id]` | Admin (cascade deletes products) |

---

## 14. Known Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| **In-memory rate limiter** | Does not share state across Vercel serverless instances. Login and checkout rate limits reset per cold start. | Replace `Map` store in `src/lib/rateLimit.js` with Upstash Redis. The file documents the replacement point. |
| **No customer accounts** | Cart identity is a cookie-based UUID. Wishlist is localStorage. Returning customers cannot retrieve previous carts or order history. | Planned for Phase 6. |
| **No payment gateway** | Commerce depends on WhatsApp negotiation. No automated payment capture. | By design for this market/business model. |
| **No product pagination** | `GET /api/products` returns the entire catalog in one response. | Acceptable below ~50 products. Add cursor-based pagination when catalog grows. |
| **CSR-only product pages** | Product pages fetch on mount. No SSG/ISR. | LCP is blocked by JS + API roundtrip. Add `generateStaticParams` + `revalidate` for SEO improvement. |
| **Modal focus traps missing** | Tab key escapes modals into background. WCAG 2.1 SC 2.4.3 failure. | Implement focus-trap-react or a custom hook on QuickViewModal, Lightbox, ShareModal, HamburgerMenu. |
| **No Content-Security-Policy** | CSP header not set. XSS injection surface not constrained. | Add to `next.config.mjs` security headers. |
| **Hardcoded brand stories** | Executive and Sport showcase copy references specific brands (Tissot/Rolex, Seiko/Casio). Overridable via Homepage Content CMS but underlying logic still pattern-matches brand names. | Fully resolved by setting content overrides in Admin → Homepage Content. |

---

## 15. Launch Status

**Build:** Passing. 58 pages generated. `ƒ Proxy (Middleware)` active.

**P0 items (pre-launch blocking):** All resolved.
- Geographic content corrected (Kuwait/GCC throughout)
- Operating hours aligned (9 PM AST across all surfaces)
- APK download link removed from mobile contact page
- Admin security confirmed (proxy.js JWT verification active)

**P1 items remaining before production hardening:**
1. Modal focus traps (WCAG gap — requires `focus-trap-react` or equivalent)
2. Rate limiter migration to Upstash Redis (required for Vercel multi-instance)

**Production readiness:** The platform is suitable for client demonstration and initial launch. The P1 items are hardening improvements, not blockers for a soft launch.

---

## 16. Future Roadmap

### Phase 6 — Production Hardening

- **Upstash Redis rate limiting** — Replace in-memory Map with distributed store for multi-instance Vercel deployments
- **Modal focus traps** — WCAG 2.1 SC 2.4.3 compliance
- **Content-Security-Policy header** — Add to `next.config.mjs`
- **Product page SSG/ISR** — `generateStaticParams` + `revalidate: 3600` for improved LCP and SEO Core Web Vitals

### Phase 7 — Commerce Expansion

- **Customer accounts** — Registration, order history, saved addresses
- **Order webhooks** — Telegram/WhatsApp notification to admin on new order (eliminates manual dashboard checking)
- **Product catalog pagination** — Cursor-based `/api/products?after=<cursor>&limit=24`
- **Inventory quantities** — Replace boolean `inStock` with numeric `stockQty`

### Phase 8 — Content & Discovery

- **Brand story management** — Move hardcoded brand narratives to admin-editable brand description fields
- **Image gallery management** — Reorder and delete product images from admin without re-uploading
- **Product collections** — Tag-based grouping beyond Featured/Best Selling
- **Sitemap automation** — Auto-regenerate on product/brand create/delete

---

*Developed by Rifaque · Hub Zero*
