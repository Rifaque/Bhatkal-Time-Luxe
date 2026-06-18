'use client';

import useProductPageLogic from '@/hooks/useProductPageLogic';
import { useCurrency } from '@/context/CurrencyContext';
import { ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { FaWhatsapp } from 'react-icons/fa';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col">
      <div className="relative bg-[#f0eeea] animate-pulse" style={{ height: '55vw' }} />
      <div className="px-5 pt-5 space-y-3">
        <div className="h-6 bg-[#252525] animate-pulse rounded w-3/4" />
        <div className="h-4 bg-[#252525] animate-pulse rounded w-1/3" />
        <div className="h-3 bg-[#252525] animate-pulse rounded w-full mt-4" />
        <div className="h-3 bg-[#252525] animate-pulse rounded w-5/6" />
        <div className="h-3 bg-[#252525] animate-pulse rounded w-4/5" />
      </div>
    </div>
  );
}

export default function MobileProductView() {
  const {
    product,
    loading,
    error,
    notification,
    currentImage,
    setCurrentImage,
    swipeHandlers,
    buyNow,
    router,
  } = useProductPageLogic();
  const { formatPrice } = useCurrency();

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <p className="text-red-400 text-center px-8">{error}</p>
      </div>
    );
  }

  const hasDiscount = product.MRP && product.price && product.MRP > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.MRP - product.price) / product.MRP) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      {/* In-app toast notification */}
      {notification && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#D1B23E] text-black text-center py-2.5 text-sm font-semibold animate-fade-in">
          {notification}
        </div>
      )}

      {/* ── Image gallery ── */}
      <div className="relative bg-[#f0eeea]">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-[#1e1e1e]" />
        </button>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-4 right-4 z-10 bg-[#D1B23E] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}

        {/* Main image — swipeable */}
        <div
          {...swipeHandlers}
          className="flex items-center justify-center"
          style={{ minHeight: '55vw', maxHeight: '70vw' }}
        >
          <img
            src={getImageUrl(product.images?.[currentImage] || product.image)}
            alt={product.name}
            className="w-full object-contain"
            style={{ maxHeight: '70vw', padding: '1.25rem' }}
            onError={(e) => (e.currentTarget.src = '/assets/images/fallback-image.webp')}
          />
        </div>

        {/* Carousel dot indicators */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                aria-label={`Image ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  currentImage === i
                    ? 'w-4 h-1.5 bg-[#D1B23E]'
                    : 'w-1.5 h-1.5 bg-black/25'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {product.images?.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-[#1e1e1e] border-b border-white/5">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              aria-label={`View image ${i + 1}`}
              className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                currentImage === i
                  ? 'border-[#D1B23E] shadow-[0_0_0_1px_rgba(209,178,62,0.3)]'
                  : 'border-transparent'
              }`}
            >
              <img
                src={getImageUrl(img)}
                alt=""
                className="w-full h-full object-contain bg-[#f0eeea] p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Product details ── */}
      <div className="flex-1 px-5 pt-5 pb-32">
        <h1 className="text-xl font-bold text-white leading-snug">{product.name}</h1>

        {/* Price row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#D1B23E]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.MRP)}
              </span>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              product.inStock
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-5" />

        {/* About */}
        {product.about && (
          <>
            <h2 className="text-sm font-semibold text-white mb-2">About</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{product.about}</p>
          </>
        )}

        {/* Trust signals */}
        <div className="mt-6 bg-[#171717] border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <ShieldCheck size={14} className="text-[#D1B23E] shrink-0" />
            <span>Certified authenticity on every timepiece</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Truck size={14} className="text-[#D1B23E] shrink-0" />
            <span>Complimentary fully insured shipping</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <FaWhatsapp size={14} style={{ color: '#D1B23E' }} className="shrink-0" />
            <span>WhatsApp concierge support available</span>
          </div>
        </div>
      </div>

      {/* ── Sticky Buy Button ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#1e1e1e]/95 backdrop-blur-xl border-t border-white/8 px-5 py-4">
        <button
          onClick={buyNow}
          disabled={!product.inStock}
          className="w-full bg-[#D1B23E] text-black font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all hover:bg-[#c1a22e]"
        >
          <FaWhatsapp size={16} />
          {product.inStock ? 'Buy Now via WhatsApp' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
