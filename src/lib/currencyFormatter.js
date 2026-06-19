/**
 * Shared pure currency formatting utilities.
 * No React dependencies — safe for use in API routes, server helpers, and components.
 *
 * Client components that need to respect the user's selected display currency
 * should use `formatPrice` from `useCurrency()` (CurrencyContext), which calls
 * `fmtDisplay` internally after applying the exchange rate.
 *
 * This module is the single source of truth for:
 *  - currency symbol lookup
 *  - decimal-place config
 *  - number formatting
 */

export const CURRENCY_SYMBOLS = {
  KWD: 'KD',  INR: '₹',   USD: '$',   EUR: '€',
  GBP: '£',   AUD: 'A$',  AED: 'AED', SAR: 'SAR',
  BHD: 'BD',  QAR: 'QR',  OMR: 'RO',
};

/** Currencies that use 3 decimal places; all others default to 2. */
export const CURRENCY_DECIMALS = { KWD: 3, BHD: 3, OMR: 3 };

/**
 * Format a KWD amount with 3 decimal places.
 * @example formatKwd(14.999) → "14.999"
 */
export function formatKwd(amount) {
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
}

/**
 * Format an amount in the given display currency with correct decimal places.
 * Returns the raw number string (no symbol prefix).
 * @example formatForCurrency(71.99, 'USD') → "71.99"
 */
export function formatForCurrency(amount, currency = 'KWD') {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  return new Intl.NumberFormat('en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a KWD amount with symbol prefix.
 * @example formatKwdWithSymbol(14.999) → "KD 14.999"
 */
export function formatKwdWithSymbol(amount) {
  return `KD ${formatKwd(amount)}`;
}

/**
 * Format an amount with its currency symbol prefix.
 * @example formatWithSymbol(71.99, 'USD') → "$ 71.99"
 */
export function formatWithSymbol(amount, currency = 'KWD') {
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  return `${sym} ${formatForCurrency(amount, currency)}`;
}
