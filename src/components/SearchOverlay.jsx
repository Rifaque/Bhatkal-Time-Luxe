'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, History, TrendingUp, Tag, Command, Keyboard } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import { useCurrency } from '@/context/CurrencyContext';

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const inputRef = useRef(null);
  const paletteRef = useRef(null);

  const popularSearches = ['Rolex', 'Omega', 'Tissot', 'Seiko', 'Automatic', 'Gold'];

  useEffect(() => {
    // Focus input on open
    inputRef.current?.focus();

    // Fetch all products for dynamic client-side filtering
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch((err) => console.error('Failed to pre-fetch products for search', err));

    // Load recent searches
    const saved = localStorage.getItem('btl_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }

    // Escape listener
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Client-side instant filter
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = allProducts
      .filter((product) => {
        const q = query.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(q);
        const aboutMatch = product.about?.toLowerCase().includes(q);
        const brandMatch = product.brand?.name?.toLowerCase().includes(q);
        const colorMatch = product.color?.toLowerCase().includes(q);
        const refMatch = product.reference?.toLowerCase().includes(q);
        return nameMatch || aboutMatch || brandMatch || colorMatch || refMatch;
      })
      .slice(0, 5); // Show top 5 instant results

    setResults(filtered);
  }, [query, allProducts]);

  const saveSearchTerm = (term) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    let updated = [cleanTerm, ...recentSearches.filter((t) => t !== cleanTerm)];
    updated = updated.slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('btl_recent_searches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    saveSearchTerm(query);
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (term) => {
    saveSearchTerm(term);
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('btl_recent_searches');
  };

  const highlightMatch = (text, highlight) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-[#D1B23E]/20 text-[#D1B23E] font-medium rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xs flex items-start justify-center pt-28 px-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Command Palette Dialog Box */}
      <div
        ref={paletteRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#131313] border border-white/[0.07] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)] flex flex-col max-h-[70vh] animate-scale-up"
      >
        {/* Search Header Input */}
        <form onSubmit={handleSearchSubmit} className="search-form-row flex items-center px-5 py-4 border-b border-white/[0.06] relative transition-colors duration-200">
          <Search size={18} className="text-gray-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search catalog... e.g. Rolex, Chronograph"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm font-sans border-none outline-none focus:ring-0 focus:outline-none placeholder-gray-600 pr-16 tracking-wide"
          />
          <div className="absolute right-4 flex items-center space-x-2">
            <span className="text-[10px] bg-white/[0.05] border border-white/[0.08] text-gray-600 px-1.5 py-0.5 rounded-md font-mono tracking-wider">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-300 p-1 rounded-md hover:bg-white/5 transition-all duration-200"
            >
              <X size={15} />
            </button>
          </div>
        </form>

        {/* Dynamic Panel */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide text-left">
          {query ? (
            results.length > 0 ? (
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#D1B23E] font-bold block mb-1">
                  Instant Results
                </span>
                <div className="space-y-2">
                  {results.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        saveSearchTerm(query);
                        onClose();
                        router.push(`/product/${product._id}`);
                      }}
                      className="flex items-center gap-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#D1B23E]/35 hover:bg-white/[0.07] cursor-pointer transition-all duration-150 group"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1">
                        <img
                          src={getImageUrl(product.images?.[0] || product.image)}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[#D1B23E] font-medium tracking-wide uppercase">
                          {product.brand?.name}
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#D1B23E] transition-colors">
                          {highlightMatch(product.name, query)}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-white">
                          {formatPrice(product.salePrice ?? product.priceKwd ?? 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2.5 bg-[#D1B23E] text-black font-semibold rounded-xl hover:bg-[#c1a22e] hover:shadow-[0_4px_16px_rgba(209,178,62,0.2)] transition-all duration-200 text-xs mt-4"
                  >
                    View All Matching References for &ldquo;{query}&rdquo;
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-600 font-serif text-sm">
                No matching luxury watches found for &ldquo;{query}&rdquo;
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Recent searches */}
              <div className="space-y-4">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  <History size={12} /> Recent Searches
                </span>
                {recentSearches.length > 0 ? (
                  <div className="flex flex-col space-y-0.5 text-sm">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(term)}
                        className="text-left text-gray-400 hover:text-[#D1B23E] transition-colors duration-200 py-1.5 px-2 rounded-lg hover:bg-white/[0.04] truncate"
                      >
                        {term}
                      </button>
                    ))}
                    <button
                      onClick={clearRecentSearches}
                      className="text-left text-[10px] text-gray-600 hover:text-gray-400 transition-colors duration-200 pt-2 px-2"
                    >
                      Clear history
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 font-serif">No recent queries.</p>
                )}
              </div>

              {/* Right Column: Trending search chips */}
              <div className="space-y-4">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  <TrendingUp size={12} /> Popular Searches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(term)}
                      className="px-3 py-1 bg-white/[0.04] border border-white/[0.08] hover:border-[#D1B23E]/45 hover:text-[#D1B23E] hover:bg-[#D1B23E]/[0.04] rounded-full text-xs text-gray-400 transition-all duration-200 font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Command Footer Guide */}
        <div className="bg-black/25 px-5 py-2.5 border-t border-white/[0.05] flex justify-between items-center text-[10px] text-gray-600 font-mono">
          <span className="flex items-center gap-1.5">
            <Command size={9} /> Enter to search
          </span>
          <span className="flex items-center gap-1.5">
            <Keyboard size={9} /> Esc to close
          </span>
        </div>
      </div>
    </div>
  );
}
