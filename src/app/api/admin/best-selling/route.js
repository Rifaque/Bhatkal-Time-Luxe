import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BestSelling } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';

export async function POST(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const exists = await BestSelling.findOne({ productId });
    if (exists) {
      return NextResponse.json({ error: 'Product is already in the best-selling list' }, { status: 400 });
    }

    const bestSelling = new BestSelling({ productId });
    await bestSelling.save();

    return NextResponse.json({ message: 'Product added to best-selling list', bestSelling }, { status: 201 });
  } catch (err) {
    console.error('❌ POST Admin Best Selling Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
