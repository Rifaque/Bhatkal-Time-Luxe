'use client';

import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getImageUrl } from '@/lib/image';
import WishlistButton from '@/components/WishlistButton';

export default function RecentlyViewedRow({ excludeId, className = '' }) {
  const { items } = useRecentlyViewed();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const visible = items.filter((p) => p._id !== excludeId);
  if (visible.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
        Recently Viewed
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {visible.map((product) => (
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
                    productId={product._id}
                    size={13}
                    className="bg-black/25 backdrop-blur-sm p-1 rounded-full"
                  />
                </div>
              </div>
              <div className="px-2.5 py-2">
                <p className="text-[10px] text-white/80 font-medium truncate leading-tight">{product.name}</p>
                <span className="text-xs font-bold text-[#D1B23E]">{formatPrice(product.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
