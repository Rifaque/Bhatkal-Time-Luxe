'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import MobileProductCard from '@/components/MobileProductCard';
import { getImageUrl } from '@/lib/image';
import { useWishlist } from '@/context/WishlistContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { Sk, ProductCardSk } from '@/components/ui/skeleton';

function CardSkeleton() {
  return (
    <div className="w-[42vw] md:w-52 lg:w-64 shrink-0">
      <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden">
        <Sk className="w-full !rounded-none" style={{ aspectRatio: '1/1' }} />
        <div className="px-3 py-2.5 space-y-1.5">
          <Sk className="h-2.5 w-3/4" />
          <Sk className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

function BrandSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
          <Sk className="w-16 h-16 !rounded-2xl" />
          <Sk className="h-2 w-12" />
        </div>
      ))}
    </>
  );
}

export default function MobileHomeView() {
  const [topCategories, setTopCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { wishlistIds, count: wishlistCount } = useWishlist();
  const { storeName } = useStoreSettings();

  useEffect(() => {
    Promise.all([
      fetch('/api/top-brands').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/featured').then((r) => r.json()),
      fetch('/api/best-selling').then((r) => r.json()),
    ])
      .then(([topCatData, productsData, featuredData, bestSellingData]) => {
        setTopCategories(Array.isArray(topCatData) ? topCatData : []);
        setAllProducts(Array.isArray(productsData) ? productsData : []);
        setFeatured(Array.isArray(featuredData) ? featuredData : []);
        setBestSelling(Array.isArray(bestSellingData) ? bestSellingData : []);
      })
      .catch((err) => console.error('Failed to fetch home data', err))
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = useMemo(
    () => featured.map((item) => item.productId).filter(Boolean),
    [featured]
  );

  const bestSellingProducts = useMemo(
    () => bestSelling.map((item) => item.productId).filter(Boolean),
    [bestSelling]
  );

  const wishlistProducts = useMemo(() => {
    if (wishlistCount < 4 || allProducts.length === 0) return [];
    const idSet = new Set(wishlistIds);
    return allProducts.filter((p) => idSet.has(String(p._id))).slice(0, 8);
  }, [wishlistIds, wishlistCount, allProducts]);

  return (
    <MobileLayout>
      {/* ── Hero ── */}
      <section className="relative px-5 pt-8 pb-10 md:px-8 md:pt-10 lg:px-12 lg:pt-12 lg:pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D1B23E]/6 via-transparent to-transparent pointer-events-none" />
        <div className="relative lg:flex lg:items-center lg:gap-10">
          {/* Text + CTA */}
          <div className="lg:flex-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-3">
              Premium Timepieces
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-white mb-3">
              Discover Luxury<br />Watch Collection
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-[280px] md:max-w-sm lg:max-w-md">
              Certified authentic timepieces from the world&apos;s finest horological houses.
            </p>
            <button
              onClick={() => router.push('/brands')}
              className="inline-flex items-center gap-2 bg-[#D1B23E] text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#c1a22e] active:scale-[0.97] transition-all"
            >
              Shop Collection
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Featured watch showcase — lg: tablet landscape only */}
          {loading && (
            <div className="hidden lg:block lg:w-[260px] lg:shrink-0">
              <div className="bg-[#171717] border border-white/5 rounded-3xl overflow-hidden">
                <Sk className="aspect-square w-full !rounded-none" />
                <div className="p-4 space-y-2">
                  <Sk className="h-2.5 w-1/3" />
                  <Sk className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          )}
          {!loading && featuredProducts.length > 0 && (
            <div className="hidden lg:block lg:w-[260px] lg:shrink-0">
              <div
                className="relative bg-[#f0eeea] rounded-3xl overflow-hidden shadow-2xl cursor-pointer group active:scale-[0.98] transition-transform"
                onClick={() => router.push(`/product/${featuredProducts[0]._id}`)}
              >
                <div className="p-6">
                  <img
                    src={getImageUrl(featuredProducts[0].images?.[0] || featuredProducts[0].image)}
                    alt={featuredProducts[0].name}
                    className="w-full aspect-square object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/assets/images/fallback-image.webp'; }}
                    loading="lazy"
                  />
                </div>
                <div className="bg-white px-4 py-3 border-t border-black/5">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest">{featuredProducts[0].brand?.name}</p>
                  <p className="text-sm font-bold text-[#1e1e1e] mt-0.5 truncate">{featuredProducts[0].name}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#D1B23E]" />
                    <span className="text-[9px] text-[#D1B23E] font-semibold uppercase tracking-wider">Featured</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="flex gap-2 px-5 mb-8">
        {[
          { icon: ShieldCheck, text: 'Certified' },
          { icon: Award,       text: 'Authentic' },
          { icon: Clock,       text: 'Verified'  },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex-1 flex flex-col items-center gap-1.5 bg-[#171717] border border-white/5 rounded-2xl py-3"
          >
            <Icon size={16} className="text-[#D1B23E]" />
            <span className="text-[10px] text-gray-400 font-medium">{text}</span>
          </div>
        ))}
      </div>

      {/* ── Top Brands ── */}
      {(loading || topCategories.length > 0) && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4 px-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
              Top Brands
            </h2>
            <button
              onClick={() => router.push('/brands')}
              className="text-xs text-[#D1B23E] font-medium"
            >
              See All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-5 pb-1">
            {loading ? (
              <BrandSkeleton />
            ) : (
              topCategories.map((item) => (
                <button
                  key={item._id}
                  onClick={() => router.push(`/brands/${item.brand._id}`)}
                  className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                    <img
                      src={getImageUrl(item.brand.logo, 'brand')}
                      alt={item.brand.name}
                      className="w-full h-full object-contain p-1.5 mix-blend-multiply"
                      onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium max-w-[64px] truncate text-center">
                    {item.brand.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>
      )}

      <div className="mx-5 h-px bg-white/5 mb-8" />

      {/* ── Featured ── */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Featured
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product._id} className="w-[42vw] md:w-52 lg:w-64 shrink-0">
                <MobileProductCard
                  product={product}
                  onClick={() => router.push(`/product/${product._id}`)}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 px-1">No featured products yet.</p>
          )}
        </div>
      </section>

      {/* ── Your Saved Collection — shown when wishlist >= 4 items ── */}
      {!loading && wishlistProducts.length >= 4 && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4 px-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
              Your Saved Collection
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
            {wishlistProducts.map((product) => (
              <div key={product._id} className="w-[42vw] md:w-52 lg:w-64 shrink-0">
                <MobileProductCard
                  product={product}
                  onClick={() => router.push(`/product/${product._id}`)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Best Selling ── */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Best Selling
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : bestSellingProducts.length > 0 ? (
            bestSellingProducts.map((product) => (
              <div key={product._id} className="w-[42vw] md:w-52 lg:w-64 shrink-0">
                <MobileProductCard
                  product={product}
                  onClick={() => router.push(`/product/${product._id}`)}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 px-1">No best sellers yet.</p>
          )}
        </div>
      </section>

      <div className="mx-5 h-px bg-white/5 mb-8" />

      {/* ── New Arrivals ── */}
      <section className="px-5 lg:px-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            New Arrivals
          </h2>
          <button
            onClick={() => router.push('/new-arrivals')}
            className="text-xs text-[#D1B23E] font-medium"
          >
            See All
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSk key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allProducts.slice(0, 12).map((product) => (
              <MobileProductCard
                key={product._id}
                product={product}
                onClick={() => router.push(`/product/${product._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 pt-6 pb-4 border-t border-white/5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-700 font-semibold text-center">
          {storeName}
        </p>
        <p className="text-[10px] text-gray-800 text-center mt-1">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </footer>
    </MobileLayout>
  );
}
