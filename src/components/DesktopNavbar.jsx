'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, Shield } from 'lucide-react';
import btimehome from '@/assets/images/btimehome.webp';
import SearchOverlay from './SearchOverlay';

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
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#1e1e1e]/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Left: Logo and Links */}
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center">
              <Image
                src={btimehome}
                alt="Bhatkal Time Luxe Logo"
                className="h-12 w-auto cursor-pointer object-contain"
                priority
              />
            </Link>
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium tracking-wide transition-colors hover:text-[#D1B23E] ${
                      isActive ? 'text-[#D1B23E]' : 'text-gray-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-6">
            {/* Search Trigger Command Pill */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-between rounded-full bg-white/5 border border-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 transition-all w-48 xl:w-56 group cursor-pointer"
            >
              <span className="flex items-center space-x-2">
                <Search size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                <span className="group-hover:text-white transition-colors">Search catalog...</span>
              </span>
              <kbd className="hidden sm:inline-block text-[9px] bg-white/5 border border-white/10 text-gray-500 px-1.5 py-0.5 rounded font-mono font-normal">
                ⌘K
              </kbd>
            </button>

            {/* Admin Dashboard */}
            <Link
              href="/admin/dashboard"
              className="text-gray-400 hover:text-[#D1B23E] p-2 transition-colors"
              title="Admin Portal"
            >
              <Shield size={18} />
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative text-gray-400 hover:text-[#D1B23E] p-2 transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#D1B23E] text-[9px] font-bold text-black ring-2 ring-[#1e1e1e]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Search Overlay Command Palette */}
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
