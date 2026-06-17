import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/models/Schemas';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    await connectToDatabase();
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const token = signToken({ id: admin._id, username: admin.username });
    
    const response = NextResponse.json({ token, message: 'Login successful' });
    
    // Set HTTP-only cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    return response;
  } catch (err) {
    console.error('❌ Login Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
