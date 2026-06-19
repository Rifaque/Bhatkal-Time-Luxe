import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BestSelling } from '@/models/Schemas';

export async function GET() {
  try {
    await connectToDatabase();
    const all = await BestSelling.find().populate('productId').lean();
    // Self-heal: remove entries whose product no longer exists
    const orphanIds = all.filter((i) => !i.productId).map((i) => i._id);
    if (orphanIds.length > 0) {
      await BestSelling.deleteMany({ _id: { $in: orphanIds } });
    }
    return NextResponse.json(all.filter((i) => i.productId));
  } catch (err) {
    console.error('❌ GET Best Selling Error:', err);
    return NextResponse.json({ error: 'Failed to load best-selling watches' }, { status: 500 });
  }
}
