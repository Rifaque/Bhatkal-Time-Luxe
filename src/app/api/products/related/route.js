import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Schemas';
import mongoose from 'mongoose';

const MAX = 8;

// Score signals — must sum ≤ 100
const W_BRAND    = 40;
const W_COLOR    = 25;
const W_PRICE    = 25; // linear decay: full at 0% diff, zero at ≥40% diff
const W_KEYWORDS = 10; // 2 pts per shared word (min 3 chars), capped at 10

function priceScore(ref, candidate) {
  const a = ref.salePrice || ref.priceKwd || 0;
  const b = candidate.salePrice || candidate.priceKwd || 0;
  if (!a || !b) return 0;
  const diff = Math.abs(a - b) / a;
  if (diff >= 0.4) return 0;
  return Math.round(W_PRICE * (1 - diff / 0.4));
}

function keywordScore(nameA, nameB) {
  const words = (s) =>
    (s || '')
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length >= 3);
  const setA = new Set(words(nameA));
  const matches = words(nameB).filter((w) => setA.has(w)).length;
  return Math.min(matches * 2, W_KEYWORDS);
}

function scoreProduct(ref, candidate) {
  let score = 0;
  if (String(ref.brand) === String(candidate.brand)) score += W_BRAND;
  if (ref.color && candidate.color && ref.color === candidate.color) score += W_COLOR;
  score += priceScore(ref, candidate);
  score += keywordScore(ref.name, candidate.name);
  return score;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  await connectToDatabase();

  const ref = await Product.findById(productId).lean();
  if (!ref) return NextResponse.json([]);

  // Pull candidates — same brand first (most likely to score high), then rest
  const [sameBrand, others] = await Promise.all([
    Product.find({ _id: { $ne: productId }, brand: ref.brand })
      .populate('brand', 'name logo')
      .lean(),
    Product.find({ _id: { $ne: productId }, brand: { $ne: ref.brand } })
      .populate('brand', 'name logo')
      .lean(),
  ]);

  const candidates = [...sameBrand, ...others];

  // Score and sort
  const scored = candidates
    .map((p) => ({ product: p, score: scoreProduct(ref, p) }))
    .sort((a, b) => b.score - a.score);

  // Primary results: score > 0
  const results = scored
    .filter(({ score }) => score > 0)
    .slice(0, MAX)
    .map(({ product: p }) => ({ ...p, _id: String(p._id) }));

  // Fallback: fill to MIN_RESULTS with any in-stock product if pool is thin
  if (results.length < 4) {
    const seen = new Set(results.map((p) => p._id).concat(String(productId)));
    const fallbacks = scored
      .filter(({ product: p, score }) => score === 0 && p.inStock !== false && !seen.has(String(p._id)))
      .slice(0, MAX - results.length)
      .map(({ product: p }) => ({ ...p, _id: String(p._id) }));
    results.push(...fallbacks);
  }

  return NextResponse.json(results);
}
