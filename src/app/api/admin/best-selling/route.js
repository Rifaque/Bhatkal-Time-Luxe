import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BestSelling } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { badId } from '@/lib/validate';
import { logAdminAction } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    const invalid = badId(productId, 'product ID');
    if (invalid) return invalid;

    await connectToDatabase();

    const exists = await BestSelling.findOne({ productId });
    if (exists) {
      return NextResponse.json({ error: 'Product is already in the best-selling list' }, { status: 400 });
    }

    const bestSelling = new BestSelling({ productId });
    await bestSelling.save();

    logAdminAction({ admin, action: 'BEST_SELLING_ADD', entity: 'BestSelling', entityId: productId, ip: getClientIp(req) });

    return NextResponse.json({ message: 'Product added to best-selling list', bestSelling }, { status: 201 });
  } catch (err) {
    console.error('❌ POST Admin Best Selling Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
