'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getImageUrl } from '@/lib/image';
import { Plus, Trash2, Pencil, X, Search, Tag } from 'lucide-react';
import {
  AdminShell,
  AdminPanel,
  AdminEmptyState,
  AdminBadge,
  AdminSelect,
  adminInputClasses,
  adminTextareaClasses,
  adminPrimaryButtonClasses,
  adminSecondaryButtonClasses,
  adminDangerButtonClasses,
} from '../components/AdminShell';
import { useToast } from '@/context/ToastContext';

export default function ProductsManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  // Add-product form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [inStock, setInStock] = useState(true);
  const [color, setColor] = useState('');
  const [about, setAbout] = useState('');
  const [images, setImages] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name_az');
  const [generatingRefs, setGeneratingRefs] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [savingAvailability, setSavingAvailability] = useState(new Set());

  // Edit modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [updateData, setUpdateData] = useState({
    name: '', brand: '', originalPrice: 0, salePrice: 0, inStock: true, color: '', about: '',
  });
  const [updateImages, setUpdateImages] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/brands');
      setBrands(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  }, []);

  useEffect(() => { fetchProducts(); fetchBrands(); }, [fetchProducts, fetchBrands]);
  useEffect(() => { if (brands.length > 0 && !brand) setBrand(brands[0]._id); }, [brands, brand]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q) ||
        brands.find((b) => b._id === p.brand)?.name?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const aPrice = a.salePrice ?? a.priceKwd ?? 0;
      const bPrice = b.salePrice ?? b.priceKwd ?? 0;
      switch (sortBy) {
        case 'newest':     return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case 'oldest':     return new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0);
        case 'price_asc':  return aPrice - bPrice;
        case 'price_desc': return bPrice - aPrice;
        case 'name_za':    return b.name.localeCompare(a.name);
        default:           return a.name.localeCompare(b.name);
      }
    });
  }, [products, brands, searchQuery, sortBy]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name || !brand || !originalPrice || !salePrice || images.length === 0) {
      setError('Please fill in all required fields and upload at least one image.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('salePrice', salePrice);
    formData.append('originalPrice', originalPrice);
    formData.append('inStock', inStock.toString());
    formData.append('color', color);
    formData.append('about', about);
    Array.from(images).forEach((file) => formData.append('images', file));
    try {
      await axios.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Product added successfully!');
      setName(''); setBrand(brands[0]?._id || ''); setOriginalPrice(''); setSalePrice('');
      setInStock(true); setColor(''); setAbout(''); setImages([]);
      const fi = document.getElementById('product-images-input');
      if (fi) fi.value = '';
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setTimeout(() => setPendingDeleteId((p) => (p === id ? null : p)), 3000);
      return;
    }
    setPendingDeleteId(null);
    setError(''); setSuccess('');
    // Optimistic removal
    setProducts((prev) => prev.filter((p) => p._id !== id));
    try {
      await axios.delete(`/api/products/${id}`);
      setSuccess('Product deleted.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product');
      fetchProducts(); // rollback on failure
    }
  };

  // No optimistic update — wait for server confirmation
  const handleAvailabilityToggle = async (productId, newInStock) => {
    setSavingAvailability((prev) => new Set(prev).add(productId));
    try {
      await axios.put(`/api/products/${productId}`, { inStock: newInStock });
      setProducts((prev) => prev.map((p) => p._id === productId ? { ...p, inStock: newInStock } : p));
      toast({ message: `Marked ${newInStock ? 'In Stock' : 'Out of Stock'}`, type: 'success' });
    } catch {
      toast({ message: 'Failed to update availability', type: 'error' });
    } finally {
      setSavingAvailability((prev) => { const s = new Set(prev); s.delete(productId); return s; });
    }
  };

  const openUpdateModal = (product) => {
    setProductToUpdate(product);
    setUpdateData({
      name:          product.name,
      brand:         product.brand?._id ?? product.brand,
      salePrice:     product.salePrice ?? product.priceKwd ?? 0,
      originalPrice: product.originalPrice ?? product.originalPriceKwd ?? 0,
      inStock:       product.inStock ?? true,
      color:         product.color || '',
      about:         product.about || '',
    });
    setUpdateImages(null);
    setUpdateModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setUpdating(true);
    try {
      if (updateImages && updateImages.length > 0) {
        const formData = new FormData();
        Object.entries(updateData).forEach(([k, v]) => formData.append(k, v));
        Array.from(updateImages).forEach((file) => formData.append('images', file));
        await axios.put(`/api/products/${productToUpdate._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.put(`/api/products/${productToUpdate._id}`, updateData);
      }
      setSuccess('Product updated!');
      setUpdateModalOpen(false);
      setProductToUpdate(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateReferences = async () => {
    setGeneratingRefs(true);
    try {
      const { data } = await axios.post('/api/admin/generate-references');
      toast({ message: data.message || 'References generated.', type: data.updated > 0 ? 'success' : 'info' });
      if (data.updated > 0) fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.error || `Error: ${err.message}`;
      toast({ message: msg, type: 'error' });
    } finally {
      setGeneratingRefs(false);
    }
  };

  const labelClasses = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2';

  return (
    <AdminShell
      eyebrow="Catalog"
      title="Products"
      description={`${products.length} timepieces in the catalog.`}
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

        {/* Add Product */}
        <AdminPanel title="Add New Product" description="All fields marked * are required.">
          <form onSubmit={handleAddProduct} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Product Name <span className="text-[#D1B23E]">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Submariner Date 40mm" className={adminInputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Brand <span className="text-[#D1B23E]">*</span></label>
                <AdminSelect
                  value={brand}
                  onChange={setBrand}
                  options={brands.map((b) => ({ value: b._id, label: b.name }))}
                  placeholder="Select brand..."
                />
              </div>
              <div>
                <label className={labelClasses}>Original Price (KD) <span className="text-[#D1B23E]">*</span></label>
                <input type="number" step="0.001" min="0" value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0.000" className={adminInputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Sale Price (KD) <span className="text-[#D1B23E]">*</span></label>
                <input type="number" step="0.001" min="0" value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="0.000" className={adminInputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Color / Dial</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black Dial, Rose Gold" className={adminInputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Availability</label>
                <div className="flex gap-3 mt-1">
                  {[{ v: true, label: 'In Stock' }, { v: false, label: 'Out of Stock' }].map(({ v, label }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="add-instock"
                        checked={inStock === v}
                        onChange={() => setInStock(v)}
                        className="accent-[#D1B23E]"
                      />
                      <span className={`text-sm font-medium ${v ? 'text-emerald-400' : 'text-red-400'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClasses}>Product Description</label>
                <textarea value={about} onChange={(e) => setAbout(e.target.value)}
                  placeholder="Movement type, case material, water resistance, complications…"
                  className={adminTextareaClasses} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClasses}>Product Images <span className="text-[#D1B23E]">*</span></label>
                <input
                  id="product-images-input"
                  type="file" multiple
                  onChange={(e) => setImages(e.target.files)}
                  className={`${adminInputClasses} file:mr-3 file:rounded-xl file:border-0 file:bg-[#D1B23E] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black cursor-pointer`}
                  accept="image/*" required
                />
              </div>
            </div>
            <div className="sticky bottom-0 -mx-5 px-5 py-3 bg-[#101010] border-t border-white/[0.06] lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:border-none">
              <button type="submit" disabled={submitting} className={adminPrimaryButtonClasses}>
                <Plus size={16} />
                {submitting ? 'Adding product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </AdminPanel>

        {/* Product Catalog */}
        <AdminPanel
          title="Product Catalog"
          description={`${filteredProducts.length} of ${products.length} timepieces`}
          action={
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
              <button
                onClick={handleGenerateReferences}
                disabled={generatingRefs}
                className={`${adminSecondaryButtonClasses} shrink-0`}
                title="Assign BTL-XXX-000 reference codes to all products that don't have one"
              >
                <Tag size={14} />
                {generatingRefs ? 'Generating…' : 'Generate References'}
              </button>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, ref, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D1B23E] transition w-full sm:w-52"
                />
              </div>
              <AdminSelect
                value={sortBy}
                onChange={setSortBy}
                size="sm"
                className="w-full sm:w-44"
                options={[
                  { value: 'name_az',    label: 'Name A–Z' },
                  { value: 'name_za',    label: 'Name Z–A' },
                  { value: 'newest',     label: 'Newest First' },
                  { value: 'oldest',     label: 'Oldest First' },
                  { value: 'price_asc',  label: 'Price: Low → High' },
                  { value: 'price_desc', label: 'Price: High → Low' },
                ]}
              />
            </div>
          }
        >
          {filteredProducts.length === 0 ? (
            <AdminEmptyState
              title={searchQuery ? 'No matching products' : 'No products yet'}
              description={searchQuery ? 'Try a different search term.' : 'Add your first product using the form above.'}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const brandName = brands.find((b) => b._id === product.brand)?.name || '';
                const isPendingDelete = pendingDeleteId === product._id;
                const isSavingAvail = savingAvailability.has(product._id);
                const sp = product.salePrice ?? product.priceKwd ?? 0;
                const op = product.originalPrice ?? product.originalPriceKwd ?? 0;
                return (
                  <div key={product._id}
                    className="flex flex-col rounded-[1.5rem] border border-white/8 bg-white/3 overflow-hidden transition-all hover:border-white/15">
                    {product.images?.[0] && (
                      <div className="bg-white h-36 flex items-center justify-center p-3">
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="max-h-full object-contain"
                          onError={(e) => (e.target.src = '/assets/images/fallback-image.webp')}
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[10px] uppercase tracking-wider text-[#D1B23E] font-bold">{brandName}</p>
                          {product.reference && (
                            <span className="text-[10px] text-[#D1B23E]/80 font-mono font-medium shrink-0">{product.reference}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white leading-snug mt-0.5 line-clamp-2">{product.name}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-white">KD {sp.toFixed(3)}</span>
                        {op > sp && (
                          <span className="text-xs text-gray-500 line-through">KD {op.toFixed(3)}</span>
                        )}
                      </div>
                      {/* Availability toggle — saves to DB before updating UI */}
                      <button
                        onClick={() => !isSavingAvail && handleAvailabilityToggle(product._id, !product.inStock)}
                        disabled={isSavingAvail}
                        className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          isSavingAvail
                            ? 'border-gray-600 bg-gray-700/30 text-gray-500 cursor-wait'
                            : product.inStock
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {isSavingAvail ? 'Saving…' : product.inStock ? '● In Stock' : '● Out of Stock'}
                      </button>
                      {product.color && (
                        <p className="text-xs text-gray-500">{product.color}</p>
                      )}
                      <div className="flex gap-2 mt-auto pt-3">
                        <button onClick={() => openUpdateModal(product)}
                          className={`${adminSecondaryButtonClasses} flex-1`}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className={isPendingDelete
                            ? 'inline-flex items-center gap-1.5 rounded-2xl border border-red-500/60 bg-red-600 px-3 py-2 text-xs font-bold text-white transition'
                            : adminDangerButtonClasses
                          }
                        >
                          <Trash2 size={14} />
                          {isPendingDelete ? 'Confirm?' : ''}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminPanel>

      </div>

      {/* Edit Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setUpdateModalOpen(false)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-[#131313] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Product</h3>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-400 transition hover:border-white/20 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Product Name <span className="text-[#D1B23E]">*</span></label>
                  <input type="text" value={updateData.name}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                    className={adminInputClasses} required />
                </div>
                <div>
                  <label className={labelClasses}>Brand</label>
                  <AdminSelect
                    value={updateData.brand}
                    onChange={(val) => setUpdateData((prev) => ({ ...prev, brand: val }))}
                    options={brands.map((b) => ({ value: b._id, label: b.name }))}
                    placeholder="Select brand..."
                  />
                </div>
                <div>
                  <label className={labelClasses}>Original Price (KD)</label>
                  <input type="number" step="0.001" min="0" value={updateData.originalPrice}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, originalPrice: e.target.value }))}
                    className={adminInputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Sale Price (KD)</label>
                  <input type="number" step="0.001" min="0" value={updateData.salePrice}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, salePrice: e.target.value }))}
                    className={adminInputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Color / Dial</label>
                  <input type="text" value={updateData.color}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, color: e.target.value }))}
                    className={adminInputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Availability</label>
                  <div className="flex gap-3 mt-1">
                    {[{ v: true, label: 'In Stock' }, { v: false, label: 'Out of Stock' }].map(({ v, label }) => (
                      <label key={label} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="edit-instock"
                          checked={updateData.inStock === v}
                          onChange={() => setUpdateData(prev => ({ ...prev, inStock: v }))}
                          className="accent-[#D1B23E]"
                        />
                        <span className={`text-sm font-medium ${v ? 'text-emerald-400' : 'text-red-400'}`}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Description</label>
                  <textarea value={updateData.about}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, about: e.target.value }))}
                    className={adminTextareaClasses} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Replace Images (optional)</label>
                  <input type="file" multiple
                    onChange={(e) => setUpdateImages(e.target.files)}
                    className={`${adminInputClasses} file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white cursor-pointer`}
                    accept="image/*" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-white/8">
                <button type="button" onClick={() => setUpdateModalOpen(false)}
                  className={adminSecondaryButtonClasses}>Cancel</button>
                <button type="submit" disabled={updating} className={adminPrimaryButtonClasses}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
