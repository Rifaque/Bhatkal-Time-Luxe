'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import MobileLayout from '@/components/MobileLayout';
import { getImageUrl } from '@/lib/image';

function BrandSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[#171717] border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 animate-pulse">
          <div className="w-14 h-14 rounded-xl bg-[#252525]" />
          <div className="h-2.5 bg-[#252525] rounded w-16" />
        </div>
      ))}
    </>
  );
}

export default function MobileBrandsView() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/brands')
      .then((r) => r.json())
      .then((data) => setBrands(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch((err) => console.error('Failed to fetch brands', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = searchQuery
    ? brands.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : brands;

  return (
    <MobileLayout>
      {/* Page heading */}
      <div className="px-5 pt-6 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-1">
          Our Collection
        </p>
        <h1 className="text-2xl font-serif font-bold text-white">All Brands</h1>
      </div>

      {/* Brand search */}
      <div className="px-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Find a brand…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171717] border border-white/8 text-sm text-white placeholder-gray-600 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D1B23E]/40 transition-all"
          />
        </div>
      </div>

      {/* Brand grid */}
      <div className="grid grid-cols-3 gap-3 px-4 pb-6">
        {loading ? (
          <BrandSkeleton />
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-600">
            No brands found.
          </div>
        ) : (
          filtered.map((brand) => (
            <button
              key={brand._id}
              onClick={() => router.push(`/brands/${brand._id}`)}
              className="bg-[#171717] border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-[#D1B23E]/20 active:scale-95 transition-all duration-200"
            >
              {/* Logo panel */}
              <div className="w-full aspect-square rounded-xl bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={getImageUrl(brand.logo, 'brand')}
                  alt={brand.name}
                  className="w-full h-full object-contain p-2 mix-blend-multiply"
                  onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
                />
              </div>
              {/* Brand name */}
              <span className="text-[10px] text-gray-300 font-medium text-center leading-tight line-clamp-2">
                {brand.name}
              </span>
            </button>
          ))
        )}
      </div>
    </MobileLayout>
  );
}
