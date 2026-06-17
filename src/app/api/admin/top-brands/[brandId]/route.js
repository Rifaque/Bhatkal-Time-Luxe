import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TopBrand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const { brandId } = await params;
    await connectToDatabase();

    const deleted = await TopBrand.findOneAndDelete({ brand: brandId });
    if (!deleted) {
      return NextResponse.json({ error: 'Brand not found in top brands list' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Brand removed from top brands list' });
  } catch (err) {
    console.error('❌ DELETE Admin Top Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
