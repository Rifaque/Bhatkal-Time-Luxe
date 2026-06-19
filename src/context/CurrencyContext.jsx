'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Fallback constants — used when DB rates are unavailable
export const CURRENCIES = {
  KWD: { code: 'KWD', symbol: 'KD',  name: 'Kuwaiti Dinar',     rate: 1,       decimals: 3 },
  INR: { code: 'INR', symbol: '₹',   name: 'Indian Rupee',      rate: 227.273, decimals: 0 },
  USD: { code: 'USD', symbol: '$',   name: 'US Dollar',          rate: 2.727,   decimals: 2 },
  EUR: { code: 'EUR', symbol: '€',   name: 'Euro',               rate: 2.500,   decimals: 2 },
  GBP: { code: 'GBP', symbol: '£',   name: 'British Pound',      rate: 2.159,   decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',  rate: 4.182,   decimals: 2 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham',         rate: 10.000,  decimals: 2 },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal',        rate: 10.250,  decimals: 2 },
  BHD: { code: 'BHD', symbol: 'BD',  name: 'Bahraini Dinar',     rate: 1.023,   decimals: 3 },
  QAR: { code: 'QAR', symbol: 'QR',  name: 'Qatari Riyal',       rate: 9.909,   decimals: 2 },
  OMR: { code: 'OMR', symbol: 'RO',  name: 'Omani Rial',         rate: 1.045,   decimals: 3 },
};

const STORAGE_KEY = 'btl_currency';
const DEFAULT_CURRENCY = 'KWD';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [liveRates, setLiveRates] = useState(null);
  const [ratesMeta, setRatesMeta] = useState(null);

  // Restore saved currency preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CURRENCIES[saved]) setCurrency(saved);
    } catch { /* SSR / private mode */ }
  }, []);

  // Fetch live rates from DB cache
  useEffect(() => {
    fetch('/api/currency-rates')
      .then((r) => r.json())
      .then((data) => {
        if (data.rates && Object.keys(data.rates).length > 0) {
          setLiveRates(data.rates);
          setRatesMeta({
            fetchedAt:  data.fetchedAt,
            source:     data.source,
            status:     data.status,
          });
        }
      })
      .catch(() => { /* fall through to static fallbacks */ });
  }, []);

  // Merge live rates into CURRENCIES structure (preserves symbol, name, decimals)
  const currencies = useMemo(() => {
    if (!liveRates) return CURRENCIES;
    const merged = {};
    for (const [code, meta] of Object.entries(CURRENCIES)) {
      merged[code] = { ...meta, rate: liveRates[code] ?? meta.rate };
    }
    return merged;
  }, [liveRates]);

  const changeCurrency = useCallback((code) => {
    if (!CURRENCIES[code]) return;
    setCurrency(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }, []);

  const formatPrice = useCallback((kwdValue) => {
    const curr = currencies[currency];
    const raw = Number(kwdValue ?? 0);
    if (Number.isNaN(raw)) return `${curr.symbol}0`;

    const converted = raw * curr.rate;
    const locale = currency === 'INR' ? 'en-IN' : 'en';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals,
    }).format(converted);

    return curr.symbol.length === 1
      ? `${curr.symbol}${formatted}`
      : `${curr.symbol} ${formatted}`;
  }, [currency, currencies]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      changeCurrency,
      formatPrice,
      currencies,
      ratesMeta,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
