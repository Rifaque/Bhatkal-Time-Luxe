'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import btimehome from '@/assets/images/btimehome.webp';

export default function DesktopFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#121212] text-gray-400 border-t border-white/5 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src={btimehome}
                alt="Bhatkal Time Luxe Logo"
                className="h-16 w-auto object-contain brightness-95"
              />
            </Link>
            <p className="text-sm font-serif leading-relaxed text-gray-400 max-w-sm">
              Bhatkal Time Luxe is a premier marketplace for luxury, high-end watches. Curating the world's most distinguished timepieces, we offer unrivaled quality, secured checkout, and premium support.
            </p>
            <div className="flex items-center space-x-3 text-white">
              <a
                href="https://wa.me/916364282251"
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
              <li>
                <Link href="/" className="hover:text-[#D1B23E] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-[#D1B23E] transition-colors">Brands</Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="hover:text-[#D1B23E] transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#D1B23E] transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#D1B23E] transition-colors">Contact</Link>
              </li>
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
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt size={16} className="text-[#D1B23E] shrink-0 mt-0.5" />
                <span>Bhatkal, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaPhoneAlt size={14} className="text-[#D1B23E] shrink-0" />
                <a href="tel:+916364282251" className="hover:text-white transition-colors">
                  +91 636 428 2251
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FaEnvelope size={14} className="text-[#D1B23E] shrink-0" />
                <a href="mailto:support@bhatkaltimeluxe.in" className="hover:text-white transition-colors">
                  support@bhatkaltimeluxe.in
                </a>
              </li>
              <li className="pt-2 text-xs border-t border-white/5 text-gray-500 font-serif">
                Available 24/7 for order processing and general shopping consultations.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-gray-500 space-y-4 sm:space-y-0">
          <p>&copy; {currentYear} Bhatkal Time Luxe. All rights reserved.</p>
          <p>
            Powered by{' '}
            <a
              href="https://www.hubzero.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#D1B23E] hover:underline"
            >
              Hubzero
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
