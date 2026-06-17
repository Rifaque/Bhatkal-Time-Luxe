'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  AdminShell,
  AdminStatCard,
  AdminPanel,
  adminDangerButtonClasses,
} from '../components/AdminShell';
import AdminLogs from '../components/AdminLogs';
import { Package, Gem, Sparkles, Star, Shield, Trash2, ArrowRight } from 'lucide-react';

const quickActions = [
  { label: 'Manage Products', href: '/admin/products', icon: Package },
  { label: 'Manage Brands', href: '/admin/brands', icon: Gem },
  { label: 'Featured Items', href: '/admin/featured', icon: Sparkles },
  { label: 'Best Selling', href: '/admin/best-selling', icon: Star },
  { label: 'Top Brands', href: '/admin/top-brands', icon: Shield },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({
    brands: '—',
    products: '—',
    featured: '—',
    bestSelling: '—',
    topBrands: '—',
  });
  const [cleanupResult, setCleanupResult] = useState(null);
  const [cleanupError, setCleanupError] = useState(null);
  const [cleanupDisabled, setCleanupDisabled] = useState(false);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [resBrands, resProducts, resFeatured, resBestSelling, resTopBrands] = await Promise.all([
          axios.get('/api/brands'),
          axios.get('/api/products'),
          axios.get('/api/featured'),
          axios.get('/api/best-selling'),
          axios.get('/api/top-brands'),
        ]);
        setCounts({
          brands: resBrands.data.length,
          products: resProducts.data.length,
          featured: resFeatured.data.length,
          bestSelling: resBestSelling.data.length,
          topBrands: resTopBrands.data.length,
        });
      } catch (err) {
        console.error('Failed to fetch counts', err);
      }
    }
    fetchCounts();
  }, []);

  const handleCleanup = async () => {
    setCleanupResult(null);
    setCleanupError(null);
    setCleanupDisabled(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.post(
        '/api/admin/cleanup-images',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCleanupResult(res.data);
    } catch (err) {
      setCleanupError(err.response?.data?.error || 'Cleanup failed');
    } finally {
      setTimeout(() => setCleanupDisabled(false), 30000);
    }
  };

  return (
    <AdminShell
      eyebrow="Overview"
      title="Dashboard"
      description="Monitor your catalog, curations, and operational metrics from one place."
      statStrip={
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          <AdminStatCard icon={Package} label="Products" value={counts.products} />
          <AdminStatCard icon={Gem} label="Brands" value={counts.brands} />
          <AdminStatCard icon={Sparkles} label="Featured" value={counts.featured} />
          <AdminStatCard icon={Star} label="Best Selling" value={counts.bestSelling} />
          <AdminStatCard icon={Shield} label="Top Brands" value={counts.topBrands} />
        </div>
      }
    >
      <div className="space-y-6">

        {/* Quick Actions */}
        <AdminPanel
          title="Quick Actions"
          description="Jump to frequently used management sections."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3.5 text-sm font-medium text-gray-300 transition-all hover:border-[#D1B23E]/40 hover:bg-white/8 hover:text-white group"
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} className="text-[#D1B23E]" />
                  {label}
                </span>
                <ArrowRight
                  size={14}
                  className="opacity-30 group-hover:opacity-90 group-hover:translate-x-0.5 transition-all"
                />
              </button>
            ))}
          </div>
        </AdminPanel>

        {/* Image Cleanup */}
        <AdminPanel
          title="Image Cleanup"
          description="Remove orphaned images from Cloudinary that are no longer linked to any product or brand."
          action={
            <button
              onClick={handleCleanup}
              disabled={cleanupDisabled}
              className={`${adminDangerButtonClasses} ${cleanupDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <Trash2 size={15} />
              {cleanupDisabled ? 'Please wait 30s…' : 'Run Cleanup'}
            </button>
          }
        >
          {cleanupResult && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm text-emerald-200 space-y-1">
              <p className="font-medium">{cleanupResult.message}</p>
              {cleanupResult.deletedFiles?.length > 0 && (
                <p className="text-xs text-emerald-300/70">
                  Deleted: {cleanupResult.deletedFiles.join(', ')}
                </p>
              )}
              <p className="text-xs text-emerald-300/70">Total removed: {cleanupResult.count}</p>
            </div>
          )}
          {cleanupError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-200">
              {cleanupError}
            </div>
          )}
          {!cleanupResult && !cleanupError && (
            <p className="text-sm text-gray-500">
              No cleanup has been run this session. Use the button above to scan and remove orphaned media assets.
            </p>
          )}
        </AdminPanel>

        {/* Activity Log */}
        <AdminPanel title="Recent Activity" description="Changelog entries from your admin operations.">
          <AdminLogs />
        </AdminPanel>

      </div>
    </AdminShell>
  );
}
