'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Eye, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function QuickViewModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [productId]);

  const addToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    setAddedMessage('');
    try {
      await axios.post('/api/cart', { product: product._id, quantity: 1 });
      setAddedMessage('Added to cart successfully!');
      
      // Dispatch cart update event so navbar updates badge
      window.dispatchEvent(new Event('cart-updated'));
      
      setTimeout(() => setAddedMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add to cart', err);
      setAddedMessage('Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    if (!product) return;
    try {
      // Direct checkout for this single product
      const res = await axios.get(`/api/product/${product._id}/checkout`);
      if (res.data.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Checkout failed', err);
    }
  };

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#2A2A2A] text-white rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 bg-black/40 hover:bg-black/75 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="w-full h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#D1B23E]" size={36} />
          </div>
        ) : product ? (
          <>
            {/* Left: Product Image */}
            <div className="md:w-1/2 bg-white flex items-center justify-center p-6 min-h-[300px] md:min-h-[450px]">
              <img
                src={getImageUrl(product.images?.[0] || product.image)}
                alt={product.name}
                className="max-h-[380px] max-w-full object-contain mx-auto rounded-lg"
                onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
              />
            </div>

            {/* Right: Product Details */}
            <div className="md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <span className="text-xs tracking-widest text-[#D1B23E] uppercase font-bold">
                  {product.brand?.name}
                </span>
                <h2 className="text-2xl font-serif font-bold leading-tight">{product.name}</h2>
                
                {/* Price Tag */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">
                    ₹{new Intl.NumberFormat('en-IN').format(product.price)}
                  </span>
                  <span className="text-sm text-gray-400 line-through opacity-70">
                    ₹{new Intl.NumberFormat('en-IN').format(product.MRP)}
                  </span>
                  {product.MRP > product.price && (
                    <span className="bg-[#D1B23E] text-black px-2 py-0.5 text-xs rounded font-bold">
                      {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold">
                  Availability:{' '}
                  <span className={product.inStock ? 'text-green-400' : 'text-red-400'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* About description */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Overview</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans max-h-36 overflow-y-auto pr-1">
                    {product.about || 'A luxurious timepiece built with premium design and structural excellence.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-3">
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
                    Buy Now
                  </Button>
                </div>
                <p className="text-[10px] text-center text-gray-500 font-serif">
                  * WhatsApp order redirection is supported globally.
                </p>
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
  );
}
