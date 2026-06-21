'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useProductPageLogic from '@/hooks/useProductPageLogic';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useIsVisible } from '@/hooks/useIsVisible';
import { ShieldCheck, Truck, ShoppingCart, Share2 } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { FaWhatsapp } from 'react-icons/fa';
import MobileProductCard from '@/components/MobileProductCard';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';
import WishlistButton from '@/components/WishlistButton';
import WishlistSavedSection from '@/components/WishlistSavedSection';
import ShareModal from '@/components/ShareModal';
import Lightbox from '@/components/Lightbox';
import ProductBreadcrumb from '@/components/ProductBreadcrumb';
import { Sk } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col md:flex-row md:items-start">
      {/* Gallery stage — cream panel matching the loaded gallery background */}
      <div
        className="bg-[#f0eeea] flex items-center justify-center md:w-[45%] md:h-screen"
        style={{ height: '55vw' }}
      >
        <Sk className="w-40 h-56 !rounded-2xl" />
      </div>
      <div className="flex-1 px-5 pt-5 md:px-8 md:pt-6 space-y-3">
        <Sk className="h-6 w-3/4" />
        <Sk className="h-7 w-1/3 mt-1" />
        <div className="space-y-2.5 pt-3">
          <Sk className="h-3 w-full" />
          <Sk className="h-3 w-5/6" />
          <Sk className="h-3 w-4/5" />
        </div>
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
    buyingNow,
    openRequestDetails,
    router,
  } = useProductPageLogic();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { addItem } = useRecentlyViewed();

  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Scroll-triggered sticky CTA.
  // threshold:0 — sticky appears only after the entire primary CTA section
  //   has fully left the viewport (not at 10% gone, which was the old bug).
  // initialValue:true — inline CTAs are visible on mount; prevents a
  //   single-frame flash of the sticky bar before the observer fires.
  const inlineCTARef = useRef(null);
  const inlineCTAVisible = useIsVisible(inlineCTARef, { threshold: 0, initialValue: true });

  // Surface buyNow failures (set by useProductPageLogic) via the mobile toast system
  useEffect(() => {
    if (notification) toast({ message: notification, type: 'error' });
  }, [notification]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!product) return;
    addItem(product);
    fetch(`/api/products/related?productId=${product._id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRelatedProducts(data.slice(0, 6)); })
      .catch(() => {});
  }, [product, addItem]);

  const handleShare = async () => {
    const url = window.location.href;
    const refLabel = product.reference ? ` (${product.reference})` : '';
    const shareData = {
      title: product.name,
      text: `${product.name}${refLabel}${product.brand?.name ? ` by ${product.brand.name}` : ''} — a premium timepiece from Bhatkal Time Luxe`,
      url,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    setShowShareModal(true);
  };

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
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <p className="text-[#D1B23E] text-xs uppercase tracking-[0.3em] font-semibold mb-3">Unavailable</p>
          <h1 className="text-2xl font-serif font-bold text-white mb-3">Product Not Found</h1>
          <p className="text-gray-400 text-sm mb-7 leading-relaxed">
            This timepiece is no longer available or may have been removed from our collection.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-[#D1B23E] text-black text-sm font-semibold rounded-xl hover:bg-[#c1a22e] transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push('/brands')}
              className="w-full py-3 border border-white/15 text-white text-sm font-medium rounded-xl hover:border-[#D1B23E]/40 transition-colors"
            >
              Browse Brands
            </button>
          </div>
        </div>
      </div>
    );
  }

  const salePrice = product.salePrice ?? product.priceKwd ?? 0;
  const origPrice = product.originalPrice ?? product.originalPriceKwd ?? 0;
  const hasDiscount = origPrice > salePrice;
  const discountPct = hasDiscount ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;
  const inStock = product.inStock;
  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col md:flex-row md:items-start animate-fade-in">

      {/* ── Gallery block ── */}
      <div className="md:w-[45%] md:sticky md:top-0 md:h-screen md:flex md:flex-col md:overflow-hidden">
        <div className="relative bg-[#f0eeea] md:flex-1 md:flex md:flex-col">

          {/* Discount badge */}
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

          {/* Main image — swipeable + tap to lightbox */}
          <div
            {...swipeHandlers}
            onClick={() => images.length > 0 && setLightboxOpen(true)}
            className="flex items-center justify-center min-h-[55vw] max-h-[70vw] md:flex-1 md:min-h-0 md:max-h-none cursor-zoom-in"
          >
            <img
              key={currentImage}
              src={getImageUrl(images[currentImage] || product.image)}
              alt={product.name}
              className="w-full object-contain p-5 max-h-[70vw] md:max-h-full animate-fade-in"
              style={currentImage === 0 ? { viewTransitionName: `pimg-${product._id}` } : undefined}
              onError={(e) => (e.currentTarget.src = '/assets/images/fallback-image.webp')}
            />
          </div>

          {/* Image count pill */}
          {images.length > 1 && (
            <span className="absolute bottom-10 right-3 text-[10px] text-white/60 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full pointer-events-none">
              {currentImage + 1} / {images.length}
            </span>
          )}

          {/* Carousel dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
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
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-[#1e1e1e] border-b border-white/5 md:bg-[#f0eeea] md:border-t md:border-black/8 md:border-b-0">
            {images.map((img, i) => (
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
      </div>

      {/* ── Product details ── */}
      <div className="flex-1 px-5 pt-5 pb-36 md:pb-8 md:px-8 md:pt-6 md:h-screen md:overflow-y-auto md:overscroll-contain">

        {/* Breadcrumb */}
        <ProductBreadcrumb brand={product.brand} productName={product.name} className="mb-3" />

        <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">{product.name}</h1>

        {/* Price + stock */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#D1B23E]">{formatPrice(salePrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(origPrice)}</span>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              inStock ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Specifications: Reference + Brand + Colorway */}
        {(product.reference || product.brand?.name || product.color) && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {product.brand?.name && (
              <button
                onClick={() => router.push(`/brands/${product.brand._id}`)}
                className="bg-[#171717] border border-white/5 hover:border-[#D1B23E]/20 rounded-xl p-3 text-left transition-colors"
              >
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">Brand</p>
                <p className="text-sm font-semibold text-white truncate">{product.brand.name}</p>
              </button>
            )}
            {product.color && (
              <div className="bg-[#171717] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">Colorway</p>
                <p className="text-sm font-semibold text-white truncate">{product.color}</p>
              </div>
            )}
            {product.reference && (
              <div className="bg-[#171717] border border-white/5 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">Reference</p>
                <p className="text-sm font-semibold text-white font-mono truncate">{product.reference}</p>
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
            <span>Authenticated timepiece — certificate included</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Truck size={14} className="text-[#D1B23E] shrink-0" />
            <span>Complimentary fully insured shipping</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <FaWhatsapp size={14} style={{ color: '#D1B23E' }} className="shrink-0" />
            <span>7-day returns · No-cost instalments available</span>
          </div>
        </div>

        {/* ── Primary CTA section ──
            The ref wraps ALL purchase actions so the sticky bar only appears
            after every one of them has fully scrolled off-screen.         */}
        <div ref={inlineCTARef} className="mt-6">

          {/* Row 1 — primary purchase actions */}
          <div className="flex gap-3">
            <button
              onClick={addToCart}
              disabled={!inStock || addingToCart}
              className="flex-1 bg-[#D1B23E] text-black font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all hover:bg-[#c1a22e]"
            >
              <ShoppingCart size={16} />
              {addingToCart ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {inStock && (
              <button
                onClick={buyNow}
                disabled={buyingNow}
                className="flex-1 bg-[#171717] border border-white/10 text-white font-medium py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:border-[#D1B23E]/30 disabled:opacity-50"
              >
                <FaWhatsapp size={16} style={{ color: '#25D366' }} />
                Buy via WhatsApp
              </button>
            )}
          </div>

          <p className="text-[10px] text-center text-gray-600 mt-2">
            Responds within 2 hours · 9AM–9PM AST, 7 days
          </p>

          {/* Row 2 — secondary actions */}
          <div className="flex gap-2 mt-3">
            <WishlistButton
              productId={product._id}
              size={15}
              showLabel
              className="flex-1 justify-center bg-[#171717] border border-white/8 rounded-2xl py-3"
            />
            <button
              onClick={handleShare}
              aria-label="Share this product"
              className="flex items-center gap-1.5 bg-[#171717] border border-white/8 rounded-2xl px-4 py-3 text-gray-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
            >
              <Share2 size={15} />
              <span className="text-xs font-medium">Share</span>
            </button>
          </div>

          {/* Row 3 — enquiry action */}
          <button
            onClick={openRequestDetails}
            className="w-full mt-2 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-[#25D366] border border-white/5 hover:border-[#25D366]/20 rounded-2xl py-3 transition-all"
          >
            <FaWhatsapp size={14} style={{ color: '#25D366' }} />
            Request Details via WhatsApp
          </button>

        </div>

        {/* Related watches */}
        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Related Timepieces
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {relatedProducts.map((p) => (
                <MobileProductCard
                  key={p._id}
                  product={p}
                  onClick={() => router.push(`/product/${p._id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        <RecentlyViewedRow excludeId={product._id} className="mt-8" />

        {/* Saved timepieces from wishlist */}
        <WishlistSavedSection
          title="Saved Timepieces"
          excludeId={product._id}
          className="mt-8"
        />
      </div>

      {/* Share modal */}
      {showShareModal && product && (
        <ShareModal product={product} onClose={() => setShowShareModal(false)} />
      )}

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          currentIndex={currentImage}
          onChange={setCurrentImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ── Sticky CTA — mobile only, hidden at md: (tablet uses two-column layout) ──
          Slides in only after the entire primary CTA section has left the viewport.
          Safe-area inset ensures the bar clears iOS home indicator and Android
          gesture navigation bar on all devices.                                   */}
      <div
        aria-hidden={inlineCTAVisible || undefined}
        {...(inlineCTAVisible ? { inert: '' } : {})}
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        className={`fixed bottom-0 left-0 right-0 z-30 bg-[#1e1e1e]/95 backdrop-blur-xl border-t border-white/8 px-5 pt-4 md:hidden transition-transform duration-300 ${
          inlineCTAVisible ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex gap-3">
          <button
            onClick={addToCart}
            disabled={!inStock || addingToCart}
            className="flex-1 bg-[#D1B23E] text-black font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all hover:bg-[#c1a22e]"
          >
            <ShoppingCart size={16} />
            {addingToCart ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          {inStock && (
            <button
              onClick={buyNow}
              disabled={buyingNow}
              className="flex-1 bg-[#171717] border border-white/10 text-white font-medium py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:border-[#D1B23E]/30 disabled:opacity-50"
            >
              <FaWhatsapp size={16} style={{ color: '#25D366' }} />
              Buy via WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
