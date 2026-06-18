'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'btl_wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setWishlist(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const toggle = useCallback((productId) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId) => wishlist.has(productId), [wishlist]);

  return (
    <WishlistContext.Provider value={{ toggle, isWishlisted, wishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
