'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, ShieldCheck, Heart, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import MobileLayout from '@/components/MobileLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useWishlistProducts } from '@/hooks/useWishlistProducts';
import { useToast } from '@/context/ToastContext';
import { getImageUrl } from '@/lib/image';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';
import { Sk } from '@/components/ui/skeleton';

function CartSkeleton() {
  return (
    <div className="space-y-3 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#171717] border border-white/5 rounded-2xl p-4 flex gap-3">
          <Sk className="w-16 h-16 !rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Sk className="h-3 w-3/4" />
            <Sk className="h-3 w-1/2" />
            <Sk className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MobileCartView() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();
  const { formatPrice, currency } = useCurrency();
  const { remove: removeFromWishlist } = useWishlist();
  const { products: wishlistProducts } = useWishlistProducts();
  const { toast } = useToast();

  const fetchCart = async () => {
    try {
      const [cartRes, totalRes] = await Promise.all([
        axios.get('/api/cart'),
        axios.get('/api/cart/total'),
      ]);
      setCartItems(cartRes.data.items || []);
      setTotal(totalRes.data.total);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.put(`/api/cart/${productId}`, { quantity: newQuantity });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error('Failed to update cart', err);
    }
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const response = await axios.post('/api/cart/checkout', { currency });
      if (response.data.whatsappUrl) window.open(response.data.whatsappUrl, '_blank');
      window.dispatchEvent(new Event('cart-updated'));
      router.push(`/order-confirmation?orderId=${response.data.orderId}&total=${response.data.total}`);
    } catch (err) {
      console.error('Checkout failed', err);
      toast({ message: 'Checkout failed. Please try again.', type: 'error' });
      setCheckingOut(false);
    }
  };

  const addWishlistToCart = async (productId) => {
    try {
      await axios.post('/api/cart', { product: productId, quantity: 1 });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
      toast({ message: 'Added to cart.', type: 'success' });
    } catch {
      toast({ message: 'Failed to add to cart.', type: 'error' });
    }
  };

  const buyWishlistWhatsapp = async (productId) => {
    try {
      const res = await fetch(`/api/product/${productId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      });
      const data = await res.json();
      if (data.whatsappUrl) window.open(data.whatsappUrl, '_blank');
      if (data.orderId) router.push(`/order-confirmation?orderId=${data.orderId}&total=${data.total}`);
    } catch {
      router.push(`/product/${productId}`);
    }
  };

  const isEmpty = !loading && cartItems.length === 0;

  return (
    <MobileLayout hideFAB={!isEmpty}>
      {/* Page heading */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-1">
          Your Selection
        </p>
        <h1 className="text-2xl font-serif font-bold text-white">Cart</h1>
      </div>

      {loading ? (
        <div className="pt-6"><CartSkeleton /></div>
      ) : isEmpty ? (
        <div className="pb-10">
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#171717] border border-white/5 flex items-center justify-center mb-5">
              <ShoppingCart size={28} className="text-gray-600" />
            </div>
            <p className="text-white font-semibold mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Browse our collection and add the timepieces that speak to you.
            </p>
            <button
              onClick={() => router.push('/brands')}
              className="bg-[#D1B23E] text-black text-sm font-semibold px-6 py-2.5 rounded-xl active:scale-95 transition-transform"
            >
              Browse Collection
            </button>
          </div>

          {/* Saved For Later — wishlist recovery */}
          <RecentlyViewedRow className="px-5 pt-6 pb-2 border-t border-white/5 mt-2" />

          {wishlistProducts.length > 0 && (
            <div className="px-5 space-y-4 mt-2">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Heart size={14} className="text-[#D1B23E]" fill="#D1B23E" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Saved For Later</h2>
              </div>
              <div className="space-y-3">
                {wishlistProducts.map((product) => {
                  const salePrice = product.salePrice ?? product.priceKwd ?? 0;
                  return (
                    <div
                      key={product._id}
                      className="relative bg-[#171717] border border-white/5 rounded-2xl p-3 flex gap-3 hover:border-[#D1B23E]/15 transition-all"
                    >
                      <button
                        onClick={() => removeFromWishlist(product._id)}
                        aria-label="Remove from wishlist"
                        className="absolute top-2.5 right-2.5 bg-black/30 p-1 rounded-full hover:bg-red-500/50 transition-colors"
                      >
                        <X size={10} className="text-white" />
                      </button>
                      <div
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="w-16 h-16 bg-[#f0eeea] rounded-xl flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                      >
                        <img
                          src={getImageUrl(product.images?.[0] || product.image)}
                          alt={product.name}
                          className="w-full h-full object-contain p-1.5"
                          onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-[#D1B23E] font-bold">{product.brand?.name}</p>
                        <p
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="text-xs font-semibold text-white truncate cursor-pointer hover:text-[#D1B23E] transition-colors"
                        >
                          {product.name}
                        </p>
                        <p className="text-sm font-bold text-[#D1B23E]">{formatPrice(salePrice)}</p>
                        <div className="flex gap-2 pt-0.5">
                          <button
                            onClick={() => addWishlistToCart(product._id)}
                            disabled={!product.inStock}
                            className="flex-1 bg-[#D1B23E] hover:bg-[#c1a22e] text-black text-[10px] font-bold py-1.5 rounded-lg disabled:opacity-40 transition-colors"
                          >
                            {product.inStock ? '+ Add to Cart' : 'Out of Stock'}
                          </button>
                          {product.inStock && (
                            <button
                              onClick={() => buyWishlistWhatsapp(product._id)}
                              aria-label="Buy via WhatsApp"
                              className="bg-[#1a1a1a] border border-white/10 hover:border-[#25D366]/40 p-1.5 rounded-lg transition-colors"
                            >
                              <FaWhatsapp size={12} style={{ color: '#25D366' }} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tablet 2-column layout wrapper */}
          <div className="md:grid md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px] md:gap-6 lg:gap-8 md:px-6 lg:px-8 md:pt-6 md:pb-8 md:items-start">

            {/* Cart items */}
            <div className="px-4 md:px-0 pt-4 pb-48 md:pb-0 space-y-3">
              {cartItems.map((item) => {
                if (!item.product) return null;
                return (
                  <div
                    key={item.product._id}
                    className="bg-[#171717] border border-white/5 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#f0eeea] flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(item.product.images?.[0] || item.product.image)}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.product.name}</p>
                      <p className="text-sm font-bold text-[#D1B23E] mt-0.5">
                        {formatPrice(item.product.salePrice || item.product.priceKwd || item.product.price || 0)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          item.quantity === 1
                            ? updateQuantity(item.product._id, 0)
                            : updateQuantity(item.product._id, item.quantity - 1)
                        }
                        aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                        className="w-8 h-8 rounded-xl bg-[#252525] hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={13} className="text-red-400" />
                        ) : (
                          <span className="text-white text-sm font-bold leading-none">−</span>
                        )}
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 rounded-xl bg-[#252525] hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <span className="text-white text-sm font-bold leading-none">+</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-2 pt-2 pb-1">
                <ShieldCheck size={13} className="text-[#D1B23E] shrink-0" />
                <span className="text-[11px] text-gray-600">Certified authenticity on every timepiece</span>
              </div>

              <RecentlyViewedRow
                excludeId={cartItems[0]?.product?._id}
                className="pt-6 pb-4 border-t border-white/5 mt-4"
              />
            </div>

            {/* Inline order summary — tablet only */}
            <div className="hidden md:block">
              <div className="bg-[#111] border border-white/8 rounded-2xl p-5 sticky top-20 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">Order Summary</p>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-gray-400 font-medium">Total</span>
                  <span className="text-xl font-bold text-[#D1B23E]">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={checkout}
                  disabled={checkingOut}
                  className="w-full bg-[#D1B23E] text-black font-bold py-3.5 rounded-2xl text-sm disabled:opacity-60 active:scale-[0.98] transition-all hover:bg-[#c1a22e]"
                >
                  {checkingOut ? 'Processing…' : 'Place Order via WhatsApp'}
                </button>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-[#D1B23E] shrink-0" />
                  <span className="text-[11px] text-gray-500">Certified authenticity guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky order summary — mobile only */}
          <div className="fixed bottom-16 left-0 right-0 z-30 bg-[#111]/95 backdrop-blur-xl border-t border-white/8 px-5 pt-4 pb-5 md:hidden">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-sm text-gray-400 font-medium">Order Total</span>
              <span className="text-xl font-bold text-[#D1B23E]">{formatPrice(total)}</span>
            </div>
            <button
              onClick={checkout}
              disabled={checkingOut}
              className="w-full bg-[#D1B23E] text-black font-bold py-3.5 rounded-2xl text-sm disabled:opacity-60 active:scale-[0.98] transition-all hover:bg-[#c1a22e]"
            >
              {checkingOut ? 'Processing…' : 'Place Order via WhatsApp'}
            </button>
            <p className="text-[10px] text-center text-gray-600 mt-2">
              Team confirms via WhatsApp · 7-day returns · Cancel within 12 hours
            </p>
          </div>
        </>
      )}
    </MobileLayout>
  );
}
