import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';
import { brandsCache as cache } from '@/lib/brandsCache';

export async function GET() {
  try {
    let brands = cache.get('brands');
    if (brands) {
      return NextResponse.json(brands);
    }

    await connectToDatabase();
    brands = await Brand.find().lean();
    cache.set('brands', brands);
    return NextResponse.json(brands);
  } catch (err) {
    console.error('❌ GET Brands Error:', err);
    return NextResponse.json({ error: 'Failed to load brands' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // 1. Verify admin
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const name = formData.get('name');
    const file = formData.get('logo');
    const rawPrefix = formData.get('referencePrefix') || '';
    const referencePrefix = rawPrefix.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);

    if (!name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'Logo file is required' }, { status: 400 });
    }
    if (referencePrefix.length < 2) {
      return NextResponse.json({ error: 'Reference prefix must be 2–4 uppercase letters' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return NextResponse.json({ error: 'Brand name already exists' }, { status: 400 });
    }

    // Check prefix uniqueness
    const prefixConflict = await Brand.findOne({ referencePrefix });
    if (prefixConflict) {
      return NextResponse.json(
        { error: `Prefix "${referencePrefix}" is already used by ${prefixConflict.name}` },
        { status: 400 }
      );
    }

    // Convert file to buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadBuffer(buffer, 'brands');

    const brand = new Brand({
      name,
      logo: uploadResult.secure_url,
      referencePrefix,
    });

    await brand.save();
    
    // Invalidate cache
    cache.del('brands');

    return NextResponse.json(brand, { status: 201 });
  } catch (err) {
    console.error('❌ POST Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
