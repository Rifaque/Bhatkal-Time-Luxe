import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { badId } from '@/lib/validate';

export async function POST(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await params;
    const invalid = badId(orderId, 'order ID');
    if (invalid) return invalid;

    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const now = new Date();
    const update = { $inc: { viewCount: 1 }, lastViewedAt: now };
    if (!order.firstViewedAt) update.firstViewedAt = now;

    await Order.findByIdAndUpdate(orderId, update);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
