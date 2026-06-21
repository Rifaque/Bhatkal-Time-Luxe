'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistButton({ productId, className = '', size = 16, showLabel = false }) {
  const { isWishlisted, toggle } = useWishlist();
  const [justSaved, setJustSaved] = useState(false);
  const saved = isWishlisted(productId);

  const handleClick = (e) => {
    e.stopPropagation();
    const wasSaved = isWishlisted(productId);
    toggle(productId);
    if (!wasSaved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 500);
    }
  };

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        aria-label={saved ? 'Remove from saved' : 'Save watch'}
        className={`flex items-center gap-2 transition-all duration-200 active:scale-95 ${className}`}
      >
        <Heart
          size={size}
          className={`transition-colors duration-200 ${saved ? 'text-[#D1B23E]' : 'text-gray-500'} ${justSaved ? 'heart-pop' : ''}`}
          fill={saved ? '#D1B23E' : 'none'}
        />
        <span className={`text-xs font-medium ${saved ? 'text-[#D1B23E]' : 'text-gray-500'}`}>
          {saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved' : 'Save watch'}
      className={`transition-all duration-200 active:scale-90 ${className}`}
    >
      <Heart
        size={size}
        className={`transition-colors duration-200 ${saved ? 'text-[#D1B23E]' : 'text-white/50 hover:text-white/70'} ${justSaved ? 'heart-pop' : ''}`}
        fill={saved ? '#D1B23E' : 'none'}
      />
    </button>
  );
}
