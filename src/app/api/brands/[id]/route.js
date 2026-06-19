import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { badId } from '@/lib/validate';
import { logAdminAction } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';
import { brandsCache } from '@/lib/brandsCache';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const invalid = badId(id, 'brand ID');
    if (invalid) return invalid;

    await connectToDatabase();
    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (err) {
    console.error('❌ GET Brand By ID Error:', err);
    return NextResponse.json({ error: 'Failed to load brand' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invalid = badId(id, 'brand ID');
    if (invalid) return invalid;

    const body = await req.json();

    // Allowlist — never let arbitrary fields reach the DB
    const update = {};
    if (typeof body.name        === 'string') update.name        = body.name.trim().slice(0, 100);
    if (typeof body.logo        === 'string') update.logo        = body.logo;
    if (typeof body.description === 'string') update.description = body.description.slice(0, 500);
    if (typeof body.referencePrefix === 'string') {
      const pfx = body.referencePrefix.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
      if (pfx.length >= 2) update.referencePrefix = pfx;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await connectToDatabase();
    const brand = await Brand.findByIdAndUpdate(id, update, { new: true });
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    if (brandsCache) brandsCache.del('brands');

    logAdminAction({
      admin, action: 'BRAND_UPDATE', entity: 'Brand', entityId: id,
      after: update, ip: getClientIp(req),
    });

    return NextResponse.json(brand);
  } catch (err) {
    console.error('❌ PUT Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invalid = badId(id, 'brand ID');
    if (invalid) return invalid;

    await connectToDatabase();

    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    if (brandsCache) brandsCache.del('brands');

    logAdminAction({
      admin, action: 'BRAND_DELETE', entity: 'Brand', entityId: id,
      before: { name: brand.name }, ip: getClientIp(req),
    });

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
