import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product, FeaturedWatch, BestSelling, TopBrand, Order } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId');
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 });

  await connectToDatabase();

  const brandProducts = await Product.find({ brand: brandId }, { _id: 1 }).lean();
  const productIds = brandProducts.map((p) => p._id);

  const [inTopBrands, featuredProducts, bestSellingProducts, orderCount] = await Promise.all([
    TopBrand.countDocuments({ brand: brandId }),
    productIds.length > 0 ? FeaturedWatch.countDocuments({ productId: { $in: productIds } }) : Promise.resolve(0),
    productIds.length > 0 ? BestSelling.countDocuments({ productId: { $in: productIds } }) : Promise.resolve(0),
    productIds.length > 0 ? Order.countDocuments({ 'items.product': { $in: productIds } }) : Promise.resolve(0),
  ]);

  return NextResponse.json({
    products: brandProducts.length,
    inTopBrands: inTopBrands > 0,
    featuredProducts,
    bestSellingProducts,
    orderCount,
  });
}
