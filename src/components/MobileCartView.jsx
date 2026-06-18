'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import MobileLayout from '@/components/MobileLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { getImageUrl } from '@/lib/image';

function CartSkeleton() {
  return (
    <div className="space-y-3 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#171717] border border-white/5 rounded-2xl p-4 flex gap-3 animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-[#252525] shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 bg-[#252525] rounded w-3/4" />
            <div className="h-3 bg-[#252525] rounded w-1/2" />
            <div className="h-3 bg-[#252525] rounded w-1/3" />
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
  const { formatPrice } = useCurrency();

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

  useEffect(() => {
    fetchCart();
  }, []);

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
      const response = await axios.get('/api/cart/checkout');
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }
      router.push(
        `/order-confirmation?orderId=${response.data.orderId}&total=${response.data.total}`
      );
    } catch (err) {
      console.error('Checkout failed', err);
      setCheckingOut(false);
    }
  };

  const isEmpty = !loading && cartItems.length === 0;

  return (
    <MobileLayout>
      {/* Page heading */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-1">
          Your Selection
        </p>
        <h1 className="text-2xl font-serif font-bold text-white">Cart</h1>
      </div>

      {loading ? (
        <div className="pt-6">
          <CartSkeleton />
        </div>
      ) : isEmpty ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
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
      ) : (
        <>
          {/* Cart items */}
          <div className="px-4 pt-4 pb-48 space-y-3">
            {cartItems.map((item) => {
              if (!item.product) return null;
              return (
                <div
                  key={item.product._id}
                  className="bg-[#171717] border border-white/5 rounded-2xl p-4 flex items-center gap-3"
                >
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-xl bg-[#f0eeea] flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={getImageUrl(item.product.images?.[0] || item.product.image)}
                      alt={item.product.name}
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm font-bold text-[#D1B23E] mt-0.5">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity controls */}
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
                    <span className="w-6 text-center text-sm font-semibold text-white">
                      {item.quantity}
                    </span>
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

            {/* Trust strip */}
            <div className="flex items-center gap-2 pt-2 pb-1">
              <ShieldCheck size={13} className="text-[#D1B23E] shrink-0" />
              <span className="text-[11px] text-gray-600">
                Certified authenticity on every timepiece
              </span>
            </div>
          </div>

          {/* Sticky order summary */}
          <div className="fixed bottom-16 left-0 right-0 z-30 bg-[#111]/95 backdrop-blur-xl border-t border-white/8 px-5 pt-4 pb-5">
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
          </div>
        </>
      )}
    </MobileLayout>
  );
}
