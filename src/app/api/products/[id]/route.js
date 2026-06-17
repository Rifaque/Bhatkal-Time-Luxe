import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, FeaturedWatch, BestSelling } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await connectToDatabase();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error('❌ GET Product Error:', err);
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    let updateFields = {};

    await connectToDatabase();

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      updateFields = {
        name: formData.get('name'),
        brand: formData.get('brand'),
        MRP: Number(formData.get('MRP')),
        price: Number(formData.get('price')),
        inStock: formData.get('inStock') === 'true' || formData.get('inStock') === true,
        color: formData.get('color') || '',
        about: formData.get('about') || '',
      };

      const imageFiles = formData.getAll('images');
      if (imageFiles && imageFiles.length > 0 && imageFiles[0]?.name) {
        // Upload new images
        const uploadPromises = imageFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const uploadResult = await uploadBuffer(buffer, 'products');
          return uploadResult.secure_url;
        });
        updateFields.images = await Promise.all(uploadPromises);
      }
    } else {
      updateFields = await req.json();
    }

    const product = await Product.findByIdAndUpdate(id, updateFields, { new: true });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('❌ PUT Product Error:', err);
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
    
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete associated records from FeaturedWatch and BestSelling collections
    await FeaturedWatch.deleteMany({ productId: product._id });
    await BestSelling.deleteMany({ productId: product._id });

    return NextResponse.json({ message: 'Product and related records deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
