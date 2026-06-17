'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Tag, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import Loader from '@/components/Loader';
import { getImageUrl } from '@/lib/image';

export default function MobileCartView() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.put(`/api/cart/${productId}`, { quantity: newQuantity });
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Failed to update cart', error);
    }
  };

  const checkout = async () => {
    try {
      const response = await axios.get('/api/cart/checkout');
      
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      }

      router.push(`/order-confirmation?orderId=${response.data.orderId}&total=${response.data.total}`);
    } catch (error) {
      console.error('Checkout failed', error);
    }
  };

  return (
    <div className="relative min-h-screen !bg-[#2A2A2A] text-white">
      {/* Main Content (blur removed, fully interactive) */}
      <div className="pb-40">
        <header className="p-4 text-center border-b border-[#333]">
          <h1 className="text-xl font-semibold font-sans">My Cart</h1>
        </header>

        <section className="p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => {
              if (!item.product) return null;
              return (
                <Card
                  key={item.product._id}
                  className="!bg-[#1E1E1E] text-white rounded-2xl border-none"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getImageUrl(item.product.images?.[0] || item.product.image)}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-[#EDEDED]"
                        onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                      />
                      <div>
                        <h3 className="text-sm font-semibold">{item.product.name}</h3>
                        <p className="text-xs text-gray-400">Colour: {item.product.color}</p>
                        <p className="text-sm font-bold mt-1">
                          &#8377; {new Intl.NumberFormat('en-IN').format(item.product.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="!bg-[#333] text-white hover:bg-[#444] border-none"
                        onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="px-2">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="!bg-[#333] text-white hover:bg-[#444] border-none"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>

        {cartItems.length > 0 && (
          <section className="p-4 fixed bottom-20 left-4 right-4 bg-[#1E1E1E] rounded shadow-lg z-30 border border-[#333]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Total</h2>
              <p className="text-xl font-bold text-[#D1B23E]">
                &#8377; {new Intl.NumberFormat('en-IN').format(total)}
              </p>
            </div>
            <Button
              onClick={checkout}
              className="w-full !bg-[#D1B23E] text-black hover:bg-[#c1a22e] font-semibold py-3 rounded-2xl"
            >
              Buy Now
            </Button>
          </section>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full !bg-[#1E1E1E] flex justify-around py-2 z-40 border-t border-[#333]">
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]" onClick={() => router.push('/')}>
          <Home size={24} />
        </Button>
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]" onClick={() => router.push('/brands')}>
          <Tag size={24} />
        </Button>
        <Button variant="ghost" className="flex flex-col items-center !text-[#D1B23E]">
          <ShoppingCart size={24} />
        </Button>
      </nav>
    </div>
  );
}
