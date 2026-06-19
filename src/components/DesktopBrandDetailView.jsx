'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, ShieldCheck, Award, Hourglass } from 'lucide-react';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import QuickViewModal from './QuickViewModal';
import { Sk, ProductCardSk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import axios from 'axios';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

export default function DesktopBrandDetailView() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const params = useParams();
  const brandId = params?.id;
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewId, setQuickViewId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  
  const router = useRouter();

  useEffect(() => {
    if (!brandId) return;

    const fetchBrandData = async () => {
      try {
        const brandRes = await fetch(`/api/brands/${brandId}`);
        const brandData = await brandRes.json();
        setBrand(brandData);

        const productsRes = await fetch(`/api/products/brand/${brandId}`);
        const productsData = await productsRes.json();
        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch brand details/products', err);
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [brandId]);

  const brandStory = useMemo(() => {
    if (!brand) return '';
    const name = brand.name.toLowerCase();
    if (name.includes('rolex')) {
      return 'Founded in 1905, Rolex has stood as the ultimate symbol of performance, prestige, and horological precision. Renowned for its Oyster case and pioneering achievements, Rolex watches have scaled the highest peaks and navigated the deepest oceans.';
    }
    if (name.includes('omega')) {
      return 'Omega represents Swiss precision, craftsmanship, and historic innovation since 1848. Chosen by NASA for the Moon landings and serving as the official timekeeper of the Olympic Games, Omega is synonymous with performance and classic design.';
    }
    if (name.includes('seiko')) {
      return 'Since 1881, Seiko has pushed the limits of watchmaking from Tokyo to the world. Creator of the quartz watch and a leader in spring drive technology, Seiko delivers exceptional mechanical durability and aesthetic design.';
    }
    if (name.includes('tissot')) {
      return 'Since 1853, Tissot has merged Swiss precision craftsmanship with forward-looking innovative watch details. Driven by their signature "Innovators by Tradition" philosophy, Tissot creates refined automatic and sports watches.';
    }
    return `An exquisite collection of timepieces from ${brand.name}. Defined by exceptional engineering, structural durability, and refined visual appeal, this selection celebrates the fine art of modern horology.`;
  }, [brand]);

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
        {/* Brand header placeholder */}
        <div className="bg-gradient-to-b from-[#242424] to-[#1e1e1e] border-b border-white/5 py-16">
          <div className="mx-auto max-w-7xl px-6 flex items-center gap-8">
            <Sk className="w-24 h-24 !rounded-2xl shrink-0" />
            <div className="space-y-3">
              <Sk className="h-2.5 w-20" />
              <Sk className="h-10 w-64" />
              <Sk className="h-3.5 w-96" />
              <Sk className="h-3.5 w-80" />
            </div>
          </div>
        </div>
        {/* Product grid placeholder */}
        <div className="py-16 mx-auto max-w-7xl px-6 w-full flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSk key={i} />)}
          </div>
        </div>
        <DesktopFooter />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col justify-between">
        <DesktopNavbar />
        <div className="flex-1 flex items-center justify-center text-xl font-serif text-gray-400">
          Brand not found.
        </div>
        <DesktopFooter />
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col justify-between">
      {/* Desktop Navigation */}
      <DesktopNavbar />

      {/* Brand Hero & Story Header */}
      <section className="luxury-page-hero bg-gradient-to-b from-[#2A2A2A] to-[#1e1e1e] relative overflow-x-hidden border-b border-white/5 min-h-[560px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(209,178,62,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1B23E]/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-center w-full">
          {/* Logo container */}
          <div className="md:col-span-3 flex justify-center">
            <div className="luxury-logo-panel w-44 h-44 rounded-3xl p-6 flex items-center justify-center border-2 border-[#D1B23E]/20 shadow-xl overflow-hidden">
              <img
                src={getImageUrl(brand.logo, 'brand')}
                alt={brand.name}
                className="luxury-logo-image max-h-full max-w-full object-contain"
                onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
              />
            </div>
          </div>

          {/* Heritage Story details */}
          <div className="md:col-span-9 space-y-4 text-left">
            <span className="text-xs uppercase tracking-widest text-[#D1B23E] font-bold block">
              Luxury House
            </span>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
              {brand.name}
            </h1>
            <p className="text-sm md:text-base text-gray-400 font-serif leading-relaxed max-w-3xl">
              {brandStory}
            </p>
          </div>
        </div>
      </section>

      {/* Products catalog section */}
      <section className="py-20 mx-auto max-w-7xl px-6 w-full flex-1">
        <h2 className="text-2xl font-serif font-bold mb-10 border-b border-white/5 pb-4">
          Curated Catalog ({products.length} {products.length === 1 ? 'watch' : 'watches'})
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-serif">
            No timepieces currently cataloged under {brand.name}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                onMouseEnter={() => setHoveredCardId(product._id)}
                onMouseLeave={() => setHoveredCardId(null)}
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
                  <div className={`absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-opacity duration-300 ${hoveredCardId === product._id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
                      {brand.name}
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
        )}
      </section>

      {/* Brand Attributes Section */}
      <section className="py-16 bg-[#171717] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">Verified Watch Credentials</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              Every watch comes with a serial verification and an invoice, ensuring historical lineage and authentic movement.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <Award size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">Horological Prestige</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              Our selection highlights references that represent historical milestones, mechanical breakthroughs, and outstanding finishes.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <Hourglass size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">Timeless Mechanical Art</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              Whether automatic winding, mechanical chronograph, or precision quartz, each model represents a legacy of micro-engineering.
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
