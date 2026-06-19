'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, Search, Home, Tag, ShoppingCart } from 'lucide-react';
import btimehome from '@/assets/images/btimehome.webp';
import HamburgerMenu from '@/components/HamburgerMenu';
import { FaWhatsapp } from 'react-icons/fa';
import { useStoreSettings } from '@/context/StoreSettingsContext';

const NAV_ITEMS = [
  { icon: Home,         label: 'Home',   path: '/'       },
  { icon: Tag,          label: 'Brands', path: '/brands' },
  { icon: ShoppingCart, label: 'Cart',   path: '/cart'   },
];

export default function MobileLayout({ children, hideFAB = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { whatsappNumber } = useStoreSettings();

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      {/* Sticky glass header */}
      <header className="fixed top-0 left-0 right-0 z-40 luxury-glass-header">
        <div className="flex items-center justify-between h-14 px-3">
          <button
            className="p-2 text-[#D1B23E] hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Image
            src={btimehome}
            alt="Bhatkal Timeluxe"
            className="h-9 w-auto cursor-pointer"
            onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                router.push('/');
              }
            }}
            priority
          />
          <button
            className="p-2 text-[#D1B23E] hover:bg-white/5 rounded-xl transition-colors"
            onClick={() => {
              if (pathname === '/search') return;
              router.push('/search');
            }}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Page body — clears sticky header (56px) + bottom nav (64px) */}
      <main className="pt-14 pb-20 min-h-screen">
        {children}
      </main>

      {/* WhatsApp FAB — sits just above bottom nav */}
      {!hideFAB && (
        <a
          href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '/contact'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-[72px] right-4 z-50 bg-[#171717] border border-white/10 p-3.5 rounded-full shadow-xl"
        >
          <FaWhatsapp size={20} style={{ color: '#D1B23E' }} />
        </a>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/8">
        <div className="flex justify-around items-center py-1.5">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => {
                  if (isActive(path)) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    router.push(path);
                  }
                }}
                className="relative flex flex-col items-center gap-0.5 px-6 py-1.5 min-w-[64px]"
                aria-label={label}
              >
                {/* Active indicator bar */}
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full transition-all duration-200 ${
                    active ? 'bg-[#D1B23E]' : 'bg-transparent'
                  }`}
                />
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    active ? 'text-[#D1B23E]' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    active ? 'text-[#D1B23E]' : 'text-gray-600'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentPath={pathname}
      />
    </div>
  );
}
