'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart } from 'lucide-react';
import btimehome from '@/assets/images/btimehome.webp';
import SearchOverlay from './SearchOverlay';
import CurrencyPicker from './CurrencyPicker';

export default function DesktopNavbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch cart count on load and path change
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          const count = data.items ? data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
          setCartCount(count);
        }
      } catch (err) {
        console.error('Failed to fetch cart count', err);
      }
    };

    fetchCartCount();
    
    // Add custom event listener for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cart-updated', handleCartUpdate);

    // Global keyboard listener for search trigger: Cmd+K / Ctrl+K / /
    const handleGlobalKeyDown = (e) => {
      // Check for / key (outside input fields)
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Brands', href: '/brands' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="luxury-glass-header sticky top-0 z-50 w-full">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Left: Logo and Links */}
          <div className="flex items-center space-x-12">
            {pathname === '/' ? (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center opacity-90 hover:opacity-100 transition-opacity duration-200"
                aria-label="Scroll to top"
              >
                <Image
                  src={btimehome}
                  alt="Bhatkal Time Luxe Logo"
                  className="h-12 w-auto object-contain"
                  priority
                />
              </button>
            ) : (
              <Link href="/" className="flex items-center opacity-90 hover:opacity-100 transition-opacity duration-200">
                <Image
                  src={btimehome}
                  alt="Bhatkal Time Luxe Logo"
                  className="h-12 w-auto cursor-pointer object-contain"
                  priority
                />
              </Link>
            )}
            <nav className="hidden lg:flex items-center space-x-8 bg-transparent">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return isActive ? (
                  <button
                    key={link.name}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="relative text-sm font-medium tracking-wide text-[#D1B23E] group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#D1B23E] rounded-full" />
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative text-sm font-medium tracking-wide transition-colors duration-200 hover:text-[#D1B23E] text-gray-400 group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#D1B23E] rounded-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-5">
            {/* Search Trigger Command Pill */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-between rounded-full bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-xs text-gray-500 hover:bg-white/[0.07] hover:border-white/15 hover:text-gray-300 transition-all duration-200 w-48 xl:w-56 group cursor-pointer"
            >
              <span className="flex items-center space-x-2">
                <Search size={13} className="shrink-0" />
                <span>Search catalog...</span>
              </span>
              <kbd className="hidden sm:inline-block text-[9px] bg-white/[0.06] border border-white/10 text-gray-600 px-1.5 py-0.5 rounded font-mono font-normal">
                ⌘K
              </kbd>
            </button>

            {/* Currency Switcher */}
            <CurrencyPicker />

            {/* Shopping Cart */}
            {pathname === '/cart' ? (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="relative text-[#D1B23E] p-2"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#D1B23E] text-[9px] font-bold text-black ring-2 ring-[#0a0a0a]">
                    {cartCount}
                  </span>
                )}
              </button>
            ) : (
            <Link
              href="/cart"
              className="relative text-gray-500 hover:text-[#D1B23E] p-2 transition-colors duration-200"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#D1B23E] text-[9px] font-bold text-black ring-2 ring-[#0a0a0a]">
                  {cartCount}
                </span>
              )}
            </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search Overlay Command Palette */}
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
