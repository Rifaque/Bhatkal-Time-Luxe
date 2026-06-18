'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Frown, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import MobileLayout from '@/components/MobileLayout';
import MobileProductCard from '@/components/MobileProductCard';

const PRICE_MIN = 1;
const PRICE_MAX = 500000;

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
          <div className="bg-[#222]" style={{ aspectRatio: '1/1' }} />
          <div className="px-3 py-2.5 space-y-1.5">
            <div className="h-2.5 bg-[#222] rounded w-3/4" />
            <div className="h-3 bg-[#222] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MobileSearchView() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const aboutMatch = p.about?.toLowerCase().includes(q);
      const colorMatch = p.color?.toLowerCase().includes(q);
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      return (nameMatch || aboutMatch || colorMatch) && priceMatch;
    });
  }, [products, query, priceRange]);

  const filtersActive = priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX;

  return (
    <MobileLayout>
      {/* Search bar */}
      <div className="sticky top-14 z-30 bg-[#1e1e1e]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="relative flex items-center">
          <Search size={17} className="absolute left-3.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search watches…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-[#171717] border border-white/8 text-white text-sm placeholder-gray-600 pl-9 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-[#D1B23E]/40 focus:ring-1 focus:ring-[#D1B23E]/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 text-gray-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`mt-2.5 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            filtersActive || showFilters
              ? 'bg-[#D1B23E]/10 text-[#D1B23E] border border-[#D1B23E]/20'
              : 'bg-[#252525] text-gray-400 border border-transparent'
          }`}
        >
          <SlidersHorizontal size={13} />
          Price Filter
          {filtersActive && (
            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#D1B23E]" />
          )}
        </button>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 bg-[#171717] border border-white/8 rounded-2xl p-4 animate-fade-in">
            <div className="flex justify-between text-xs text-gray-400 mb-3">
              <span>₹{new Intl.NumberFormat('en-IN').format(priceRange[0])}</span>
              <span>₹{new Intl.NumberFormat('en-IN').format(priceRange[1])}</span>
            </div>
            <Slider
              range
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={1000}
              value={priceRange}
              onChange={(val) => setPriceRange(val)}
              trackStyle={[{ backgroundColor: '#D1B23E', height: 3 }]}
              railStyle={{ backgroundColor: '#333', height: 3 }}
              handleStyle={[
                { borderColor: '#D1B23E', backgroundColor: '#D1B23E', boxShadow: 'none', width: 16, height: 16, marginTop: -6 },
                { borderColor: '#D1B23E', backgroundColor: '#D1B23E', boxShadow: 'none', width: 16, height: 16, marginTop: -6 },
              ]}
            />
            {filtersActive && (
              <button
                onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
                className="mt-3 text-xs text-[#D1B23E] font-medium"
              >
                Reset filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="pt-4 pb-4">
        {loading ? (
          <GridSkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <Frown size={36} className="text-gray-700 mb-4" />
            <p className="text-white font-semibold mb-1">No results found</p>
            <p className="text-sm text-gray-600">
              Try a different search or adjust the price filter.
            </p>
          </div>
        ) : (
          <>
            <p className="px-5 pb-3 text-xs text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
            </p>
            <div className="grid grid-cols-2 gap-3 px-4">
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product._id}
                  product={product}
                  onClick={() => router.push(`/product/${product._id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
