import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';
import { badId } from '@/lib/validate';

export async function GET(req, { params }) {
  try {
    const { brandId } = await params;
    const invalid = badId(brandId, 'brand ID');
    if (invalid) return invalid;

    await connectToDatabase();
    const products = await Product.find({ brand: brandId }).populate('brand', 'name').lean();
    return NextResponse.json(products);
  } catch (err) {
    console.error('❌ GET Products by Brand Error:', err);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
