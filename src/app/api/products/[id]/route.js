import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, FeaturedWatch, BestSelling } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';
import { badId, validateImageFile } from '@/lib/validate';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const invalid = badId(id, 'product ID');
    if (invalid) return invalid;
    await connectToDatabase();
    const product = await Product.findById(id).populate('brand', 'name').lean();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error('❌ GET Product Error:', err);
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });

    const { id } = await params;
    const invalidId = badId(id, 'product ID');
    if (invalidId) return invalidId;

    await connectToDatabase();
    const contentType = req.headers.get('content-type') || '';
    let updateFields = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      updateFields = {
        name:          formData.get('name'),
        brand:         formData.get('brand'),
        salePrice:     Number.isFinite(parseFloat(formData.get('salePrice')))     ? parseFloat(formData.get('salePrice'))     : 0,
        originalPrice: Number.isFinite(parseFloat(formData.get('originalPrice'))) ? parseFloat(formData.get('originalPrice')) : 0,
        color:         formData.get('color') || '',
        about:         formData.get('about') || '',
        inStock:       formData.get('inStock') !== 'false',
      };
      const imageFiles = formData.getAll('images');
      if (imageFiles?.length > 0 && imageFiles[0]?.name) {
        for (const file of imageFiles) {
          const fileErr = validateImageFile(file);
          if (fileErr) return NextResponse.json({ error: fileErr }, { status: 400 });
        }
        updateFields.images = await Promise.all(
          imageFiles.map(async (file) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const result = await uploadBuffer(buffer, 'products');
            return result.secure_url;
          })
        );
      }
    } else {
      updateFields = await req.json();
    }

    // Reference is immutable once assigned — strip it from any update payload
    delete updateFields.reference;

    const product = await Product.findByIdAndUpdate(id, updateFields, { new: true });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error('❌ PUT Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    await FeaturedWatch.deleteMany({ productId: product._id });
    await BestSelling.deleteMany({ productId: product._id });

    return NextResponse.json({ message: 'Product and related records deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
