import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TopBrand } from '@/models/Schemas';

export async function GET() {
  try {
    await connectToDatabase();
    const topBrands = await TopBrand.find().populate('brand');
    return NextResponse.json(topBrands);
  } catch (err) {
    console.error('❌ GET Top Brands Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
