import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FeaturedWatch } from '@/models/Schemas';

export async function GET() {
  try {
    await connectToDatabase();
    // Sorts by order field if available (as in Express: sort({ order: 1 }).populate("productId"))
    const featuredWatches = await FeaturedWatch.find().sort({ order: 1 }).populate('productId');
    return NextResponse.json(featuredWatches);
  } catch (err) {
    console.error('❌ GET Featured Watches Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
