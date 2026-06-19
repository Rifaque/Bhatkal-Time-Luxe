import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TopBrand } from '@/models/Schemas';
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

    const { brandId } = await req.json();
    const invalid = badId(brandId, 'brand ID');
    if (invalid) return invalid;

    await connectToDatabase();

    const exists = await TopBrand.findOne({ brand: brandId });
    if (exists) {
      return NextResponse.json({ error: 'Brand is already in the top brands list' }, { status: 400 });
    }

    const topBrand = new TopBrand({ brand: brandId });
    await topBrand.save();

    logAdminAction({ admin, action: 'TOP_BRAND_ADD', entity: 'TopBrand', entityId: brandId, ip: getClientIp(req) });

    return NextResponse.json({ message: 'Brand added to top brands list', topBrand }, { status: 201 });
  } catch (err) {
    console.error('❌ POST Admin Top Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
