'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, ArrowUp, Eye, ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import QuickViewModal from './QuickViewModal';
import { Sk, ProductCardSk, BrandCardSk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import axios from 'axios';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function DesktopHomeView() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { wishlistIds, count: wishlistCount } = useWishlist();
  const { storeName } = useStoreSettings();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [topCategories, setTopCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewId, setQuickViewId] = useState(null);
  
  const catalogRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch('/api/top-brands').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/featured').then((r) => r.json()),
      fetch('/api/best-selling').then((r) => r.json()),
    ])
      .then(([topCatData, productsData, featuredData, bestSellingData]) => {
        setTopCategories(Array.isArray(topCatData) ? topCatData : []);
        setAllProducts(Array.isArray(productsData) ? productsData : []);
        setFeatured(Array.isArray(featuredData) ? featuredData : []);
        setBestSelling(Array.isArray(bestSellingData) ? bestSellingData : []);
      })
      .catch((err) => console.error('Failed to fetch home data', err))
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = useMemo(() => {
    return featured.map((item) => item.productId).filter(Boolean);
  }, [featured]);

  const bestSellingProducts = useMemo(() => {
    return bestSelling.map((item) => item.productId).filter(Boolean);
  }, [bestSelling]);

  const wishlistProducts = useMemo(() => {
    if (wishlistCount < 4 || allProducts.length === 0) return [];
    const idSet = new Set(wishlistIds);
    return allProducts.filter((p) => idSet.has(String(p._id))).slice(0, 8);
  }, [wishlistIds, wishlistCount, allProducts]);

  const heroWatch = useMemo(() => {
    if (allProducts.length === 0) return null;
    return allProducts.find(p => p.brand?.name?.toLowerCase().includes('rolex')) || allProducts[0];
  }, [allProducts]);

  const executiveWatch = useMemo(() => {
    if (allProducts.length < 2) return null;
    return allProducts.find(p => p.brand?.name?.toLowerCase().includes('tissot') || p.brand?.name?.toLowerCase().includes('rolex')) || allProducts[1];
  }, [allProducts]);

  const sportWatch = useMemo(() => {
    if (allProducts.length < 3) return null;
    return allProducts.find(p => p.brand?.name?.toLowerCase().includes('seiko') || p.brand?.name?.toLowerCase().includes('casio')) || allProducts[Math.min(2, allProducts.length - 1)];
  }, [allProducts]);

  const brandStories = {
    rolex: 'Founded in 1905, Rolex has stood as the ultimate symbol of performance, prestige, and horological precision. Renowned for its Oyster case and pioneering achievements, Rolex watches have scaled the highest peaks and navigated the deepest oceans.',
    omega: 'Omega represents Swiss precision, craftsmanship, and historic innovation since 1848. Chosen by NASA for the Moon landings and serving as the official timekeeper of the Olympic Games, Omega is synonymous with performance and classic design.',
    seiko: 'Since 1881, Seiko has pushed the limits of watchmaking from Tokyo to the world. Creator of the quartz watch and a leader in spring drive technology, Seiko delivers exceptional mechanical durability and aesthetic design.',
    tissot: 'Since 1853, Tissot has merged Swiss precision craftsmanship with forward-looking innovative watch details. Driven by their signature "Innovators by Tradition" philosophy, Tissot creates refined automatic and sports watches.',
    casio: 'Synonymous with tough structural durability and smart utility, Casio watches dominate both active and luxury dress layouts.'
  };

  const getBrandStory = (brandName) => {
    const key = brandName.toLowerCase();
    return brandStories[key] || `A curated collection of distinguished watchmaking references from the House of ${brandName}, built on precision engineering, design, and structural durability.`;
  };

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

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal: fade chapters up as they enter the viewport (one-shot per section)
  useEffect(() => {
    if (loading) return;
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('reveal-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col">
        <DesktopNavbar />
        {/* Hero placeholder — mirrors the 95vh immersive hero to prevent layout shift */}
        <div className="relative overflow-hidden min-h-[95vh] flex items-center border-b border-white/5 bg-gradient-to-b from-[#222222] to-[#1e1e1e]">
          <div className="absolute inset-0 bg-ambient-glow opacity-50" />
          <div className="relative mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16">
            <div className="lg:col-span-7 space-y-8">
              <Sk className="h-2.5 w-44" />
              <div className="space-y-4">
                <Sk className="h-14 lg:h-16 w-full" />
                <Sk className="h-14 lg:h-16 w-3/4" />
              </div>
              <div className="space-y-2.5">
                <Sk className="h-4 w-full max-w-xl" />
                <Sk className="h-4 w-2/3 max-w-xl" />
              </div>
              <div className="flex gap-6 pt-2">
                <Sk className="h-14 w-52 !rounded-full" />
                <Sk className="h-14 w-44 !rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <Sk className="w-full max-w-md h-[450px] !rounded-[36px]" />
            </div>
          </div>
        </div>
        {/* Product grid placeholder */}
        <div className="py-20 mx-auto max-w-7xl px-6 w-full">
          <div className="text-center mb-12 space-y-3">
            <Sk className="h-2.5 w-24 mx-auto" />
            <Sk className="h-8 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSk key={i} />)}
          </div>
        </div>
        {/* Brand strip placeholder */}
        <div className="py-12 mx-auto max-w-7xl px-6 w-full">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <Sk className="w-14 h-14 !rounded-xl" />
                <Sk className="h-2.5 w-14" />
              </div>
            ))}
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

      {/* Chapter 1: Immersive Hero Section (95vh) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#222222] to-[#1e1e1e] min-h-[95vh] flex items-center border-b border-white/5 py-0">
        <div className="absolute inset-0 bg-ambient-glow opacity-50" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D1B23E]/5 blur-[120px] pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D1B23E] font-bold block animate-fade-in luxury-text-spacing">
                The Bhatkal Luxury Vault
              </span>
              <h1 className="text-5xl lg:text-7xl font-serif font-extrabold tracking-tight text-white leading-[1.1]">
                Timeless Design. <br />
                Modern <span className="text-[#D1B23E] font-normal italic">Presence.</span>
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-400 font-serif max-w-xl leading-relaxed">
              Experience visual and mechanical perfection. We curate an elite catalog of certified luxury watches, celebrating prestigious horology and precision movements.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <Button
                onClick={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="!bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-bold px-10 py-6 rounded-full text-base flex items-center gap-2 group transition-all duration-300 shadow-[0_4px_20px_rgba(209,178,62,0.25)] hover:shadow-[0_4px_30px_rgba(209,178,62,0.4)]"
              >
                Explore Collection <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </Button>
              <Button
                onClick={() => router.push('/brands')}
                className="!bg-white/5 hover:bg-white/10 text-white font-semibold px-9 py-6 rounded-full text-base border border-white/10 transition-all duration-300"
              >
                Watch Houses
              </Button>
            </div>
          </div>

          {/* Right Watch Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            {heroWatch && (
              <div 
                onClick={() => router.push(`/product/${heroWatch._id}`)}
                className="relative group cursor-pointer w-full max-w-md p-2"
              >
                <div className="absolute inset-0 bg-black/40 rounded-[40px] blur-2xl group-hover:bg-[#D1B23E]/5 transition-all duration-500" />
                <div className="relative border border-white/10 bg-white/5 backdrop-blur-md p-10 rounded-[36px] transition-all duration-500 group-hover:border-[#D1B23E]/30 flex flex-col justify-between h-[450px]">
                  <div className="bg-white p-6 rounded-2xl h-64 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
                    <img
                      src={getImageUrl(heroWatch.images?.[0] || heroWatch.image)}
                      alt={heroWatch.name}
                      className="max-h-full object-contain mx-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]"
                    />
                  </div>
                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#D1B23E] font-bold">Featured Reference</span>
                      <h3 className="text-base font-bold text-white truncate max-w-[200px] mt-1 group-hover:text-[#D1B23E] transition-colors">{heroWatch.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-[#D1B23E]">{formatPrice(heroWatch.salePrice ?? heroWatch.priceKwd ?? 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chapter 2: Luxury Watch Houses (Brand Showcase) */}
      <section className="reveal py-28 bg-[#141414] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D1B23E] font-bold block luxury-text-spacing">
              Distinguished Curation
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Luxury Watch Houses</h2>
            <div className="h-0.5 w-16 bg-[#D1B23E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topCategories.slice(0, 3).map((item) => (
              <div
                key={item._id}
                onClick={() => router.push(`/brands/${item.brand._id}`)}
                className="group relative cursor-pointer bg-[#1e1e1e] border border-white/5 rounded-3xl p-8 hover:border-[#D1B23E] transition-all duration-300 flex flex-col justify-between h-[320px] hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="space-y-6">
                  {/* Brand Logo and Name */}
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2.5 overflow-hidden">
                      <img
                        src={getImageUrl(item.brand.logo, 'brand')}
                        alt={item.brand.name}
                        className="max-h-full object-contain"
                        onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-[#D1B23E] transition-colors">
                      Heritage House
                    </span>
                  </div>
                  {/* Narrative details */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold text-white">{item.brand.name}</h3>
                    <p className="text-xs text-gray-400 font-serif leading-relaxed line-clamp-3">
                      {getBrandStory(item.brand.name)}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-[#D1B23E] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-4">
                  Explore Heritage &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 3: Featured Collection ("Curated Spotlight") */}
      <section className="reveal py-28 bg-[#1e1e1e]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex justify-between items-end mb-20">
            <div className="text-left space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D1B23E] font-bold block luxury-text-spacing">
                Spotlight Vault
              </span>
              <h2 className="text-3xl font-serif font-bold">Featured Collection</h2>
            </div>
            <Button
              onClick={() => router.push('/new-arrivals')}
              className="text-sm font-semibold text-[#D1B23E] hover:underline p-0 flex items-center gap-1"
              variant="link"
            >
              See All Timepieces &rarr;
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="relative group bg-[#151515] border border-white/5 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                {(product.originalPrice ?? product.originalPriceKwd ?? 0) > (product.salePrice ?? product.priceKwd ?? 0) && (
                  <span className="absolute top-4 left-4 z-10 bg-[#D1B23E] text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {Math.round((((product.originalPrice ?? product.originalPriceKwd) - (product.salePrice ?? product.priceKwd)) / (product.originalPrice ?? product.originalPriceKwd)) * 100)}% OFF
                  </span>
                )}

                {/* Whitespace Image Container */}
                <div
                  onClick={() => router.push(`/product/${product._id}`)}
                  className="bg-white p-6 rounded-xl h-60 flex items-center justify-center overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={getImageUrl(product.images?.[0] || product.image)}
                    alt={product.name}
                    className="max-h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                  />
                  {/* Hover Quick View Overlay */}
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

                {/* Minimalist details */}
                <div className="mt-5 space-y-2 flex-1 flex flex-col justify-between">
                  <div onClick={() => router.push(`/product/${product._id}`)} className="cursor-pointer">
                    <span className="text-[9px] uppercase tracking-widest text-[#D1B23E] font-bold font-sans">
                      {product.brand?.name}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate hover:text-[#D1B23E] transition-colors mt-0.5 font-serif">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-base font-bold text-white">
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
                      className="font-semibold text-[10px] py-1 px-3.5 rounded-lg"
                      aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
                    >
                      {product.inStock ? '+ Add' : 'OOS'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Saved Collection — shown when wishlist >= 4 items */}
      {wishlistProducts.length >= 4 && (
        <section className="reveal py-20 bg-[#181818] border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex justify-between items-end mb-12">
              <div className="text-left space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#D1B23E] font-bold block luxury-text-spacing">
                  Your Curation
                </span>
                <h2 className="text-3xl font-serif font-bold">Your Saved Collection</h2>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-3">
              {wishlistProducts.map((product) => (
                <div
                  key={product._id}
                  className="shrink-0 w-56 relative group bg-[#151515] border border-white/5 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#D1B23E]/15"
                >
                  <div
                    onClick={() => router.push(`/product/${product._id}`)}
                    className="bg-white p-5 rounded-xl h-44 flex items-center justify-center overflow-hidden relative cursor-pointer"
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
                        className="!bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-semibold rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg text-xs"
                      >
                        <Eye size={13} /> Quick View
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-[#D1B23E] font-bold">{product.brand?.name}</span>
                    <h3
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="text-xs font-bold text-white truncate hover:text-[#D1B23E] transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-white">
                        {formatPrice(product.salePrice ?? product.priceKwd ?? 0)}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={(e) => addToCart(product._id, e)}
                        disabled={!product.inStock}
                        className="font-semibold text-[9px] py-1 px-3 rounded-lg"
                      >
                        {product.inStock ? '+ Add' : 'OOS'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Transition Chapter: Trust Section */}
      <section className="reveal py-20 bg-[#121212] border-t border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white/5 border border-white/5 rounded-3xl">
            <div className="p-4 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-bold font-serif text-white">Certified Authenticity</h3>
            <p className="text-sm text-gray-400 font-serif leading-relaxed">
              Every timepiece in our selection is backed by absolute serial-number credentials and manual movement calibration tests.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white/5 border border-white/5 rounded-3xl">
            <div className="p-4 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <Truck size={32} />
            </div>
            <h3 className="text-lg font-bold font-serif text-white">Insured Free Transit</h3>
            <p className="text-sm text-gray-400 font-serif leading-relaxed">
              We provide free secure shipping channels throughout India, keeping every luxury shipment covered via full insurance policies.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white/5 border border-white/5 rounded-3xl">
            <div className="p-4 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <RefreshCw size={32} />
            </div>
            <h3 className="text-lg font-bold font-serif text-white">Concierge Assurances</h3>
            <p className="text-sm text-gray-400 font-serif leading-relaxed">
              Direct consultations on watch specifications, dials, references, and movements are available 24/7 via our WhatsApp concierge line.
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 4: Executive Collection (Editorial Showcase) */}
      {executiveWatch && (
        <section className="reveal relative overflow-hidden min-h-[750px] flex items-center bg-[#171717] border-b border-white/5 py-0">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-[#D1B23E]/5 blur-[90px] pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text editorial */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-[#D1B23E] font-bold block luxury-text-spacing">
                  The Executive Showcase
                </span>
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  The Mark of Leadership. <br />
                  Refined Boardroom Chronometers.
                </h2>
              </div>
              <p className="text-base lg:text-lg text-gray-400 font-serif leading-relaxed max-w-xl">
                Exude authority in every setting. Our Executive Collection brings together exceptional automatic models from Tissot and Rolex, detailed with premium stainless steel, gold bezels, and calibrated dial references.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => router.push(`/product/${executiveWatch._id}`)}
                  className="!bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-bold px-8 py-5 rounded-full text-sm flex items-center gap-1.5 shadow-md transition-all duration-300"
                >
                  View Collection Details &rarr;
                </Button>
              </div>
            </div>

            {/* Right watch visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div 
                onClick={() => router.push(`/product/${executiveWatch._id}`)}
                className="group relative cursor-pointer w-full max-w-xs bg-white/5 border border-white/10 p-6 rounded-[28px] backdrop-blur-md hover:border-[#D1B23E]/30 transition-all duration-300"
              >
                <div className="bg-white p-6 rounded-xl h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src={getImageUrl(executiveWatch.images?.[0] || executiveWatch.image)}
                    alt={executiveWatch.name}
                    className="max-h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-500 uppercase font-bold tracking-wider">{executiveWatch.brand?.name}</span>
                    <h4 className="text-sm font-bold text-white truncate max-w-[150px] mt-0.5">{executiveWatch.name}</h4>
                  </div>
                  <span className="text-sm font-bold text-[#D1B23E]">{formatPrice(executiveWatch.salePrice ?? executiveWatch.priceKwd ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Chapter 5: Best Sellers Section */}
      <section className="reveal py-28 bg-[#1a1a1a] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D1B23E] font-bold block luxury-text-spacing">
              Elite References
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Best Selling Timepieces</h2>
            <div className="h-0.5 w-16 bg-[#D1B23E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellingProducts.map((product) => (
              <div
                key={product._id}
                className="relative group bg-[#141414] border border-white/5 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                {(product.originalPrice ?? product.originalPriceKwd ?? 0) > (product.salePrice ?? product.priceKwd ?? 0) && (
                  <span className="absolute top-4 left-4 z-10 bg-[#D1B23E] text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {Math.round((((product.originalPrice ?? product.originalPriceKwd) - (product.salePrice ?? product.priceKwd)) / (product.originalPrice ?? product.originalPriceKwd)) * 100)}% OFF
                  </span>
                )}

                <div
                  onClick={() => router.push(`/product/${product._id}`)}
                  className="bg-white p-6 rounded-xl h-60 flex items-center justify-center overflow-hidden relative cursor-pointer"
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
                    <span className="text-[9px] uppercase tracking-widest text-[#D1B23E] font-bold font-sans">
                      {product.brand?.name}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate hover:text-[#D1B23E] transition-colors mt-0.5 font-serif">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-base font-bold text-white">
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
                      className="font-semibold text-[10px] py-1 px-3.5 rounded-lg"
                      aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
                    >
                      {product.inStock ? '+ Add' : 'OOS'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 6: Sport Collection (Editorial Showcase) */}
      {sportWatch && (
        <section className="reveal relative overflow-hidden min-h-[750px] flex items-center bg-[#141414] border-b border-white/5 py-0">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-[#D1B23E]/5 blur-[90px] pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left watch visual */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div 
                onClick={() => router.push(`/product/${sportWatch._id}`)}
                className="group relative cursor-pointer w-full max-w-xs bg-white/5 border border-white/10 p-6 rounded-[28px] backdrop-blur-md hover:border-[#D1B23E]/30 transition-all duration-300"
              >
                <div className="bg-white p-6 rounded-xl h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src={getImageUrl(sportWatch.images?.[0] || sportWatch.image)}
                    alt={sportWatch.name}
                    className="max-h-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-500 uppercase font-bold tracking-wider">{sportWatch.brand?.name}</span>
                    <h4 className="text-sm font-bold text-white truncate max-w-[150px] mt-0.5">{sportWatch.name}</h4>
                  </div>
                  <span className="text-sm font-bold text-[#D1B23E]">{formatPrice(sportWatch.salePrice ?? sportWatch.priceKwd ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* Right text editorial */}
            <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-[#D1B23E] font-bold block luxury-text-spacing">
                  The Sport Showcase
                </span>
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  Engineered for Adventure. <br />
                  Robust Outdoor Chronographs.
                </h2>
              </div>
              <p className="text-base lg:text-lg text-gray-400 font-serif leading-relaxed max-w-xl">
                Built to resist the elements without compromising on aesthetic prestige. Sourced from Seiko and Casio, these references feature hardened steel cases, scratch-resistant crystal dials, and advanced chronographic movements.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => router.push(`/product/${sportWatch._id}`)}
                  className="!bg-[#D1B23E] hover:bg-[#c1a22e] text-black font-bold px-8 py-5 rounded-full text-sm flex items-center gap-1.5 shadow-md transition-all duration-300"
                >
                  View Collection Details &rarr;
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Chapter 7: New Arrivals Section */}
      <section ref={catalogRef} className="reveal py-28 bg-[#1e1e1e]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D1B23E] font-bold block luxury-text-spacing">
              Vault Arrivals
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">New Arrivals</h2>
            <div className="h-0.5 w-16 bg-[#D1B23E] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {allProducts.slice(0, 8).map((product) => (
              <div
                key={product._id}
                className="relative group bg-[#151515] border border-white/5 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                {(product.originalPrice ?? product.originalPriceKwd ?? 0) > (product.salePrice ?? product.priceKwd ?? 0) && (
                  <span className="absolute top-4 left-4 z-10 bg-[#D1B23E] text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {Math.round((((product.originalPrice ?? product.originalPriceKwd) - (product.salePrice ?? product.priceKwd)) / (product.originalPrice ?? product.originalPriceKwd)) * 100)}% OFF
                  </span>
                )}

                <div
                  onClick={() => router.push(`/product/${product._id}`)}
                  className="bg-white p-6 rounded-xl h-60 flex items-center justify-center overflow-hidden relative cursor-pointer"
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
                    <span className="text-[9px] uppercase tracking-widest text-[#D1B23E] font-bold font-sans">
                      {product.brand?.name}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate hover:text-[#D1B23E] transition-colors mt-0.5 font-serif">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-base font-bold text-white">
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
                      className="font-semibold text-[10px] py-1 px-3.5 rounded-lg"
                      aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
                    >
                      {product.inStock ? '+ Add' : 'OOS'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Support */}
      <section className="reveal pt-32 pb-40 bg-gradient-to-b from-[#121212] via-[#0e0e0e] to-[#080808] border-t border-white/5 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D1B23E]/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 text-center space-y-10">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D1B23E] font-bold font-sans">
              Personal Concierge
            </span>
            <h2 className="text-4xl font-serif font-bold text-white tracking-tight leading-tight">
              Need Assistance Finding The Perfect Timepiece?
            </h2>
            <p className="text-base text-gray-400 font-serif leading-relaxed max-w-2xl mx-auto">
              Our concierge team is available to help with product recommendations, availability checks, pricing inquiries, and order support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/api/whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-[#D1B23E] hover:bg-[#e0c45b] text-black font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-sm shadow-lg"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="flex items-center gap-2.5 border border-white/15 hover:border-[#D1B23E]/40 text-white hover:text-[#D1B23E] font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-sm"
            >
              <ArrowRight size={16} />
              Contact Page
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
            <div className="space-y-2 p-4">
              <ShieldCheck size={22} className="text-[#D1B23E] mx-auto" />
              <p className="text-xs text-gray-400 font-sans">Certified Authenticity</p>
            </div>
            <div className="space-y-2 p-4">
              <Truck size={22} className="text-[#D1B23E] mx-auto" />
              <p className="text-xs text-gray-400 font-sans">Insured Shipping</p>
            </div>
            <div className="space-y-2 p-4">
              <RefreshCw size={22} className="text-[#D1B23E] mx-auto" />
              <p className="text-xs text-gray-400 font-sans">Easy Returns</p>
            </div>
            <div className="space-y-2 p-4">
              <MessageCircle size={22} className="text-[#D1B23E] mx-auto" />
              <p className="text-xs text-gray-400 font-sans">24/7 Support</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 mt-24 flex flex-col items-center gap-5">
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#D1B23E]/50 to-transparent" />
          <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500 font-sans">
            {storeName} · Est. 2020 · Certified Horological Excellence
          </p>
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#D1B23E]/50 to-transparent" />
        </div>
      </section>

      {/* Chapter 9: Premium Footer */}
      <DesktopFooter />

      {/* Quick View Modal Overlay */}
      {quickViewId && (
        <QuickViewModal
          productId={quickViewId}
          onClose={() => setQuickViewId(null)}
        />
      )}

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#D1B23E]/30 bg-[#1a1a1a]/90 text-[#D1B23E] shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300 hover:border-[#D1B23E]/60 hover:bg-[#D1B23E] hover:text-black hover:shadow-[0_4px_20px_rgba(209,178,62,0.25)] ${
          showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ArrowUp size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
