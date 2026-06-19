import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json([]);

    const validIds = ids
      .filter((id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
      .slice(0, 20);

    if (validIds.length === 0) return NextResponse.json([]);

    await connectToDatabase();
    const products = await Product.find({ _id: { $in: validIds } }).populate('brand').lean();

    const order = new Map(validIds.map((id, i) => [id, i]));
    products.sort((a, b) => (order.get(String(a._id)) ?? 99) - (order.get(String(b._id)) ?? 99));

    return NextResponse.json(products.map((p) => ({ ...p, _id: String(p._id) })));
  } catch (err) {
    console.error('❌ POST Products Batch Error:', err);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
