'use client';

import { useRouter } from 'next/navigation';
import { Search, Home, Tag, Menu, ShoppingCart, Phone, MessageSquare } from 'lucide-react';
import btimehome from '@/assets/images/btimehome.webp';
import { Button } from '@/components/ui/button';
import HamburgerMenu from '@/components/HamburgerMenu';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';

const PHONE_NUMBER = '+916364282251';
const WHATSAPP_LINK = 'https://wa.me/916364282251';

export default function MobileContactView() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <span className="text-[10px] uppercase tracking-widest text-[#D1B23E] font-bold block">Personal Assistance</span>
        <h1 className="text-2xl font-serif font-bold mt-1 mb-1">Contact Us</h1>
        <div className="h-0.5 w-10 bg-[#D1B23E] mb-6" />
      </div>

      <section className="px-4 space-y-4">
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="flex items-center gap-4 bg-[#171717] border border-white/5 rounded-2xl p-4"
        >
          <div className="p-2.5 bg-[#D1B23E]/10 rounded-xl text-[#D1B23E]">
            <Phone size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Phone</p>
            <p className="text-sm font-semibold text-white mt-0.5">{PHONE_NUMBER}</p>
          </div>
        </a>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-[#171717] border border-white/5 rounded-2xl p-4"
        >
          <div className="p-2.5 bg-[#25D366]/10 rounded-xl">
            <FaWhatsapp size={20} style={{ color: '#25D366' }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">WhatsApp</p>
            <p className="text-sm font-semibold text-white mt-0.5">Chat with Concierge</p>
          </div>
        </a>

        <a
          href="/apk/btimeluxe.apk"
          download="btimeluxe.apk"
          className="flex items-center justify-center gap-2 w-full bg-[#D1B23E] text-black font-semibold py-3.5 rounded-xl text-sm mt-2"
        >
          Download APK
        </a>
      </section>

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP_LINK}
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
