'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Truck, MessageCircle, Heart, X, RotateCcw } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import { Sk, CartItemSk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';
import { useWishlistProducts } from '@/hooks/useWishlistProducts';
import { useToast } from '@/context/ToastContext';
import RecentlyViewedRow from '@/components/RecentlyViewedRow';

export default function DesktopCartView() {
  const { formatPrice, currency } = useCurrency();
  const { remove: removeFromWishlist } = useWishlist();
  const { products: wishlistProducts } = useWishlistProducts();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = async () => {
    try {
      const cartResponse = await axios.get('/api/cart');
      setCartItems(cartResponse.data.items || []);
      const totalResponse = await axios.get('/api/cart/total');
      setTotal(totalResponse.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch cart', error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.put(`/api/cart/${productId}`, { quantity: newQuantity });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.put(`/api/cart/${productId}`, { quantity: 0 });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const response = await axios.post('/api/cart/checkout', { currency });
      if (response.data.whatsappUrl) window.open(response.data.whatsappUrl, '_blank');
      window.dispatchEvent(new Event('cart-updated'));
      router.push(`/order-confirmation?orderId=${response.data.orderId}&total=${response.data.total}`);
    } catch (error) {
      console.error('Checkout failed', error);
      toast({ message: 'Checkout failed. Please try again.', type: 'error' });
    } finally {
      setCheckingOut(false);
    }
  };

  const addWishlistItemToCart = async (productId) => {
    try {
      await axios.post('/api/cart', { product: productId, quantity: 1 });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
      toast({ message: 'Watch added to your cart.', type: 'success' });
    } catch {
      toast({ message: 'Failed to add to cart.', type: 'error' });
    }
  };

  const buyWishlistItemWhatsapp = async (productId) => {
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

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col">
        <DesktopNavbar />
        <main className="mx-auto max-w-7xl px-6 py-16 w-full flex-1">
          <Sk className="h-8 w-64 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => <CartItemSk key={i} />)}
            </div>
            <div className="space-y-4 lg:pt-2">
              <Sk className="h-5 w-36 mb-4" />
              <Sk className="h-3.5 w-full" />
              <Sk className="h-3.5 w-full" />
              <Sk className="h-3.5 w-4/5" />
              <div className="pt-4 border-t border-white/5">
                <Sk className="h-5 w-full mb-4" />
                <Sk className="h-12 w-full !rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <DesktopFooter />
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col justify-between">
      <DesktopNavbar />

      <main className="mx-auto max-w-7xl px-6 py-16 w-full flex-1">
        <div className="flex items-center space-x-2 mb-10">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="p-0 text-[#D1B23E] hover:text-[#b9972d] flex items-center gap-1.5"
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Button>
        </div>

        <h1 className="text-3xl font-serif font-bold mb-10 pb-4 border-b border-white/5">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </h1>

        {cartItems.length === 0 ? (
          <div className="space-y-12">
            <div className="text-center py-20 bg-[#171717] rounded-3xl border border-white/5 space-y-6">
              <ShoppingCart size={64} className="mx-auto text-gray-500 opacity-60" />
              <h2 className="text-2xl font-serif">Your Cart is Empty</h2>
              <p className="text-gray-400 max-w-md mx-auto text-sm font-serif">
                You haven&apos;t added any luxury watches to your collection yet. Browse our catalog to discover elite references.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="!bg-[#D1B23E] text-black hover:bg-[#c1a22e] font-semibold px-8 py-3 rounded-full"
              >
                Explore Catalog
              </Button>
            </div>

            <RecentlyViewedRow className="pt-2" />

            {/* Saved For Later — wishlist recovery */}
            {wishlistProducts.length > 0 && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Heart size={16} className="text-[#D1B23E]" fill="#D1B23E" />
                  <h2 className="text-xl font-serif font-bold">Saved For Later</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlistProducts.map((product) => {
                    const salePrice = product.salePrice ?? product.priceKwd ?? 0;
                    const origPrice = product.originalPrice ?? product.originalPriceKwd ?? 0;
                    const hasDiscount = origPrice > salePrice;
                    return (
                      <div
                        key={product._id}
                        className="relative bg-[#171717] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:border-[#D1B23E]/20 transition-all"
                      >
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 z-10 bg-[#D1B23E] text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            {Math.round(((origPrice - salePrice) / origPrice) * 100)}% OFF
                          </span>
                        )}
                        <button
                          onClick={() => removeFromWishlist(product._id)}
                          aria-label="Remove from wishlist"
                          className="absolute top-3 right-3 z-10 bg-black/30 p-1 rounded-full hover:bg-red-500/50 transition-colors"
                        >
                          <X size={12} className="text-white" />
                        </button>
                        <div
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="bg-white rounded-xl h-40 flex items-center justify-center overflow-hidden cursor-pointer"
                        >
                          <img
                            src={getImageUrl(product.images?.[0] || product.image)}
                            alt={product.name}
                            className="max-h-full object-contain mx-auto p-3"
                            onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <span className="text-[9px] uppercase tracking-widest text-[#D1B23E] font-bold">
                            {product.brand?.name}
                          </span>
                          <h3
                            onClick={() => router.push(`/product/${product._id}`)}
                            className="text-xs font-bold text-white truncate hover:text-[#D1B23E] transition-colors cursor-pointer"
                          >
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-white">{formatPrice(salePrice)}</span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-500 line-through">{formatPrice(origPrice)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => addWishlistItemToCart(product._id)}
                            disabled={!product.inStock}
                            className="flex-1 !bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold text-xs py-2 rounded-lg disabled:opacity-40"
                          >
                            {product.inStock ? '+ Add to Cart' : 'Out of Stock'}
                          </Button>
                          {product.inStock && (
                            <button
                              onClick={() => buyWishlistItemWhatsapp(product._id)}
                              aria-label="Buy via WhatsApp"
                              className="bg-[#1a1a1a] border border-white/10 hover:border-[#25D366]/40 p-2 rounded-lg transition-colors"
                            >
                              <FaWhatsapp size={14} style={{ color: '#25D366' }} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Side: Items List */}
            <div className="lg:col-span-8 space-y-6">
              {cartItems.map((item) => {
                if (!item.product) return null;
                return (
                  <div
                    key={item.product._id}
                    className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D1B23E]/20 transition-all duration-200 shadow-sm"
                  >
                    <div className="p-4 flex items-center gap-5">
                      <div
                        onClick={() => router.push(`/product/${item.product._id}`)}
                        className="w-20 h-20 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={getImageUrl(item.product.images?.[0] || item.product.image)}
                          alt={item.product.name}
                          className="max-h-full max-w-full object-contain mx-auto"
                          onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-[#D1B23E] font-bold">
                          {item.product.brand?.name}
                        </span>
                        <h3
                          onClick={() => router.push(`/product/${item.product._id}`)}
                          className="text-sm font-bold text-white truncate hover:text-[#D1B23E] transition-colors cursor-pointer mt-0.5 font-serif"
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.product.color || 'Classic'}</p>
                        <div className="text-sm font-bold text-white mt-1.5">
                          {formatPrice(item.product.salePrice || item.product.priceKwd || item.product.price || 0)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3 py-1.5 rounded-xl">
                          <button
                            onClick={() => item.quantity === 1 ? removeItem(item.product._id) : updateQuantity(item.product._id, item.quantity - 1)}
                            className="text-gray-400 hover:text-red-400 transition-colors w-5 flex items-center justify-center"
                            aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                          >
                            {item.quantity === 1 ? <Trash2 size={13} /> : <span className="font-semibold leading-none">−</span>}
                          </button>
                          <span className="font-semibold min-w-5 text-center text-sm text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="text-gray-400 hover:text-white transition-colors w-5 text-center font-semibold leading-none"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                          title="Remove item"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Side: Sticky Checkout Calculator */}
            <div className="lg:col-span-4 sticky top-28 bg-[#171717] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-serif font-bold text-white">Order Summary</h2>

              <div className="space-y-4 border-b border-white/5 pb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cart Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Insured Shipping</span>
                  <span className="font-semibold text-green-400 uppercase tracking-wide text-xs">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GST / Luxury Tax</span>
                  <span className="font-semibold text-gray-500 italic text-xs">Inclusive</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-base font-serif text-white">Order Total</span>
                <span className="text-2xl font-bold text-[#D1B23E]">{formatPrice(total)}</span>
              </div>

              <Button
                onClick={checkout}
                disabled={checkingOut}
                className="w-full !bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 group transition-all"
              >
                <MessageCircle size={18} /> {checkingOut ? 'Checking out...' : 'Checkout with WhatsApp'}
              </Button>
              <p className="text-[11px] text-center text-gray-500">
                Our team confirms via WhatsApp with payment options (KNET, bank transfer)
              </p>

              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#D1B23E]" />
                  <span>Authenticity certificate included with every timepiece</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#D1B23E]" />
                  <span>Free fully insured transit — 1–3 days within Kuwait</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-[#D1B23E]" />
                  <span>Orders may be modified or cancelled within 12 hours</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {cartItems.length > 0 && (
          <RecentlyViewedRow
            excludeId={cartItems[0]?.product?._id}
            className="mt-14 mb-4 border-t border-white/5 pt-10"
          />
        )}
      </main>

      <DesktopFooter />
    </div>
  );
}
