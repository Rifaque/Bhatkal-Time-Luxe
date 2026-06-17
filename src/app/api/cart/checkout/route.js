import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Cart, Product, Stats, Order } from '@/models/Schemas';
import { getOrCreateCartId } from '../route';

export async function GET() {
  try {
    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    const cart = await Cart.findOne({ cartId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let message = 'Order Details:\n';
    let total = 0;
    const orderItems = [];

    // Process each item
    for (const item of cart.items) {
      if (item.product) {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;
        message += `${item.product.name} - Quantity: ${item.quantity}, Price: ${item.product.price}, Subtotal: ${itemTotal}\n`;
        
        // Increment product order count
        await Product.findByIdAndUpdate(item.product._id, { $inc: { orderCount: item.quantity } });

        // Prepare order snapshot
        orderItems.push({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        });
      }
    }
    message += `Total: ${total}`;

    // Increment global order counter
    const globalStats = await Stats.findOneAndUpdate(
      {},
      { $inc: { globalOrderCount: 1 } },
      { new: true, upsert: true }
    );

    // Save order history record
    const order = new Order({
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
      orderId: order._id,
    });
  } catch (err) {
    console.error('❌ Cart Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
