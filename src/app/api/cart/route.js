import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Cart } from '@/models/Schemas';
import { isValidObjectId } from '@/lib/validate';

async function getOrCreateCartId() {
  const cookieStore = await cookies();
  let cartId = cookieStore.get('cartId')?.value;
  if (!cartId) {
    cartId = new mongoose.Types.ObjectId().toString();
    cookieStore.set('cartId', cartId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return cartId;
}

export async function GET() {
  try {
    const cartId = await getOrCreateCartId();
    await connectToDatabase();
    
    const cart = await Cart.findOne({ cartId }).populate('items.product').lean();
    if (!cart) {
      return NextResponse.json({ items: [] });
    }
    return NextResponse.json(cart);
  } catch (err) {
    console.error('❌ GET Cart Error:', err);
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { product, quantity = 1 } = await req.json();
    if (!product) {
      return NextResponse.json({ error: 'Product is required' }, { status: 400 });
    }
    if (!isValidObjectId(product)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }
    // Clamp quantity to a sane range — prevents large-number exploits
    const safeQty = Math.max(1, Math.min(99, parseInt(quantity, 10) || 1));

    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    let cart = await Cart.findOne({ cartId });
    if (!cart) {
      cart = new Cart({ cartId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity = Math.min(
        99,
        cart.items[existingItemIndex].quantity + safeQty
      );
    } else {
      cart.items.push({ product, quantity: safeQty });
    }

    cart.updatedAt = new Date();
    await cart.save();
    
    return NextResponse.json(cart, { status: 201 });
  } catch (err) {
    console.error('❌ POST Cart Error:', err);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    await Cart.findOneAndDelete({ cartId });
    return NextResponse.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('❌ DELETE Cart Error:', err);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}

export { getOrCreateCartId };
