import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

export async function GET(req) {
  let newArrivals = cache.get('newArrivals');
  if (newArrivals) {
    return NextResponse.json(newArrivals);
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 40, 100);

    await connectToDatabase();
    newArrivals = await Product.find().sort({ dateAdded: -1 }).limit(limit).populate('brand', 'name').lean();
    
    cache.set('newArrivals', newArrivals);
    return NextResponse.json(newArrivals);
  } catch (err) {
    console.error('❌ GET New Arrivals Error:', err);
    return NextResponse.json({ error: 'Failed to load new arrivals' }, { status: 500 });
  }
}
export { cache as newArrivalsCache };
