'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getImageUrl } from '@/lib/image';
import WishlistButton from '@/components/WishlistButton';

export default function RecentlyViewedRow({ excludeId, className = '' }) {
  const { items, pruneItems } = useRecentlyViewed();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  // null = not yet verified (snapshot shown while pending); [...] = verified live products
  const [liveProducts, setLiveProducts] = useState(null);
  const verifiedKey = useRef('');
  const fetchingRef = useRef(false);

  const idsKey = items.map((p) => p._id).join(',');

  useEffect(() => {
    const allIds = items.map((p) => p._id);

    if (allIds.length === 0) {
      verifiedKey.current = '';
      setLiveProducts([]);
      return;
    }

    // Skip if already verified for this exact ID set, or a fetch is in flight
    if (idsKey === verifiedKey.current || fetchingRef.current) return;
    fetchingRef.current = true;

    fetch('/api/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: allIds }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          // Server error — leave snapshot visible; don't commit key so we can retry
          return;
        }
        // Only commit key on a successful verification so failures allow future retries
        verifiedKey.current = idsKey;
        pruneItems(data.map((p) => String(p._id)));
        // Store ALL live products; excludeId filtering happens at render time
        const byId = new Map(data.map((p) => [String(p._id), p]));
        setLiveProducts(allIds.filter((id) => byId.has(id)).map((id) => byId.get(id)));
      })
      .catch(() => {
        // Network failure — leave snapshot visible; allow retry on next render
      })
      .finally(() => {
        fetchingRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // While verification is pending, render from snapshot; after verification, use live results.
  // excludeId filtering happens here so navigating between recently-viewed products
  // re-evaluates without triggering a new API call.
  const excludeStr = excludeId ? String(excludeId) : null;
  const displayProducts = (liveProducts !== null ? liveProducts : items)
    .filter((p) => String(p._id) !== excludeStr);

  if (displayProducts.length === 0) return null;

  return (
    <section className={`animate-fade-in ${className}`}>
      <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
        Recently Viewed
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {displayProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => router.push(`/product/${product._id}`)}
            className="shrink-0 w-36 cursor-pointer"
          >
            <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D1B23E]/20 transition-all active:scale-[0.97]">
              <div className="relative bg-[#f0eeea]" style={{ aspectRatio: '1/1' }}>
                <img
                  src={getImageUrl(product.images?.[0] || product.image)}
                  alt={product.name}
                  className="w-full h-full object-contain p-2.5"
                  onError={(e) => { e.target.src = '/assets/images/fallback-image.webp'; }}
                  loading="lazy"
                />
                <div className="absolute top-1.5 right-1.5">
                  <WishlistButton
                    productId={String(product._id)}
                    size={13}
                    className="bg-black/25 backdrop-blur-sm p-1 rounded-full"
                  />
                </div>
              </div>
              <div className="px-2.5 py-2">
                <p className="text-[10px] text-white/80 font-medium truncate leading-tight">{product.name}</p>
                {product.reference && (
                  <p className="text-[9px] text-gray-600 font-mono truncate">{product.reference}</p>
                )}
                <span className="text-xs font-bold text-[#D1B23E]">
                  {formatPrice(product.salePrice ?? product.priceKwd ?? 0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
