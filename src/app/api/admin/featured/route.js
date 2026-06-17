import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FeaturedWatch } from '@/models/Schemas';
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

    const exists = await FeaturedWatch.findOne({ productId });
    if (exists) {
      return NextResponse.json({ error: 'Product is already in the featured list' }, { status: 400 });
    }

    const featured = new FeaturedWatch({ productId });
    await featured.save();

    return NextResponse.json({ message: 'Product added to featured list', featured }, { status: 201 });
  } catch (err) {
    console.error('❌ POST Admin Featured Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
