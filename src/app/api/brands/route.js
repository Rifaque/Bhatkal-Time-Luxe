import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

export async function GET() {
  try {
    let brands = cache.get('brands');
    if (brands) {
      return NextResponse.json(brands);
    }

    await connectToDatabase();
    brands = await Brand.find();
    cache.set('brands', brands);
    return NextResponse.json(brands);
  } catch (err) {
    console.error('❌ GET Brands Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
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

    if (!name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'Logo file is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return NextResponse.json({ error: 'Brand name already exists' }, { status: 400 });
    }

    // Convert file to buffer and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadBuffer(buffer, 'brands');

    const brand = new Brand({
      name,
      logo: uploadResult.secure_url, // Save the full Cloudinary URL
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
export { cache as brandsCache };
