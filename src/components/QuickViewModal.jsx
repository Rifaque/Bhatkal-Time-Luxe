'use client';

import React, { useState, useEffect } from 'react';
import { X, Share2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModalContentSk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/context/CurrencyContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import WishlistButton from '@/components/WishlistButton';
import ShareModal from '@/components/ShareModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFocusRestoration } from '@/hooks/useFocusRestoration';

export default function QuickViewModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const { formatPrice, currency } = useCurrency();
  const router = useRouter();

  const isOpen = !!productId;
  useFocusRestoration(isOpen);
  const dialogRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setActiveImg(0);
    setShowShare(false);
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
      })
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));

    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [productId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') { if (showShare) setShowShare(false); else onClose(); }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showShare, onClose]);

  const addToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    setAddedMessage('');
    try {
      await axios.post('/api/cart', { product: product._id, quantity: 1 });
      setAddedMessage('Added to cart!');
      window.dispatchEvent(new Event('cart-updated'));
      setTimeout(() => setAddedMessage(''), 3000);
    } catch {
      setAddedMessage('Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!product) return;
    try {
      const res = await axios.post(`/api/product/${product._id}/checkout`, { currency });
      if (res.data.whatsappUrl) window.open(res.data.whatsappUrl, '_blank');
      if (res.data.orderId) router.push(`/order-confirmation?orderId=${res.data.orderId}&total=${res.data.total}`);
    } catch {
      // silent
    }
  };

  const goToProduct = () => {
    onClose();
    router.push(`/product/${product._id}`);
  };

  const goToBrand = () => {
    if (!product?.brand?._id) return;
    onClose();
    router.push(`/brands/${product.brand._id}`);
  };

  if (!productId) return null;

  const images = product?.images?.length > 0 ? product.images : (product?.image ? [product.image] : []);
  const total = images.length;
  const salePrice = product?.salePrice ?? product?.priceKwd ?? 0;
  const origPrice = product?.originalPrice ?? product?.originalPriceKwd ?? 0;
  const hasDiscount = origPrice > salePrice;
  const discountPct = hasDiscount ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          className="relative w-full max-w-4xl bg-[#171717] text-white rounded-2xl border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-4 top-4 z-20 p-2 bg-black/30 border border-white/[0.08] hover:bg-black/60 hover:border-white/15 rounded-full text-gray-500 hover:text-white transition-all duration-200"
          >
            <X size={18} />
          </button>

          {loading ? (
            <ModalContentSk />
          ) : product ? (
            <>
              {/* Left: Image Gallery */}
              <div className="md:w-1/2 bg-white flex flex-col min-h-[260px] md:min-h-[450px]">
                {/* Main image */}
                <div className="relative flex-1 flex items-center justify-center p-6">
                  {total > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImg((p) => (p - 1 + total) % total)}
                        className="absolute left-2 text-gray-500 hover:text-gray-800 p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                        aria-label="Previous"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => setActiveImg((p) => (p + 1) % total)}
                        className="absolute right-2 text-gray-500 hover:text-gray-800 p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                        aria-label="Next"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                  <img
                    src={getImageUrl(images[activeImg], 'product', 'tablet')}
                    alt={product.name}
                    className="max-h-[300px] max-w-full object-contain mx-auto rounded-lg cursor-pointer"
                    sizes="(max-width: 768px) 90vw, 480px"
                    onClick={goToProduct}
                    onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                  />
                  {/* Image counter */}
                  {total > 1 && (
                    <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-black/10 px-1.5 py-0.5 rounded-full font-medium">
                      {activeImg + 1} / {total}
                    </span>
                  )}
                </div>

                {/* Thumbnail strip */}
                {total > 1 && (
                  <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImg === i ? 'border-[#D1B23E]' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={getImageUrl(img, 'product', 'thumb')}
                          alt=""
                          className="w-full h-full object-contain p-1"
                          sizes="88px"
                          onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Details */}
              <div className="md:w-1/2 p-7 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-3.5">
                  {/* Brand */}
                  <button
                    onClick={goToBrand}
                    className="text-xs tracking-widest text-[#D1B23E] uppercase font-bold hover:text-[#c1a22e] transition-colors"
                  >
                    {product.brand?.name}
                  </button>

                  <h2 id="quick-view-title" className="text-xl font-serif font-bold leading-tight">{product.name}</h2>

                  {/* Reference below title */}
                  {product.reference && (
                    <p className="text-xs text-gray-500 font-mono -mt-1">Ref. {product.reference}</p>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{formatPrice(salePrice)}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-sm text-gray-400 line-through opacity-70">
                          {formatPrice(origPrice)}
                        </span>
                        <span className="bg-[#D1B23E] text-black px-2 py-0.5 text-xs rounded font-bold">
                          -{discountPct}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-sm font-semibold">
                    <span className={product.inStock ? 'text-green-400' : 'text-red-400'}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* About */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Overview</h4>
                    <p className="text-xs text-gray-300 leading-relaxed max-h-28 overflow-y-auto pr-1">
                      {product.about || 'A luxurious timepiece built with premium design and structural excellence.'}
                    </p>
                  </div>

                  {/* Wishlist + Share */}
                  <div className="flex gap-2 pt-1">
                    <WishlistButton
                      productId={product._id}
                      size={14}
                      showLabel
                      className="flex-1 justify-center bg-white/5 border border-white/8 rounded-xl py-2 text-xs hover:bg-white/10 transition-colors"
                    />
                    <button
                      onClick={() => setShowShare(true)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#D1B23E] border border-white/8 hover:border-[#D1B23E]/20 rounded-xl px-3 py-2 transition-all"
                    >
                      <Share2 size={13} />
                      Share
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  {addedMessage && (
                    <p className="text-xs text-[#D1B23E] text-center font-semibold animate-pulse">{addedMessage}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={addToCart}
                      disabled={!product.inStock || addingToCart}
                      className="w-full !bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all"
                    >
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button
                      onClick={buyNow}
                      disabled={!product.inStock}
                      className="w-full !bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold py-3 rounded-xl transition-all"
                    >
                      Buy via WhatsApp
                    </Button>
                  </div>
                  <button
                    onClick={goToProduct}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors py-2"
                  >
                    <ExternalLink size={12} />
                    View Full Details
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-96 flex items-center justify-center">
              <p className="text-gray-400 font-serif">Product details not found.</p>
            </div>
          )}
        </div>
      </div>

      {showShare && product && (
        <ShareModal product={product} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
