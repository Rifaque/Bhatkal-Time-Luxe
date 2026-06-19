'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Plus, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/image';
import {
  AdminShell,
  AdminPanel,
  AdminEmptyState,
  adminPrimaryButtonClasses,
  adminDangerButtonClasses,
  adminSelectStyles,
} from '../components/AdminShell';

const fmt = (n) => Number(n || 0).toFixed(3);

export default function FeaturedManager() {
  const [featured, setFeatured] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get('/api/featured');
      setFeatured(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load featured items');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands');
      setBrands(res.data);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    fetchFeatured();
    fetchProducts();
    fetchBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const brandMap = useMemo(() => {
    const map = {};
    brands.forEach((b) => { map[b._id] = b.name; });
    return map;
  }, [brands]);

  const handleAddFeatured = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/admin/featured', { productId: selectedProduct.value });
      setSuccess('Featured product added!');
      setSelectedProduct(null);
      fetchFeatured();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add featured product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeatured = async (id) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setTimeout(() => setPendingDeleteId((p) => (p === id ? null : p)), 3000);
      return;
    }
    setPendingDeleteId(null);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/admin/featured/${id}`);
      setSuccess('Featured product removed!');
      fetchFeatured();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove featured product');
    }
  };

  const productOptions = useMemo(() => products.map((p) => ({
    value: p._id,
    label: p.name,
    brand: brandMap[p.brand] || '',
    price: p.salePrice ?? p.priceKwd ?? 0,
    originalPrice: p.originalPrice ?? p.originalPriceKwd ?? 0,
    image: p.images?.[0] || '',
  })), [products, brandMap]);

  const formatOptionLabel = (option) => (
    <div className="flex items-center gap-3 py-0.5">
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
        <img
          src={getImageUrl(option.image)}
          alt={option.label}
          className="max-h-full object-contain"
          onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-[#D1B23E] uppercase tracking-wider font-bold leading-none">{option.brand}</p>
        <p className="text-sm text-white font-medium truncate leading-snug">{option.label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-xs text-gray-400">KD {fmt(option.price)}</p>
          {option.originalPrice > option.price && (
            <p className="text-[10px] text-gray-600 line-through">KD {fmt(option.originalPrice)}</p>
          )}
        </div>
      </div>
    </div>
  );

  const validFeatured = featured.filter((i) => i.productId);

  return (
    <AdminShell
      eyebrow="Merchandising"
      title="Featured Products"
      description="Curate the Featured Collection displayed on the homepage."
    >
      <div className="space-y-6">

        {(error || success) && (
          <div className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
            error
              ? 'border-red-500/20 bg-red-500/8 text-red-200'
              : 'border-emerald-500/20 bg-emerald-500/8 text-emerald-200'
          }`}>
            {error || success}
          </div>
        )}

        <AdminPanel title="Add Featured Product" description="Choose a product to highlight in the Featured Collection.">
          <form onSubmit={handleAddFeatured} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Select Product <span className="text-[#D1B23E]">*</span>
              </label>
              <Select
                options={productOptions}
                value={selectedProduct}
                onChange={setSelectedProduct}
                placeholder="Search and select a product..."
                isSearchable
                styles={adminSelectStyles}
                formatOptionLabel={formatOptionLabel}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !selectedProduct}
              className={adminPrimaryButtonClasses}
            >
              <Plus size={16} />
              {submitting ? 'Adding...' : 'Add to Featured'}
            </button>
          </form>
        </AdminPanel>

        <AdminPanel
          title="Current Featured"
          description={`${validFeatured.length} product${validFeatured.length !== 1 ? 's' : ''} in the Featured Collection`}
        >
          {validFeatured.length === 0 ? (
            <AdminEmptyState
              title="No featured products"
              description="Add products above to populate the Featured Collection on the homepage."
            />
          ) : (
            <div className="space-y-2">
              {featured.map((item) => {
                if (!item.productId) return null;
                const isPending = pendingDeleteId === item._id;
                const p = item.productId;
                const brand = brandMap[p.brand] || '';
                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:border-white/15"
                  >
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(p.images?.[0] || '')}
                        alt={p.name}
                        className="max-h-full object-contain"
                        onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {brand && (
                        <p className="text-[10px] uppercase tracking-wider text-[#D1B23E] font-bold">{brand}</p>
                      )}
                      <p className="text-sm font-semibold text-white leading-snug mt-0.5 line-clamp-1">{p.name}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-white">KD {fmt(p.salePrice ?? p.priceKwd ?? 0)}</span>
                        {(p.originalPrice ?? p.originalPriceKwd ?? 0) > (p.salePrice ?? p.priceKwd ?? 0) && (
                          <span className="text-xs text-gray-500 line-through">KD {fmt(p.originalPrice ?? p.originalPriceKwd ?? 0)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFeatured(item._id)}
                      className={isPending
                        ? 'inline-flex items-center gap-2 rounded-2xl border border-red-500/60 bg-red-600 px-4 py-3 text-sm font-bold text-white transition shrink-0'
                        : `${adminDangerButtonClasses} shrink-0`
                      }
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">{isPending ? 'Confirm?' : 'Remove'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </AdminPanel>

      </div>
    </AdminShell>
  );
}
