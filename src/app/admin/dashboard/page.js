'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  AdminShell,
  AdminStatCard,
  AdminPanel,
} from '../components/AdminShell';
import { Package, Gem, Sparkles, Star, Shield, ArrowRight } from 'lucide-react';

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
  const [availability, setAvailability] = useState({ inStock: '—', outOfStock: '—' });

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
        const prods = resProducts.data;
        setCounts({
          brands: resBrands.data.length,
          products: prods.length,
          featured: resFeatured.data.length,
          bestSelling: resBestSelling.data.length,
          topBrands: resTopBrands.data.length,
        });
        setAvailability({
          inStock:    prods.filter((p) => p.inStock !== false).length,
          outOfStock: prods.filter((p) => p.inStock === false).length,
        });
      } catch (err) {
        console.error('Failed to fetch counts', err);
      }
    }
    fetchCounts();
  }, []);

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

        {/* Availability Summary */}
        <AdminPanel title="Availability" description="In-stock status across the product catalog.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5">
              <Package size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-emerald-500/70 font-semibold">In Stock</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{availability.inStock}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3.5">
              <Package size={18} className="text-red-400 shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-red-500/70 font-semibold">Out of Stock</p>
                <p className="text-xl font-bold text-red-400 mt-0.5">{availability.outOfStock}</p>
              </div>
            </div>
          </div>
        </AdminPanel>

      </div>
    </AdminShell>
  );
}
