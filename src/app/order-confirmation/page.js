'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Truck, MessageCircle, RotateCcw, Clock } from 'lucide-react';
import DesktopNavbar from '@/components/DesktopNavbar';
import DesktopFooter from '@/components/DesktopFooter';
import MobileLayout from '@/components/MobileLayout';
import useIsDesktop from '@/hooks/useIsDesktop';
import { useCurrency } from '@/context/CurrencyContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';

function ConfirmationCard({ orderId, total }) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { whatsappNumber } = useStoreSettings();
  const kwdTotal = total ? parseFloat(total) : null;
  const formattedTotal = kwdTotal && Number.isFinite(kwdTotal) ? formatPrice(kwdTotal) : null;

  const waFallbackUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I placed an order and my Order ID is: ${orderId || 'N/A'}. Please confirm my order.`)}`
    : null;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Icon */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#D1B23E]/15 blur-2xl scale-150" />
          <div className="relative h-24 w-24 rounded-full bg-[#D1B23E]/12 border border-[#D1B23E]/25 flex items-center justify-center">
            <CheckCircle2 size={48} className="text-[#D1B23E]" />
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-3">Order Confirmed</p>
        <h1 className="text-3xl font-serif font-bold text-white mb-3">Thank You for Your Order</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          Your order is reserved. Our concierge team will message you on WhatsApp to confirm payment and arrange delivery.
        </p>
      </div>

      {/* Order details card */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-4 space-y-4">
        {orderId && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Order Reference</span>
            <span className="font-mono font-semibold text-white tracking-wide">{orderId}</span>
          </div>
        )}
        {formattedTotal && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Order Total</span>
            <span className="text-xl font-bold text-[#D1B23E]">{formattedTotal}</span>
          </div>
        )}
        <div className="pt-3 border-t border-white/6 flex items-start gap-2.5 text-xs text-emerald-400">
          <Clock size={14} className="shrink-0 mt-0.5" />
          <span>Our team responds within 2 hours · Available 9AM–9PM AST, 7 days a week</span>
        </div>
      </div>

      {/* What happens next */}
      <div className="rounded-2xl border border-[#D1B23E]/15 bg-[#D1B23E]/5 px-5 py-4 mb-4 space-y-2.5">
        <p className="text-xs font-bold text-[#D1B23E] uppercase tracking-wider mb-3">What happens next</p>
        {[
          'Our concierge contacts you on WhatsApp to confirm your order',
          'We share payment options (KNET, bank transfer, or card)',
          'Your timepiece is dispatched with full insurance cover',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
            <span className="shrink-0 w-4 h-4 rounded-full bg-[#D1B23E]/20 text-[#D1B23E] font-bold flex items-center justify-center text-[9px] mt-0.5">{i + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {/* WhatsApp fallback */}
      {waFallbackUrl && (
        <div className="rounded-2xl border border-white/6 bg-white/2 px-5 py-4 mb-4 flex items-center gap-3">
          <MessageCircle size={16} className="text-[#25D366] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">WhatsApp not opened automatically?</p>
          </div>
          <a
            href={waFallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs font-semibold text-[#25D366] hover:text-[#20c45a] border border-[#25D366]/30 hover:border-[#25D366]/60 px-3 py-1.5 rounded-xl transition-colors"
          >
            Open WhatsApp
          </a>
        </div>
      )}

      {/* Trust strip */}
      <div className="rounded-2xl border border-white/6 bg-white/2 px-5 py-4 mb-8 space-y-3">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <ShieldCheck size={15} className="text-[#D1B23E] shrink-0" />
          <span>Authenticity certificate included with every timepiece</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <Truck size={15} className="text-[#D1B23E] shrink-0" />
          <span>Complimentary fully insured shipping to your door</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <RotateCcw size={15} className="text-[#D1B23E] shrink-0" />
          <span>7-day returns accepted — contact us within 7 days of delivery</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/')}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D1B23E] px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#e0c45b] active:scale-[0.98]"
      >
        Continue Shopping
      </button>
    </div>
  );
}

function DesktopConfirmation({ orderId, total }) {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      <DesktopNavbar />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <ConfirmationCard orderId={orderId} total={total} />
      </main>
      <DesktopFooter />
    </div>
  );
}

function MobileConfirmation({ orderId, total }) {
  return (
    <MobileLayout hideFAB>
      <div className="flex items-center justify-center px-5 py-10 min-h-[calc(100vh-8rem)]">
        <ConfirmationCard orderId={orderId} total={total} />
      </div>
    </MobileLayout>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');

  if (isDesktop === null) return null;
  return isDesktop
    ? <DesktopConfirmation orderId={orderId} total={total} />
    : <MobileConfirmation orderId={orderId} total={total} />;
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#D1B23E]/30 border-t-[#D1B23E] animate-spin" />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
