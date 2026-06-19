'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import axios from 'axios';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function AdminLogin() {
  const router = useRouter();
  const { storeName } = useStoreSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/admin/login', { username, password });
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#D1B23E] transition';

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(209,178,62,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_30%)]" />

      {/* Card */}
      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl border border-white/8 bg-[#121212] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.6)]">

          {/* Branding */}
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-2">
              Admin Console
            </p>
            <h1 className="text-2xl font-serif font-bold text-white">
              {storeName}
            </h1>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Authorized access to the management platform.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
                placeholder="admin"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-11`}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#D1B23E] text-black font-bold py-3.5 rounded-2xl text-sm transition hover:bg-[#e0c45b] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Security indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <Lock size={11} className="text-gray-700" />
            <span className="text-[11px] text-gray-700">Protected Management Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
