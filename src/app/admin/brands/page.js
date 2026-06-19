'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { getImageUrl } from '@/lib/image';
import { Trash2, Plus, Search, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import {
  AdminShell,
  AdminPanel,
  AdminEmptyState,
  AdminSelect,
  adminInputClasses,
  adminPrimaryButtonClasses,
  adminDangerButtonClasses,
} from '../components/AdminShell';

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function BrandsManager() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(null);
  const [referencePrefix, setReferencePrefix] = useState('');
  const [prefixLockedByUser, setPrefixLockedByUser] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [customPrefixAvailable, setCustomPrefixAvailable] = useState(null);
  const [customPrefixUsedBy, setCustomPrefixUsedBy] = useState(null);
  const [checkingCustomPrefix, setCheckingCustomPrefix] = useState(false);

  // ── Feedback ────────────────────────────────────────────────────────────────
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Directory ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name_az');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [brandImpacts, setBrandImpacts] = useState({});

  const debouncedName = useDebouncedValue(name, 600);
  const debouncedCustomPrefix = useDebouncedValue(referencePrefix, 500);

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands');
      setBrands(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load brands');
    }
  };

  useEffect(() => { fetchBrands(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-suggest prefix when brand name changes
  useEffect(() => {
    if (!debouncedName.trim()) {
      setSuggestion(null);
      if (!prefixLockedByUser) setReferencePrefix('');
      return;
    }
    setLoadingSuggestion(true);
    axios.get(`/api/admin/suggest-prefix?name=${encodeURIComponent(debouncedName)}`)
      .then((res) => {
        setSuggestion(res.data);
        if (!prefixLockedByUser) {
          const best = res.data.primaryTaken ? res.data.alternative : res.data.primary;
          if (best) setReferencePrefix(best);
        }
      })
      .catch(() => setSuggestion(null))
      .finally(() => setLoadingSuggestion(false));
  }, [debouncedName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Async availability check when user types a custom prefix not matching suggestions
  useEffect(() => {
    const isMatchesSuggestion =
      suggestion && (debouncedCustomPrefix === suggestion.primary || debouncedCustomPrefix === suggestion.alternative);

    if (!debouncedCustomPrefix || debouncedCustomPrefix.length < 2 || isMatchesSuggestion) {
      setCustomPrefixAvailable(null);
      setCustomPrefixUsedBy(null);
      return;
    }

    setCheckingCustomPrefix(true);
    axios.get(`/api/admin/suggest-prefix?prefix=${encodeURIComponent(debouncedCustomPrefix)}`)
      .then((res) => {
        setCustomPrefixAvailable(res.data.available);
        setCustomPrefixUsedBy(res.data.usedBy);
      })
      .catch(() => {
        setCustomPrefixAvailable(null);
        setCustomPrefixUsedBy(null);
      })
      .finally(() => setCheckingCustomPrefix(false));
  }, [debouncedCustomPrefix, suggestion]);

  const filteredBrands = useMemo(() => {
    let result = [...brands];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.name?.toLowerCase().includes(q) || b.referencePrefix?.toLowerCase().includes(q)
      );
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
    if (!name || !logo) { setError('Please provide both a name and logo'); return; }
    const clean = referencePrefix.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length < 2) {
      setError('Reference prefix must be 2–4 uppercase letters');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('logo', logo);
    formData.append('referencePrefix', clean);
    try {
      await axios.post('/api/brands', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Brand added successfully!');
      setName('');
      setLogo(null);
      setReferencePrefix('');
      setPrefixLockedByUser(false);
      setSuggestion(null);
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
      setTimeout(() => setPendingDeleteId((p) => (p === id ? null : p)), 5000);
      // Fetch impact counts in background while admin reads the confirmation
      axios.get(`/api/admin/brand-impact?brandId=${id}`)
        .then((res) => setBrandImpacts((prev) => ({ ...prev, [id]: res.data })))
        .catch(() => {});
      return;
    }
    // Confirmed — optimistic removal then server call
    setPendingDeleteId(null);
    setBrandImpacts((prev) => { const s = { ...prev }; delete s[id]; return s; });
    setError('');
    setSuccess('');
    setBrands((prev) => prev.filter((b) => b._id !== id));
    try {
      await axios.delete(`/api/brands/${id}`);
      setSuccess('Brand deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete brand');
      fetchBrands(); // rollback on failure
    }
  };

  // Resolved availability for the current prefix value
  const prefixStatus = (() => {
    if (!referencePrefix || referencePrefix.length < 2) return null;
    if (suggestion) {
      if (referencePrefix === suggestion.primary) {
        return suggestion.primaryTaken
          ? { ok: false, label: `Used by ${suggestion.primaryTaken}` }
          : { ok: true, label: 'Available' };
      }
      if (referencePrefix === suggestion.alternative) {
        return suggestion.alternativeTaken
          ? { ok: false, label: `Used by ${suggestion.alternativeTaken}` }
          : { ok: true, label: 'Available' };
      }
    }
    if (checkingCustomPrefix) return { ok: null, label: 'Checking…' };
    if (customPrefixAvailable === true) return { ok: true, label: 'Available' };
    if (customPrefixAvailable === false) return { ok: false, label: `Used by ${customPrefixUsedBy || 'another brand'}` };
    return null;
  })();

  const directoryToolbar = (
    <div className="flex gap-3 items-center flex-wrap">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search brands…"
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

        {/* ── Add Brand Form ─────────────────────────────────────────────── */}
        <AdminPanel title="Add New Brand" description="Upload a brand logo (PNG/WebP with transparency works best).">
          <form onSubmit={handleAddBrand} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Brand Name <span className="text-[#D1B23E]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!e.target.value.trim()) setPrefixLockedByUser(false);
                  }}
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
            </div>

            {/* Reference Prefix — auto-populated, inline availability */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Reference Prefix <span className="text-[#D1B23E]">*</span>
                <span className="ml-2 normal-case text-gray-600 font-normal tracking-normal">
                  2–4 letters · used in product codes, e.g. RLX → BTL-RLX-001
                </span>
              </label>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={referencePrefix}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
                      setReferencePrefix(val);
                      setPrefixLockedByUser(true);
                      setCustomPrefixAvailable(null);
                      setCustomPrefixUsedBy(null);
                    }}
                    placeholder={loadingSuggestion ? 'Suggesting…' : 'e.g. RLX'}
                    maxLength={4}
                    className={`${adminInputClasses} w-28 font-mono tracking-widest text-center`}
                    required
                  />
                  {prefixStatus && (
                    prefixStatus.ok === null ? (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 size={11} className="animate-spin" /> {prefixStatus.label}
                      </span>
                    ) : prefixStatus.ok ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={11} /> {prefixStatus.label}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <AlertTriangle size={11} /> {prefixStatus.label}
                      </span>
                    )
                  )}
                  {loadingSuggestion && !prefixStatus && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" /> Suggesting…
                    </span>
                  )}
                </div>

                {/* Alternative chip — only when primary was auto-applied */}
                {suggestion && !loadingSuggestion && referencePrefix === suggestion.primary && !suggestion.primaryTaken && suggestion.alternative && suggestion.alternative !== suggestion.primary && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Alt:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReferencePrefix(suggestion.alternative);
                        setPrefixLockedByUser(true);
                      }}
                      disabled={!!suggestion.alternativeTaken}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                        suggestion.alternativeTaken
                          ? 'border-red-500/20 text-red-400/50 bg-red-500/5 cursor-not-allowed line-through'
                          : 'border-white/15 text-gray-400 bg-white/3 hover:border-[#D1B23E]/30 hover:text-[#D1B23E] cursor-pointer'
                      }`}
                      title={suggestion.alternativeTaken ? `In use by ${suggestion.alternativeTaken}` : `Use ${suggestion.alternative} instead`}
                    >
                      {suggestion.alternative}
                      {suggestion.alternativeTaken && <span className="ml-1 text-[9px]">taken</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={submitting} className={adminPrimaryButtonClasses}>
              <Plus size={16} />
              {submitting ? 'Adding brand…' : 'Add Brand'}
            </button>
          </form>
        </AdminPanel>

        {/* ── Brand Directory ───────────────────────────────────────────── */}
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
                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold text-white">{brand.name}</p>
                      {brand.referencePrefix ? (
                        <p className="text-[10px] text-gray-500 font-mono">
                          Prefix: <span className="text-[#D1B23E] font-semibold">{brand.referencePrefix}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-600 italic">No prefix</p>
                      )}
                    </div>
                    {isPendingDelete && brandImpacts[brand._id] && (() => {
                      const imp = brandImpacts[brand._id];
                      const curations = [
                        imp.featuredProducts > 0 && `${imp.featuredProducts} featured`,
                        imp.bestSellingProducts > 0 && `${imp.bestSellingProducts} best-selling`,
                        imp.inTopBrands && 'top brand',
                      ].filter(Boolean);
                      return (
                        <div className="text-center space-y-0.5 w-full">
                          <p className="text-[10px] text-red-400 font-medium">
                            Will delete {imp.products} product{imp.products !== 1 ? 's' : ''}
                          </p>
                          {curations.length > 0 && (
                            <p className="text-[10px] text-amber-400/80">{curations.join(' · ')} removed</p>
                          )}
                          {imp.orderCount > 0 && (
                            <p className="text-[10px] text-amber-400/80">{imp.orderCount} order{imp.orderCount !== 1 ? 's' : ''} reference this brand</p>
                          )}
                        </div>
                      );
                    })()}
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
