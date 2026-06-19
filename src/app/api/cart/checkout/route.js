import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Cart, Product, Stats, Order, ExchangeRate } from '@/models/Schemas';
import { getOrCreateCartId } from '../route';
import {
  buildLineItems,
  buildWhatsAppMessage,
  generateOrderId,
} from '@/lib/orderPricing';
import { getSettings } from '@/lib/settings';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const checkoutLimiter = rateLimit({ maxRequests: 20, windowMs: 10 * 60 * 1000 });

async function getServerRate(currency) {
  if (!currency || currency === 'KWD') return 1;
  try {
    const record = await ExchangeRate.findOne({ singleton: 'latest' }).lean();
    const rate   = record?.rates?.[currency];
    return Number.isFinite(rate) && rate > 0 ? rate : 1;
  } catch {
    return 1;
  }
}

export async function POST(request) {
  const ip = getClientIp(request);
  const limit = checkoutLimiter(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many checkout requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const orderCurrency = body.currency || 'KWD';

    await connectToDatabase();
    const exchangeRateUsed = await getServerRate(orderCurrency);

    const cartId = await getOrCreateCartId();

    // lean() — raw MongoDB docs, no Mongoose schema-default injection on price fields
    const cart = await Cart.findOne({ cartId }).lean();
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Bulk-fetch all products in one round-trip, with brand populated for names
    const productIds = cart.items.map((i) => i.product);
    const products   = await Product.find({ _id: { $in: productIds } }).populate('brand').lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const lineInputs = [];
    for (const item of cart.items) {
      const product = productMap.get(item.product.toString());
      if (!product) continue;
      lineInputs.push({ product, quantity: item.quantity });
    }

    if (lineInputs.length === 0) {
      return NextResponse.json({ error: 'No valid products in cart' }, { status: 400 });
    }

    // Build and validate all line items (throws on NaN/missing price)
    const { orderItems, baseKwdAmount } = buildLineItems(lineInputs);

    // Increment orderCount for each product (fire-and-forget)
    for (const item of orderItems) {
      Product.findByIdAndUpdate(item.product, { $inc: { orderCount: item.quantity } }).exec();
    }

    const globalStats = await Stats.findOneAndUpdate(
      {},
      { $inc: { globalOrderCount: 1 } },
      { new: true, upsert: true }
    );
    const orderId = generateOrderId(globalStats.globalOrderCount);

    const { message, displayAmount } = buildWhatsAppMessage({
      orderId,
      orderItems,
      baseKwdAmount,
      orderCurrency,
      exchangeRateUsed,
    });

    const order = new Order({
      orderId,
      cartId,
      items:            orderItems,
      total:            baseKwdAmount,
      totalKwd:         baseKwdAmount,
      orderCurrency,
      exchangeRateUsed,
      baseKwdAmount,
      displayAmount,
      message,
    });
    await order.save();
    await Cart.deleteOne({ cartId });

    const { whatsappNumber: waNumber } = await getSettings();
    const whatsappNumber = waNumber || process.env.WHATSAPP_NUMBER || '';
    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      : '';

    return NextResponse.json({
      message,
      total:       baseKwdAmount,
      displayAmount,
      orderCurrency,
      exchangeRateUsed,
      globalOrderCount: globalStats.globalOrderCount,
      whatsappUrl,
      orderId,
    });
  } catch (err) {
    console.error('❌ Cart Checkout Error:', err);
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 });
  }
}
