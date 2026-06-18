import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'btl_recently_viewed';
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const addItem = useCallback((product) => {
    if (!product?._id) return;
    const snapshot = {
      _id: product._id,
      name: product.name,
      price: product.price,
      MRP: product.MRP,
      images: product.images,
      image: product.image,
      brand: product.brand,
      inStock: product.inStock,
    };
    setItems((prev) => {
      const filtered = prev.filter((p) => p._id !== snapshot._id);
      const next = [snapshot, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { items, addItem };
}
