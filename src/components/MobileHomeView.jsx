'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import MobileProductCard from '@/components/MobileProductCard';
import { getImageUrl } from '@/lib/image';

function CardSkeleton() {
  return (
    <div className="w-[42vw] shrink-0">
      <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden">
        <div className="bg-[#222] animate-pulse" style={{ aspectRatio: '1/1' }} />
        <div className="px-3 py-2.5 space-y-1.5">
          <div className="h-2.5 bg-[#222] animate-pulse rounded w-3/4" />
          <div className="h-3 bg-[#222] animate-pulse rounded w-1/2" />
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
          <div className="w-16 h-16 rounded-2xl bg-[#222] animate-pulse" />
          <div className="h-2 w-12 bg-[#222] animate-pulse rounded" />
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

  useEffect(() => {
    Promise.all([
      fetch('/api/top-brands').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/featured').then((r) => r.json()),
      fetch('/api/best-selling').then((r) => r.json()),
    ])
      .then(([topCatData, productsData, featuredData, bestSellingData]) => {
        setTopCategories(topCatData);
        setAllProducts(productsData);
        setFeatured(featuredData);
        setBestSelling(bestSellingData);
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

  return (
    <MobileLayout>
      {/* ── Hero ── */}
      <section className="relative px-5 pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D1B23E]/6 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-3">
            Premium Timepieces
          </p>
          <h1 className="text-3xl font-serif font-bold leading-tight text-white mb-3">
            Discover Luxury<br />Watch Collection
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-[280px]">
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
              <div key={product._id} className="w-[42vw] shrink-0">
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
              <div key={product._id} className="w-[42vw] shrink-0">
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
      <section className="px-5 mb-8">
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
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden">
                <div className="bg-[#222] animate-pulse" style={{ aspectRatio: '1/1' }} />
                <div className="px-3 py-2.5 space-y-1.5">
                  <div className="h-2.5 bg-[#222] animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-[#222] animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
          Bhatkal Time Luxe
        </p>
        <p className="text-[10px] text-gray-800 text-center mt-1">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </footer>
    </MobileLayout>
  );
}
