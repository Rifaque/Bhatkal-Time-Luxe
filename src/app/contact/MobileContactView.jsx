'use client';

import { Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import MobileLayout from '@/components/MobileLayout';

const PHONE_NUMBER = '+916364282251';
const WHATSAPP_LINK = 'https://wa.me/916364282251';

export default function MobileContactView() {
  return (
    <MobileLayout>
      {/* Page heading */}
      <div className="px-5 pt-6 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-1">
          Personal Assistance
        </p>
        <h1 className="text-2xl font-serif font-bold text-white mb-1">Contact Us</h1>
        <div className="h-0.5 w-8 bg-[#D1B23E] mt-3" />
      </div>

      {/* Contact cards */}
      <section className="px-5 space-y-3 pb-6">
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="flex items-center gap-4 bg-[#171717] border border-white/5 rounded-2xl p-4 hover:border-white/10 active:scale-[0.98] transition-all"
        >
          <div className="p-2.5 bg-[#D1B23E]/10 rounded-xl shrink-0">
            <Phone size={18} className="text-[#D1B23E]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Phone</p>
            <p className="text-sm font-semibold text-white mt-0.5">{PHONE_NUMBER}</p>
          </div>
        </a>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-[#171717] border border-white/5 rounded-2xl p-4 hover:border-white/10 active:scale-[0.98] transition-all"
        >
          <div className="p-2.5 bg-[#25D366]/10 rounded-xl shrink-0">
            <FaWhatsapp size={18} style={{ color: '#25D366' }} />
          </div>
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">WhatsApp</p>
            <p className="text-sm font-semibold text-white mt-0.5">Chat with Concierge</p>
          </div>
        </a>

        <a
          href="/apk/btimeluxe.apk"
          download="btimeluxe.apk"
          className="flex items-center justify-center gap-2 w-full bg-[#D1B23E] text-black font-semibold py-3.5 rounded-2xl text-sm mt-2 active:scale-[0.98] transition-all"
        >
          Download App (APK)
        </a>
      </section>
    </MobileLayout>
  );
}
