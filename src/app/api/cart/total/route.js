import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Cart } from '@/models/Schemas';
import { getOrCreateCartId } from '../route';

export async function GET() {
  try {
    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    const cart = await Cart.findOne({ cartId }).populate('items.product');
    if (!cart) {
      return NextResponse.json({ total: 0 });
    }

    let total = 0;
    cart.items.forEach((item) => {
      if (item.product && item.product.price) {
        total += item.product.price * item.quantity;
      }
    });

    return NextResponse.json({ total });
  } catch (err) {
    console.error('❌ GET Cart Total Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
