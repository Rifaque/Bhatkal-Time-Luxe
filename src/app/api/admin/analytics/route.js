import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order, Product } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      revenueAgg,
      recentOrders,
      topProducts,
      dailyOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: { $ifNull: ['$totalKwd', '$total'] } } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderId customer items total totalKwd orderStatus createdAt')
        .lean(),
      Product.find({ orderCount: { $gt: 0 } })
        .sort({ orderCount: -1 })
        .limit(10)
        .select('name orderCount brand')
        .populate('brand', 'name')
        .lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: { $ifNull: ['$totalKwd', '$total'] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      recentOrders,
      topProducts,
      dailyOrders,
    });
  } catch {
    return NextResponse.json({ error: 'Analytics unavailable' }, { status: 500 });
  }
}
