import { useState, useEffect, useRef } from 'react';
import { useWishlist } from '@/context/WishlistContext';

export function useWishlistProducts() {
  const { wishlistIds, removeMany } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevKey = useRef('');

  useEffect(() => {
    const key = [...wishlistIds].sort().join(',');
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (wishlistIds.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    fetch('/api/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: wishlistIds }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setProducts(data);
        // Silently prune IDs for products that no longer exist — single state update
        const returnedIds = new Set(data.map((p) => String(p._id)));
        const staleIds = wishlistIds.filter((id) => !returnedIds.has(id));
        if (staleIds.length > 0) removeMany(staleIds);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wishlistIds, removeMany]);

  return { products, loading };
}
