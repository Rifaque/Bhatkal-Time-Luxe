'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import MobileLayout from '@/components/MobileLayout';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { faqs } from '@/lib/faq-data';

export default function MobileFAQView() {
  const [openIndex, setOpenIndex] = useState(null);
  const { whatsappNumber } = useStoreSettings();

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <MobileLayout>
      {/* Page heading */}
      <div className="px-5 pt-6 pb-5 lg:max-w-2xl lg:mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-1">
          Client Guidance
        </p>
        <h1 className="text-2xl font-serif font-bold text-white mb-1">
          Frequently Asked Questions
        </h1>
        <div className="h-0.5 w-8 bg-[#D1B23E] mt-3" />
      </div>

      {/* Accordion */}
      <section className="px-5 pb-6 lg:max-w-2xl lg:mx-auto">
        <div className="divide-y divide-white/5">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex items-start justify-between py-4 gap-3 text-left"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <h3 className="text-sm font-semibold font-serif text-white leading-snug">
                  {faq.question}
                </h3>
                {openIndex === i ? (
                  <ChevronUp size={16} className="text-[#D1B23E] shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown size={16} className="text-[#D1B23E] shrink-0 mt-0.5" />
                )}
              </button>
              {openIndex === i && (
                <p className="pb-4 text-sm text-gray-400 font-serif leading-relaxed animate-fade-in">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Concierge CTA */}
      <div className="px-5 pb-6 lg:max-w-2xl lg:mx-auto">
        <a
          href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '/contact'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#D1B23E] text-black font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-all"
        >
          <FaWhatsapp size={16} />
          Chat with Concierge
        </a>
      </div>
    </MobileLayout>
  );
}
