import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TopBrand } from '@/models/Schemas';

export async function GET() {
  try {
    await connectToDatabase();
    const all = await TopBrand.find().populate('brand').lean();
    // Self-heal: remove entries whose brand no longer exists
    const orphanIds = all.filter((i) => !i.brand).map((i) => i._id);
    if (orphanIds.length > 0) {
      await TopBrand.deleteMany({ _id: { $in: orphanIds } });
    }
    return NextResponse.json(all.filter((i) => i.brand));
  } catch (err) {
    console.error('❌ GET Top Brands Error:', err);
    return NextResponse.json({ error: 'Failed to load top brands' }, { status: 500 });
  }
}
