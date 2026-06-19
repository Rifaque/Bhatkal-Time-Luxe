import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import { badId } from '@/lib/validate';
import { logAdminAction } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

const ORDER_PATCH_ALLOWLIST = [
  'orderStatus', 'paymentStatus', 'paymentMethod',
  'adminApproved', 'internalNotes', 'trackingNumber', 'customer',
];

export async function GET(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await params;
    const invalid = badId(orderId, 'order ID');
    if (invalid) return invalid;

    await connectToDatabase();
    const order = await Order.findById(orderId).lean();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await params;
    const invalid = badId(orderId, 'order ID');
    if (invalid) return invalid;

    const body = await req.json();

    // Only allow whitelisted fields — never pricing, totals, or IDs
    const update = { updatedAt: new Date() };
    for (const key of ORDER_PATCH_ALLOWLIST) {
      if (key in body) update[key] = body[key];
    }

    await connectToDatabase();

    const before = await Order.findById(orderId).lean();
    const order  = await Order.findByIdAndUpdate(orderId, update, { new: true });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    logAdminAction({
      admin, action: 'ORDER_UPDATE', entity: 'Order', entityId: orderId,
      before: before ? {
        orderStatus: before.orderStatus, paymentStatus: before.paymentStatus,
        adminApproved: before.adminApproved,
      } : null,
      after: {
        orderStatus: order.orderStatus, paymentStatus: order.paymentStatus,
        adminApproved: order.adminApproved,
      },
      ip: getClientIp(req),
    });

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await params;
    const invalid = badId(orderId, 'order ID');
    if (invalid) return invalid;

    await connectToDatabase();
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    logAdminAction({
      admin, action: 'ORDER_DELETE', entity: 'Order', entityId: orderId,
      before: { orderId: order.orderId, total: order.total },
      ip: getClientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
