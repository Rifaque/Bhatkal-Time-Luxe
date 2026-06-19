/**
 * Shared order-pricing utilities.
 * Both /api/cart/checkout and /api/product/[id]/checkout use these functions
 * so totals, line items, and WhatsApp messages are always identical.
 *
 * Price resolution uses || (not ??) so that Mongoose's schema default of 0
 * (injected on unmigrated documents) never masks the real priceKwd value.
 * After the migration script runs, salePrice will always be populated.
 */

import {
  CURRENCY_SYMBOLS,
  CURRENCY_DECIMALS,
  formatKwd as fmtKwd,
  formatForCurrency as fmtDisplay,
} from './currencyFormatter';

/**
 * Return the canonical KWD unit price from a lean MongoDB product object.
 * Throws if no valid positive price is found — never lets NaN reach the DB.
 */
export function resolveKwdPrice(product) {
  const price = product.salePrice || product.priceKwd || product.price || 0;
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(
      `No valid KWD price for product "${product.name}" ` +
      `(salePrice=${product.salePrice}, priceKwd=${product.priceKwd}, price=${product.price})`
    );
  }
  return price;
}

export { fmtKwd, fmtDisplay };

/**
 * Build order line items and subtotal from an array of { product, quantity }.
 * `product` must be a lean plain object (raw MongoDB doc) — no Mongoose hydration.
 *
 * @param {{ product: object, quantity: number }[]} lineInputs
 * @returns {{ orderItems: object[], baseKwdAmount: number }}
 */
export function buildLineItems(lineInputs) {
  let baseKwdAmount = 0;
  const orderItems = lineInputs.map(({ product, quantity }) => {
    const priceKwd    = resolveKwdPrice(product);
    const lineTotalKwd = priceKwd * quantity;
    baseKwdAmount += lineTotalKwd;
    return {
      product:      product._id,
      name:         product.name,
      brand:        product.brand?.name || '',
      reference:    product.reference || '',
      price:        priceKwd,
      priceKwd,
      lineTotalKwd,
      quantity,
      image:        product.images?.[0] || '',
    };
  });

  if (!Number.isFinite(baseKwdAmount) || baseKwdAmount <= 0) {
    throw new Error(`Order total is invalid: ${baseKwdAmount}`);
  }

  return { orderItems, baseKwdAmount };
}

/**
 * Build the WhatsApp confirmation message from already-validated order data.
 *
 * @param {{ orderId, orderItems, baseKwdAmount, orderCurrency, exchangeRateUsed }} opts
 * @returns {{ message: string, displayAmount: number }}
 */
export function buildWhatsAppMessage({ orderId, orderItems, baseKwdAmount, orderCurrency, exchangeRateUsed }) {
  const sym           = CURRENCY_SYMBOLS[orderCurrency] || orderCurrency;
  const displayAmount = baseKwdAmount * exchangeRateUsed;

  let message = `BHATKAL TIME LUXE — ORDER CONFIRMATION\n\nOrder ID: ${orderId}\n\nORDER DETAILS:\n`;
  for (const item of orderItems) {
    const lineDisplay = fmtDisplay(item.lineTotalKwd * exchangeRateUsed, orderCurrency);
    const refTag = item.reference ? ` [${item.reference}]` : '';
    message += `• ${item.name}${refTag} — Qty: ${item.quantity} — ${sym} ${lineDisplay}\n`;
  }
  message += `\nORDER TOTAL: ${sym} ${fmtDisplay(displayAmount, orderCurrency)}`;
  if (orderCurrency !== 'KWD') {
    message += ` (KD ${fmtKwd(baseKwdAmount)})`;
  }
  message += `\n\nPlease quote Order ID ${orderId} in all communications.\nOur team will reach out to confirm your order.`;

  return { message, displayAmount };
}

/** Generate a sequential order ID like BTL-2025-000042. */
export function generateOrderId(globalCount) {
  return `BTL-${new Date().getFullYear()}-${String(globalCount).padStart(6, '0')}`;
}
