'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistButton({ productId, className = '', size = 16 }) {
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(productId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={saved ? 'Remove from saved' : 'Save watch'}
      className={`transition-all duration-200 active:scale-90 ${className}`}
    >
      <Heart
        size={size}
        className={saved ? 'text-[#D1B23E] fill-[#D1B23E]' : 'text-white/50 hover:text-white/70'}
        style={saved ? {} : { fill: 'none' }}
      />
    </button>
  );
}
