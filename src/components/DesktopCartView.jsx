'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import axios from 'axios';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import { Sk, CartItemSk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import { useCurrency } from '@/context/CurrencyContext';

export default function DesktopCartView() {
  const { formatPrice } = useCurrency();
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

  useEffect(() => {
    fetchCart();
  }, []);

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
      const response = await axios.get('/api/cart/checkout');
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }
      router.push(`/order-confirmation?orderId=${response.data.orderId}&total=${response.data.total}`);
    } catch (error) {
      console.error('Checkout failed', error);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col">
        <DesktopNavbar />
        <main className="mx-auto max-w-7xl px-6 py-16 w-full flex-1">
          {/* Title area */}
          <Sk className="h-8 w-64 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart items column */}
            <div className="lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => <CartItemSk key={i} />)}
            </div>
            {/* Order summary column */}
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
      {/* Desktop Navigation */}
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
          <div className="text-center py-24 bg-[#171717] rounded-3xl border border-white/5 space-y-6">
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
                      {/* Product Thumbnail */}
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

                      {/* Name and Metadata */}
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
                          {formatPrice(item.product.price)}
                        </div>
                      </div>

                      {/* Controls and Actions */}
                      <div className="flex items-center gap-4 shrink-0">
                        {/* Quantity controls */}
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

                        {/* Remove button */}
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
                  <span className="font-semibold text-white">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Insured Shipping</span>
                  <span className="font-semibold text-green-400 uppercase tracking-wide text-xs">
                    Complimentary
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GST / Luxury Tax</span>
                  <span className="font-semibold text-gray-500 italic text-xs">Inclusive</span>
                </div>
              </div>

              {/* Total Order */}
              <div className="flex justify-between items-end">
                <span className="text-base font-serif text-white">Order Total</span>
                <span className="text-2xl font-bold text-[#D1B23E]">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Action */}
              <Button
                onClick={checkout}
                disabled={checkingOut}
                className="w-full !bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 group transition-all"
              >
                <MessageCircle size={18} /> {checkingOut ? 'Checking out...' : 'Checkout with WhatsApp'}
              </Button>

              {/* Trust Details */}
              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#D1B23E]" />
                  <span>Certified pre-owned authenticity guarantee.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#D1B23E]" />
                  <span>Free fully insured transit package cover.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Premium Footer */}
      <DesktopFooter />
    </div>
  );
}
