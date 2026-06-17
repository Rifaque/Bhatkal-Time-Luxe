'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { getImageUrl } from '@/lib/image';
import { Plus, Trash2, Pencil, X, Search } from 'lucide-react';
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

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [MRP, setMRP] = useState('');
  const [price, setPrice] = useState('');
  const [inStock, setInStock] = useState(true);
  const [color, setColor] = useState('');
  const [about, setAbout] = useState('');
  const [images, setImages] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name_az');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);
  const [updateData, setUpdateData] = useState({
    name: '', brand: '', MRP: '', price: '', inStock: true, color: '', about: '',
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

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [fetchProducts, fetchBrands]);

  useEffect(() => {
    if (brands.length > 0 && !brand) setBrand(brands[0]._id);
  }, [brands, brand]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        brands.find((b) => b._id === p.brand)?.name?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case 'oldest': return new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0);
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'name_za': return b.name.localeCompare(a.name);
        case 'name_az':
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [products, brands, searchQuery, sortBy]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !brand || !MRP || !price || images.length === 0) {
      setError('Please fill in all required fields and upload at least one image.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('MRP', MRP);
    formData.append('price', price);
    formData.append('inStock', inStock);
    formData.append('color', color);
    formData.append('about', about);
    Array.from(images).forEach((file) => formData.append('images', file));
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      setSuccess('Product added successfully!');
      setName(''); setBrand(brands[0]?._id || ''); setMRP(''); setPrice('');
      setInStock(true); setColor(''); setAbout(''); setImages([]);
      const fileInput = document.getElementById('product-images-input');
      if (fileInput) fileInput.value = '';
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
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Product deleted.');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const openUpdateModal = (product) => {
    setProductToUpdate(product);
    setUpdateData({
      name: product.name,
      brand: product.brand,
      MRP: product.MRP,
      price: product.price,
      inStock: product.inStock,
      color: product.color,
      about: product.about,
    });
    setUpdateImages(null);
    setUpdateModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (updateImages && updateImages.length > 0) {
        const formData = new FormData();
        Object.entries(updateData).forEach(([k, v]) => formData.append(k, v));
        Array.from(updateImages).forEach((file) => formData.append('images', file));
        await axios.put(`/api/products/${productToUpdate._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.put(`/api/products/${productToUpdate._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const labelClasses = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2';

  const catalogToolbar = (
    <div className="flex gap-3 items-center flex-wrap">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D1B23E] transition w-44"
        />
      </div>
      <AdminSelect
        value={sortBy}
        onChange={setSortBy}
        size="sm"
        className="w-44"
        options={[
          { value: 'name_az', label: 'Name A–Z' },
          { value: 'name_za', label: 'Name Z–A' },
          { value: 'newest', label: 'Newest First' },
          { value: 'oldest', label: 'Oldest First' },
          { value: 'price_asc', label: 'Price: Low → High' },
          { value: 'price_desc', label: 'Price: High → Low' },
        ]}
      />
    </div>
  );

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

        {/* Add Product Form */}
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
                <label className={labelClasses}>MRP (₹) <span className="text-[#D1B23E]">*</span></label>
                <input type="number" value={MRP} onChange={(e) => setMRP(e.target.value)}
                  placeholder="0" className={adminInputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Sale Price (₹) <span className="text-[#D1B23E]">*</span></label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="0" className={adminInputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Color / Dial</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black Dial, Rose Gold" className={adminInputClasses} />
              </div>
              <div>
                <label className={labelClasses}>In Stock</label>
                <AdminSelect
                  value={String(inStock)}
                  onChange={(val) => setInStock(val === 'true')}
                  options={[
                    { value: 'true', label: 'Yes — Available' },
                    { value: 'false', label: 'No — Out of Stock' },
                  ]}
                />
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
                  type="file"
                  multiple
                  onChange={(e) => setImages(e.target.files)}
                  className={`${adminInputClasses} file:mr-3 file:rounded-xl file:border-0 file:bg-[#D1B23E] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black cursor-pointer`}
                  accept="image/*"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={submitting} className={adminPrimaryButtonClasses}>
              <Plus size={16} />
              {submitting ? 'Adding product...' : 'Add Product'}
            </button>
          </form>
        </AdminPanel>

        {/* Product Catalog */}
        <AdminPanel
          title="Product Catalog"
          description={`${filteredProducts.length} of ${products.length} timepieces`}
          action={catalogToolbar}
        >
          {filteredProducts.length === 0 ? (
            <AdminEmptyState
              title={searchQuery ? 'No matching products' : 'No products yet'}
              description={searchQuery ? 'Try a different search term.' : 'Add your first product using the form above.'}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const brandName = brands.find((b) => b._id === product.brand)?.name || product.brand;
                const isPendingDelete = pendingDeleteId === product._id;
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-[#D1B23E] font-bold">{brandName}</p>
                          <p className="text-sm font-semibold text-white leading-snug mt-0.5 line-clamp-2">{product.name}</p>
                        </div>
                        <AdminBadge tone={product.inStock ? 'success' : 'danger'}>
                          {product.inStock ? 'In Stock' : 'OOS'}
                        </AdminBadge>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-base font-bold text-white">₹{new Intl.NumberFormat('en-IN').format(product.price)}</span>
                        {product.MRP > product.price && (
                          <span className="text-xs text-gray-500 line-through">₹{new Intl.NumberFormat('en-IN').format(product.MRP)}</span>
                        )}
                      </div>
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

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setUpdateModalOpen(false)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-[#131313] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.7)]" onClick={(e) => e.stopPropagation()}>
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
                  <input type="text" name="name" value={updateData.name}
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
                  <label className={labelClasses}>MRP (₹)</label>
                  <input type="number" value={updateData.MRP}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, MRP: e.target.value }))}
                    className={adminInputClasses} required />
                </div>
                <div>
                  <label className={labelClasses}>Sale Price (₹)</label>
                  <input type="number" value={updateData.price}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, price: e.target.value }))}
                    className={adminInputClasses} required />
                </div>
                <div>
                  <label className={labelClasses}>Color / Dial</label>
                  <input type="text" value={updateData.color}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, color: e.target.value }))}
                    className={adminInputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>In Stock</label>
                  <AdminSelect
                    value={String(updateData.inStock)}
                    onChange={(val) => setUpdateData((prev) => ({ ...prev, inStock: val === 'true' }))}
                    options={[
                      { value: 'true', label: 'Yes — Available' },
                      { value: 'false', label: 'No — Out of Stock' },
                    ]}
                  />
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
                  className={adminSecondaryButtonClasses}>
                  Cancel
                </button>
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
