'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'btl_wishlist';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const valid = parsed.filter((id) => typeof id === 'string' && id.trim().length > 0);
    return new Set(valid); // Set deduplicates automatically
  } catch {
    return new Set();
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => new Set());

  useEffect(() => {
    setWishlist(loadFromStorage());
  }, []);

  const persist = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {}
  };

  const toggle = useCallback((productId) => {
    if (typeof productId !== 'string' || !productId.trim()) return;
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((productId) => {
    setWishlist((prev) => {
      if (!prev.has(productId)) return prev;
      const next = new Set(prev);
      next.delete(productId);
      persist(next);
      return next;
    });
  }, []);

  const removeMany = useCallback((productIds) => {
    if (!productIds?.length) return;
    setWishlist((prev) => {
      const toRemove = productIds.filter((id) => prev.has(id));
      if (toRemove.length === 0) return prev;
      const next = new Set(prev);
      for (const id of toRemove) next.delete(id);
      persist(next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId) => wishlist.has(productId), [wishlist]);

  const wishlistIds = useMemo(() => [...wishlist], [wishlist]);
  const count = wishlist.size;

  return (
    <WishlistContext.Provider value={{ toggle, remove, removeMany, isWishlisted, wishlist, wishlistIds, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
