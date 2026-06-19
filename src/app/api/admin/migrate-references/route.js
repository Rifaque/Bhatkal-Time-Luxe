import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Brand, Product } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { suggestReferencePrefixes } from '@/lib/reference';
import { brandsCache } from '@/lib/brandsCache';

// ── Shared prefix-assignment plan (pure — no DB writes) ──────────────────────
async function computePrefixPlan() {
  const allBrandsWithPrefix = await Brand.find(
    { referencePrefix: { $exists: true, $nin: [null, ''] } },
    { referencePrefix: 1, name: 1 }
  ).lean();

  const usedPrefixes = new Set(allBrandsWithPrefix.map((b) => b.referencePrefix));
  const prefixMap = {};
  for (const b of allBrandsWithPrefix) prefixMap[String(b._id)] = b.referencePrefix;

  const brandsNeedingPrefix = await Brand.find({
    $or: [{ referencePrefix: { $exists: false } }, { referencePrefix: null }, { referencePrefix: '' }],
  }).lean();

  const assignments = [];
  const errors = [];

  for (const brand of brandsNeedingPrefix) {
    const { primary, alternative } = suggestReferencePrefixes(brand.name);
    let chosen = !usedPrefixes.has(primary) ? primary : !usedPrefixes.has(alternative) ? alternative : null;

    if (!chosen) {
      const base = primary.slice(0, 2);
      for (let i = 0; i < 26 && !chosen; i++) {
        const candidate = (base + String.fromCharCode(65 + i)).slice(0, 3);
        if (!usedPrefixes.has(candidate)) chosen = candidate;
      }
    }

    if (!chosen) {
      errors.push({ brand: brand.name, error: 'Cannot find unique prefix.' });
      continue;
    }

    usedPrefixes.add(chosen);
    prefixMap[String(brand._id)] = chosen;

    // Store both the raw ObjectId and the hex string
    assignments.push({
      _id: brand._id,          // raw ObjectId from lean()
      idHex: String(brand._id), // hex string for logging
      name: brand.name,
      currentPrefix: brand.referencePrefix || null,
      newPrefix: chosen,
    });
  }

  return { prefixMap, assignments, errors };
}

// ── GET — Preview (no writes) ─────────────────────────────────────────────────
export async function GET(req) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();

  const { prefixMap, assignments, errors } = await computePrefixPlan();

  const productCounts = await Product.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
  ]);
  const countMap = {};
  for (const row of productCounts) countMap[String(row._id)] = row.count;

  const allBrands = await Brand.find({}, { name: 1, referencePrefix: 1 }).lean();

  const preview = allBrands.map((brand) => {
    const id = String(brand._id);
    const newPrefix = prefixMap[id] || null;
    const willChange = !brand.referencePrefix && !!newPrefix;
    return {
      brandId: id,
      name: brand.name,
      currentPrefix: brand.referencePrefix || null,
      newPrefix,
      willChange,
      productCount: countMap[id] || 0,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    preview,
    totalBrandsToUpdate: preview.filter((r) => r.willChange).length,
    totalProductsAffected: preview.reduce((sum, r) => sum + r.productCount, 0),
    errors: errors.length > 0 ? errors : undefined,
  });
}

// ── POST — Execute migration ──────────────────────────────────────────────────
export async function POST(req) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();

  // Get direct access to the brands collection in the MongoDB driver — bypasses
  // Mongoose model layer entirely so strict-mode / schema-caching cannot strip fields.
  const brandsCol = mongoose.connection.db.collection('brands');
  const { assignments, errors: planErrors } = await computePrefixPlan();

  // ── Step 1: Write referencePrefix to each brand ───────────────────────────
  let prefixesAssigned = 0;
  const assignErrors = [];

  for (const a of assignments) {
    const filter = { _id: a._id };
    const update = { $set: { referencePrefix: a.newPrefix } };
    try {
      const rawResult = await brandsCol.updateOne(filter, update);
      if (rawResult.matchedCount === 0) {
        assignErrors.push({ brand: a.name, error: `No document matched _id=${a.idHex}` });
      } else {
        prefixesAssigned++;
      }
    } catch (err) {
      assignErrors.push({ brand: a.name, error: err.message });
    }
  }

  // Hard verification before proceeding
  const verifyCount = await Brand.countDocuments({
    referencePrefix: { $exists: true, $nin: [null, ''] },
  });

  if (verifyCount === 0 && assignments.length > 0) {
    return NextResponse.json(
      { error: 'Prefix writes did not persist to MongoDB.', assignErrors, planErrors },
      { status: 500 }
    );
  }

  brandsCache.del('brands');

  // ── Step 2: Rebuild all product references ────────────────────────────────
  const allBrandsAfter = await Brand.find(
    { referencePrefix: { $exists: true, $nin: [null, ''] } },
    { name: 1, referencePrefix: 1 }
  ).lean();

  const products = await Product.find({}, { brand: 1, name: 1 }).lean();

  const byBrand = {};
  for (const p of products) {
    const bid = String(p.brand);
    if (!byBrand[bid]) byBrand[bid] = [];
    byBrand[bid].push(p);
  }

  let refsUpdated = 0;
  const refErrors = [];
  const finalMapping = [];

  const productsCol = mongoose.connection.db.collection('products');

  for (const b of allBrandsAfter) {
    const bid = String(b._id);
    const prefix = b.referencePrefix;
    const brandProducts = byBrand[bid] || [];
    brandProducts.sort((x, y) => String(x._id).localeCompare(String(y._id)));

    for (let i = 0; i < brandProducts.length; i++) {
      const ref = `BTL-${prefix}-${String(i + 1).padStart(3, '0')}`;
      try {
        const res = await productsCol.updateOne({ _id: brandProducts[i]._id }, { $set: { reference: ref } });
        if (res.matchedCount > 0) refsUpdated++;
      } catch (err) {
        refErrors.push({ product: brandProducts[i].name, error: err.message });
      }
    }

    finalMapping.push({ brand: b.name, prefix });
  }

  finalMapping.sort((a, b) => a.brand.localeCompare(b.brand));

  const collisions = [...planErrors, ...assignErrors];

  return NextResponse.json({
    prefixesAssigned,
    refsUpdated,
    collisionsResolved: collisions.length > 0 ? collisions : undefined,
    finalMapping,
    refErrors: refErrors.length > 0 ? refErrors : undefined,
    message: `${prefixesAssigned} brand prefix${prefixesAssigned !== 1 ? 'es' : ''} assigned. ${refsUpdated} product reference${refsUpdated !== 1 ? 's' : ''} rebuilt.`,
  });
}
