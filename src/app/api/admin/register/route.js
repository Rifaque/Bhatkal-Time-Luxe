import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Admin } from '@/models/Schemas';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if admin already exists (Optional security guard, but keeping open for parity)
    const existing = await Admin.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    
    return NextResponse.json({ message: 'Admin registered successfully' }, { status: 201 });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
