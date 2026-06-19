import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';
import mongoose from 'mongoose';

const MAX = 6;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  await connectToDatabase();

  const product = await Product.findById(productId).lean();
  if (!product) return NextResponse.json([]);

  const seen = new Set([String(productId)]);
  const results = [];

  // Priority 1: Same brand
  if (product.brand) {
    const sameBrand = await Product.find({ _id: { $nin: [...seen] }, brand: product.brand })
      .populate('brand')
      .limit(MAX)
      .lean();
    for (const p of sameBrand) {
      if (results.length >= MAX) break;
      seen.add(String(p._id));
      results.push(p);
    }
  }

  // Priority 2: Same colorway
  if (results.length < MAX && product.color) {
    const sameColor = await Product.find({ _id: { $nin: [...seen] }, color: product.color })
      .populate('brand')
      .limit(MAX - results.length)
      .lean();
    for (const p of sameColor) {
      if (results.length >= MAX) break;
      seen.add(String(p._id));
      results.push(p);
    }
  }

  // Priority 3: Similar price range (±35%)
  if (results.length < MAX) {
    const price = product.salePrice || product.priceKwd || 0;
    if (price > 0) {
      const lo = price * 0.65;
      const hi = price * 1.35;
      const priceRelated = await Product.find({
        _id: { $nin: [...seen] },
        $or: [
          { salePrice: { $gte: lo, $lte: hi } },
          { priceKwd: { $gte: lo, $lte: hi } },
        ],
      })
        .populate('brand')
        .limit(MAX - results.length)
        .lean();
      for (const p of priceRelated) {
        if (results.length >= MAX) break;
        seen.add(String(p._id));
        results.push(p);
      }
    }
  }

  return NextResponse.json(results.map((p) => ({ ...p, _id: String(p._id) })));
}
