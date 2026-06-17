import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { brandsCache } from '../route';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (err) {
    console.error('❌ GET Brand By ID Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();
    const brand = await Brand.findByIdAndUpdate(id, body, { new: true });
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Invalidate cache
    if (brandsCache) brandsCache.del('brands');

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
    await connectToDatabase();
    
    // Cascades delete to products via schema pre-hook
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Invalidate cache
    if (brandsCache) brandsCache.del('brands');

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
