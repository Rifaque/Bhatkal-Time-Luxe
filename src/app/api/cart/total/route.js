import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Cart } from '@/models/Schemas';
import { getOrCreateCartId } from '../route';

// Resolve canonical KWD price regardless of schema migration state.
// lean() returns raw MongoDB objects — no Mongoose default getters —
// so salePrice is undefined (not 0) on unmigrated documents, and the
// || fallback chain correctly reaches priceKwd.
function resolvePrice(product) {
  return product.salePrice || product.priceKwd || product.price || 0;
}

export async function GET() {
  try {
    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    const cart = await Cart.findOne({ cartId })
      .populate('items.product')
      .lean();

    if (!cart) return NextResponse.json({ total: 0 });

    let total = 0;
    for (const item of cart.items) {
      if (item.product) {
        total += resolvePrice(item.product) * item.quantity;
      }
    }

    return NextResponse.json({ total });
  } catch (err) {
    console.error('❌ GET Cart Total Error:', err);
    return NextResponse.json({ error: 'Failed to load cart total' }, { status: 500 });
  }
}
