import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, Stats, Order } from '@/models/Schemas';

export async function GET(req, { params }) {
  try {
    const { productId } = await params;
    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const quantity = 1; // Direct purchase quantity is always 1
    const total = product.price * quantity;

    // Use current request host dynamically or fallback to btl.hubzero.in
    const origin = new URL(req.url).origin || 'https://btl.hubzero.in';
    const productPageUrl = `${origin}/product/${product._id}`;

    // Format message exactly as Express server did
    const message = `Order Details:\n${product.name}\nColor: ${product.color}\nPrice: ~${new Intl.NumberFormat('en-IN').format(product.MRP)}~ ${new Intl.NumberFormat('en-IN').format(product.price)}\n--------------------------------\nSubtotal: ${total}\n\nProduct: ${productPageUrl}`;

    // Increment global order counter
    const globalStats = await Stats.findOneAndUpdate(
      {},
      { $inc: { globalOrderCount: 1 } },
      { new: true, upsert: true }
    );

    // Save order history record
    const order = new Order({
      cartId: 'direct',
      items: [{
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      }],
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
    console.error('❌ Direct Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
