import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, Brand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadBuffer } from '@/lib/cloudinary';
import { isValidObjectId, validateImageFile } from '@/lib/validate';
import { generateReference } from '@/lib/reference';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find().populate('brand', 'name').lean();
    return NextResponse.json(products);
  } catch (err) {
    console.error('❌ GET Products Error:', err);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name          = formData.get('name');
    const brand         = formData.get('brand');
    const salePriceRaw     = parseFloat(formData.get('salePrice') || '0');
    const originalPriceRaw = parseFloat(formData.get('originalPrice') || '0');
    const salePrice        = Number.isFinite(salePriceRaw)     ? salePriceRaw     : 0;
    const originalPrice    = Number.isFinite(originalPriceRaw) ? originalPriceRaw : 0;
    const inStock       = formData.get('inStock') !== 'false';
    const color         = formData.get('color') || '';
    const about         = formData.get('about') || '';
    const imageFiles    = formData.getAll('images');

    if (!name || !brand) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }
    if (!isValidObjectId(brand)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }
    for (const file of imageFiles) {
      const fileErr = validateImageFile(file);
      if (fileErr) return NextResponse.json({ error: fileErr }, { status: 400 });
    }

    await connectToDatabase();

    const brandDoc = await Brand.findById(brand).lean();
    if (!brandDoc) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 400 });
    }

    const imageUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadBuffer(buffer, 'products');
        return result.secure_url;
      })
    );

    const newProduct = new Product({
      name, brand, salePrice, originalPrice, inStock, color, about,
      images: imageUrls,
    });

    await newProduct.save();

    // Auto-generate reference after save (non-blocking — product still created on failure)
    // Uses brand.referencePrefix; falls back to legacy name-based derivation if prefix not yet set
    try {
      const { brandCode } = await import('@/lib/reference');
      const prefix = brandDoc.referencePrefix || brandCode(brandDoc.name);
      const ref = await generateReference(prefix, Product);
      await Product.updateOne({ _id: newProduct._id }, { $set: { reference: ref } });
      newProduct.reference = ref;
    } catch {
      // intentionally silent
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error('❌ POST Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
