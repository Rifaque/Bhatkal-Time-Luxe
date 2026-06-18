'use client';

import { useRouter } from 'next/navigation';
import { X, Home, Tag, Sparkles, Phone, HelpCircle } from 'lucide-react';
import btime from '@/assets/images/btime.webp';
import Image from 'next/image';

const MENU_ITEMS = [
  { icon: Home,       label: 'Home',         path: '/'             },
  { icon: Tag,        label: 'Collections',  path: '/brands'       },
  { icon: Sparkles,   label: 'New Arrivals', path: '/new-arrivals' },
  { icon: Phone,      label: 'Contact',      path: '/contact'      },
  { icon: HelpCircle, label: 'FAQ',          path: '/faq'          },
];

export default function HamburgerMenu({ isOpen, onClose, currentPath = '' }) {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
    onClose();
  };

  const isActive = (path) =>
    path === '/' ? currentPath === '/' : currentPath.startsWith(path);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f0f0f] border-r border-white/6 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <Image
            src={btime}
            alt="Bhatkal Timeluxe"
            className="h-10 w-auto cursor-pointer"
            onClick={() => handleNavigation('/')}
          />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#D1B23E]/10 text-[#D1B23E]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  size={17}
                  className={active ? 'text-[#D1B23E]' : 'text-gray-600'}
                />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D1B23E]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/6">
          <p className="text-[10px] text-gray-700 uppercase tracking-widest font-semibold">
            Bhatkal Time Luxe
          </p>
          <p className="text-[10px] text-gray-800 mt-0.5">Premium Timepieces</p>
        </div>
      </div>
    </>
  );
}
