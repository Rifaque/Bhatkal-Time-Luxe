'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import QuickViewModal from './QuickViewModal';
import { Sk, ProductCardSk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import axios from 'axios';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

export default function DesktopNewArrivalsView() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewId, setQuickViewId] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products/new-arrivals')
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch new arrivals', err);
        setLoading(false);
      });
  }, []);

  const addToCart = async (productId, e) => {
    e.stopPropagation();
    try {
      await axios.post('/api/cart', { product: productId, quantity: 1 });
      window.dispatchEvent(new Event('cart-updated'));
      toast({ message: 'Watch added to your cart.', type: 'success' });
    } catch (err) {
      console.error('Failed to add to cart', err);
      toast({ message: 'Failed to add to cart.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col">
        <DesktopNavbar />
        {/* Page title placeholder */}
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-6 w-full">
          <Sk className="h-2.5 w-28 mb-4" />
          <Sk className="h-10 w-72 mb-3" />
          <Sk className="h-3.5 w-96" />
          <div className="h-px bg-white/5 mt-8" />
        </div>
        {/* Product grid placeholder */}
        <div className="pb-20 mx-auto max-w-7xl px-6 w-full flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => <ProductCardSk key={i} />)}
          </div>
        </div>
        <DesktopFooter />
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col justify-between">
      {/* Desktop Navigation */}
      <DesktopNavbar />

      {/* Hero Banner */}
      <section className="luxury-page-hero bg-gradient-to-b from-[#2A2A2A] to-[#1e1e1e] text-center relative overflow-x-hidden min-h-[620px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(209,178,62,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1B23E]/20 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#D1B23E] font-bold block luxury-text-spacing">
            Vault Additions
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            New Timepiece Arrivals
          </h1>
          <div className="h-0.5 w-16 bg-[#D1B23E] mx-auto" />
          <p className="text-base text-gray-400 font-serif max-w-2xl mx-auto leading-relaxed">
            Discover the latest elite references added to our collection. Hand-selected for exceptional quality, visual excellence, and precision movements.
          </p>
        </div>
      </section>

      {/* Grid List */}
      <section className="py-20 mx-auto max-w-7xl px-6 w-full flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="relative group bg-[#171717] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {(product.originalPrice ?? product.originalPriceKwd ?? 0) > (product.salePrice ?? product.priceKwd ?? 0) && (
                <span className="absolute top-4 left-4 z-10 bg-[#D1B23E] text-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  {Math.round((((product.originalPrice ?? product.originalPriceKwd) - (product.salePrice ?? product.priceKwd)) / (product.originalPrice ?? product.originalPriceKwd)) * 100)}% OFF
                </span>
              )}

              <div 
                onClick={() => router.push(`/product/${product._id}`)}
                className="bg-white p-4 rounded-xl h-64 flex items-center justify-center overflow-hidden relative cursor-pointer"
              >
                <img
                  src={getImageUrl(product.images?.[0] || product.image)}
                  alt={product.name}
                  className="max-h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                />
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto`}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewId(product._id);
                    }}
                    className="!bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold rounded-full px-5 py-2.5 flex items-center gap-1.5 shadow-lg text-xs"
                  >
                    <Eye size={14} /> Quick View
                  </Button>
                </div>
              </div>

              <div className="mt-5 space-y-2 flex-1 flex flex-col justify-between">
                <div onClick={() => router.push(`/product/${product._id}`)} className="cursor-pointer">
                  <span className="text-[10px] uppercase tracking-widest text-[#D1B23E] font-bold">
                    {product.brand?.name}
                  </span>
                  <h3 className="text-base font-bold text-white truncate hover:text-[#D1B23E] transition-colors mt-0.5">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {formatPrice(product.salePrice ?? product.priceKwd ?? 0)}
                    </div>
                    {(product.originalPrice ?? product.originalPriceKwd ?? 0) > (product.salePrice ?? product.priceKwd ?? 0) && (
                      <div className="text-xs text-gray-500 line-through opacity-60">
                        {formatPrice(product.originalPrice ?? product.originalPriceKwd ?? 0)}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={(e) => addToCart(product._id, e)}
                    disabled={!product.inStock}
                    className="font-semibold text-xs py-1.5 px-3.5 rounded-lg"
                    aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
                  >
                    {product.inStock ? '+ Add' : 'OOS'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust-Building Section */}
      <section className="py-16 bg-[#171717] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">Guaranteed Authenticity</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              Every newly arrived timepiece is inspected and authenticated by certified horologists before shipment.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <Truck size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">Insured Free Transit</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              We ship fully insured packages throughout Kuwait and the GCC region to secure your high-end watch delivery.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <RotateCcw size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">24/7 Client Assistant</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              Connect with our dedicated support specialists on WhatsApp for personalized watch consultations.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <DesktopFooter />

      {/* Quick View Modal Overlay */}
      {quickViewId && (
        <QuickViewModal 
          productId={quickViewId} 
          onClose={() => setQuickViewId(null)} 
        />
      )}
    </div>
  );
}
