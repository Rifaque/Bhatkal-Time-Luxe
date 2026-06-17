import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';

export async function GET(req, { params }) {
  try {
    const { brandId } = await params;
    await connectToDatabase();
    const products = await Product.find({ brand: brandId });
    return NextResponse.json(products);
  } catch (err) {
    console.error('❌ GET Products by Brand Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
