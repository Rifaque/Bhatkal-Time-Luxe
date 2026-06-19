'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import MobileProductCard from '@/components/MobileProductCard';
import { getImageUrl } from '@/lib/image';

function ProductSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
          <div className="bg-[#222]" style={{ aspectRatio: '1/1' }} />
          <div className="px-3 py-2.5 space-y-1.5">
            <div className="h-2.5 bg-[#222] rounded w-3/4" />
            <div className="h-3 bg-[#222] rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function MobileBrandDetailView() {
  const params = useParams();
  const brandId = params?.id;
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!brandId) return;
    Promise.all([
      fetch(`/api/brands/${brandId}`).then((r) => r.json()),
      fetch(`/api/products/brand/${brandId}`).then((r) => r.json()),
    ])
      .then(([brandData, productsData]) => {
        setBrand(brandData);
        setProducts(productsData);
      })
      .catch((err) => console.error('Failed to fetch brand detail', err))
      .finally(() => setLoading(false));
  }, [brandId]);

  return (
    <MobileLayout>
      {/* Brand header */}
      <div className="px-5 pt-6 pb-6 border-b border-white/5 flex items-center gap-4">
        {loading ? (
          <div className="w-14 h-14 rounded-2xl bg-[#252525] animate-pulse shrink-0" />
        ) : brand?.logo ? (
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img
              src={getImageUrl(brand.logo, 'brand')}
              alt={brand.name}
              className="w-full h-full object-contain p-1.5 mix-blend-multiply"
              onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
            />
          </div>
        ) : null}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-0.5">
            Collection
          </p>
          {loading ? (
            <div className="h-6 w-32 bg-[#252525] animate-pulse rounded" />
          ) : (
            <h1 className="text-2xl font-serif font-bold text-white">{brand?.name}</h1>
          )}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pt-5 pb-6">
          <ProductSkeleton />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 px-8">
          <p className="text-white font-semibold mb-2">No products yet</p>
          <p className="text-sm text-gray-600">Check back soon for new arrivals.</p>
        </div>
      ) : (
        <>
          <p className="px-5 pt-4 pb-2 text-xs text-gray-600">
            {products.length} {products.length === 1 ? 'timepiece' : 'timepieces'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pb-6">
            {products.map((product) => (
              <MobileProductCard
                key={product._id}
                product={product}
                onClick={() => router.push(`/product/${product._id}`)}
              />
            ))}
          </div>
        </>
      )}
    </MobileLayout>
  );
}
