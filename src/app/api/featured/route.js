import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FeaturedWatch } from '@/models/Schemas';

export async function GET() {
  try {
    await connectToDatabase();
    const all = await FeaturedWatch.find().sort({ order: 1 }).populate('productId').lean();
    // Self-heal: remove entries whose product no longer exists
    const orphanIds = all.filter((i) => !i.productId).map((i) => i._id);
    if (orphanIds.length > 0) {
      await FeaturedWatch.deleteMany({ _id: { $in: orphanIds } });
    }
    return NextResponse.json(all.filter((i) => i.productId));
  } catch (err) {
    console.error('❌ GET Featured Watches Error:', err);
    return NextResponse.json({ error: 'Failed to load featured watches' }, { status: 500 });
  }
}
