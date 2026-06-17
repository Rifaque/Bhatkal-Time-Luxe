import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find();
    return NextResponse.json(products);
  } catch (err) {
    console.error('❌ GET Products Error:', err);
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
    const brand = formData.get('brand');
    const MRP = Number(formData.get('MRP'));
    const price = Number(formData.get('price'));
    const inStock = formData.get('inStock') === 'true' || formData.get('inStock') === true;
    const color = formData.get('color') || '';
    const about = formData.get('about') || '';
    
    // Retrieve files
    const imageFiles = formData.getAll('images');

    if (!name || !brand || isNaN(MRP) || isNaN(price)) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Upload images to Cloudinary in parallel
    const uploadPromises = imageFiles.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await uploadBuffer(buffer, 'products');
      return uploadResult.secure_url;
    });

    const imageUrls = await Promise.all(uploadPromises);

    const newProduct = new Product({
      name,
      brand,
      MRP,
      price,
      inStock,
      color,
      about,
      images: imageUrls,
    });

    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error('❌ POST Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
