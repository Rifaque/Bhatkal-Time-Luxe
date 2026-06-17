'use client';

import Link from 'next/link';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Gem,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Tags,
  Users,
} from 'lucide-react';

const navigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { href: '/admin/products', label: 'Products', icon: Package, group: 'Catalog' },
  { href: '/admin/brands', label: 'Brands', icon: Gem, group: 'Catalog' },
  { href: '/admin/categories', label: 'Categories', icon: Tags, group: 'Catalog' },
  { href: '/admin/featured', label: 'Featured', icon: Sparkles, group: 'Merchandising' },
  { href: '/admin/best-selling', label: 'Best Selling', icon: Star, group: 'Merchandising' },
  { href: '/admin/top-brands', label: 'Top Brands', icon: Shield, group: 'Merchandising' },
  { href: '/admin/orders', label: 'Orders', icon: Receipt, group: 'Operations' },
  { href: '/admin/users', label: 'Users', icon: Users, group: 'Operations' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, group: 'Operations' },
];

export const adminInputClasses =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus:border-[#D1B23E] focus:bg-white/7 focus:outline-none';

export const adminTextareaClasses = `${adminInputClasses} min-h-32 resize-y`;
export const adminCheckboxClasses =
  'h-4 w-4 rounded border border-white/15 bg-white/5 text-[#D1B23E] focus:ring-2 focus:ring-[#D1B23E] focus:ring-offset-0';
export const adminPrimaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D1B23E] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#e0c45b] disabled:cursor-not-allowed disabled:opacity-60';
export const adminSecondaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#D1B23E]/40 hover:bg-white/10';
export const adminDangerButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/20';

export const adminSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: state.isFocused ? '#D1B23E' : 'rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    boxShadow: 'none',
    minHeight: '50px',
    paddingInline: '0.35rem',
    '&:hover': {
      borderColor: '#D1B23E',
    },
  }),
  input: (base) => ({
    ...base,
    color: '#fff',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#fff',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#7f8596',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    overflow: 'hidden',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgba(209,178,62,0.18)' : '#141414',
    color: '#fff',
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgba(209,178,62,0.15)',
    borderRadius: '999px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#f8e3a0',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#f8e3a0',
    ':hover': {
      backgroundColor: 'rgba(209,178,62,0.25)',
      color: '#fff',
    },
  }),
};

export function AdminShell({ eyebrow, title, description, actions, statStrip, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navSearch, setNavSearch] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const filteredNavigation = useMemo(() => {
    if (!navSearch.trim()) {
      return navigation;
    }

    const query = navSearch.trim().toLowerCase();
    return navigation.filter((item) => item.label.toLowerCase().includes(query));
  }, [navSearch]);

  const groupedNavigation = useMemo(() => {
    return filteredNavigation.reduce((groups, item) => {
      groups[item.group] = groups[item.group] || [];
      groups[item.group].push(item);
      return groups;
    }, {});
  }, [filteredNavigation]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post('/api/admin/logout');
    } catch (error) {
      console.error('Logout API call failed', error);
    } finally {
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(209,178,62,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_20%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="w-full shrink-0 rounded-[2rem] border border-white/8 bg-[#121212]/95 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[296px] lg:overflow-hidden">
          <div className="flex h-full flex-col gap-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#D1B23E]">Bhatkal Time Luxe</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Admin Console</h1>
                </div>
                <Link
                  href="/"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-[#D1B23E]/40 hover:text-white"
                  title="Back to storefront"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </div>

              <label className="relative block">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="search"
                  value={navSearch}
                  onChange={(event) => setNavSearch(event.target.value)}
                  placeholder="Search admin sections"
                  className={`${adminInputClasses} pl-11`}
                />
              </label>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
              {Object.entries(groupedNavigation).map(([group, items]) => (
                <div key={group} className="space-y-2">
                  <p className="px-2 text-[10px] uppercase tracking-[0.28em] text-gray-500">{group}</p>
                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm transition ${
                            isActive
                              ? 'bg-[#D1B23E] text-black shadow-[0_16px_30px_rgba(209,178,62,0.28)]'
                              : 'text-gray-300 hover:bg-white/6 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon size={17} />
                            <span className="font-medium">{item.label}</span>
                          </span>
                          <ArrowUpRight size={14} className={isActive ? 'opacity-90' : 'opacity-30'} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-red-400/30 hover:bg-red-500/10 disabled:opacity-60"
            >
              <LogOut size={16} />
              {loggingOut ? 'Signing out...' : 'Logout'}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-[2rem] border border-white/8 bg-[#101010]/95 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
          <header className="border-b border-white/6 pb-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-3">
                {eyebrow ? (
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#D1B23E]">{eyebrow}</p>
                ) : null}
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
                  {description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">{description}</p>
                  ) : null}
                </div>
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
            </div>

            {statStrip ? <div className="mt-6">{statStrip}</div> : null}
          </header>

          <div className="pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminStatCard({ icon: Icon, label, value, meta }) {
  return (
    <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D1B23E]/14 text-[#D1B23E]">
            <Icon size={20} />
          </div>
        ) : null}
      </div>
      {meta ? <p className="mt-4 text-sm text-gray-400">{meta}</p> : null}
    </div>
  );
}

export function AdminPanel({ title, description, action, children, className = '' }) {
  return (
    <section
      className={`rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.3)] ${className}`}
    >
      {(title || description || action) ? (
        <div className="mb-5 flex flex-col gap-3 border-b border-white/6 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-gray-400">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap items-center gap-3">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminBadge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/5 text-gray-300',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
    danger: 'border-red-500/20 bg-red-500/10 text-red-200',
    gold: 'border-[#D1B23E]/20 bg-[#D1B23E]/12 text-[#f2dd87]',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function AdminEmptyState({ title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 px-6 py-10 text-center">
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-400">{description}</p>
    </div>
  );
}
