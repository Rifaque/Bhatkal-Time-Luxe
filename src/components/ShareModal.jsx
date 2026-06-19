'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { FaWhatsapp, FaTwitter, FaTelegram, FaFacebook, FaEnvelope } from 'react-icons/fa';
import { getImageUrl } from '@/lib/image';

const SHARE_OPTS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`,
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    icon: FaTwitter,
    color: '#e7e9ea',
    href: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: 'telegram',
    label: 'Telegram',
    icon: FaTelegram,
    color: '#2AABEE',
    href: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'email',
    label: 'Email',
    icon: FaEnvelope,
    color: '#D1B23E',
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent('Check out this watch')}&body=${encodeURIComponent(text + '\n\n' + url)}`,
  },
];

export default function ShareModal({ product, onClose }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (configuredOrigin) {
      setUrl(configuredOrigin + window.location.pathname);
    } else {
      setUrl(window.location.href);
    }
  }, []);

  const refLabel = product.reference ? ` (${product.reference})` : '';
  const shareText = `${product.name}${refLabel}${product.brand?.name ? ` by ${product.brand.name}` : ''} — a premium timepiece from Bhatkal Time Luxe`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const open = (opt) => {
    window.open(opt.href(url, shareText), '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal — bottom sheet on mobile, centered on md+ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share this product"
        className="fixed inset-x-0 bottom-0 z-[151] bg-[#171717] border-t border-white/10 rounded-t-3xl md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] md:rounded-3xl md:border overflow-hidden shadow-2xl"
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 md:pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Share2 size={15} className="text-[#D1B23E]" />
            <p className="text-sm font-semibold text-white">Share Timepiece</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/8 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Product preview */}
        {(product.images?.[0] || product.image) && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-[#0f0f0f] border-b border-white/5">
            <div className="w-10 h-10 bg-[#f0eeea] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={getImageUrl(product.images?.[0] || product.image)}
                alt=""
                className="w-full h-full object-contain p-1"
                onError={(e) => { e.target.src = '/assets/images/fallback-image.webp'; }}
              />
            </div>
            <div className="min-w-0">
              {product.brand?.name && (
                <p className="text-[10px] text-[#D1B23E] font-semibold uppercase tracking-widest truncate">
                  {product.brand.name}
                </p>
              )}
              <p className="text-sm font-semibold text-white truncate">{product.name}</p>
            </div>
          </div>
        )}

        {/* Platform buttons */}
        <div className="grid grid-cols-5 gap-2 px-5 py-5">
          {SHARE_OPTS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => open(opt)}
              className="flex flex-col items-center gap-2 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
            >
              <opt.icon size={20} style={{ color: opt.color }} />
              <span className="text-[9px] text-gray-500 font-medium text-center leading-tight">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <div className="px-5 pb-6">
          <div className="flex items-center gap-2 bg-[#0f0f0f] border border-white/8 rounded-2xl px-3.5 py-2.5">
            <span className="flex-1 text-xs text-gray-600 truncate font-mono">{url}</span>
            <button
              onClick={copyLink}
              className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                copied
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-[#D1B23E]/10 text-[#D1B23E] hover:bg-[#D1B23E]/20'
              }`}
            >
              {copied ? (
                <><Check size={11} />Copied</>
              ) : (
                <><Copy size={11} />Copy</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
