'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, SlidersHorizontal, Frown, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import DesktopNavbar from './DesktopNavbar';
import DesktopFooter from './DesktopFooter';
import QuickViewModal from './QuickViewModal';
import { Sk, ProductCardSk } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/image';
import axios from 'axios';

export default function DesktopSearchView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([1, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
  const [quickViewId, setQuickViewId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  // Fetch products and brands on load
  useEffect(() => {
    // Sync query state if URL parameter changes
    setQuery(initialQuery);

    const loadData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        setProducts(prodData);

        const brandRes = await fetch('/api/brands');
        const brandData = await brandRes.json();
        setBrands(brandData.sort((a, b) => a.name.localeCompare(b.name)));
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load search data', err);
        setLoading(false);
      }
    };
    loadData();
  }, [initialQuery]);

  const toggleBrand = (brandId) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setPriceRange([1, 10000]);
    setSelectedBrands([]);
    router.push('/search');
  };

  // Client filtering
  const filteredProducts = products.filter((product) => {
    const lowerQuery = query.toLowerCase();
    const nameMatch = product.name?.toLowerCase().includes(lowerQuery);
    const aboutMatch = product.about?.toLowerCase().includes(lowerQuery);
    const colorMatch = product.color?.toLowerCase().includes(lowerQuery);
    const brandNameMatch = product.brand?.name?.toLowerCase().includes(lowerQuery);
    
    const textMatch = nameMatch || aboutMatch || colorMatch || brandNameMatch;
    
    // Price match
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    // Brand selection match
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand?._id);

    return textMatch && priceMatch && brandMatch;
  });

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
        <main className="mx-auto max-w-7xl px-6 py-12 w-full flex-1">
          <Sk className="h-8 w-80 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Sidebar placeholder */}
            <div className="lg:col-span-3 bg-[#171717] border border-white/5 rounded-3xl p-6 space-y-6">
              <Sk className="h-5 w-24" />
              <div className="border-t border-white/5 pt-6 space-y-3">
                <Sk className="h-2.5 w-16" />
                <Sk className="h-10 w-full !rounded-xl" />
              </div>
              <div className="space-y-3">
                <Sk className="h-2.5 w-14" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Sk className="h-4 w-4 !rounded" />
                    <Sk className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
            {/* Product grid placeholder */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSk key={i} />)}
            </div>
          </div>
        </main>
        <DesktopFooter />
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen font-sans antialiased flex flex-col justify-between">
      {/* Desktop Navigation */}
      <DesktopNavbar />

      <main className="mx-auto max-w-7xl px-6 py-12 w-full flex-1">
        <h1 className="text-3xl font-serif font-bold mb-10 pb-4 border-b border-white/5">
          Curated Search & Filters
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Filter Panel */}
          <div className="lg:col-span-3 bg-[#171717] border border-white/5 rounded-3xl p-6 space-y-8 sticky top-28 shadow-lg">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="font-serif font-bold text-lg flex items-center gap-1.5"><SlidersHorizontal size={18} /> Filters</span>
              {(query || selectedBrands.length > 0 || priceRange[0] > 1 || priceRange[1] < 10000) && (
                <button onClick={clearFilters} className="text-xs text-[#D1B23E] hover:underline flex items-center gap-0.5">
                  <X size={12} /> Clear All
                </button>
              )}
            </div>

            {/* Query Filter */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-bold">Keyword</label>
              <input
                type="text"
                placeholder="Search watches..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#D1B23E] transition-colors"
              />
            </div>

            {/* Brand Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-1">Brands</label>
              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-2">
                {brands.map((brand) => (
                  <label key={brand._id} className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand._id)}
                      onChange={() => toggleBrand(brand._id)}
                      className="rounded bg-white/5 border-white/20 text-[#D1B23E] focus:ring-[#D1B23E]/50 focus:ring-offset-0 focus:ring-1"
                    />
                    <span>{brand.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-wider text-gray-400 font-bold block">Price Range</label>
              <div className="flex justify-between text-xs text-gray-300 font-mono">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
              <div className="px-2">
                <Slider
                  range
                  min={1}
                  max={10000}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val)}
                  trackStyle={[{ backgroundColor: '#D1B23E' }]}
                  handleStyle={[{ borderColor: '#D1B23E' }, { borderColor: '#D1B23E' }]}
                  railStyle={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Grid Results */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Showing {filteredProducts.length} matching references</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-[#171717] rounded-3xl border border-white/5 space-y-4">
                <Frown size={48} className="mx-auto text-gray-500 opacity-60" />
                <h3 className="text-xl font-serif text-white">No Watches Found</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Adjust your search keyword or change your price/brand filters to discover more items.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
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
                      className="bg-white p-4 rounded-xl h-56 flex items-center justify-center overflow-hidden relative cursor-pointer"
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
                          {product.brand?.name}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate hover:text-[#D1B23E] transition-colors mt-0.5">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <div className="text-base font-bold text-white">
                            {formatPrice(product.price)}
                          </div>
                          {product.MRP > product.price && (
                            <div className="text-xs text-gray-500 line-through opacity-60">
                              {formatPrice(product.MRP)}
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
          </div>
        </div>
      </main>

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
