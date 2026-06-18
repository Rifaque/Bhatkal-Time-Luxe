'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import MobileLayout from '@/components/MobileLayout';

const faqs = [
  {
    question: 'What is Bhatkal Timeluxe?',
    answer: 'Bhatkal Timeluxe is a premier luxury store offering certified pre-owned and new timepieces from the world\'s most distinguished houses.',
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Currently, we ship only within India. We are working on expanding our shipping options.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for unused and undamaged products in their original packaging.',
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach us via phone, WhatsApp, or email. Visit our Contact page for details.',
  },
  {
    question: 'Are the watches authentic?',
    answer: 'Yes. Every timepiece undergoes authentication by our certified horologists — including serial number verification and movement inspection.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, bank transfer (NEFT/RTGS/IMPS), and select card arrangements coordinated through our WhatsApp concierge.',
  },
];

export default function MobileFAQView() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <MobileLayout>
      {/* Page heading */}
      <div className="px-5 pt-6 pb-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D1B23E] font-semibold mb-1">
          Client Guidance
        </p>
        <h1 className="text-2xl font-serif font-bold text-white mb-1">
          Frequently Asked Questions
        </h1>
        <div className="h-0.5 w-8 bg-[#D1B23E] mt-3" />
      </div>

      {/* Accordion */}
      <section className="px-5 pb-6">
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
      <div className="px-5 pb-6">
        <a
          href="https://wa.me/916364282251"
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
