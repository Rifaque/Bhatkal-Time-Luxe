'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Truck, RotateCcw, ShoppingCart, Eye, Share2, MessageCircle } from 'lucide-react';
import useProductPageLogic from '@/hooks/useProductPageLogic';
import DesktopNavbar from '@/components/DesktopNavbar';
import DesktopFooter from '@/components/DesktopFooter';
import QuickViewModal from '@/components/QuickViewModal';
import { Sk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import axios from 'axios';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';
import WishlistButton from '@/components/WishlistButton';
import WishlistSavedSection from '@/components/WishlistSavedSection';
import ShareModal from '@/components/ShareModal';
import Lightbox from '@/components/Lightbox';
import ProductBreadcrumb from '@/components/ProductBreadcrumb';

export default function DesktopProductView() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { addItem } = useRecentlyViewed();
  const {
    product,
    loading,
    error,
    notification,
    setNotification,
    buyNow,
    buyingNow,
    openRequestDetails,
    router,
  } = useProductPageLogic();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quickViewId, setQuickViewId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    addItem(product);
    fetch(`/api/products/related?productId=${product._id}`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setRelatedProducts(data.slice(0, 4)); })
      .catch((err) => console.error('Failed to fetch related products', err));
  }, [product, addItem]);

  const addToCart = async () => {
    if (!product || addingToCart || addedToCart) return;
    setAddingToCart(true);
    try {
      await axios.post('/api/cart', { product: product._id, quantity: 1 });
      setAddedToCart(true);
      window.dispatchEvent(new Event('cart-updated'));
      toast({ message: 'Watch added to your cart.', type: 'success' });
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (err) {
      console.error('Failed to add to cart', err);
      toast({ message: 'Failed to add to cart.', type: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col">
        <DesktopNavbar />
        <main className="mx-auto max-w-7xl px-6 py-12 md:py-16 w-full flex-1 space-y-20">
          {/* Breadcrumb placeholder — matches the loaded breadcrumb offset */}
          <Sk className="h-3.5 w-64 -mb-14" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 space-y-4">
              <Sk className="h-[500px] w-full !rounded-3xl" />
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <Sk key={i} className="w-20 h-20 !rounded-xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <Sk className="h-3 w-20" />
              <Sk className="h-10 w-3/4" />
              <Sk className="h-5 w-1/3" />
              <Sk className="h-28 w-full !rounded-2xl" />
              <div className="space-y-2 pt-2">
                {[80, 70, 60, 55].map((w, i) => (
                  <Sk key={i} className="h-3" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Sk className="h-14 !rounded-xl" />
                <Sk className="h-14 !rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <DesktopFooter />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col">
        <DesktopNavbar />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="text-center max-w-md">
            <p className="text-[#D1B23E] text-xs uppercase tracking-[0.3em] font-semibold mb-4">Unavailable</p>
            <h1 className="text-3xl font-serif font-bold text-white mb-3">Product Not Found</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              This timepiece is no longer available or may have been removed from our collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-5 py-2.5 bg-[#D1B23E] text-black text-sm font-semibold rounded-xl hover:bg-[#c1a22e] transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push('/brands')}
                className="px-5 py-2.5 border border-white/15 text-white text-sm font-medium rounded-xl hover:border-[#D1B23E]/40 transition-colors"
              >
                Browse Brands
              </button>
            </div>
          </div>
        </main>
        <DesktopFooter />
      </div>
    );
  }

  const imagesList = product.images?.length > 0 ? product.images : [product.image];

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col justify-between animate-fade-in">
      {/* Premium Header */}
      <DesktopNavbar />

      {/* Main product wrapper */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16 w-full flex-1 space-y-20">

        {/* Breadcrumb */}
        <ProductBreadcrumb brand={product.brand} productName={product.name} className="-mb-14" />

        {/* Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className="bg-white border border-white/10 rounded-3xl p-8 flex items-center justify-center h-[500px] overflow-hidden shadow-xl cursor-zoom-in relative"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                key={activeImageIdx}
                src={getImageUrl(imagesList[activeImageIdx])}
                alt={product.name}
                className="max-h-full max-w-full object-contain mx-auto animate-fade-in"
                style={activeImageIdx === 0 ? { viewTransitionName: `pimg-${product._id}` } : undefined}
                onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
              />
              {imagesList.length > 1 && (
                <span className="absolute bottom-4 right-4 text-[11px] text-gray-400 bg-black/8 px-2 py-0.5 rounded-full font-medium pointer-events-none">
                  {activeImageIdx + 1} / {imagesList.length}
                </span>
              )}
            </div>
            
            {/* Gallery Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-4">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 p-2 bg-white rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden ${
                      activeImageIdx === idx ? 'border-[#D1B23E]' : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt="Thumbnail"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Spec Sheet & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <button
                onClick={() => product.brand?._id && router.push(`/brands/${product.brand._id}`)}
                className="text-xs tracking-widest text-[#D1B23E] uppercase font-bold hover:text-[#c1a22e] transition-colors"
              >
                {product.brand?.name}
              </button>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight mt-1.5 leading-tight">
                {product.name}
              </h1>
              
            </div>

            {/* Pricing Panel */}
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-end gap-3.5">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(product.salePrice ?? product.priceKwd ?? 0)}
                </span>
                {(product.originalPrice ?? product.originalPriceKwd ?? 0) > (product.salePrice ?? product.priceKwd ?? 0) && (
                  <>
                    <span className="text-lg text-gray-500 line-through opacity-75">
                      {formatPrice(product.originalPrice ?? product.originalPriceKwd ?? 0)}
                    </span>
                    <span className="bg-[#D1B23E] text-black px-2.5 py-0.5 text-xs rounded font-bold uppercase tracking-wider">
                      {Math.round((((product.originalPrice ?? product.originalPriceKwd) - (product.salePrice ?? product.priceKwd)) / (product.originalPrice ?? product.originalPriceKwd)) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-bold text-gray-300">
                  {product.inStock ? 'In stock and ready to ship' : 'Temporarily unavailable'}
                </span>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Timepiece Specifications</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-white/5 pt-3">
                {product.color && (
                  <div className="py-1 flex justify-between border-b border-white/5"><span className="text-gray-500">Colorway</span> <span className="font-semibold text-white">{product.color}</span></div>
                )}
                <div className={`py-1 flex justify-between border-b border-white/5${!product.color ? ' col-span-2' : ''}`}>
                  <span className="text-gray-500">Brand</span>
                  <span className="font-semibold text-white">{product.brand?.name || '—'}</span>
                </div>
                {product.reference && (
                  <div className="py-1 flex justify-between border-b border-white/5">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-semibold text-white font-mono">{product.reference}</span>
                  </div>
                )}
                <div className={`py-1 flex justify-between border-b border-white/5${!product.reference ? ' col-span-2' : ''}`}>
                  <span className="text-gray-500">Secured Shipping</span>
                  <span className="font-semibold text-white">Complimentary</span>
                </div>
              </div>
            </div>

            {/* About / Narrative */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Watch Narrative</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-serif">
                {product.about || 'A masterpiece of horological engineering. Features pristine finish, structural resistance, and a reliable calibrated movement.'}
              </p>
            </div>

            {/* Actions Panel */}
            <div className="pt-6 space-y-4">
              {notification && <p className="text-sm text-red-400 text-center font-semibold">{notification}</p>}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={addToCart}
                  disabled={!product.inStock || addingToCart || addedToCart}
                  className={`w-full border font-semibold py-4 rounded-xl text-base transition-all duration-300 ${
                    addedToCart
                      ? '!bg-[#D1B23E]/10 border-[#D1B23E]/30 !text-[#D1B23E]'
                      : '!bg-white/5 border-white/10 hover:bg-white/10 !text-white'
                  }`}
                >
                  {addingToCart ? 'Adding...' : addedToCart ? '✓ Added' : 'Add to Cart'}
                </Button>
                <Button
                  onClick={buyNow}
                  disabled={!product.inStock || buyingNow}
                  className="w-full !bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold py-4 rounded-xl text-base transition-all disabled:opacity-60"
                >
                  {buyingNow ? 'Processing…' : 'Buy via WhatsApp'}
                </Button>
              </div>
              <p className="text-[11px] text-center text-gray-500 -mt-1">
                Our team responds within 2 hours · 9AM–9PM AST, 7 days
              </p>
              <p className="text-[10px] text-center text-gray-600">
                No-cost instalment plans available — ask via WhatsApp
              </p>
              <div className="flex items-center gap-3 pt-2">
                <WishlistButton productId={product._id} size={16} showLabel className="flex-1" />
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#D1B23E] border border-white/8 hover:border-[#D1B23E]/20 rounded-xl px-4 py-2.5 transition-all"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>
              <button
                onClick={openRequestDetails}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-[#25D366] border border-white/5 hover:border-[#25D366]/20 rounded-xl py-2.5 transition-all"
              >
                <MessageCircle size={13} />
                Request Details via WhatsApp
              </button>
            </div>

            {/* Detail Trust Section */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 text-center text-xs text-gray-400">
              <div className="flex flex-col items-center space-y-1"><ShieldCheck size={20} className="text-[#D1B23E]" /> <span className="font-semibold">Authenticated Timepiece</span></div>
              <div className="flex flex-col items-center space-y-1"><Truck size={20} className="text-[#D1B23E]" /> <span className="font-semibold">Secured Free Transit</span></div>
              <div className="flex flex-col items-center space-y-1"><RotateCcw size={20} className="text-[#D1B23E]" /> <span className="font-semibold">7-Day Returns</span></div>
            </div>

          </div>
        </div>

        {/* Related Products from this Brand */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-10 border-t border-white/5">
            <div className="text-left">
              <span className="text-xs uppercase tracking-widest text-[#D1B23E] font-bold block mb-1">More from the House</span>
              <h2 className="text-2xl font-serif font-bold">Related Timepieces</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <div
                  key={p._id}
                  className="relative group bg-[#171717] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {(p.originalPrice ?? p.originalPriceKwd ?? 0) > (p.salePrice ?? p.priceKwd ?? 0) && (
                    <span className="absolute top-4 left-4 z-10 bg-[#D1B23E] text-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      {Math.round((((p.originalPrice ?? p.originalPriceKwd) - (p.salePrice ?? p.priceKwd)) / (p.originalPrice ?? p.originalPriceKwd)) * 100)}% OFF
                    </span>
                  )}

                  <div 
                    onClick={() => router.push(`/product/${p._id}`)}
                    className="bg-white p-4 rounded-xl h-64 flex items-center justify-center overflow-hidden relative cursor-pointer"
                  >
                    <img
                      src={getImageUrl(p.images?.[0] || p.image)}
                      alt={p.name}
                      className="max-h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                    />
                    <div className={`absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto`}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewId(p._id);
                        }}
                        className="!bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold rounded-full px-5 py-2.5 flex items-center gap-1.5 shadow-lg text-xs"
                      >
                        <Eye size={14} /> Quick View
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div onClick={() => router.push(`/product/${p._id}`)} className="cursor-pointer">
                      <span className="text-[10px] uppercase tracking-widest text-[#D1B23E] font-bold">
                        {p.brand?.name}
                      </span>
                      <h3 className="text-base font-bold text-white truncate hover:text-[#D1B23E] transition-colors mt-0.5">
                        {p.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm font-bold text-white">
                        {formatPrice(p.salePrice ?? p.priceKwd ?? 0)}
                      </div>
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          axios.post('/api/cart', { product: p._id, quantity: 1 }).then(() => {
                            window.dispatchEvent(new Event('cart-updated'));
                            toast({ message: 'Watch added to your cart.', type: 'success' });
                          });
                        }}
                        disabled={!p.inStock}
                        className="font-semibold text-xs py-1.5 px-3 rounded-lg"
                      >
                        {p.inStock ? 'Add to Cart' : 'Enquire'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <RecentlyViewedRow
          excludeId={product._id}
          className="pt-10 border-t border-white/5"
        />

        <WishlistSavedSection
          title="Saved Timepieces"
          excludeId={product._id}
          className="pt-10 border-t border-white/5"
        />

      </main>

      {/* Premium Footer */}
      <DesktopFooter />

      {/* Share modal */}
      {showShareModal && product && (
        <ShareModal product={product} onClose={() => setShowShareModal(false)} />
      )}

      {/* Lightbox */}
      {lightboxOpen && imagesList.length > 0 && (
        <Lightbox
          images={imagesList}
          currentIndex={activeImageIdx}
          onChange={setActiveImageIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Related Products Quick View Overlay */}
      {quickViewId && (
        <QuickViewModal 
          productId={quickViewId} 
          onClose={() => setQuickViewId(null)} 
        />
      )}
    </div>
  );
}
