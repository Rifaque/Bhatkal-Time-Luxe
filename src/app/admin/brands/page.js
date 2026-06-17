'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { getImageUrl } from '@/lib/image';
import { Trash2, Plus, Search } from 'lucide-react';
import {
  AdminShell,
  AdminPanel,
  AdminEmptyState,
  AdminSelect,
  adminInputClasses,
  adminPrimaryButtonClasses,
  adminDangerButtonClasses,
} from '../components/AdminShell';

export default function BrandsManager() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name_az');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands');
      setBrands(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredBrands = useMemo(() => {
    let result = [...brands];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => b.name?.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'name_za': return b.name.localeCompare(a.name);
        case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'name_az':
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [brands, searchQuery, sortBy]);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !logo) {
      setError('Please provide both a name and logo');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('logo', logo);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      setSuccess('Brand added successfully!');
      setName('');
      setLogo(null);
      const fileInput = document.getElementById('logo-file-input');
      if (fileInput) fileInput.value = '';
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id) => {
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
      await axios.delete(`/api/brands/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Brand deleted successfully!');
      fetchBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete brand');
    }
  };

  const directoryToolbar = (
    <div className="flex gap-3 items-center flex-wrap">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D1B23E] transition w-40"
        />
      </div>
      <AdminSelect
        value={sortBy}
        onChange={setSortBy}
        size="sm"
        className="w-36"
        options={[
          { value: 'name_az', label: 'Name A–Z' },
          { value: 'name_za', label: 'Name Z–A' },
          { value: 'newest', label: 'Newest First' },
          { value: 'oldest', label: 'Oldest First' },
        ]}
      />
    </div>
  );

  return (
    <AdminShell
      eyebrow="Catalog"
      title="Brands"
      description="Add and manage watch houses. Deleting a brand removes all its associated products."
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

        {/* Add Brand Form */}
        <AdminPanel title="Add New Brand" description="Upload a brand logo (PNG/WebP with transparency works best).">
          <form onSubmit={handleAddBrand} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Brand Name <span className="text-[#D1B23E]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rolex, Omega, Seiko"
                className={adminInputClasses}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Logo File <span className="text-[#D1B23E]">*</span>
              </label>
              <input
                id="logo-file-input"
                type="file"
                onChange={(e) => setLogo(e.target.files[0])}
                className={`${adminInputClasses} file:mr-3 file:rounded-xl file:border-0 file:bg-[#D1B23E] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black cursor-pointer`}
                accept="image/*"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className={adminPrimaryButtonClasses}
              >
                <Plus size={16} />
                {submitting ? 'Adding brand...' : 'Add Brand'}
              </button>
            </div>
          </form>
        </AdminPanel>

        {/* Brand Directory */}
        <AdminPanel
          title="Brand Directory"
          description={`${filteredBrands.length} of ${brands.length} ${brands.length === 1 ? 'brand' : 'brands'}`}
          action={directoryToolbar}
        >
          {filteredBrands.length === 0 ? (
            <AdminEmptyState
              title={searchQuery ? 'No matching brands' : 'No brands yet'}
              description={searchQuery ? 'Try a different search term.' : 'Add your first watch brand using the form above.'}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredBrands.map((brand) => {
                const isPendingDelete = pendingDeleteId === brand._id;
                return (
                  <div
                    key={brand._id}
                    className="group flex flex-col items-center gap-3 rounded-[1.5rem] border border-white/8 bg-white/3 p-5 transition-all hover:border-white/15 hover:bg-white/6"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white p-3 shadow-md">
                      <img
                        src={getImageUrl(brand.logo, 'brand')}
                        alt={brand.name}
                        className="h-full w-full object-contain"
                        onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
                      />
                    </div>
                    <p className="text-center text-sm font-semibold text-white">{brand.name}</p>
                    <button
                      onClick={() => handleDeleteBrand(brand._id)}
                      className={isPendingDelete
                        ? 'inline-flex items-center gap-1.5 rounded-2xl border border-red-500/60 bg-red-600 px-3 py-2 text-xs font-bold text-white transition'
                        : adminDangerButtonClasses
                      }
                    >
                      <Trash2 size={14} />
                      {isPendingDelete ? 'Confirm?' : 'Delete'}
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
