'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';

export default function CurrencyPicker() {
  const { currency, changeCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const current = CURRENCIES[currency];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-200 transition-colors duration-200 px-2.5 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/[0.08]"
        aria-label={`Currency: ${current.code}. Click to change.`}
      >
        <span className="font-mono tracking-wider">{current.code}</span>
        <ChevronDown
          size={11}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#131313] border border-white/[0.07] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.55)] overflow-hidden z-[200] animate-scale-up">
          <div className="py-1.5">
            {Object.values(CURRENCIES).map((curr) => {
              const isActive = curr.code === currency;
              return (
                <button
                  key={curr.code}
                  onClick={() => { changeCurrency(curr.code); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-xs transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#D1B23E]/10 text-[#D1B23E]'
                      : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                  }`}
                >
                  <span className="font-medium">{curr.code}</span>
                  <span className="text-gray-500 font-mono text-[10px]">{curr.symbol}</span>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-2 border-t border-white/[0.05]">
            <p className="text-[10px] text-gray-600 font-sans">Indicative rates. Prices in INR.</p>
          </div>
        </div>
      )}
    </div>
  );
}
