import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Cart } from '@/models/Schemas';
import { getOrCreateCartId } from '../route';

export async function PUT(req, { params }) {
  try {
    const { productId } = await params;
    const { quantity } = await req.json();
    
    if (quantity === undefined) {
      return NextResponse.json({ error: 'Quantity is required' }, { status: 400 });
    }

    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    const cart = await Cart.findOne({ cartId });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Product not found in cart' }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json(cart);
  } catch (err) {
    console.error('❌ PUT Cart Item Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { productId } = await params;
    const cartId = await getOrCreateCartId();
    await connectToDatabase();

    const cart = await Cart.findOne({ cartId });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json(cart);
  } catch (err) {
    console.error('❌ DELETE Cart Item Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
