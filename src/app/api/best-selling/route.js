import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { BestSelling } from '@/models/Schemas';

export async function GET() {
  try {
    await connectToDatabase();
    const bestSellingItems = await BestSelling.find().populate('productId');
    return NextResponse.json(bestSellingItems);
  } catch (err) {
    console.error('❌ GET Best Selling Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
