'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const CURRENCIES = {
  KWD: { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar',      rate: 0.0044,  decimals: 3 },
  INR: { code: 'INR', symbol: '₹',  name: 'Indian Rupee',       rate: 1,       decimals: 0 },
  USD: { code: 'USD', symbol: '$',  name: 'US Dollar',           rate: 0.012,   decimals: 2 },
  EUR: { code: 'EUR', symbol: '€',  name: 'Euro',                rate: 0.011,   decimals: 2 },
  GBP: { code: 'GBP', symbol: '£',  name: 'British Pound',      rate: 0.0095,  decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',   rate: 0.0184,  decimals: 2 },
  AED: { code: 'AED', symbol: 'AED',name: 'UAE Dirham',          rate: 0.044,   decimals: 2 },
  SAR: { code: 'SAR', symbol: 'SAR',name: 'Saudi Riyal',         rate: 0.0451,  decimals: 2 },
  BHD: { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar',      rate: 0.0045,  decimals: 3 },
  QAR: { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal',        rate: 0.0436,  decimals: 2 },
  OMR: { code: 'OMR', symbol: 'RO', name: 'Omani Rial',          rate: 0.0046,  decimals: 3 },
};

const STORAGE_KEY = 'btl_currency';
const DEFAULT_CURRENCY = 'KWD';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CURRENCIES[saved]) setCurrency(saved);
    } catch {
      /* localStorage unavailable (SSR or private mode) */
    }
  }, []);

  const changeCurrency = useCallback((code) => {
    if (!CURRENCIES[code]) return;
    setCurrency(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch { /* ignore */ }
  }, []);

  const formatPrice = useCallback((inrValue) => {
    const curr = CURRENCIES[currency];
    const raw = Number(inrValue ?? 0);
    if (Number.isNaN(raw)) return `${curr.symbol}0`;

    const converted = raw * curr.rate;
    const locale = currency === 'INR' ? 'en-IN' : 'en';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals,
    }).format(converted);

    // Single-char symbols: no space. Multi-char symbols: space after.
    return curr.symbol.length === 1
      ? `${curr.symbol}${formatted}`
      : `${curr.symbol} ${formatted}`;
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
