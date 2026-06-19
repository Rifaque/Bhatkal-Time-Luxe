import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TopBrand } from '@/models/Schemas';
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

    const { brandId } = await params;
    const invalid = badId(brandId, 'brand ID');
    if (invalid) return invalid;

    await connectToDatabase();

    const deleted = await TopBrand.findOneAndDelete({ brand: brandId });
    if (!deleted) {
      return NextResponse.json({ error: 'Brand not found in top brands list' }, { status: 404 });
    }

    logAdminAction({ admin, action: 'TOP_BRAND_REMOVE', entity: 'TopBrand', entityId: brandId, ip: getClientIp(req) });

    return NextResponse.json({ message: 'Brand removed from top brands list' });
  } catch (err) {
    console.error('❌ DELETE Admin Top Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
