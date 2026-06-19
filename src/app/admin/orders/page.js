'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt, Search, Trash2, Eye, CheckCircle2, MessageCircle, ArrowLeft,
} from 'lucide-react';
import axios from 'axios';
import {
  AdminShell,
  AdminEmptyState,
  AdminSelect,
  adminInputClasses,
  adminTextareaClasses,
  adminPrimaryButtonClasses,
  adminDangerButtonClasses,
} from '../components/AdminShell';
import { useToast } from '@/context/ToastContext';

const ORDER_STATUSES = [
  { value: 'pending',          label: 'Pending',          color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { value: 'awaiting_payment', label: 'Awaiting Payment', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { value: 'paid',             label: 'Paid',             color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'processing',       label: 'Processing',       color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'packed',           label: 'Packed',           color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { value: 'shipped',          label: 'Shipped',          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { value: 'delivered',        label: 'Delivered',        color: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20' },
  { value: 'cancelled',        label: 'Cancelled',        color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { value: 'refunded',         label: 'Refunded',         color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
];

const PAYMENT_STATUSES = [
  { value: 'pending',         label: 'Pending' },
  { value: 'partially_paid',  label: 'Partially Paid' },
  { value: 'paid',            label: 'Paid' },
  { value: 'failed',          label: 'Failed' },
  { value: 'refunded',        label: 'Refunded' },
];

function StatusBadge({ status }) {
  const s = ORDER_STATUSES.find((x) => x.value === status) || ORDER_STATUSES[0];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}

function getSmartScore(order) {
  let score = 0;
  if (order.adminApproved) score += 100;
  if (order.paymentStatus === 'paid' && !['delivered', 'cancelled', 'refunded'].includes(order.orderStatus)) score += 60;
  if (order.orderStatus === 'pending') score += 30;
  if (!order.viewCount || order.viewCount === 0) score += 20;
  const hoursAgo = (Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60);
  score += Math.max(0, 24 - hoursAgo);
  return score;
}

const fmt = (n) => `KD ${Number(n || 0).toFixed(3)}`;

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const labelClasses = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2';

function OrderSkeletonRow() {
  return (
    <div className="px-5 py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-2">
          <div className="sk h-2.5 w-20 rounded" />
          <div className="sk h-4 w-32 rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="sk h-4 w-16 rounded ml-auto" />
          <div className="sk h-2.5 w-10 rounded ml-auto" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="sk h-5 w-20 rounded-full" />
        <div className="sk h-2.5 w-14 rounded" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSelectOrder = async (order) => {
    setSelected(order);
    setEditForm({
      customer: {
        name: '', phone: '', email: '', address: '', city: '', state: '', country: '',
        ...(order.customer || {}),
      },
      orderStatus: order.orderStatus || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      paymentMethod: order.paymentMethod || '',
      trackingNumber: order.trackingNumber || '',
      internalNotes: order.internalNotes || '',
      adminApproved: order.adminApproved || false,
    });
    try {
      await axios.post(`/api/admin/orders/${order._id}/view`, {});
      setOrders((prev) => prev.map((o) =>
        o._id === order._id ? { ...o, viewCount: (o.viewCount || 0) + 1 } : o
      ));
    } catch { /* silently fail */ }
  };

  const handleInstantSave = async (updates) => {
    if (!selected) return;
    const toastLabel =
      'orderStatus' in updates ? `Status → ${updates.orderStatus}` :
      'paymentStatus' in updates ? `Payment → ${updates.paymentStatus}` :
      updates.adminApproved ? 'Order Approved' : 'Approval Removed';
    setEditForm((prev) => ({ ...prev, ...updates }));
    setOrders((prev) => prev.map((o) => o._id === selected._id ? { ...o, ...updates } : o));
    try {
      await axios.patch(`/api/admin/orders/${selected._id}`, updates);
      toast({ message: toastLabel, type: 'success' });
    } catch {
      toast({ message: 'Failed to save', type: 'error' });
      fetchOrders();
    }
  };

  const handleSave = async () => {
    if (!selected || !editForm) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/api/admin/orders/${selected._id}`, editForm);
      setSuccess('Order updated successfully.');
      setOrders((prev) => prev.map((o) =>
        o._id === selected._id ? { ...o, ...editForm } : o
      ));
      setSelected((prev) => ({ ...prev, ...editForm }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      setTimeout(() => setPendingDeleteId((p) => (p === id ? null : p)), 3000);
      return;
    }
    setPendingDeleteId(null);
    setError('');
    setOrders((prev) => prev.filter((o) => o._id !== id));
    if (selected?._id === id) {
      setSelected(null);
      setEditForm(null);
    }
    try {
      await axios.delete(`/api/admin/orders/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete order');
      fetchOrders();
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.orderId?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.phone?.includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o._id?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const byNewest = new Date(b.createdAt) - new Date(a.createdAt);
      switch (sortBy) {
        case 'smart':       return getSmartScore(b) - getSmartScore(a);
        case 'newest':      return byNewest;
        case 'oldest':      return new Date(a.createdAt) - new Date(b.createdAt);
        case 'approved':    return (b.adminApproved ? 1 : 0) - (a.adminApproved ? 1 : 0) || byNewest;
        case 'pending':     return (b.orderStatus === 'pending' ? 1 : 0) - (a.orderStatus === 'pending' ? 1 : 0) || byNewest;
        case 'paid':        return (b.paymentStatus === 'paid' ? 1 : 0) - (a.paymentStatus === 'paid' ? 1 : 0) || byNewest;
        case 'unpaid':      return (a.paymentStatus === 'paid' ? 1 : 0) - (b.paymentStatus === 'paid' ? 1 : 0) || byNewest;
        case 'shipped':     return (b.orderStatus === 'shipped' ? 1 : 0) - (a.orderStatus === 'shipped' ? 1 : 0) || byNewest;
        case 'delivered':   return (b.orderStatus === 'delivered' ? 1 : 0) - (a.orderStatus === 'delivered' ? 1 : 0) || byNewest;
        case 'most_viewed': return (b.viewCount || 0) - (a.viewCount || 0);
        case 'total_desc':  return (b.total || 0) - (a.total || 0);
        case 'total_asc':   return (a.total || 0) - (b.total || 0);
        default:            return 0;
      }
    });

  const panelBase = 'rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] overflow-hidden flex flex-col';

  return (
    <AdminShell
      eyebrow="Operations"
      title="Order Management"
      description={`${orders.length} total order${orders.length !== 1 ? 's' : ''}`}
    >
      <div className="space-y-4">
        {(error || success) && (
          <div className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
            error
              ? 'border-red-500/20 bg-red-500/8 text-red-200'
              : 'border-emerald-500/20 bg-emerald-500/8 text-emerald-200'
          }`}>
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:items-start">

          {/* ── Left: Order List ── */}
          <div className={`lg:col-span-2 flex-col gap-0 ${selected ? 'hidden lg:flex' : 'flex'}`}>
            <div className={panelBase}>
              {/* Toolbar */}
              <div className="px-4 py-3.5 border-b border-white/6 shrink-0">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${adminInputClasses} pl-9 py-2`}
                    />
                  </div>
                  <AdminSelect
                    value={sortBy}
                    onChange={setSortBy}
                    size="sm"
                    className="w-32 shrink-0"
                    options={[
                      { value: 'newest',      label: 'Recent' },
                      { value: 'smart',       label: 'Smart' },
                      { value: 'oldest',      label: 'Oldest' },
                      { value: 'approved',    label: 'Approved' },
                      { value: 'pending',     label: 'Pending' },
                      { value: 'paid',        label: 'Paid' },
                      { value: 'unpaid',      label: 'Unpaid' },
                      { value: 'shipped',     label: 'Shipped' },
                      { value: 'delivered',   label: 'Delivered' },
                      { value: 'most_viewed', label: 'Most Viewed' },
                      { value: 'total_desc',  label: 'Highest Value' },
                      { value: 'total_asc',   label: 'Lowest Value' },
                    ]}
                  />
                </div>
              </div>

              {/* Order rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 lg:max-h-[calc(100vh-310px)] min-h-[300px]">
                {loading ? (
                  <>
                    {[...Array(6)].map((_, i) => <OrderSkeletonRow key={i} />)}
                  </>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-8">
                    <AdminEmptyState
                      title="No orders found"
                      description="Orders appear here once customers check out."
                    />
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <button
                      key={order._id}
                      onClick={() => handleSelectOrder(order)}
                      className={`w-full text-left px-5 py-4 transition-all hover:bg-white/5 ${
                        selected?._id === order._id
                          ? 'bg-[#D1B23E]/8 border-l-2 border-[#D1B23E]'
                          : 'border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-[#D1B23E] font-bold">
                            {order.orderId || `#${order._id.slice(-6)}`}
                          </p>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            {order.customer?.name || 'Anonymous'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">{fmt(order.totalKwd ?? order.total ?? 0)}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={order.orderStatus || 'pending'} />
                        <div className="flex items-center gap-2">
                          {(order.viewCount || 0) > 0 && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Eye size={10} />{order.viewCount}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Order Detail ── */}
          <div className={`lg:col-span-3 ${!selected ? 'hidden lg:block' : 'block'}`}>
            {!selected ? (
              <div className={`${panelBase} min-h-[400px] items-center justify-center p-12 text-center gap-4`}>
                <Receipt size={48} className="text-gray-600" />
                <div>
                  <p className="text-white font-semibold text-lg">Select an Order</p>
                  <p className="text-gray-500 text-sm mt-1">Click an order from the list to view and manage details.</p>
                </div>
              </div>
            ) : (
              <div className={panelBase}>
                {/* Mobile back button */}
                <button
                  type="button"
                  onClick={() => { setSelected(null); setEditForm(null); }}
                  className="lg:hidden flex items-center gap-2 px-6 pt-5 pb-1 text-sm font-medium text-[#D1B23E] hover:text-[#e0c45b] transition"
                >
                  <ArrowLeft size={16} />
                  Back to Orders
                </button>

                {/* Fixed detail header */}
                <div className="px-6 py-5 border-b border-white/8 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#D1B23E] font-bold">
                        {selected.orderId || `Order #${selected._id.slice(-6)}`}
                      </p>
                      <p className="text-xl font-semibold text-white mt-0.5">{fmt(selected.totalKwd ?? selected.total ?? 0)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(selected.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleInstantSave({ adminApproved: !editForm.adminApproved })}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition ${
                          editForm?.adminApproved
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-[#D1B23E]/30'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        {editForm?.adminApproved ? 'Approved' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDelete(selected._id)}
                        className={
                          pendingDeleteId === selected._id
                            ? 'inline-flex items-center gap-2 rounded-2xl border border-red-500/60 bg-red-600 px-3.5 py-2 text-xs font-bold text-white transition'
                            : `${adminDangerButtonClasses} py-2 px-3.5 text-xs`
                        }
                      >
                        <Trash2 size={14} />
                        {pendingDeleteId === selected._id ? 'Confirm?' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrollable detail body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 lg:max-h-[calc(100vh-390px)] min-h-[300px]">
                  {/* Order Items */}
                  <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <h4 className={`${labelClasses} mb-3`}>Order Items</h4>
                    <div className="space-y-2.5">
                      {selected.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-start gap-3 text-sm">
                          <div className="min-w-0">
                            <span className="text-white font-medium">{item.name}</span>
                            {item.brand && (
                              <span className="text-gray-500 ml-1.5 text-xs">({item.brand})</span>
                            )}
                          </div>
                          <div className="text-right shrink-0 text-gray-300 whitespace-nowrap">
                            ×{item.quantity} — {fmt((item.priceKwd ?? item.price ?? 0) * item.quantity)}
                          </div>
                        </div>
                      ))}
                      <div className="pt-2.5 border-t border-white/8 flex justify-between font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-[#D1B23E]">{fmt(selected.totalKwd ?? selected.total ?? 0)}</span>
                      </div>
                    </div>
                  </div>

                  {editForm && (
                    <>
                      {/* Status + Logistics */}
                      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 space-y-4">
                        <h4 className={labelClasses}>Status &amp; Logistics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClasses}>Order Status</label>
                            <AdminSelect
                              value={editForm.orderStatus}
                              onChange={(val) => handleInstantSave({ orderStatus: val })}
                              options={ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>Payment Status</label>
                            <AdminSelect
                              value={editForm.paymentStatus}
                              onChange={(val) => handleInstantSave({ paymentStatus: val })}
                              options={PAYMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>Payment Method</label>
                            <input
                              type="text"
                              value={editForm.paymentMethod}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                              placeholder="WhatsApp, UPI, Bank Transfer..."
                              className={adminInputClasses}
                            />
                          </div>
                          <div>
                            <label className={labelClasses}>Tracking Number</label>
                            <input
                              type="text"
                              value={editForm.trackingNumber}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                              placeholder="Courier tracking ID"
                              className={adminInputClasses}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 space-y-4">
                        <h4 className={labelClasses}>Customer Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            ['name', 'Name', 'Customer name'],
                            ['phone', 'Phone', 'Phone number'],
                            ['email', 'Email', 'Email address'],
                            ['city', 'City', 'City'],
                          ].map(([field, label, placeholder]) => (
                            <div key={field}>
                              <label className={labelClasses}>{label}</label>
                              <input
                                type={field === 'email' ? 'email' : 'text'}
                                value={editForm.customer[field]}
                                onChange={(e) => setEditForm((prev) => ({
                                  ...prev,
                                  customer: { ...prev.customer, [field]: e.target.value },
                                }))}
                                className={adminInputClasses}
                                placeholder={placeholder}
                              />
                            </div>
                          ))}
                          <div className="sm:col-span-2">
                            <label className={labelClasses}>Address</label>
                            <input
                              type="text"
                              value={editForm.customer.address}
                              onChange={(e) => setEditForm((prev) => ({
                                ...prev,
                                customer: { ...prev.customer, address: e.target.value },
                              }))}
                              className={adminInputClasses}
                              placeholder="Shipping address"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div>
                        <label className={labelClasses}>Internal Notes</label>
                        <textarea
                          value={editForm.internalNotes}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, internalNotes: e.target.value }))}
                          placeholder="Private notes visible to admin only..."
                          className={adminTextareaClasses}
                          rows={3}
                        />
                      </div>

                      {/* Save */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className={adminPrimaryButtonClasses}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        {selected.orderId && (
                          <span className="inline-flex items-center gap-2 text-xs text-gray-500 font-mono px-4 py-3 border border-white/8 rounded-2xl">
                            <MessageCircle size={14} className="text-[#D1B23E]" />
                            {selected.orderId}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminShell>
  );
}
