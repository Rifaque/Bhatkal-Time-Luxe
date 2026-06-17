'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Tag, ShoppingCart, ChevronDown, Menu, Search, ChevronUp } from 'lucide-react';
import btimehome from '@/assets/images/btimehome.webp';
import { Button } from '@/components/ui/button';
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';

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
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="!bg-[#1e1e1e] text-white min-h-screen pb-20">
      {/* Header */}
      <header className="flex justify-between items-center p-2 border-b border-white/5">
        <Button variant="ghost" className="mt-2" onClick={() => setMenuOpen(true)}>
          <Menu size={28} className="text-[#D1B23E]" />
        </Button>
        <Image
          src={btimehome}
          alt="Bhatkal Timeluxe Logo"
          className="h-14 w-auto cursor-pointer"
          onClick={() => router.push('/')}
        />
        <Button variant="ghost" className="mt-2" onClick={() => router.push('/search')}>
          <Search size={24} className="text-[#D1B23E]" />
        </Button>
      </header>

      <div className="px-4 pt-8 pb-4">
        <span className="text-[10px] uppercase tracking-widest text-[#D1B23E] font-bold block">Client Guidance</span>
        <h1 className="text-2xl font-serif font-bold mt-1 mb-1">Frequently Asked Questions</h1>
        <div className="h-0.5 w-10 bg-[#D1B23E] mb-6" />
      </div>

      <section className="px-4 space-y-0">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-white/5">
            <button
              className="w-full flex justify-between items-center py-4 text-left gap-3"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-sm font-semibold font-serif text-white leading-snug">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp size={18} className="text-[#D1B23E] shrink-0" />
              ) : (
                <ChevronDown size={18} className="text-[#D1B23E] shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <p className="pb-4 text-sm text-gray-400 font-serif leading-relaxed animate-fade-in">{faq.answer}</p>
            )}
          </div>
        ))}
      </section>

      <div className="px-4 mt-8">
        <a
          href="https://wa.me/916364282251"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#D1B23E] text-black font-semibold py-3.5 rounded-xl text-sm"
        >
          <FaWhatsapp size={18} /> Chat with Concierge
        </a>
      </div>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/916364282251"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 right-3 z-50 bg-[#1e1e1e] border border-white/10 p-4 rounded-full shadow-lg"
      >
        <FaWhatsapp size={22} style={{ color: '#D1B23E' }} />
      </a>

      <nav className="fixed bottom-0 w-full bg-[#1E1E1E] border-t border-white/5 flex justify-around py-2 z-40">
        <Button variant="ghost" className="flex flex-col items-center text-[#D1B23E]" onClick={() => router.push('/')}>
          <Home size={22} />
        </Button>
        <Button variant="ghost" className="flex flex-col items-center text-[#D1B23E]" onClick={() => router.push('/brands')}>
          <Tag size={22} />
        </Button>
        <Button variant="ghost" className="flex flex-col items-center text-[#D1B23E]" onClick={() => router.push('/cart')}>
          <ShoppingCart size={22} />
        </Button>
      </nav>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
