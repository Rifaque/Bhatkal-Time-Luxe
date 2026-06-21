import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20);

    await connectToDatabase();

    const products = await Product.find({ orderCount: { $gt: 0 }, inStock: { $ne: false } })
      .sort({ orderCount: -1 })
      .limit(limit)
      .populate('brand', 'name logo')
      .lean();

    return NextResponse.json(
      products.map((p) => ({ ...p, _id: String(p._id) }))
    );
  } catch {
    return NextResponse.json({ error: 'Trending unavailable' }, { status: 500 });
  }
}
