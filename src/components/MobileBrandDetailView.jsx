'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import MobileProductCard from '@/components/MobileProductCard';
import { getImageUrl } from '@/lib/image';
import { Sk, ProductCardSk } from '@/components/ui/skeleton';

function ProductSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <ProductCardSk key={i} />
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
          <Sk className="w-14 h-14 !rounded-2xl shrink-0" />
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
            <Sk className="h-6 w-32" />
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
