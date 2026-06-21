'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import btimehome from '@/assets/images/btimehome.webp';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export default function DesktopFooter() {
  const currentYear = new Date().getFullYear();
  const { storeName, supportPhone, supportEmail, whatsappNumber, businessAddress } = useStoreSettings();
  const router = useRouter();
  const pathname = usePathname();

  const navTo = (href) => {
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(href);
    }
  };

  return (
    <footer className="bg-[#121212] text-gray-400 border-t border-white/5 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-4 space-y-6">
            <button onClick={() => navTo('/')} className="inline-block">
              <Image
                src={btimehome}
                alt="Bhatkal Time Luxe Logo"
                className="h-16 w-auto object-contain brightness-95"
              />
            </button>
            <p className="text-sm font-serif leading-relaxed text-gray-400 max-w-sm">
              Bhatkal Time Luxe is a premier marketplace for luxury, high-end watches. Curating the world's most distinguished timepieces, we offer unrivaled quality, secured checkout, and premium support.
            </p>
            <div className="flex items-center space-x-3 text-white">
              <a
                href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '/contact'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 rounded-full hover:bg-[#D1B23E] hover:text-black transition-all"
                title="WhatsApp Support"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-white uppercase font-sans">
              Discover
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              {[
                { label: 'Home',         href: '/'            },
                { label: 'Brands',       href: '/brands'      },
                { label: 'New Arrivals', href: '/new-arrivals'},
                { label: 'FAQ',          href: '/faq'         },
                { label: 'Contact',      href: '/contact'     },
              ].map(({ label, href }) => (
                <li key={href}>
                  <button
                    onClick={() => navTo(href)}
                    className="hover:text-[#D1B23E] transition-colors text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Curated Collections / Brands */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-white uppercase font-sans">
              Top Brands
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/brands" className="hover:text-[#D1B23E] transition-colors">Rolex</Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-[#D1B23E] transition-colors">Omega</Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-[#D1B23E] transition-colors">Seiko</Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-[#D1B23E] transition-colors">Tissot</Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-[#D1B23E] transition-colors">Rado</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Concierge Support */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-white uppercase font-sans">
              Concierge Support
            </h4>
            <ul className="space-y-3 text-sm">
              {businessAddress && (
                <li className="flex items-start gap-2.5">
                  <FaMapMarkerAlt size={16} className="text-[#D1B23E] shrink-0 mt-0.5" />
                  <span>{businessAddress}</span>
                </li>
              )}
              {supportPhone && (
                <li className="flex items-center gap-2.5">
                  <FaPhoneAlt size={14} className="text-[#D1B23E] shrink-0" />
                  <a href={`tel:${supportPhone}`} className="hover:text-white transition-colors">
                    {supportPhone}
                  </a>
                </li>
              )}
              {supportEmail && (
                <li className="flex items-center gap-2.5">
                  <FaEnvelope size={14} className="text-[#D1B23E] shrink-0" />
                  <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">
                    {supportEmail}
                  </a>
                </li>
              )}
              <li className="pt-2 text-xs border-t border-white/5 text-gray-500 font-serif">
                Available 24/7 for order processing and general shopping consultations.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-gray-500 space-y-4 sm:space-y-0">
          <p>&copy; {currentYear} {storeName}. All rights reserved.</p>
          <p>Crafted for watch connoisseurs.</p>
        </div>
      </div>
    </footer>
  );
}
