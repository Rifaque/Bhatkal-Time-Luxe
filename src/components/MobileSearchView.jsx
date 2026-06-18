'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Frown, X, ArrowUpDown } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import MobileLayout from '@/components/MobileLayout';
import MobileProductCard from '@/components/MobileProductCard';
import { useCurrency } from '@/context/CurrencyContext';

const PRICE_MIN = 1;
const PRICE_MAX = 500000;

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default'   },
  { value: 'price_asc',  label: 'Price ↑'   },
  { value: 'price_desc', label: 'Price ↓'   },
  { value: 'name_asc',   label: 'A → Z'     },
];

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
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/brands').then((r) => r.json()),
    ])
      .then(([prodData, brandData]) => {
        setProducts(prodData);
        setBrands(brandData.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((err) => console.error('Failed to fetch search data', err))
      .finally(() => setLoading(false));
  }, []);

  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const clearFilters = () => {
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedBrands([]);
    setSortBy('default');
  };

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    let results = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const aboutMatch = p.about?.toLowerCase().includes(q);
      const colorMatch = p.color?.toLowerCase().includes(q);
      const brandMatch = p.brand?.name?.toLowerCase().includes(q);
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      const brandFilter = selectedBrands.length === 0 || selectedBrands.includes(p.brand?._id);
      return (nameMatch || aboutMatch || colorMatch || brandMatch) && priceMatch && brandFilter;
    });

    if (sortBy === 'price_asc')  results = [...results].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') results = [...results].sort((a, b) => b.price - a.price);
    if (sortBy === 'name_asc')   results = [...results].sort((a, b) => a.name.localeCompare(b.name));

    return results;
  }, [products, query, priceRange, selectedBrands, sortBy]);

  const filtersActive =
    priceRange[0] !== PRICE_MIN ||
    priceRange[1] !== PRICE_MAX ||
    selectedBrands.length > 0 ||
    sortBy !== 'default';

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

        {/* Filter + sort toggle */}
        <div className="flex items-center gap-2 mt-2.5">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              filtersActive || showFilters
                ? 'bg-[#D1B23E]/10 text-[#D1B23E] border border-[#D1B23E]/20'
                : 'bg-[#252525] text-gray-400 border border-transparent'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {filtersActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D1B23E]" />}
          </button>

          {/* Sort chips */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                  sortBy === opt.value
                    ? 'bg-[#D1B23E]/10 text-[#D1B23E] border border-[#D1B23E]/20'
                    : 'bg-[#252525] text-gray-500 border border-transparent'
                }`}
              >
                {opt.value === 'default' && <ArrowUpDown size={11} />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 bg-[#171717] border border-white/8 rounded-2xl p-4 animate-fade-in space-y-4">
            {/* Brand chips */}
            {brands.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2.5">Brand</p>
                <div className="flex flex-wrap gap-1.5">
                  {brands.map((brand) => (
                    <button
                      key={brand._id}
                      onClick={() => toggleBrand(brand._id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        selectedBrands.includes(brand._id)
                          ? 'bg-[#D1B23E]/15 text-[#D1B23E] border-[#D1B23E]/40'
                          : 'bg-[#252525] text-gray-400 border-white/5'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
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
            </div>

            {filtersActive && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#D1B23E] font-medium"
              >
                Reset all filters
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
              Try a different search or adjust your filters.
            </p>
            {filtersActive && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-[#D1B23E] font-medium"
              >
                Clear all filters
              </button>
            )}
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
