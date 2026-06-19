import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/models/Schemas';
import { signToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import bcrypt from 'bcrypt';

const loginLimiter = rateLimit({ maxRequests: 10, windowMs: 15 * 60 * 1000 });

export async function POST(req) {
  // Rate limit by IP — 10 attempts per 15 minutes
  const ip = getClientIp(req);
  const limit = loginLimiter(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfter) },
      }
    );
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    await connectToDatabase();
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: admin._id, username: admin.username });

    const response = NextResponse.json({ message: 'Login successful' });

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60,
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('❌ Login Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
