import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/models/Schemas';
import { getAdminFromRequest } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(req) {
  // Blocked in production — admin accounts must be created via MongoDB directly
  // or a seeding script. This endpoint remains available only in development.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // In development, still require an existing authenticated admin
  const caller = getAdminFromRequest(req);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Admin.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    return NextResponse.json({ message: 'Admin registered successfully' }, { status: 201 });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
