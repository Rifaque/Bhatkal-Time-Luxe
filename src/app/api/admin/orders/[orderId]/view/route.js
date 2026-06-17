import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { orderId } = await params;

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const now = new Date();
    const update = {
      $inc: { viewCount: 1 },
      lastViewedAt: now,
    };
    if (!order.firstViewedAt) update.firstViewedAt = now;

    await Order.findByIdAndUpdate(orderId, update);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
