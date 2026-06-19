import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FeaturedWatch } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { badId } from '@/lib/validate';
import { logAdminAction } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

export async function DELETE(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const { productId } = await params;
    const invalid = badId(productId, 'product ID');
    if (invalid) return invalid;

    await connectToDatabase();

    const deleted = await FeaturedWatch.findOneAndDelete({ productId });
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found in featured list' }, { status: 404 });
    }

    logAdminAction({ admin, action: 'FEATURED_REMOVE', entity: 'FeaturedWatch', entityId: productId, ip: getClientIp(req) });

    return NextResponse.json({ message: 'Product removed from featured list' });
  } catch (err) {
    console.error('❌ DELETE Admin Featured Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
