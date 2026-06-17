'use client';

import React, { useEffect, useState } from 'react';
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

export default function TopBrandsManager() {
  const [topBrands, setTopBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchTopBrands = async () => {
    try {
      const res = await axios.get('/api/top-brands');
      setTopBrands(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load top brands');
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands');
      setBrands(res.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  };

  useEffect(() => {
    fetchTopBrands();
    fetchBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddTopBrand = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedBrand) {
      setError('Please select a brand');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(
        '/api/admin/top-brands',
        { brandId: selectedBrand.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Top brand added!');
      setSelectedBrand(null);
      fetchTopBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add top brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopBrand = async (brandId) => {
    if (pendingDeleteId !== brandId) {
      setPendingDeleteId(brandId);
      setTimeout(() => setPendingDeleteId((p) => (p === brandId ? null : p)), 3000);
      return;
    }
    setPendingDeleteId(null);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/top-brands/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Top brand removed!');
      fetchTopBrands();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove top brand');
    }
  };

  const brandOptions = brands.map((b) => ({
    value: b._id,
    label: b.name,
    logo: b.logo || '',
  }));

  const formatBrandLabel = (option) => (
    <div className="flex items-center gap-3 py-0.5">
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
        <img
          src={getImageUrl(option.logo, 'brand')}
          alt={option.label}
          className="max-h-full object-contain"
          onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
        />
      </div>
      <p className="text-sm text-white font-medium">{option.label}</p>
    </div>
  );

  const validTopBrands = topBrands.filter((i) => i.brand);

  return (
    <AdminShell
      eyebrow="Merchandising"
      title="Top Brands"
      description="Select up to three Luxury Watch Houses to feature on the homepage."
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

        <AdminPanel title="Add Top Brand" description="Choose a brand to feature in the Luxury Watch Houses section.">
          <form onSubmit={handleAddTopBrand} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Select Brand <span className="text-[#D1B23E]">*</span>
              </label>
              <Select
                options={brandOptions}
                value={selectedBrand}
                onChange={setSelectedBrand}
                placeholder="Search and select a brand..."
                isSearchable
                styles={adminSelectStyles}
                formatOptionLabel={formatBrandLabel}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !selectedBrand}
              className={adminPrimaryButtonClasses}
            >
              <Plus size={16} />
              {submitting ? 'Adding...' : 'Add Top Brand'}
            </button>
          </form>
        </AdminPanel>

        <AdminPanel
          title="Current Top Brands"
          description={`${validTopBrands.length} of 3 slots used`}
        >
          {validTopBrands.length === 0 ? (
            <AdminEmptyState
              title="No top brands selected"
              description="Add brands above to populate the Luxury Watch Houses section on the homepage."
            />
          ) : (
            <div className="space-y-2">
              {topBrands.map((item) => {
                if (!item.brand) return null;
                const isPending = pendingDeleteId === item.brand._id;
                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:border-white/15"
                  >
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(item.brand.logo, 'brand')}
                        alt={item.brand.name}
                        className="max-h-full object-contain"
                        onError={(e) => (e.target.src = '/assets/images/fallback-brand.png')}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-[#D1B23E] font-bold">Watch House</p>
                      <p className="text-sm font-semibold text-white mt-0.5">{item.brand.name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTopBrand(item.brand._id)}
                      className={isPending
                        ? 'inline-flex items-center gap-2 rounded-2xl border border-red-500/60 bg-red-600 px-4 py-3 text-sm font-bold text-white transition shrink-0'
                        : `${adminDangerButtonClasses} shrink-0`
                      }
                    >
                      <Trash2 size={14} />
                      {isPending ? 'Confirm?' : 'Remove'}
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
