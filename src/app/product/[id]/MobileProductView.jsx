'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import useProductPageLogic from '@/hooks/useProductPageLogic';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ArrowLeft, ShieldCheck, Truck, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { FaWhatsapp } from 'react-icons/fa';
import MobileProductCard from '@/components/MobileProductCard';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';
import WishlistButton from '@/components/WishlistButton';

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
    currentImage,
    setCurrentImage,
    swipeHandlers,
    buyNow,
    router,
  } = useProductPageLogic();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { addItem } = useRecentlyViewed();

  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (!product) return;
    addItem(product);
    if (!product.brand?._id) return;
    fetch(`/api/products/brand/${product.brand._id}`)
      .then((r) => r.json())
      .then((data) => setRelatedProducts(data.filter((p) => p._id !== product._id).slice(0, 6)))
      .catch((err) => console.error('Failed to fetch related products', err));
  }, [product, addItem]);

  const addToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    try {
      await axios.post('/api/cart', { product: product._id, quantity: 1 });
      window.dispatchEvent(new Event('cart-updated'));
      toast({ message: 'Added to your cart.', type: 'success' });
    } catch {
      toast({ message: 'Could not add to cart. Try again.', type: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

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

      {/* ── Image gallery ── */}
      <div className="relative bg-[#f0eeea]">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-[#1e1e1e]" />
        </button>

        {/* Wishlist + discount badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
          <WishlistButton
            productId={product._id}
            size={18}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
          />
          {hasDiscount && (
            <span className="bg-[#D1B23E] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>

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

        {/* Carousel dots */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                aria-label={`Image ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  currentImage === i ? 'w-4 h-1.5 bg-[#D1B23E]' : 'w-1.5 h-1.5 bg-black/25'
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
      <div className="flex-1 px-5 pt-5 pb-36">
        <h1 className="text-xl font-bold text-white leading-snug">{product.name}</h1>

        {/* Price + stock */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#D1B23E]">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(product.MRP)}</span>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              product.inStock ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Brand + Colorway specs */}
        {(product.brand?.name || product.color) && (
          <div className={`grid gap-2 mt-4 ${product.brand?.name && product.color ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {product.brand?.name && (
              <div className="bg-[#171717] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">Brand</p>
                <p className="text-sm font-semibold text-white truncate">{product.brand.name}</p>
              </div>
            )}
            {product.color && (
              <div className="bg-[#171717] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">Colorway</p>
                <p className="text-sm font-semibold text-white truncate">{product.color}</p>
              </div>
            )}
          </div>
        )}

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

        {/* Related watches */}
        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              More from {product.brand?.name}
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
              {relatedProducts.map((p) => (
                <div key={p._id} className="w-[42vw] shrink-0">
                  <MobileProductCard
                    product={p}
                    onClick={() => router.push(`/product/${p._id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        <RecentlyViewedRow excludeId={product._id} className="mt-8" />
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#1e1e1e]/95 backdrop-blur-xl border-t border-white/8 px-5 py-4">
        <div className="flex gap-3">
          <button
            onClick={addToCart}
            disabled={!product.inStock || addingToCart}
            className="flex-1 bg-[#D1B23E] text-black font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all hover:bg-[#c1a22e]"
          >
            <ShoppingCart size={16} />
            {addingToCart ? 'Adding…' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          {product.inStock && (
            <button
              onClick={buyNow}
              className="shrink-0 bg-[#171717] border border-white/10 text-white font-medium py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center active:scale-[0.98] transition-all hover:border-[#D1B23E]/30"
              aria-label="Buy via WhatsApp"
            >
              <FaWhatsapp size={20} style={{ color: '#25D366' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
