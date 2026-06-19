import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, Brand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { brandCode } from '@/lib/reference';

export async function POST(req) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  // Find all products without a valid reference — explicit $or to handle
  // missing field, null, and empty-string cases unambiguously.
  const products = await Product.find({
    $or: [
      { reference: { $exists: false } },
      { reference: null },
      { reference: '' },
    ],
  })
    .populate('brand', 'name')
    .lean();

  if (products.length === 0) {
    return NextResponse.json({
      updated: 0,
      total: await Product.countDocuments(),
      message: 'All products already have references.',
    });
  }

  // Determine the current highest sequential number per brand code
  // (from products that already have references)
  const allExisting = await Product.find(
    { reference: { $regex: /^BTL-[A-Z]{3}-\d+$/ } },
    { reference: 1 }
  ).lean();

  const maxByCode = {};
  for (const p of allExisting) {
    const parts = p.reference?.split('-');
    // reference format: BTL-XXX-NNN → 3 parts when split on '-'... actually 4 parts
    // Wait: 'BTL-ROL-001'.split('-') = ['BTL', 'ROL', '001'] → length 3 ✓
    if (parts?.length === 3) {
      const code = parts[1];
      const num = parseInt(parts[2], 10);
      if (!maxByCode[code] || num > maxByCode[code]) {
        maxByCode[code] = num;
      }
    }
  }

  let updated = 0;
  const errors = [];

  for (const product of products) {
    // Prefer brand's referencePrefix; fall back to legacy brandCode derivation
    const code = product.brand?.referencePrefix || brandCode(product.brand?.name || 'Unknown');
    const next = (maxByCode[code] ?? 0) + 1;
    maxByCode[code] = next;
    const reference = `BTL-${code}-${String(next).padStart(3, '0')}`;

    try {
      await Product.updateOne({ _id: product._id }, { $set: { reference } });
      updated++;
    } catch (err) {
      errors.push({ id: String(product._id), name: product.name, error: err.message });
    }
  }

  const msg = updated === products.length
    ? `Generated ${updated} reference${updated !== 1 ? 's' : ''}.`
    : `Generated ${updated} of ${products.length} references (${errors.length} failed).`;

  return NextResponse.json({
    updated,
    attempted: products.length,
    errors: errors.length > 0 ? errors : undefined,
    message: msg,
  });
}
