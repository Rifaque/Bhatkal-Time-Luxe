import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, Stats, Order, ExchangeRate } from '@/models/Schemas';
import {
  buildLineItems,
  buildWhatsAppMessage,
  generateOrderId,
} from '@/lib/orderPricing';
import { getSettings } from '@/lib/settings';
import { badId } from '@/lib/validate';
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

export async function POST(req, { params }) {
  const ip = getClientIp(req);
  const limit = checkoutLimiter(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many checkout requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const { productId } = await params;
    const invalid = badId(productId, 'product ID');
    if (invalid) return invalid;

    const body = await req.json().catch(() => ({}));
    const orderCurrency = body.currency || 'KWD';

    await connectToDatabase();
    const exchangeRateUsed = await getServerRate(orderCurrency);

    // lean() returns raw MongoDB doc — no Mongoose schema-default injection
    const product = await Product.findById(productId).populate('brand').lean();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Build and validate line items (throws on missing/NaN price)
    const { orderItems, baseKwdAmount } = buildLineItems([{ product, quantity: 1 }]);

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
      cartId: 'direct',
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
    console.error('❌ Direct Checkout Error:', err);
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 });
  }
}
