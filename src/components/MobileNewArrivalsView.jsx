'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import MobileProductCard from '@/components/MobileProductCard';
import { ProductCardSk } from '@/components/ui/skeleton';

function GridSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <ProductCardSk key={i} />
      ))}
    </>
  );
}

export default function MobileNewArrivalsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products/new-arrivals')
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Failed to fetch new arrivals', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MobileLayout>
      {/* Page heading */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-1">
          Just Landed
        </p>
        <h1 className="text-2xl font-serif font-bold text-white">New Arrivals</h1>
      </div>

      {/* Grid */}
      <div className="px-4 pt-5 pb-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <GridSkeleton />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-8">
            <p className="text-white font-semibold mb-2">Nothing new yet</p>
            <p className="text-sm text-gray-600">Check back soon — new pieces land regularly.</p>
          </div>
        ) : (
          <>
            <p className="pb-3 text-xs text-gray-600">
              {products.length} {products.length === 1 ? 'timepiece' : 'timepieces'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
      </div>
    </MobileLayout>
  );
}
