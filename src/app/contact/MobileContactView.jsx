'use client';

import { Phone, Mail, MapPin, Clock, ShieldCheck, Package, Star, MessageSquare, HelpCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import MobileLayout from '@/components/MobileLayout';
import { useStoreSettings } from '@/context/StoreSettingsContext';
const SERVICES = [
  { icon: Star, label: 'Watch Consultation', desc: 'Expert guidance on selecting your perfect timepiece.' },
  { icon: Package, label: 'Order Assistance', desc: 'Track, modify, or resolve any order-related concern.' },
  { icon: MessageSquare, label: 'Product Inquiries', desc: 'Availability, specifications, and collection details.' },
  { icon: HelpCircle, label: 'Authentication', desc: 'Verified certificates for every piece we sell.' },
];

export default function MobileContactView() {
  const { supportPhone, whatsappNumber, supportEmail, businessAddress } = useStoreSettings();

  const waHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '/contact';

  return (
    <MobileLayout>
      {/* Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-2">
          Personal Assistance
        </p>
        <h1 className="text-2xl font-serif font-bold text-white leading-snug">Concierge Contact</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed font-serif">
          Dedicated specialists available for acquisitions, appraisals, and private inquiries.
        </p>
      </div>

      {/* Quick Contact Actions */}
      <section className="px-5 pt-5 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-600 font-semibold">Reach Us Directly</p>

        {/* WhatsApp — primary */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-[#25D366]/8 border border-[#25D366]/20 rounded-2xl p-4 active:scale-[0.98] transition-all"
        >
          <div className="p-2.5 bg-[#25D366]/15 rounded-xl shrink-0">
            <FaWhatsapp size={20} style={{ color: '#25D366' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">WhatsApp Concierge</p>
            <p className="text-sm font-semibold text-white mt-0.5">Chat with a Specialist</p>
            <p className="text-[11px] text-[#25D366] mt-0.5 font-medium">Fastest response · 9 AM – 8 PM IST</p>
          </div>
          <div className="shrink-0">
            <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          </div>
        </a>

        {supportPhone && (
          <a
            href={`tel:${supportPhone}`}
            className="flex items-center gap-4 bg-[#171717] border border-white/5 rounded-2xl p-4 active:scale-[0.98] transition-all hover:border-[#D1B23E]/20"
          >
            <div className="p-2.5 bg-[#D1B23E]/10 rounded-xl shrink-0">
              <Phone size={18} className="text-[#D1B23E]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Direct Line</p>
              <p className="text-sm font-semibold text-white mt-0.5">{supportPhone}</p>
            </div>
          </a>
        )}

        {supportEmail && (
          <a
            href={`mailto:${supportEmail}`}
            className="flex items-center gap-4 bg-[#171717] border border-white/5 rounded-2xl p-4 active:scale-[0.98] transition-all hover:border-[#D1B23E]/20"
          >
            <div className="p-2.5 bg-[#D1B23E]/10 rounded-xl shrink-0">
              <Mail size={18} className="text-[#D1B23E]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-sm font-semibold text-white mt-0.5 truncate">{supportEmail}</p>
            </div>
          </a>
        )}
      </section>

      {/* Store Info Grid */}
      <section className="px-5 pt-5">
        <div className={`grid gap-3 ${businessAddress ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {businessAddress && (
            <div className="bg-[#171717] border border-white/5 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-[#D1B23E]">
                <MapPin size={13} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Location</span>
              </div>
              <p className="text-xs text-gray-300 font-serif leading-relaxed whitespace-pre-line">
                {businessAddress}
              </p>
            </div>
          )}
          <div className="bg-[#171717] border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[#D1B23E]">
              <Clock size={13} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Hours</span>
            </div>
            <p className="text-xs text-gray-300 font-serif leading-relaxed">
              Mon – Sun<br />9:00 AM – 8:00 PM IST
            </p>
          </div>
        </div>
      </section>

      {/* How We Help */}
      <section className="px-5 pt-5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-600 font-semibold mb-3">How We Help</p>
        <div className="space-y-2.5">
          {SERVICES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 bg-[#171717] border border-white/5 rounded-xl p-3.5">
              <div className="p-1.5 bg-[#D1B23E]/10 rounded-lg shrink-0 mt-0.5">
                <Icon size={14} className="text-[#D1B23E]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Confidentiality note */}
      <section className="px-5 pt-4">
        <div className="flex items-start gap-3 bg-[#D1B23E]/5 border border-[#D1B23E]/15 rounded-2xl p-4">
          <ShieldCheck size={16} className="text-[#D1B23E] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 font-serif leading-relaxed">
            All client communications are strictly confidential. High-value acquisition inquiries handled with complete discretion.
          </p>
        </div>
      </section>

    </MobileLayout>
  );
}
