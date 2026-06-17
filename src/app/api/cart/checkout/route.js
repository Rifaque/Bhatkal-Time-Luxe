import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Cart, Product, Stats, Order } from '@/models/Schemas';
import { getOrCreateCartId } from '../route';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

function generateOrderId(count) {
  const year = new Date().getFullYear();
  return `BTL-${year}-${String(count).padStart(6, '0')}`;
}

export async function GET() {
  try {
    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    const cart = await Cart.findOne({ cartId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (item.product) {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;
        await Product.findByIdAndUpdate(item.product._id, { $inc: { orderCount: item.quantity } });
        orderItems.push({
          product: item.product._id,
          name: item.product.name,
          brand: item.product.brand?.name || '',
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || '',
        });
      }
    }

    // Increment global order counter and get new count
    const globalStats = await Stats.findOneAndUpdate(
      {},
      { $inc: { globalOrderCount: 1 } },
      { new: true, upsert: true }
    );

    const orderId = generateOrderId(globalStats.globalOrderCount);

    // Build WhatsApp message
    let message = `BHATKAL TIME LUXE — ORDER CONFIRMATION\n\nOrder ID: ${orderId}\n\nORDER DETAILS:\n`;
    for (const item of orderItems) {
      message += `• ${item.name} — Qty: ${item.quantity} — ${fmt(item.price * item.quantity)}\n`;
    }
    message += `\nORDER TOTAL: ${fmt(total)}\n\nPlease quote Order ID ${orderId} in all communications.\nOur team will reach out to confirm your order.`;

    // Save order with orderId
    const order = new Order({
      orderId,
      cartId,
      items: orderItems,
      total,
      message,
    });
    await order.save();

    // Generate WhatsApp URL
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '';
    let whatsappUrl = '';
    if (whatsappNumber) {
      whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    }

    return NextResponse.json({
      message,
      total,
      globalOrderCount: globalStats.globalOrderCount,
      whatsappUrl,
      orderId,
    });
  } catch (err) {
    console.error('❌ Cart Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
