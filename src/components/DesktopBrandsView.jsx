'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import Loader from '@/components/Loader';
import { getImageUrl } from '@/lib/image';

export default function DesktopBrandsView() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        const sortedBrands = data.sort((a, b) => a.name.localeCompare(b.name));
        setBrands(sortedBrands);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch brands', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1e1e1e] text-white min-h-screen flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col justify-between">
      {/* Desktop Navigation */}
      <DesktopNavbar />

      {/* Main Banner */}
      <section className="luxury-page-hero bg-gradient-to-b from-[#2A2A2A] to-[#1e1e1e] text-center relative overflow-hidden min-h-[480px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(209,178,62,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D1B23E]/20 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#D1B23E] font-bold block luxury-text-spacing">
            Curated Prestige
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Horological Heritage
          </h1>
          <div className="h-0.5 w-16 bg-[#D1B23E] mx-auto" />
          <p className="text-base text-gray-400 font-serif max-w-2xl mx-auto leading-relaxed">
            Discover our collection of the world's most distinguished watchmakers. Each brand has been selected for its historical significance, mechanical precision, and superior aesthetic design.
          </p>
        </div>
      </section>

      {/* Brands Grid Section */}
      <section className="py-20 mx-auto max-w-7xl px-6 w-full flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {brands.map((brand) => (
            <div
              key={brand._id}
              onClick={() => router.push(`/brands/${brand._id}`)}
              className="cursor-pointer group flex flex-col items-center bg-[#171717] border border-white/5 p-8 rounded-2xl hover:border-[#D1B23E] hover:shadow-[0_0_20px_rgba(209,178,62,0.1)] transition-all duration-300"
            >
              <div className="luxury-logo-panel w-full h-32 rounded-xl flex items-center justify-center p-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img
                  src={getImageUrl(brand.logo, 'brand')}
                  alt={brand.name}
                  className="luxury-logo-image max-h-full object-contain"
                  onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
                />
              </div>
              <h3 className="text-lg font-bold text-gray-300 mt-6 group-hover:text-[#D1B23E] transition-colors font-serif tracking-wide">
                {brand.name}
              </h3>
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
            <h3 className="text-base font-bold font-serif text-white">Certified Authenticity</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              Every watch brand featured in our inventory is guaranteed authentic and fully checked by certified horologists.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <Truck size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">Insured Delivery</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              We ship fully insured packages throughout Karnataka and major cities in India to secure your high-end watch delivery.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 p-4">
            <div className="p-3 bg-[#D1B23E]/10 rounded-full text-[#D1B23E]">
              <RefreshCw size={28} />
            </div>
            <h3 className="text-base font-bold font-serif text-white">Horology Assistance</h3>
            <p className="text-xs text-gray-400 font-serif leading-relaxed">
              Seeking advice on a model or mechanics? Connect with our dedicated horological specialists on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <DesktopFooter />
    </div>
  );
}
