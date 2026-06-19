'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, Key, MessageCircle, Save, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import {
  AdminShell,
  AdminPanel,
  AdminBadge,
  adminInputClasses,
  adminPrimaryButtonClasses,
  adminTextareaClasses,
} from '../components/AdminShell';
import { CURRENCIES } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [storeForm, setStoreForm] = useState({
    storeName: '', supportEmail: '', supportPhone: '', whatsappNumber: '', businessAddress: '',
  });
  const [storeSaving, setStoreSaving] = useState(false);
  const [ratesMeta, setRatesMeta] = useState(null);
  const [liveRates, setLiveRates] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await axios.get('/api/admin/settings');
        const s = res.data;
        setStoreForm({
          storeName: s.storeName || '',
          supportEmail: s.supportEmail || '',
          supportPhone: s.supportPhone || '',
          whatsappNumber: s.whatsappNumber || '',
          businessAddress: s.businessAddress || '',
        });
        // Fetch exchange rate meta separately (public endpoint)
        try {
          const ratesRes = await axios.get('/api/currency-rates');
          if (ratesRes.data.rates) {
            setLiveRates(ratesRes.data.rates);
            setRatesMeta({
              fetchedAt: ratesRes.data.fetchedAt,
              source:    ratesRes.data.source,
              status:    ratesRes.data.status,
            });
          }
        } catch { /* non-critical */ }
      } catch {
        toast({ message: 'Failed to load settings', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function refreshRates() {
    setRefreshing(true);
    try {
      const res = await axios.post('/api/admin/exchange-rates/refresh', {});
      setLiveRates(res.data.rates);
      setRatesMeta({ fetchedAt: res.data.fetchedAt, source: res.data.source, status: 'ok' });
      toast({ message: 'Exchange rates refreshed successfully', type: 'success' });
    } catch {
      toast({ message: 'Failed to refresh rates. Check your internet connection.', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  }

  async function saveSection(fields, setSaving) {
    setSaving(true);
    try {
      await axios.patch('/api/admin/settings', fields);
      toast({ message: 'Settings saved', type: 'success' });
    } catch {
      toast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell eyebrow="Operations" title="Settings" description="Store configuration and operational preferences.">
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Loading settings…</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      eyebrow="Operations"
      title="Settings"
      description="Store configuration, inventory preferences, and currency information."
    >
      <div className="space-y-6">

        {/* Store Information */}
        <AdminPanel
          title="Store Information"
          description="Contact details and branding shown in order communications."
          action={
            <button
              onClick={() => saveSection(storeForm, setStoreSaving)}
              disabled={storeSaving}
              className={adminPrimaryButtonClasses}
            >
              <Save size={15} />
              {storeSaving ? 'Saving…' : 'Save'}
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Store Name</label>
              <input
                className={adminInputClasses}
                value={storeForm.storeName}
                onChange={(e) => setStoreForm((p) => ({ ...p, storeName: e.target.value }))}
                placeholder="Bhatkal Time Luxe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Support Email</label>
              <input
                type="email"
                className={adminInputClasses}
                value={storeForm.supportEmail}
                onChange={(e) => setStoreForm((p) => ({ ...p, supportEmail: e.target.value }))}
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Support Phone</label>
              <input
                className={adminInputClasses}
                value={storeForm.supportPhone}
                onChange={(e) => setStoreForm((p) => ({ ...p, supportPhone: e.target.value }))}
                placeholder="+965 xxxx xxxx"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">WhatsApp Number</label>
              <input
                className={adminInputClasses}
                value={storeForm.whatsappNumber}
                onChange={(e) => setStoreForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
                placeholder="96512345678"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Business Address</label>
              <textarea
                className={adminTextareaClasses}
                style={{ minHeight: '5rem' }}
                value={storeForm.businessAddress}
                onChange={(e) => setStoreForm((p) => ({ ...p, businessAddress: e.target.value }))}
                placeholder="Kuwait City, Kuwait"
              />
            </div>
          </div>
        </AdminPanel>

        {/* Currency Management */}
        <AdminPanel
          title="Currency Management"
          description="Live exchange rates fetched daily from open.er-api.com and cached in the database."
          action={
            <button
              onClick={refreshRates}
              disabled={refreshing}
              className={adminPrimaryButtonClasses}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh Rates'}
            </button>
          }
        >
          <div className="space-y-4">
            {/* Status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[#D1B23E]/20 bg-[#D1B23E]/5 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#D1B23E]/70 mb-1">Base Currency</p>
                <p className="text-sm font-bold text-white">KWD — Kuwaiti Dinar</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm font-semibold text-white">
                  {ratesMeta?.fetchedAt
                    ? new Date(ratesMeta.fetchedAt).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Never'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Rate Source</p>
                <p className="text-sm font-semibold text-white">{ratesMeta?.source ?? 'Static fallback'}</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  {!ratesMeta ? (
                    <><Clock size={13} className="text-gray-500" /><span className="text-sm font-semibold text-gray-400">No data</span></>
                  ) : ratesMeta.status === 'ok' ? (
                    <><CheckCircle2 size={13} className="text-emerald-400" /><span className="text-sm font-semibold text-emerald-400">Live</span></>
                  ) : (
                    <><AlertCircle size={13} className="text-yellow-400" /><span className="text-sm font-semibold text-yellow-400">Stale</span></>
                  )}
                </div>
              </div>
            </div>

            {/* Rate table */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Active Exchange Rates {liveRates ? <span className="text-emerald-500 normal-case font-normal">(live)</span> : <span className="text-gray-600 normal-case font-normal">(static fallback)</span>}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.values(CURRENCIES).map((curr) => {
                  const rate = liveRates?.[curr.code] ?? curr.rate;
                  return (
                    <div key={curr.code} className="flex items-center justify-between gap-2 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-white">{curr.code}</span>
                        <span className="text-xs text-gray-600 ml-1.5">{curr.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono shrink-0">
                        1 KD = {rate.toFixed(curr.decimals)} {curr.symbol}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </AdminPanel>

        {/* System Integrations (read-only) */}
        <AdminPanel title="System Integrations">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Globe, label: 'MongoDB Atlas', note: 'Database connected' },
              { icon: Key, label: 'Cloudinary', note: 'Image CDN active' },
              { icon: MessageCircle, label: 'WhatsApp', note: 'Checkout enabled' },
            ].map(({ icon: Icon, label, note }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4">
                <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-green-500/10 text-green-400 shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

      </div>
    </AdminShell>
  );
}
