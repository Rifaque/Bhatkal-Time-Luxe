'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, ShieldCheck, Award, Hourglass } from 'lucide-react';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import QuickViewModal from './QuickViewModal';
import Loader from '@/components/Loader';
import { getImageUrl } from '@/lib/image';
import axios from 'axios';

export default function DesktopBrandDetailView() {
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
      alert('Watch added to cart!');
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
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
      <section className="luxury-page-hero bg-gradient-to-b from-[#2A2A2A] to-[#1e1e1e] relative overflow-hidden border-b border-white/5 min-h-[420px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(209,178,62,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1B23E]/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-center w-full">
          {/* Logo container */}
          <div className="md:col-span-3 flex justify-center">
            <div className="w-44 h-44 bg-white rounded-3xl p-6 flex items-center justify-center border-2 border-[#D1B23E]/20 shadow-xl overflow-hidden mix-blend-normal">
              <img
                src={getImageUrl(brand.logo, 'brand')}
                alt={brand.name}
                className="max-h-full object-contain mix-blend-multiply"
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
                {product.MRP > product.price && (
                  <span className="absolute top-4 left-4 z-10 bg-[#D1B23E] text-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                    {Math.round(((product.MRP - product.price) / product.MRP) * 100)}% OFF
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
                        ₹{new Intl.NumberFormat('en-IN').format(product.price)}
                      </div>
                      {product.MRP > product.price && (
                        <div className="text-xs text-gray-500 line-through opacity-60">
                          ₹{new Intl.NumberFormat('en-IN').format(product.MRP)}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={(e) => addToCart(product._id, e)}
                      disabled={!product.inStock}
                      className="font-semibold text-xs py-1.5 px-3 rounded-lg"
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
