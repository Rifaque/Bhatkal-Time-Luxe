import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, Stats, Order } from '@/models/Schemas';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

function generateOrderId(count) {
  const year = new Date().getFullYear();
  return `BTL-${year}-${String(count).padStart(6, '0')}`;
}

export async function GET(req, { params }) {
  try {
    const { productId } = await params;
    await connectToDatabase();

    const product = await Product.findById(productId).populate('brand');
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const quantity = 1;
    const total = product.price * quantity;

    // Increment global order counter
    const globalStats = await Stats.findOneAndUpdate(
      {},
      { $inc: { globalOrderCount: 1 } },
      { new: true, upsert: true }
    );

    const orderId = generateOrderId(globalStats.globalOrderCount);

    // Build WhatsApp message
    const message = `BHATKAL TIME LUXE — ORDER CONFIRMATION\n\nOrder ID: ${orderId}\n\nProduct: ${product.name}\nColor/Dial: ${product.color || 'N/A'}\nPrice: ${fmt(product.price)}${product.MRP > product.price ? ` (MRP: ${fmt(product.MRP)})` : ''}\n\nORDER TOTAL: ${fmt(total)}\n\nPlease quote Order ID ${orderId} in all communications.\nOur team will reach out to confirm your order.`;

    // Save order with orderId
    const order = new Order({
      orderId,
      cartId: 'direct',
      items: [{
        product: product._id,
        name: product.name,
        brand: product.brand?.name || '',
        price: product.price,
        quantity,
        image: product.images?.[0] || '',
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
      orderId,
    });
  } catch (err) {
    console.error('❌ Direct Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
