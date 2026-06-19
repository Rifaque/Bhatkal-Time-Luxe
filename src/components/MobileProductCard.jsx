'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { getImageUrl } from '@/lib/image';
import WishlistButton from '@/components/WishlistButton';

export default function MobileProductCard({ product, onClick }) {
  const { formatPrice } = useCurrency();
  const hasDiscount = (product.originalPrice ?? product.originalPriceKwd ?? 0) > (product.salePrice ?? product.priceKwd ?? 0);
  const salePrice = product.salePrice ?? product.priceKwd ?? 0;
  const origPrice = product.originalPrice ?? product.originalPriceKwd ?? 0;
  const discountPct = hasDiscount ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group select-none"
    >
      <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.97] hover:border-[#D1B23E]/20">
        {/* Light image panel — watches read better on cream */}
        <div className="relative bg-[#f0eeea] rounded-t-2xl overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
          {hasDiscount && (
            <span className="absolute top-2 left-2 z-10 bg-[#D1B23E] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              -{discountPct}%
            </span>
          )}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton
              productId={product._id}
              size={13}
              className="bg-black/25 backdrop-blur-sm p-1 rounded-full"
            />
          </div>
          <img
            src={getImageUrl(product.images?.[0] || product.image)}
            alt={product.name}
            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = '/assets/images/fallback-image.webp'; }}
            loading="lazy"
          />
        </div>
        {/* Dark info panel */}
        <div className="px-3 py-2.5">
          <p className="text-[11px] text-white/90 font-medium truncate leading-tight">{product.name}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-sm font-bold text-[#D1B23E]">{formatPrice(salePrice)}</span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-600 line-through">{formatPrice(origPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
