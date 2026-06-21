'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  AdminShell,
  AdminStatCard,
  AdminPanel,
  AdminBadge,
  AdminEmptyState,
} from '../components/AdminShell';
import {
  Package,
  Gem,
  Sparkles,
  Star,
  Shield,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';

const quickActions = [
  { label: 'Manage Products', href: '/admin/products', icon: Package },
  { label: 'Manage Brands', href: '/admin/brands', icon: Gem },
  { label: 'Featured Items', href: '/admin/featured', icon: Sparkles },
  { label: 'Best Selling', href: '/admin/best-selling', icon: Star },
  { label: 'Top Brands', href: '/admin/top-brands', icon: Shield },
];

const STATUS_TONE = {
  pending:          'warning',
  awaiting_payment: 'warning',
  paid:             'success',
  processing:       'default',
  packed:           'default',
  shipped:          'gold',
  delivered:        'success',
  cancelled:        'danger',
  refunded:         'danger',
};

function formatKWD(val) {
  if (!val && val !== 0) return '—';
  return `KD ${Number(val).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const router = useRouter();

  const [counts, setCounts] = useState({
    brands: '—', products: '—', featured: '—', bestSelling: '—', topBrands: '—',
  });
  const [availability, setAvailability] = useState({ inStock: '—', outOfStock: '—' });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [resBrands, resProducts, resFeatured, resBestSelling, resTopBrands, resAnalytics] =
          await Promise.all([
            axios.get('/api/brands'),
            axios.get('/api/products'),
            axios.get('/api/featured'),
            axios.get('/api/best-selling'),
            axios.get('/api/top-brands'),
            axios.get('/api/admin/analytics'),
          ]);

        const prods = resProducts.data;
        setCounts({
          brands:      resBrands.data.length,
          products:    prods.length,
          featured:    resFeatured.data.length,
          bestSelling: resBestSelling.data.length,
          topBrands:   resTopBrands.data.length,
        });
        setAvailability({
          inStock:    prods.filter((p) => p.inStock !== false).length,
          outOfStock: prods.filter((p) => p.inStock === false).length,
        });
        setAnalytics(resAnalytics.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    }
    fetchAll();
  }, []);

  return (
    <AdminShell
      eyebrow="Overview"
      title="Dashboard"
      description="Business performance, catalog metrics, and recent activity."
      statStrip={
        <div className="space-y-4">
          {/* Business metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <AdminStatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={analytics ? analytics.totalOrders : '—'}
            />
            <AdminStatCard
              icon={DollarSign}
              label="Total Revenue"
              value={analytics ? formatKWD(analytics.totalRevenue) : '—'}
            />
            <AdminStatCard
              icon={Clock}
              label="Pending Orders"
              value={analytics ? analytics.pendingOrders : '—'}
            />
            <AdminStatCard
              icon={TrendingUp}
              label="Today's Orders"
              value={analytics ? analytics.todayOrders : '—'}
            />
          </div>
          {/* Catalog metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            <AdminStatCard icon={Package}   label="Products"     value={counts.products} />
            <AdminStatCard icon={Gem}       label="Brands"       value={counts.brands} />
            <AdminStatCard icon={Sparkles}  label="Featured"     value={counts.featured} />
            <AdminStatCard icon={Star}      label="Best Selling" value={counts.bestSelling} />
            <AdminStatCard icon={Shield}    label="Top Brands"   value={counts.topBrands} />
          </div>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Recent Orders */}
        <AdminPanel
          title="Recent Orders"
          description="Last 10 orders by date."
          action={
            <button
              onClick={() => router.push('/admin/orders')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D1B23E] hover:underline"
            >
              View All Orders <ArrowRight size={13} />
            </button>
          }
        >
          {!analytics || analytics.recentOrders.length === 0 ? (
            <AdminEmptyState title="No orders yet" description="Orders will appear here once customers start checking out." />
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 border-b border-white/6">
                    <th className="pb-3 pr-4 font-semibold">Order</th>
                    <th className="pb-3 pr-4 font-semibold">Customer</th>
                    <th className="pb-3 pr-4 font-semibold">Items</th>
                    <th className="pb-3 pr-4 font-semibold">Total</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {analytics.recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => router.push(`/admin/orders?orderId=${order._id}`)}
                      className="group cursor-pointer hover:bg-white/[0.025] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-[#D1B23E]">
                          {order.orderId || String(order._id).slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">
                        {order.customer?.name || <span className="text-gray-600 italic">Anonymous</span>}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">
                        {order.items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0} item
                        {(order.items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-white">
                        {formatKWD(order.totalKwd ?? order.total)}
                      </td>
                      <td className="py-3 pr-4">
                        <AdminBadge tone={STATUS_TONE[order.orderStatus] || 'default'}>
                          {order.orderStatus?.replace(/_/g, ' ')}
                        </AdminBadge>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminPanel>

        {/* Top Selling Products + Orders Last 7 Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Selling Products */}
          <AdminPanel title="Top Selling Products" description="Ranked by order count.">
            {!analytics || analytics.topProducts.length === 0 ? (
              <AdminEmptyState title="No data" description="Products with completed orders will appear here." />
            ) : (
              <ol className="space-y-3">
                {analytics.topProducts.map((product, idx) => (
                  <li
                    key={product._id}
                    onClick={() => router.push(`/admin/products?search=${encodeURIComponent(product.name)}`)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <span className="shrink-0 w-6 text-[11px] font-bold text-gray-600 text-right">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-[#D1B23E] transition-colors">
                        {product.name}
                      </p>
                      {product.brand?.name && (
                        <p className="text-[11px] text-gray-500">{product.brand.name}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-[#D1B23E]">
                      {product.orderCount} order{product.orderCount !== 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </AdminPanel>

          {/* Orders Last 7 Days */}
          <AdminPanel title="Orders — Last 7 Days" description="Daily order count and revenue.">
            {!analytics || analytics.dailyOrders.length === 0 ? (
              <AdminEmptyState title="No recent orders" description="Orders placed in the last 7 days will appear here." />
            ) : (
              <div className="space-y-2">
                {analytics.dailyOrders.map((day) => (
                  <div
                    key={day._id}
                    className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {new Date(day._id + 'T00:00:00').toLocaleDateString('en', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {day.count} order{day.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#D1B23E]">
                      {formatKWD(day.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AdminPanel>

        </div>

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
