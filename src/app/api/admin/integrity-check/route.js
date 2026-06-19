import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, Brand, FeaturedWatch, BestSelling, TopBrand } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();

  const [allFeatured, allBestSelling, allTopBrands] = await Promise.all([
    FeaturedWatch.find().populate('productId', '_id').lean(),
    BestSelling.find().populate('productId', '_id').lean(),
    TopBrand.find().populate('brand', '_id').lean(),
  ]);

  const orphanedFeatured = allFeatured.filter((i) => !i.productId).map((i) => ({ _id: i._id }));
  const orphanedBestSelling = allBestSelling.filter((i) => !i.productId).map((i) => ({ _id: i._id }));
  const orphanedTopBrands = allTopBrands.filter((i) => !i.brand).map((i) => ({ _id: i._id }));

  return NextResponse.json({
    orphanedFeatured: orphanedFeatured.length,
    orphanedBestSelling: orphanedBestSelling.length,
    orphanedTopBrands: orphanedTopBrands.length,
    total: orphanedFeatured.length + orphanedBestSelling.length + orphanedTopBrands.length,
  });
}

export async function POST(req) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();

  const [allFeatured, allBestSelling, allTopBrands] = await Promise.all([
    FeaturedWatch.find().populate('productId', '_id').lean(),
    BestSelling.find().populate('productId', '_id').lean(),
    TopBrand.find().populate('brand', '_id').lean(),
  ]);

  const orphanFeaturedIds = allFeatured.filter((i) => !i.productId).map((i) => i._id);
  const orphanBestSellingIds = allBestSelling.filter((i) => !i.productId).map((i) => i._id);
  const orphanTopBrandIds = allTopBrands.filter((i) => !i.brand).map((i) => i._id);

  const [rFeatured, rBestSelling, rTopBrands] = await Promise.all([
    orphanFeaturedIds.length > 0 ? FeaturedWatch.deleteMany({ _id: { $in: orphanFeaturedIds } }) : Promise.resolve({ deletedCount: 0 }),
    orphanBestSellingIds.length > 0 ? BestSelling.deleteMany({ _id: { $in: orphanBestSellingIds } }) : Promise.resolve({ deletedCount: 0 }),
    orphanTopBrandIds.length > 0 ? TopBrand.deleteMany({ _id: { $in: orphanTopBrandIds } }) : Promise.resolve({ deletedCount: 0 }),
  ]);

  return NextResponse.json({
    removedFeatured: rFeatured.deletedCount,
    removedBestSelling: rBestSelling.deletedCount,
    removedTopBrands: rTopBrands.deletedCount,
    total: rFeatured.deletedCount + rBestSelling.deletedCount + rTopBrands.deletedCount,
    message: `Cleaned up ${rFeatured.deletedCount + rBestSelling.deletedCount + rTopBrands.deletedCount} orphaned reference${rFeatured.deletedCount + rBestSelling.deletedCount + rTopBrands.deletedCount !== 1 ? 's' : ''}.`,
  });
}
